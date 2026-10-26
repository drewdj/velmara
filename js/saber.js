/* Lo que saben los personajes de Velmara y el acceso del DM.
   - Las notas completas del vault viven en Firebase bajo dm/lore: solo las lee la cuenta del DM.
   - Lo que el DM comparte se copia a saber/{id} con el texto para jugadores y a quién va (para).
   - El DM entra con su contraseña (Firebase Authentication, usuario DM_EMAIL).
   Sin Firebase (modo prueba) todo queda en memoria y cualquier contraseña vale. */
const DM_EMAIL="dm@velmara.app";
const CATS=[["lugares","Lugares"],["personas","Personas"],["organizaciones","Organizaciones"],["mundo","Mundo"],["cronica","Crónica"]];
const Saber={
  dm:{},pub:{},isDM:false,mode:"local",subs:[],db:null,dmRef:null,
  emit(){this.subs.forEach(f=>f())},
  init(){
    const cfg=window.FIREBASE_CONFIG;
    if(!cfg||!window.firebase||!firebase.auth){this.mode="local";this.emit();return}
    this.mode="live";
    const app=firebase.apps.length?firebase.app():firebase.initializeApp(cfg);
    this.db=app.database();
    this.db.ref("saber").on("value",s=>{this.pub=s.val()||{};this.emit()},e=>console.error(e));
    firebase.auth().onAuthStateChanged(u=>{
      const on=!!u&&u.email===DM_EMAIL;
      if(this.dmRef){this.dmRef.off();this.dmRef=null;this.dm={}}
      this.isDM=on;
      if(on){this.dmRef=this.db.ref("dm/lore");this.dmRef.on("value",s=>{this.dm=s.val()||{};this.emit()},e=>console.error(e))}
      this.emit();
    });
  },
  async login(pw){
    if(this.mode==="local"){if(!pw)throw new Error("Escribe la contraseña.");this.isDM=true;this.emit();return}
    try{await firebase.auth().signInWithEmailAndPassword(DM_EMAIL,pw)}
    catch(e){
      const c=e.code||"";
      if(/wrong-password|invalid-credential|invalid-login|user-not-found/.test(c))throw new Error("Contraseña incorrecta.");
      if(/operation-not-allowed|configuration-not-found/.test(c))throw new Error("Falta activar el acceso con contraseña en Firebase.");
      if(/too-many-requests/.test(c))throw new Error("Demasiados intentos. Espera un poco.");
      throw new Error("No se pudo entrar: "+(c||e.message));
    }
  },
  async logout(){if(this.mode==="local"){this.isDM=false;this.emit();return}await firebase.auth().signOut()},
  // Lo que ve un PJ: entradas compartidas con todos o con él
  visibleFor(pj){const o={};for(const [id,e] of Object.entries(this.pub))if(e&&(e.para?.todos||e.para?.[pj]))o[id]=e;return o},
  async share(id,para,txt){
    const e=this.dm[id],any=para.todos||Object.values(para).some(Boolean);
    const val=any?{n:e.n,cat:e.cat,sub:e.sub||"",txt:String(txt).slice(0,20000),para,ts:Date.now()}:null;
    if(this.mode==="local"){if(val)this.pub[id]=val;else delete this.pub[id];this.emit();return}
    await this.db.ref("saber/"+id).set(val);
  },
  async importar(json){
    const E=json?.entradas;if(!E||typeof E!=="object")throw new Error("Ese archivo no tiene notas del vault.");
    if(this.mode==="local"){this.dm=E;this.emit();return Object.keys(E).length}
    await this.db.ref("dm/lore").set(E);return Object.keys(E).length;
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
