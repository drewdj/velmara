/* Encuentros (solo DM): bestiario del SRD, constructor con Puntos de Batalla y mesa de combate.
   Reglas (Core Rulebook, «Building Balanced Encounters»): presupuesto = 3 × PJs + 2, con ajustes.
   Coste: grupo de esbirros (tantos como PJs) 1 · Social/Apoyo 1 · Horda/A distancia/Acechador/Estándar 2 · Líder 3 · Bruto 4 · Solitario 5.
   Lo guardado va en dm/<clave>/enc (Saber.encSet): lista de encuentros y el combate en curso. */
const ATIPO={Bruiser:"Bruto",Horde:"Horda",Leader:"Líder",Minion:"Esbirro",Ranged:"A distancia",Skulk:"Acechador",Social:"Social",Solo:"Solitario",Standard:"Estándar",Support:"Apoyo"};
const ACOSTE={Minion:1,Social:1,Support:1,Horde:2,Ranged:2,Skulk:2,Standard:2,Leader:3,Bruiser:4,Solo:5};
const AALC={Melee:"Cuerpo a cuerpo","Very Close":"Muy cerca",Close:"Cerca",Far:"Lejos","Very Far":"Muy lejos"};
const AKIND={P:"Pasiva",A:"Acción",R:"Reacción"};
const ACOND=[["vul","Vulnerable"],["res","Restringido"],["ocu","Oculto"]];
const AJ_MAN=[["facil",-1,"Combate más fácil o corto"],["dificil",2,"Combate más difícil o largo"],["dano",-2,"+1d4 (o +2) al daño de todos los adversarios"]];
const Enc={
  uid:()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6),
  // Borrador del encuentro que se está montando: se queda en este navegador
  draft(){if(!ui.encD){try{ui.encD=JSON.parse(ls.get("v-encd")||"null")}catch(e){}ui.encD=ui.encD||{n:"",items:{},adj:{},pjs:0}}return ui.encD},
  save(){ls.set("v-encd",JSON.stringify(ui.encD))},
  nPJs(st){return PJS.filter(p=>!p.prueba&&st.hojas[p.id]).length||4},
  pjs(st){return this.draft().pjs||this.nPJs(st)},
  tierGrupo(st){return ui.encTier||tierDe(st.mundo?.nivel||1)},
  // Presupuesto y ajustes automáticos
  calc(st,D=this.draft()){
    const n=D.pjs||this.nPJs(st),T=this.tierGrupo(st),L=Object.entries(D.items).filter(([id,q])=>ADV[id]&&q>0);
    const tipos=L.map(([id])=>ADV[id].ty),solos=L.filter(([id])=>ADV[id].ty==="Solo").reduce((t,[,q])=>t+q,0);
    const aj=[];
    AJ_MAN.forEach(([k,v,l])=>{if(D.adj[k])aj.push([v,l])});
    if(solos>=2)aj.push([-2,"Dos o más Solitarios"]);
    if(L.some(([id])=>ADV[id].tier<T))aj.push([1,"Hay un adversario de un tier inferior"]);
    if(L.length&&!tipos.some(t=>["Bruiser","Horde","Leader","Solo"].includes(t)))aj.push([1,"Sin Brutos, Hordas, Líderes ni Solitarios"]);
    const base=3*n+2,total=base+aj.reduce((t,[v])=>t+v,0),gasto=L.reduce((t,[id,q])=>t+ACOSTE[ADV[id].ty]*q,0);
    return {n,T,base,aj,total,gasto,L};
  },
  // Rellena el presupuesto al azar con adversarios del tier del grupo
  generar(st){
    const D=this.draft(),T=this.tierGrupo(st),pool=ADVERSARIOS.filter(a=>a.tier===T&&!a.n.includes(":"));
    const de=ty=>pool.filter(a=>a.ty===ty),rnd=L=>L[Math.floor(Math.random()*L.length)];
    D.items={};let guard=0;
    const libre=()=>{const c=this.calc(st,D);return c.total-c.gasto};
    const r=Math.random(),B=libre();
    if(B>=9&&r<.35&&de("Solo").length)D.items[rnd(de("Solo")).id]=1;
    else if(B>=7&&r<.75&&de("Leader").length)D.items[rnd(de("Leader")).id]=1;
    const peso=[["Standard",4],["Bruiser",2],["Horde",2],["Ranged",3],["Skulk",2],["Support",2],["Minion",2],["Social",1]];
    while(libre()>0&&guard++<60){
      const f=libre(),ok=peso.filter(([ty])=>ACOSTE[ty]<=f&&de(ty).length);if(!ok.length)break;
      const kinds=Object.keys(D.items);
      // Con 4 tipos distintos ya, se repiten los que hay
      const rep=kinds.filter(id=>ACOSTE[ADV[id].ty]<=f&&ADV[id].ty!=="Solo"&&ADV[id].ty!=="Leader");
      if(kinds.length>=4&&rep.length){const id=rnd(rep);D.items[id]++;continue}
      let tot=ok.reduce((t,[,w])=>t+w,0),x=Math.random()*tot,ty=ok[0][0];for(const [t,w] of ok){if((x-=w)<0){ty=t;break}}
      const a=rnd(de(ty));D.items[a.id]=(D.items[a.id]||0)+1;
    }
    this.save();
  },
  // Ficha completa de un adversario
  ficha(a){
    const u=a.umb?`${a.umb[0]??"—"} / ${a.umb[1]??"—"}`:"Ninguno";
    return `<div class="advf"><p class="advd">${esc(a.d)}</p>
     <p><b>Motivos y tácticas:</b> ${esc(a.mot)}</p>
     <div class="advst"><span><small>Dificultad</small><b class="num">${a.dif}</b></span><span><small>Umbrales</small><b class="num">${u}</b></span><span><small>PG</small><b class="num">${a.pg}</b></span><span><small>Estrés</small><b class="num">${a.es}</b></span></div>
     <p><b>Ataque ${esc(a.atk)}</b> · ${esc(a.arma)} · ${esc(AALC[a.alc]||a.alc)} · <b class="num">${esc(a.dmg)}</b> ${a.tdmg==="mag"?"mágico":a.tdmg==="phy"?"físico":esc(a.tdmg)}</p>
     ${a.exp?`<p><b>Experiencia:</b> ${esc(a.exp)}</p>`:""}
     ${a.f.map(([n,k,t])=>`<p class="advft"><b>${esc(n)}</b> <span class="advk ${k}">${AKIND[k]}</span> ${esc(t)}</p>`).join("")}</div>`},
  linea(a){return `Tier ${a.tier} · ${ATIPO[a.ty]} · ${ACOSTE[a.ty]} pt${ACOSTE[a.ty]>1?"s":""}`},
  view(st){
    const t=ui.encTab==="combate"?"combate":"preparar",C=Saber.enc.combate;
    return `<nav class="subtabs enct" role="tablist"><button role="tab" data-enctab="preparar" aria-selected="${t==="preparar"}">Preparar</button><button role="tab" data-enctab="combate" aria-selected="${t==="combate"}">Combate${C?" · en curso":""}</button></nav>`
      +(t==="combate"?this.combate(st):this.preparar(st));
  },
  preparar(st){
    const D=this.draft(),c=this.calc(st),q=(ui.encQ||"").toLowerCase(),ft=ui.encFT||"",fty=ui.encFTy||"";
    const L=ADVERSARIOS.filter(a=>(!ft||a.tier===+ft)&&(!fty||a.ty===fty)&&(!q||(a.n+" "+a.d+" "+ATIPO[a.ty]).toLowerCase().includes(q)));
    const chip=(attr,v,cur,l)=>`<button class="chip" ${attr}="${v}" aria-pressed="${cur===v}">${l}</button>`;
    const best=`<section class="block deco encbest"><header><h2>Bestiario</h2><span class="note">${L.length} de ${ADVERSARIOS.length} · SRD</span></header>
      <input type="search" id="enc-q" value="${esc(ui.encQ||"")}" placeholder="Buscar adversario…" aria-label="Buscar adversario">
      <div class="cfacs"><span class="lab">Tier</span>${chip("data-encft","",ft,"Todos")}${[1,2,3,4].map(n=>chip("data-encft",String(n),ft,"Tier "+n)).join("")}</div>
      <div class="cfacs"><span class="lab">Tipo</span>${chip("data-encfty","",fty,"Todos")}${Object.keys(ACOSTE).map(k=>chip("data-encfty",k,fty,ATIPO[k])).join("")}</div>
      <div class="advlist">${L.map(a=>{const on=ui.encOpen===a.id,n=D.items[a.id]||0;return `<div class="advrow${on?" on":""}">
        <div class="advh"><button class="advn" data-encopen="${a.id}" aria-expanded="${on}"><b>${esc(a.n)}</b><small>${this.linea(a)}</small></button>
         <span class="advq num">Dif ${a.dif} · PG ${a.pg} · Es ${a.es}</span>
         <button class="btn ghost addadv" data-encadd="${a.id}" aria-label="Añadir ${esc(a.n)}">+${n?` <span class="num">${n}</span>`:""}</button></div>
        ${on?this.ficha(a):""}</div>`}).join("")||`<p class="empty">Nada coincide.</p>`}</div></section>`;
    const pct=c.total>0?Math.min(100,c.gasto/c.total*100):0,est=c.gasto>c.total?"over":c.gasto===c.total?"ok":"";
    const items=c.L.map(([id,q])=>{const a=ADV[id];return `<div class="encit"><div><b>${esc(a.n)}</b><small>${ATIPO[a.ty]} · Tier ${a.tier}${a.ty==="Minion"?` · grupos de ${c.n}`:""}</small></div>
      <span class="step"><button data-encq="${id}" data-d="-1" aria-label="Quitar uno">−</button><span class="v num">${q}</span><button data-encq="${id}" data-d="1" aria-label="Añadir uno">+</button></span><span class="num encpts">${ACOSTE[a.ty]*q} pts</span></div>`}).join("");
    const lista=Object.entries(Saber.enc.lista||{}).sort((a,b)=>(b[1].t||0)-(a[1].t||0));
    const panel=`<section class="block deco encpanel"><header><h2>Tu encuentro</h2></header>
      <div class="erow"><span class="lab">PJs en el combate</span><span class="step"><button data-encpjs="-1" aria-label="Menos PJs">−</button><span class="v num">${c.n}</span><button data-encpjs="1" aria-label="Más PJs">+</button></span></div>
      <div class="erow"><span class="lab">Tier del grupo</span><span class="btns">${[1,2,3,4].map(n=>`<button class="chip" data-enctier="${n}" aria-pressed="${c.T===n}">${n}</button>`).join("")}</span></div>
      <div class="encbud ${est}"><div class="encbar"><span style="width:${pct}%"></span></div>
       <p><b class="num">${c.gasto} / ${c.total}</b> Puntos de Batalla ${c.gasto>c.total?`<span class="warnt">· te pasas en ${c.gasto-c.total}</span>`:c.gasto<c.total?`· quedan ${c.total-c.gasto}`:"· equilibrado"}</p></div>
      <details class="encaj"><summary>Base ${c.base} (3 × ${c.n} PJs + 2)${c.aj.length?` · ajustes ${c.aj.reduce((t,[v])=>t+v,0)>0?"+":""}${c.aj.reduce((t,[v])=>t+v,0)}`:""}</summary>
       ${AJ_MAN.map(([k,v,l])=>`<label class="toggle"><input type="checkbox" data-encadj="${k}" ${D.adj[k]?"checked":""}> ${l} (${v>0?"+":""}${v})</label>`).join("")}
       ${c.aj.filter(([,l])=>!AJ_MAN.some(x=>x[2]===l)).map(([v,l])=>`<p class="note">${l}: ${v>0?"+":""}${v}</p>`).join("")}</details>
      <div class="encits">${items||`<p class="empty">Añade adversarios con «+» o genera uno equilibrado.</p>`}</div>
      <div class="btns"><button class="btn ghost" data-encgen>🎲 Generar equilibrado</button>${c.L.length?`<button class="btn ghost" data-encvaciar>Vaciar</button>`:""}</div>
      <div class="field"><label for="enc-n">Nombre</label><input id="enc-n" value="${esc(D.n||"")}" maxlength="60" placeholder="Por ejemplo: Emboscada en el Cruce"></div>
      <div class="btns"><button class="btn ghost" data-encsave ${c.L.length?"":"disabled"}>Guardar</button><button class="btn" data-encstart ${c.L.length?"":"disabled"}>⚔ Empezar combate</button></div>
      ${lista.length?`<span class="lab">Guardados</span><div class="enclist">${lista.map(([k,e])=>`<div class="encsv"><div><b>${esc(e.n||"Sin nombre")}</b><small>${Object.entries(e.items||{}).map(([id,q])=>`${q}× ${ADV[id]?.n||id}`).join(", ")}</small></div>
        <span class="btns"><button class="btn ghost" data-encload="${k}">Cargar</button><button class="btn ghost" data-encstartk="${k}">Empezar</button><button class="btn warn" data-encdel="${k}">${ui.encDel===k?"¿Seguro?":"Borrar"}</button></span></div>`).join("")}</div>`:""}
      </section>`;
    return `<div class="encgrid">${best}${panel}</div>`;
  },
  // Pasa un encuentro a la mesa de combate: una ficha por adversario (los esbirros, por grupos)
  empezar(st,E){
    const n=E.pjs||this.nPJs(st),M={};let o=0;
    Object.entries(E.items||{}).forEach(([id,q])=>{const a=ADV[id];if(!a)return;
      for(let i=0;i<q;i++){const k=this.uid()+i;M[k]={id,o:o++,n:a.n+(q>1?` ${i+1}`:""),pg:0,es:0,...(a.ty==="Minion"?{min:n,caidos:0}:{})}}});
    return Saber.encSet("combate",{n:E.n||"Combate",miedo:Saber.enc.combate?.miedo||0,E:M,t:Date.now()});
  },
  pista(k,cur,max,attr,cls){let h="";for(let i=0;i<max;i++)h+=`<button class="tk ${cls}${i<cur?" on":""}" data-${attr}="${k}" data-i="${i}" aria-label="${i+1}"></button>`;return `<span class="tks">${h}</span>`},
  combate(st){
    const C=Saber.enc.combate;
    if(!C)return `<section class="block deco"><p class="empty">No hay ningún combate en curso. Prepara un encuentro y pulsa «Empezar combate».</p></section>`;
    const E=Object.entries(C.E||{}).sort((a,b)=>a[1].o-b[1].o),vivos=E.filter(([,e])=>!this.fuera(e)).length;
    const cards=E.map(([k,e])=>{const a=ADV[e.id];if(!a)return "";const out=this.fuera(e),op=ui.encFicha===k,cond=e.cond||{};
      const u=a.umb?`${a.umb[0]??"—"}/${a.umb[1]??"—"}`:"—";
      const vida=e.min?`<div class="mins">${Array.from({length:e.min},(_,i)=>`<button class="minb${i<(e.caidos||0)?" off":""}" data-emin="${k}" data-i="${i}" aria-label="Esbirro ${i+1}">${i<(e.caidos||0)?"✕":"●"}</button>`).join("")}</div><small class="note">${e.min-(e.caidos||0)} en pie. Caen con cualquier daño${this.minX(a)?`; por cada ${this.minX(a)} de daño cae otro más`:""}.</small>`
        :`<div class="trk"><span class="lab">PG <b class="num">${e.pg}/${a.pg}</b></span>${this.pista(k,e.pg,a.pg,"ehp","hp")}</div>`;
      return `<div class="encc${out?" out":""}" data-k="${k}"><div class="ench"><div><b>${esc(e.n)}</b><small>${ATIPO[a.ty]} · Tier ${a.tier}</small></div><button class="linkbtn" data-encficha="${k}">${op?"Cerrar":"Ficha"}</button></div>
        <div class="encq"><span>Dif <b class="num">${a.dif}</b></span><span>Umbr. <b class="num">${u}</b></span><span>ATK <b class="num">${esc(a.atk)}</b></span><span class="num">${esc(a.dmg)} ${a.tdmg==="mag"?"mág":"fís"}</span></div>
        ${vida}
        ${a.es?`<div class="trk"><span class="lab">Estrés <b class="num">${e.es}/${a.es}</b></span>${this.pista(k,e.es,a.es,"ees","st")}</div>`:""}
        ${e.min?"":`<div class="dmgrow"><input type="number" min="0" id="dmg-${k}" placeholder="Daño" aria-label="Daño recibido por ${esc(e.n)}"><button class="btn ghost" data-edmg="${k}">Aplicar</button></div>`}
        <div class="btns cnds">${ACOND.map(([c,l])=>`<button class="chip" data-econd="${k}" data-c="${c}" aria-pressed="${!!cond[c]}">${l}</button>`).join("")}</div>
        ${op?`${this.ficha(a)}<div class="field"><label for="en-${k}">Nombre</label><input id="en-${k}" data-enomb="${k}" value="${esc(e.n)}" maxlength="40"></div>
          <div class="field"><label for="enota-${k}">Notas</label><textarea id="enota-${k}" data-enota="${k}" maxlength="400">${esc(e.notas||"")}</textarea></div>
          <button class="btn warn" data-equitar="${k}">Quitar del combate</button>`:e.notas?`<p class="note">${esc(e.notas)}</p>`:""}
        ${out?`<span class="encout">Derrotado</span>`:""}</div>`}).join("");
    const add=`<div class="btns encadd"><select id="enc-addsel" aria-label="Añadir adversario"><option value="">Añadir adversario…</option>${[1,2,3,4].map(t=>`<optgroup label="Tier ${t}">${ADVERSARIOS.filter(a=>a.tier===t).map(a=>`<option value="${a.id}">${esc(a.n)} (${ATIPO[a.ty]})</option>`).join("")}</optgroup>`).join("")}</select><button class="btn ghost" data-encaddc>Añadir</button></div>`;
    return `<section class="block deco enccomb"><header><h2>${esc(C.n)}</h2><span class="note">${vivos} de ${E.length} en pie</span></header>
      <div class="erow"><span class="lab">Miedo</span>${this.pista("miedo",C.miedo||0,12,"emiedo","fear")}<span class="num">${C.miedo||0}</span></div>
      <p class="note">El daño se convierte en PG según los umbrales: menos que el Mayor marca 1, desde el Mayor 2, desde el Grave 3. Toca las casillas para corregir a mano.</p>
      <div class="encboard">${cards}</div>${add}
      <div class="btns"><button class="btn warn" data-encfin>${ui.encFin?"¿Seguro? Pulsa otra vez":"Terminar combate"}</button></div></section>`;
  },
  minX(a){const f=a.f.find(([n])=>/^Minion \(\d+\)/.test(n));return f?+f[0].match(/\d+/)[0]:0},
  fuera(e){const a=ADV[e.id];return e.min?(e.caidos||0)>=e.min:a&&e.pg>=a.pg},
  pgDeDano(a,d){if(d<=0)return 0;if(!a.umb)return 1;const [M,G]=a.umb;return G!=null&&d>=G?3:M!=null&&d>=M?2:1},
  set(r,v){return Saber.encSet(r,v).catch(e=>{console.error(e);toast("No se pudo guardar.",true)})},
  // Devuelve true si el clic era suyo
  click(b,st){const d=b.dataset,C=Saber.enc.combate,D=this.draft();
    if(d.enctab){ui.encTab=d.enctab;render();return true}
    if(d.encopen){ui.encOpen=ui.encOpen===d.encopen?null:d.encopen;render();return true}
    if(d.encft!==undefined){ui.encFT=d.encft;render();return true}
    if(d.encfty!==undefined){ui.encFTy=d.encfty;render();return true}
    if(d.encadd){D.items[d.encadd]=(D.items[d.encadd]||0)+1;this.save();render();return true}
    if(d.encq){const v=(D.items[d.encq]||0)+ +d.d;if(v>0)D.items[d.encq]=v;else delete D.items[d.encq];this.save();render();return true}
    if(d.encpjs){D.pjs=Math.max(1,Math.min(8,this.pjs(st)+ +d.encpjs));this.save();render();return true}
    if(d.enctier){ui.encTier=+d.enctier;render();return true}
    if(b.hasAttribute("data-encgen")){this.generar(st);render();return true}
    if(b.hasAttribute("data-encvaciar")){D.items={};this.save();render();return true}
    if(b.hasAttribute("data-encsave")){const k=D.k||this.uid();D.k=k;this.save();this.set("lista/"+k,{n:D.n||"Sin nombre",items:D.items,adj:D.adj,pjs:D.pjs||0,t:Date.now()}).then(()=>toast("Encuentro guardado."));return true}
    if(d.encload){const e=Saber.enc.lista?.[d.encload];if(e){ui.encD={k:d.encload,n:e.n,items:{...(e.items||{})},adj:{...(e.adj||{})},pjs:e.pjs||0};this.save();render()}return true}
    if(d.encdel){if(ui.encDel!==d.encdel){ui.encDel=d.encdel;render();return true}ui.encDel=null;this.set("lista/"+d.encdel,null);return true}
    if(b.hasAttribute("data-encstart")||d.encstartk){const E=d.encstartk?Saber.enc.lista?.[d.encstartk]:{n:D.n,items:D.items,pjs:D.pjs};
      if(C&&!confirm("Ya hay un combate en curso. ¿Lo sustituyes por este?"))return true;
      this.empezar(st,E).then(()=>{ui.encTab="combate";render()});return true}
    if(!C)return false;
    if(d.emiedo!==undefined){const i=+d.i,v=(C.miedo||0)===i+1?i:i+1;this.set("combate/miedo",v);return true}
    if(d.ehp){const e=C.E[d.ehp],i=+d.i;this.set(`combate/E/${d.ehp}/pg`,e.pg===i+1?i:i+1);return true}
    if(d.ees){const e=C.E[d.ees],i=+d.i;this.set(`combate/E/${d.ees}/es`,e.es===i+1?i:i+1);return true}
    if(d.emin){const e=C.E[d.emin],i=+d.i;this.set(`combate/E/${d.emin}/caidos`,(e.caidos||0)===i+1?i:i+1);return true}
    if(d.edmg){const e=C.E[d.edmg],a=ADV[e.id],v=+($("#dmg-"+d.edmg)?.value||0),n=this.pgDeDano(a,v);if(!n)return true;
      this.set(`combate/E/${d.edmg}/pg`,Math.min(a.pg,e.pg+n)).then(()=>toast(`${e.n}: ${v} de daño → marca ${n} PG.`));return true}
    if(d.econd){const e=C.E[d.econd],on=!!(e.cond||{})[d.c];this.set(`combate/E/${d.econd}/cond/${d.c}`,on?null:true);return true}
    if(d.encficha){ui.encFicha=ui.encFicha===d.encficha?null:d.encficha;render();return true}
    if(d.equitar){this.set(`combate/E/${d.equitar}`,null);ui.encFicha=null;return true}
    if(b.hasAttribute("data-encaddc")){const id=$("#enc-addsel")?.value,a=ADV[id];if(!a)return true;const o=Math.max(-1,...Object.values(C.E||{}).map(e=>e.o))+1;
      this.set(`combate/E/${this.uid()}`,{id,o,n:a.n,pg:0,es:0,...(a.ty==="Minion"?{min:this.pjs(st),caidos:0}:{})});return true}
    if(b.hasAttribute("data-encfin")){if(!ui.encFin){ui.encFin=true;render();return true}ui.encFin=false;this.set("combate",null);return true}
    return false},
  input(t){if(t.id==="enc-q"){ui.encQ=t.value;render();const q=$("#enc-q");if(q){q.focus();q.setSelectionRange(q.value.length,q.value.length)}return true}
    if(t.id==="enc-n"){this.draft().n=t.value.slice(0,60);this.save();return true}
    return false},
  change(t){const C=Saber.enc.combate;
    if(t.dataset?.encadj){const D=this.draft();if(t.checked)D.adj[t.dataset.encadj]=true;else delete D.adj[t.dataset.encadj];this.save();render();return true}
    if(C&&t.dataset?.enomb){const v=t.value.trim().slice(0,40);if(v)this.set(`combate/E/${t.dataset.enomb}/n`,v);return true}
    if(C&&t.dataset?.enota){this.set(`combate/E/${t.dataset.enota}/notas`,t.value.slice(0,400));return true}
    return false},
  key(e){const t=e.target;if(e.key==="Enter"&&t.id?.startsWith("dmg-")){e.preventDefault();document.querySelector(`[data-edmg="${t.id.slice(4)}"]`)?.click();return true}return false}
};
