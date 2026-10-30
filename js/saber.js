/* Lo que saben los personajes de Velmara y el acceso del DM.
   - El DM entra con una contraseña. De ella sale una clave (SHA-256) que es el nombre de la carpeta
     dm/<clave> donde viven las notas completas del vault: sin la contraseña no se puede llegar a ellas.
   - dmcheck guarda una huella de la clave para saber si la contraseña es buena. La primera contraseña
     que se usa queda fijada (las reglas no dejan cambiarla; para cambiarla, borra dmcheck en Firebase).
   - Lo que el DM comparte se copia a saber/{id} con el texto para jugadores y a quién va (para).
   Sin Firebase (modo prueba) todo queda en memoria y cualquier contraseña vale. */
// Posiciones de partida (a ojo, a partir del mapa de la Zona Norte); el DM las ajusta arrastrando el marcador
const DEF_POS={aelrennor:[166,231],"gaen-gwynyr":[161,262],"el-cruce":[253,240],lunaris:[397,260],velofrio:[275,40],cenicero:[188,392]};
const CATS=[["lugares","Lugares"],["personas","Personas"],["organizaciones","Organizaciones"],["mundo","Mundo"],["artefactos","Artefactos"],["cronica","Crónica"]];
const sha=async t=>[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)))].map(b=>b.toString(16).padStart(2,"0")).join("");
const Saber={
  dm:{},pub:{},pos:{},enc:{},isDM:false,mode:"local",subs:[],db:null,dmRef:null,posRef:null,encRef:null,key:null,
  emit(){this.subs.forEach(f=>f())},
  init(){
    const cfg=window.FIREBASE_CONFIG;
    if(!cfg||!window.firebase){this.mode="local";this.tried=true;this.emit();return}
    this.mode="live";
    const app=firebase.apps.length?firebase.app():firebase.initializeApp(cfg);
    this.db=app.database();
    this.db.ref("saber").on("value",s=>{this.pub=s.val()||{};this.emit()},e=>console.error(e));
    let k=null;try{k=localStorage.getItem("v-dmkey")}catch(e){}
    // Con la clave guardada se entra solo. Solo se olvida si la contraseña ya no vale (no por un fallo de red)
    if(k)this.enter(k).catch(e=>{console.error(e);if(e.message==="Contraseña incorrecta.")this.forget()}).finally(()=>{this.tried=true;this.emit()});
    else this.tried=true;
  },
  async login(pw){
    pw=String(pw||"").trim();if(!pw)throw new Error("Escribe la contraseña.");
    if(this.mode==="local"){this.isDM=true;this.emit();return}
    const k=await sha("velmara:"+pw),chk=await sha(k+":ok");
    const ref=this.db.ref("dmcheck"),cur=(await ref.get()).val();
    if(!cur)await ref.set(chk); // primera vez: esta contraseña queda como la del DM
    else if(cur!==chk)throw new Error("Contraseña incorrecta.");
    await this.enter(k);
  },
  async enter(k){
    const cur=(await this.db.ref("dmcheck").get()).val();
    if(!cur||cur!==await sha(k+":ok"))throw new Error("Contraseña incorrecta.");
    this.key=k;try{localStorage.setItem("v-dmkey",k)}catch(e){}
    if(this.dmRef)this.dmRef.off();if(this.posRef)this.posRef.off();
    this.dmRef=this.db.ref(`dm/${k}/lore`);
    this.dmRef.on("value",s=>{this.dm=s.val()||{};this.dmListo=true;this.emit()},e=>console.error(e));
    this.posRef=this.db.ref(`dm/${k}/pos`);
    this.posRef.on("value",s=>{this.pos=s.val()||{};this.emit()},e=>console.error(e));
    // Encuentros del DM (solo con la clave): guardados y el combate en curso
    if(this.encRef)this.encRef.off();this.encRef=this.db.ref(`dm/${k}/enc`);
    this.encRef.on("value",s=>{this.enc=s.val()||{};this.emit()},e=>console.error(e));
    this.isDM=true;this.emit();
  },
  forget(){try{localStorage.removeItem("v-dmkey")}catch(e){}},
  async logout(){if(this.encRef){this.encRef.off();this.encRef=null}this.enc={};if(this.dmRef){this.dmRef.off();this.dmRef=null}if(this.posRef){this.posRef.off();this.posRef=null}this.dm={};this.pos={};this.key=null;this.isDM=false;this.dmListo=false;this.forget();this.emit()},
  // Lo que ve un PJ: entradas compartidas con todos o con él
  visibleFor(pj){
    // El PJ de prueba (solo DM) ve todas las notas con el texto que les llegaría a los jugadores
    if(PJ[pj]?.prueba&&this.isDM){const o={};for(const [id,e] of Object.entries(this.dm))o[id]={...e,txt:this.pub[id]?.txt??e.pub??""};return o}
    const o={};for(const [id,e] of Object.entries(this.pub))if(e&&(e.para?.todos||e.para?.[pj]))o[id]=e;return o},
  async share(id,para,txt,e=this.dm[id]){
    const any=para.todos||Object.values(para).some(Boolean);
    const pos=this.posOf(id);
    const val=any?{n:e.n,cat:e.cat,sub:e.sub||"",tipo:e.tipo||"",estado:e.estado||"",txt:String(txt).slice(0,20000),para,ts:Date.now(),...(pos?{pos}:{}),...(e.img?{img:e.img}:{})}:null;
    if(this.mode==="local"){if(val)this.pub[id]=val;else delete this.pub[id];this.emit();return}
    await this.db.ref("saber/"+id).set(val);
  },
  // Marcadores del mapa del mundo: los coloca el DM; el jugador recibe la posición con lo compartido
  // Guarda en dm/<clave>/enc/<ruta> (null borra)
  async encSet(ruta,v){if(!this.isDM)throw new Error("Solo el DM.");
    if(this.mode==="local"){const ks=ruta.split("/"),last=ks.pop();let o=this.enc;ks.forEach(k=>o=o[k]=o[k]||{});if(v==null)delete o[last];else o[last]=JSON.parse(JSON.stringify(v));this.emit();return}
    await this.db.ref(`dm/${this.key}/enc/${ruta}`).set(v??null)},
  posOf(id){const p=this.pos[id];return p===false?null:p||DEF_POS[id]||null},
  async setPos(id,x,y){
    const v=x==null?false:[x,y];
    if(this.mode==="local"){this.pos[id]=v;if(this.pub[id]){if(v)this.pub[id].pos=v;else delete this.pub[id].pos}this.emit();return}
    await this.db.ref(`dm/${this.key}/pos/${id}`).set(v);
    if(this.pub[id])await this.db.ref(`saber/${id}/pos`).set(v||null);
  },
  // Compendio: guardar una nota (nueva o editada). Si ya la ve alguien, le llegan los cambios con el texto para jugadores.
  async guardar(id,e,pubTxt){
    e={...e,web:true};delete e.dm;delete e.oculto;delete e.pos;
    if(this.mode==="local")this.dm[id]=e;else await this.db.ref(`dm/${this.key}/lore/${id}`).set(e);
    const p=this.pub[id];if(p)await this.share(id,p.para,pubTxt??p.txt,e);
    this.emit();
  },
  async borrarNota(id){
    if(this.pub[id])await this.share(id,{},"",this.dm[id]);
    if(this.mode==="local"){delete this.dm[id];this.emit();return}
    await this.db.ref(`dm/${this.key}/lore/${id}`).set(null);
  },
  // Quitar a los jugadores todo lo compartido (las notas del DM no se tocan)
  async ocultarTodo(){
    if(this.mode==="local"){this.pub={};this.emit();return}
    await this.db.ref("saber").set(null);
  },
  /* Cartas de los PJs: cada personaje nuevo tiene su carta en Personas, con lo que escribió su jugador,
     y la conocen todos. El jugador la publica al crearse (saber/ se puede escribir sin ser DM); el DM,
     al entrar, la pasa a sus notas para poder editarla o quitársela a quien quiera. */
  cartaPJ(p){const txt=[p.desc||"",p.j?`**Jugador:** ${p.j}`:""].filter(Boolean).join("\n\n");
    return {n:p.n,cat:"personas",sub:p.c||"",tipo:"pj",estado:"",txt,pub:txt,...(p.img?{img:p.img}:{})}},
  async publicarPJ(p){const e=this.cartaPJ(p);await this.share(p.id,{todos:true},e.pub,e)},
  syncing:new Set(),
  async syncPJs(pjs){
    if(!this.isDM||(this.mode==="live"&&!this.dmListo))return;
    const ids=new Set(pjs.map(p=>p.id));
    // Las fichas de PJs del vault (las de antes de la web) ya no se usan
    for(const [id,e] of Object.entries(this.dm))if(e?.tipo==="pj"&&!e.web&&!ids.has(id)&&!this.syncing.has(id)){this.syncing.add(id);
      try{await this.borrarNota(id)}catch(err){console.error(err)}finally{this.syncing.delete(id)}}
    for(const p of pjs){if(this.dm[p.id]||this.syncing.has(p.id))continue;this.syncing.add(p.id);
      try{const e=this.cartaPJ(p),pub=this.pub[p.id];
        if(!pub)await this.share(p.id,{todos:true},e.pub,e); // la primera vez la conocen todos
        await this.guardar(p.id,e,pub?.txt??e.pub)}
      catch(err){console.error(err)}finally{this.syncing.delete(p.id)}}
  },
  async importar(json){
    const E=json?.entradas;if(!E||typeof E!=="object")throw new Error("Ese archivo no tiene notas del vault.");
    // Lo creado o editado desde el Compendio (web) manda sobre el vault al reimportar; los PJs salen de la web
    for(const [id,e] of Object.entries(E))if(e.tipo==="pj")delete E[id];
    for(const [id,e] of Object.entries(this.dm))if(e.web)E[id]=e;
    if(this.mode==="local")this.dm=E;else await this.db.ref(`dm/${this.key}/lore`).set(E);
    // Ya no se comparte nada al importar: el DM decide qué ve cada PJ (e.para queda como sugerencia del vault)
    this.emit();return Object.keys(E).length;
  }
};

/* Markdown de Obsidian a HTML, lo justo para estas notas: títulos, listas, negrita, cursiva,
   citas, avisos ([!secret]) y enlaces [[Nota|texto]]. link(id,texto) decide si el enlace se puede abrir. */
const slugN=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
function mdHTML(md,link){
  const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const inl=s=>{
    const parts=[];s=s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(_,t,a)=>{parts.push(link(slugN(t.split("#")[0]),a||t));return `\u0000${parts.length-1}\u0000`});
    s=E(s).replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>").replace(/(^|[^*])\*([^*\s][^*]*)\*/g,"$1<i>$2</i>");
    return s.replace(/\u0000(\d+)\u0000/g,(_,i)=>parts[i]);
  };
  const lines=md.replace(/\r/g,"").split("\n");let h="",i=0;
  const list=(start)=>{ // listas con sangría (2 o 4 espacios por nivel)
    let out="",stack=[];
    while(i<lines.length){const m=lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);if(!m)break;
      const lvl=Math.floor(m[1].replace(/\t/g,"  ").length/2),tag=/\d/.test(m[2])?"ol":"ul";
      while(stack.length<=lvl){out+=`<${tag}>`;stack.push(tag)}
      while(stack.length>lvl+1)out+=`</${stack.pop()}>`;
      out+=`<li>${inl(m[3])}</li>`;i++}
    while(stack.length)out+=`</${stack.pop()}>`;return out};
  while(i<lines.length){
    const l=lines[i];
    if(!l.trim()){i++;continue}
    let m;
    if((m=l.match(/^(#{1,4})\s+(.*)$/))){const n=Math.min(4,m[1].length+1);h+=`<h${n}>${inl(m[2])}</h${n}>`;i++;continue}
    if(/^\s*([-*]|\d+\.)\s+/.test(l)){h+=list();continue}
    if(l.startsWith(">")){const q=[];while(i<lines.length&&lines[i].startsWith(">")){q.push(lines[i].replace(/^>\s?/,""));i++}
      const c=q[0].match(/^\[!(\w+)\][-+]?\s*(.*)$/);
      if(c){const body=mdHTML(q.slice(1).join("\n"),link);h+=`<aside class="callout ${/secret|warning/.test(c[1])?"secret":""}"><b>${E(c[2]||c[1])}</b>${body}</aside>`}
      else h+=`<blockquote>${mdHTML(q.join("\n"),link)}</blockquote>`;continue}
    const p=[];while(i<lines.length&&lines[i].trim()&&!/^(#{1,4}\s|>|\s*([-*]|\d+\.)\s)/.test(lines[i])){p.push(inl(lines[i]));i++}
    h+=`<p>${p.join("<br>")}</p>`;
  }
  return h;
}
