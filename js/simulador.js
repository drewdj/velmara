/* Simulador de combate (solo DM, Encuentros → Simulador). Juega solo un combate entre los PJs elegidos y los adversarios
   de un encuentro, con las reglas del SRD de Daggerheart:
   - PJ: 2d12 (Esperanza y Miedo) + rasgo del arma contra la Dificultad. Con Esperanza gana 1 Esperanza (máx. 6) y sigue el foco
     en los PJs; con Miedo, o si falla, el DM gana 1 Miedo (máx. 12) y el foco pasa al DM. Dobles = crítico (gana Esperanza,
     borra 1 Estrés y suma el máximo de los dados al daño). Gasta 1 Esperanza en su mejor Experiencia si con ella acierta.
   - Adversario: d20 + ataque contra la Evasión (un 20 natural es crítico). Daño contra los umbrales: 1, 2 o 3 PG.
     El PJ marca una casilla de Armadura para bajar un nivel (si el golpe es Mayor o más, o si le tumbaría).
   - Turno del DM: un adversario gratis y más a 1 Miedo cada uno (Implacable, Lento, Ataque en grupo, Impulso…).
   - Posición en una cuadrícula: Cuerpo a cuerpo 1, Muy Cercana 3, Cercana 6, Lejana 12, Muy Lejana 24 casillas.
     Moverse hasta Cercana va con la acción; más lejos es correr (el PJ tira Agilidad).
   - Al marcar el último PG el PJ cae (Evitar la muerte: queda inconsciente y fuera del combate).
   Nada se guarda fuera de este navegador (la configuración, en localStorage v-sim). */
const SIM_R=[1,3,6,12,24];
const SIM_ALC={Melee:0,"Very Close":1,Close:2,Far:3,"Very Far":4};
const SIM_ESTILO={cauto:{l:"Cauto",extra:1,res:3},normal:{l:"Normal",extra:2,res:1},duro:{l:"Agresivo",extra:4,res:0}};
const Sim={
  cfg(){if(!ui.simC){try{ui.simC=JSON.parse(ls.get("v-sim")||"null")}catch(e){}ui.simC=Object.assign({pjs:null,src:"draft",dist:12,miedo:null,estilo:"normal"},ui.simC||{})}return ui.simC},
  saveCfg(){ls.set("v-sim",JSON.stringify(ui.simC))},
  pjsDisp(st){return PJS.filter(p=>st.hojas[p.id])},
  elegidos(st){const c=this.cfg(),D=this.pjsDisp(st);return c.pjs?D.filter(p=>c.pjs.includes(p.id)):D.filter(p=>!p.prueba)},
  // Adversarios del encuentro elegido: {id: cantidad}
  items(st){return {...(Saber.enc.lista?.[ui.encVer]?.items||{})}},
  // ---------- dados ----------
  d(n){return 1+Math.floor(Math.random()*n)},
  dados(s){s=String(s||"").replace(/\s/g,"");const m=s.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
    if(m)return {n:+(m[1]||1),d:+m[2],b:+(m[3]||0)};const f=s.match(/^(\d+)/);return {n:0,d:0,b:f?+f[1]:0}},
  tirar(D,crit){let t=D.b,r=[];for(let i=0;i<D.n;i++){const x=this.d(D.d);r.push(x);t+=x}if(crit)t+=D.n*D.d;return {t,r}},
  media(D){return D.n*(D.d+1)/2+D.b},
  txtD(D){return D.n?`${D.n}d${D.d}${D.b?(D.b>0?"+":"")+D.b:""}`:String(D.b)},
  // ---------- montar el combate ----------
  montar(st){
    const c=this.cfg(),P=this.elegidos(st),I=this.items(st),U=[];
    P.forEach((p,i)=>{const h=st.hojas[p.id],H=calcHoja(st,p.id);
      let at=H.ataques.map(a=>({n:a.n,mod:a.mod,D:this.dados(a.dmg),ai:Math.max(0,ALC_PASOS.indexOf(a.alc)),mag:a.tipo==="mágico"}));
      if(!at.length)at=[{n:"Sin arma",mod:H.r.fue||0,D:{n:H.comp,d:4,b:0},ai:0,mag:false}];
      const exp=Math.max(0,...(h.exp||[]).filter(e=>(e.n||"").trim()).map(e=>+e.b||0));
      const lejos=Math.min(...at.map(a=>a.ai))>=2;
      U.push({k:"p"+i,pj:1,id:p.id,n:(st.pjs[p.id]?.n||p.n||p.id).split(" ")[0],nl:st.pjs[p.id]?.n||p.n,ev:H.ev,pgM:H.pg,pg:0,esM:H.es,es:0,arM:H.arm,ar:0,may:H.mayor,gra:H.grave,
        hope:2,at,exp,agi:H.r.agi||0,x:lejos?-3:0,y:(i-(P.length-1)/2)*2,st:{dmg:0,ok:0,ko:0,cr:0,hp:0,ex:0}})});
    let j=0;const n=P.length||1;
    Object.entries(I).forEach(([id,q])=>{const a=ADV[id];if(!a)return;
      const atras=["Ranged","Support","Social"].includes(a.ty);
      const ftxt=(re)=>a.f.find(([nm])=>re.test(nm));
      const res=(t)=>a.f.some(([,k,x])=>k==="P"&&new RegExp(`resist(ant|ance) to ${t}`,"i").test(x));
      const inm=(t)=>a.f.some(([,k,x])=>k==="P"&&new RegExp(`immune to ${t}`,"i").test(x));
      const ga=ftxt(/^Group Attack/),hd=ftxt(/^Horde/),rl=ftxt(/^Relentless/),mn=ftxt(/^Minion/);
      const base={id,ady:1,ty:a.ty,dif:a.dif,umb:a.umb||[null,null],pgM:a.pg,pg:0,atk:+String(a.atk).replace(/[^\d-]/g,"")||0,D:this.dados(a.dmg),ai:SIM_ALC[a.alc]??0,mag:a.tdmg==="mag",
        rel:rl?+(rl[0].match(/\d+/)||[1])[0]:1,horde:hd?this.dados((hd[0].match(/\(([^)]+)\)/)||[])[1]):null,
        minX:mn?+(mn[0].match(/\d+/)||[1])[0]:0,gaD:ga?+((ga[2].match(/deal (\d+)/)||[])[1]||1):0,
        lento:!!ftxt(/^Slow/),ramp:!!ftxt(/^Ramp Up/),mom:!!ftxt(/^Momentum/),terr:!!ftxt(/^Terrifying/),
        directo:a.f.some(([,k,x])=>k==="P"&&/attacks deal direct damage/i.test(x)),
        resF:res("physical"),resM:res("magic"),inF:inm("physical"),inM:inm("magic"),st:{dmg:0,ok:0,ko:0}};
      const cuantos=a.ty==="Minion"?q*n:q;
      for(let i=0;i<cuantos;i++){const u={...base,st:{dmg:0,ok:0,ko:0},k:"a"+U.length,n:a.n+(cuantos>1?" "+(i+1):""),x:c.dist+(atras?4:0)+(i%3),y:((j%7)-3)*1.6};j++;U.push(u)}});
    return {U,fear:Math.max(0,Math.min(12,c.miedo??n)),log:[],turno:0,pjAct:0,acc:0,miedoG:0,miedoS:0,fin:null};
  },
  // ---------- geometría ----------
  dist(a,b){return Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))},
  enRango(a,b,ai){return this.dist(a,b)<=SIM_R[ai]+.01},
  libre(S,u,x,y){return !S.U.some(o=>o!==u&&!this.fuera(o)&&Math.max(Math.abs(o.x-x),Math.abs(o.y-y))<.9)},
  // Se acerca a b hasta quedar a «quiero» casillas, sin pasar de «max»
  mover(S,u,b,quiero,max){const d=this.dist(u,b);if(d<=quiero+.01)return 0;
    const paso=Math.min(max,d-quiero),f=paso/d;let x=u.x+(b.x-u.x)*f,y=u.y+(b.y-u.y)*f;
    // No se ponen encima de otro: prueban a los lados
    if(!this.libre(S,u,x,y)){const cand=[[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1],[0,2],[0,-2]].map(([dx,dy])=>[x+dx,y+dy])
      .filter(([cx,cy])=>this.libre(S,u,cx,cy)&&Math.max(Math.abs(cx-b.x),Math.abs(cy-b.y))<=Math.max(quiero,1)+.01);
      if(cand.length)[x,y]=cand[0]}
    const m=Math.max(Math.abs(x-u.x),Math.abs(y-u.y));u.x=x;u.y=y;return m},
  fuera(u){return u.pj?u.pg>=u.pgM:u.pg>=u.pgM},
  vivos(S,pj){return S.U.filter(u=>!!u.pj===!!pj&&!this.fuera(u))},
  // ---------- registro ----------
  foto(S){return S.U.map(u=>[Math.round(u.x*10)/10,Math.round(u.y*10)/10,u.pg,u.es||0,u.pj?u.hope:0,u.pj?u.ar:0])},
  L(S,t,k){if(S.quiet)return;S.log.push({t,k,f:this.foto(S),fear:S.fear})},
  // ---------- daño ----------
  sevAdv(u,dmg){if(u.minX)return dmg>0?1:0;const [M,G]=u.umb;if(dmg<=0)return 0;if(G!=null&&dmg>=G)return 3;if(M!=null&&dmg>=M)return 2;return 1},
  danarAdv(S,atk,u,dmg,mag){
    if((mag&&u.inM)||(!mag&&u.inF))return `${u.n} es inmune`;
    if((mag&&u.resM)||(!mag&&u.resF))dmg=Math.floor(dmg/2);
    if(u.minX){u.pg=u.pgM;let extra=Math.floor(dmg/u.minX),caen=[u.n];
      if(extra>0)S.U.filter(o=>o!==u&&o.id===u.id&&!this.fuera(o)&&this.enRango(atk,o,atk._ai??0)).slice(0,extra).forEach(o=>{o.pg=o.pgM;caen.push(o.n)});
      atk.st.ko+=caen.length;return `${dmg} de daño: cae${caen.length>1?"n":""} ${caen.join(", ")}`}
    const s=this.sevAdv(u,dmg),antes=u.pg;u.pg=Math.min(u.pgM,u.pg+s);
    if(this.fuera(u))atk.st.ko++;
    return `${dmg} de daño → ${["nada","Menor","Mayor","Grave"][s]}, ${s} PG (${u.pg}/${u.pgM})${this.fuera(u)?" · cae":""}`+(antes<u.pgM/2&&u.pg>=u.pgM/2&&u.horde?" · la horda se debilita":"")},
  danarPJ(S,p,dmg,directo){
    if(dmg<=0)return "sin daño";
    let s=dmg>=p.gra?3:dmg>=p.may?2:1,arm="";
    const libres=p.pgM-p.pg;
    if(!directo&&p.ar<p.arM&&(s>=2||s>=libres)){p.ar++;s--;arm=" · marca Armadura"}
    p.pg=Math.min(p.pgM,p.pg+s);p.st.hp+=s;
    return `${dmg} de daño → ${["nada","Menor","Mayor","Grave"][s+(arm?1:0)]}${arm}, ${s} PG (${p.pg}/${p.pgM})${this.fuera(p)?" · ¡cae! Evita la muerte y queda inconsciente":""}`},
  // ---------- turno de un PJ ----------
  mejorObjetivo(S,p){
    const E=this.vivos(S,0);if(!E.length)return null;
    let best=null;
    for(const a of p.at)for(const e of E){const d=this.dist(p,e),alcanza=d<=SIM_R[a.ai]+6+.01;
      // Foco: primero lo que puede rematar (pocos PG libres), luego lo que más daño hace, y lo cercano
      const libres=e.minX?1:e.pgM-e.pg,pe=Math.min(1,Math.max(0.05,(13+a.mod-e.dif)/12));
      const sc=(alcanza?100:0)-libres*6+this.media(a.D)*pe/3+(e.ty==="Leader"||e.ty==="Support"?3:0)-d*0.3+(S.foco===e.k?4:0);
      if(!best||sc>best.sc)best={sc,a,e,alcanza}}
    return best},
  turnoPJ(S,p){
    const B=this.mejorObjetivo(S,p);if(!B)return true;
    const {a,e}=B;p._ai=a.ai;
    if(!B.alcanza){ // corre: tirada de Agilidad (Dif 10) para ir hasta Lejana; si falla, solo Cercana
      const h=this.d(12),f=this.d(12),tot=h+f+p.agi,ok=tot>=10||h===f,conE=h>f||h===f;
      const m=this.mover(S,p,e,SIM_R[a.ai],ok?12:6);
      this.resultado(S,p,h,f,ok);
      this.L(S,`${p.n} corre hacia ${e.n}: Agilidad ${h}+${f}${this.sg(p.agi)} = ${tot} ${conE?"con Esperanza":"con Miedo"} → avanza ${Math.round(m)} casillas`,"pj");
      return ok&&conE}
    const mv=this.mover(S,p,e,SIM_R[a.ai],6);
    const h=this.d(12),f=this.d(12),crit=h===f;let tot=h+f+a.mod,ex="";
    if(!crit&&tot<e.dif&&p.exp&&p.hope>0&&tot+p.exp>=e.dif){p.hope--;tot+=p.exp;ex=` +${p.exp} (Experiencia, 1 Esperanza)`;p.st.ex++}
    const ok=crit||tot>=e.dif,conE=h>f;
    this.resultado(S,p,h,f,ok);
    let t=`${p.n}${mv>.5?` se mueve ${Math.round(mv)} y`:""} ataca a ${e.n} con ${a.n}: ${h}+${f}${this.sg(a.mod)}${ex} = ${tot} ${crit?"¡crítico!":conE?"con Esperanza":"con Miedo"} contra Dif ${e.dif}`;
    if(ok){p.st.ok++;S.foco=e.k;const r=this.tirar(a.D,crit);p.st.dmg+=r.t;t+=` ✓ ${this.txtD(a.D)}${crit?" (+máx)":""} = ${r.t}. ${this.danarAdv(S,p,e,r.t,a.mag)}`;
      if(e.horde&&e.pg>=e.pgM/2)e.D=e.horde}
    else t+=" ✗ falla";
    this.L(S,t,"pj");
    return ok&&(conE||crit)},
  sg(n){return n?(n>0?"+":"")+n:""},
  resultado(S,p,h,f,ok){
    if(h===f){p.hope=Math.min(6,p.hope+1);p.es=Math.max(0,p.es-1);p.st.cr++;return}
    if(h>f)p.hope=Math.min(6,p.hope+1);else{if(S.fear<12)S.miedoG++;S.fear=Math.min(12,S.fear+1)}},
  // ---------- turno del DM ----------
  objetivoAdv(S,u){
    const P=this.vivos(S,1);if(!P.length)return null;let best=null;
    for(const p of P){const d=this.dist(u,p),alcanza=d<=SIM_R[u.ai]+6+.01,herido=p.pg/p.pgM;
      // Brutos y estándar van al más cercano; a distancia y acechadores, a la Evasión más baja; todos rematan
      const sc=(alcanza?100:0)+herido*8-(["Ranged","Skulk","Support"].includes(u.ty)?p.ev*1.5:d*0.8)+(u.foco===p.k?3:0);
      if(!best||sc>best.sc)best={sc,p,alcanza}}
    return best},
  valorAdv(S,u){const B=this.objetivoAdv(S,u);if(!B)return -1;
    if(u.lento&&!u.listo)return 5;
    const ph=Math.min(.95,Math.max(.05,(21+u.atk-B.p.ev)/20));
    return (B.alcanza?10:2)+ph*this.media(u.D)*(u.ramp?2:1)},
  // Ataque en grupo de los esbirros que estén Cerca del objetivo
  grupo(S,ids){
    let best=null;
    for(const id of ids){const M=this.vivos(S,0).filter(u=>u.id===id);const P=this.vivos(S,1);
      for(const p of P){const G=M.filter(m=>this.dist(m,p)<=6.01);if(G.length>=2&&(!best||G.length>best.G.length))best={G,p}}}
    return best},
  turnoDM(S){
    const E=this.vivos(S,0);if(!E.length)return;
    const sty=SIM_ESTILO[this.cfg().estilo]||SIM_ESTILO.normal,usado={};
    let focos=0,extra=0;
    while(this.vivos(S,1).length&&this.vivos(S,0).length){
      const gratis=focos===0;
      if(!gratis&&(extra>=sty.extra||S.fear<=sty.res))break;
      // Ataque en grupo de esbirros (cuesta 1 Miedo)
      const gaIds=[...new Set(this.vivos(S,0).filter(u=>u.gaD&&!usado[u.k]).map(u=>u.id))];
      const G=S.fear>=1&&S.fear>sty.res-(gratis?1:0)?this.grupo(S,gaIds):null;
      const cand=this.vivos(S,0).filter(u=>(usado[u.k]||0)<u.rel&&!(u.ramp&&S.fear<1)).map(u=>({u,v:this.valorAdv(S,u)})).sort((a,b)=>b.v-a.v);
      const vG=G?G.G.length*G.G[0].gaD*.6:0;
      if(G&&(!cand.length||vG>cand[0].v)){
        S.fear--;S.miedoS++;G.G.forEach(m=>{usado[m.k]=9;this.mover(S,m,G.p,1,6)});
        const m0=G.G[0],r=this.d(20),tot=r+m0.atk,ok=r===20||tot>=G.p.ev;
        let t=`DM gasta 1 Miedo: ataque en grupo de ${G.G.length} ${ADV[m0.id].n} contra ${G.p.n}: ${r}${this.sg(m0.atk)} = ${tot} contra Evasión ${G.p.ev}`;
        if(ok){const dmg=G.G.length*m0.gaD;m0.st.ok++;t+=` ✓ ${this.danarPJ(S,G.p,dmg,false)}`}else t+=" ✗ falla";
        this.L(S,t,"dm");focos++;if(!gratis)extra++;continue}
      if(!cand.length||cand[0].v<0)break;
      const u=cand[0].u;let coste=gratis?0:1;if(u.ramp&&gratis)coste=1;
      if(coste>S.fear)break;
      S.fear-=coste;S.miedoS+=coste;usado[u.k]=(usado[u.k]||0)+1;focos++;if(!gratis)extra++;
      this.accionAdv(S,u,coste);
    }},
  accionAdv(S,u,coste){
    const pre=coste?"DM gasta 1 Miedo: ":"";
    if(u.lento&&!u.listo){u.listo=true;this.L(S,`${pre}${u.n} se prepara (Lento: actuará en su próximo foco)`,"dm");return}
    u.listo=false;
    const B=this.objetivoAdv(S,u);if(!B)return;const p=B.p;u.foco=p.k;
    if(!B.alcanza){const m=this.mover(S,u,p,SIM_R[u.ai],12);this.L(S,`${pre}${u.n} corre ${Math.round(m)} casillas hacia ${p.n}`,"dm");return}
    const mv=this.mover(S,u,p,SIM_R[u.ai],6);
    const blancos=u.ramp?this.vivos(S,1).filter(o=>this.enRango(u,o,u.ai)):[p];
    for(const o of blancos){
      const r=this.d(20),tot=r+u.atk,crit=r===20,ok=crit||tot>=o.ev;
      let t=`${pre}${u.n}${mv>.5?` se mueve ${Math.round(mv)} y`:""} ataca a ${o.n}: ${r}${this.sg(u.atk)} = ${tot}${crit?" ¡crítico!":""} contra Evasión ${o.ev}`;
      if(ok){u.st.ok++;const D=u.horde&&u.pg>=u.pgM/2?u.horde:u.D,dd=this.tirar(D,crit);u.st.dmg+=dd.t;t+=` ✓ ${this.txtD(D)}${crit?" (+máx)":""} = ${dd.t}. ${this.danarPJ(S,o,dd.t,u.directo)}`;
        if(u.mom&&S.fear<12){S.fear++;S.miedoG++;t+=" · Impulso: +1 Miedo"}
        if(u.terr){this.vivos(S,1).forEach(x=>{if(this.dist(u,x)<=12)x.hope=Math.max(0,x.hope-1)});if(S.fear<12){S.fear++;S.miedoG++}t+=" · Aterrador: −1 Esperanza a los PJs, +1 Miedo"}}
      else t+=" ✗ falla";
      this.L(S,t,"dm")}},
  // ---------- bucle ----------
  correr(st,quiet){
    const S=this.montar(st);S.quiet=quiet;
    const P0=this.vivos(S,1),E0=this.vivos(S,0);
    if(!P0.length||!E0.length)return null;
    this.L(S,`Empieza el combate: ${P0.length} PJs contra ${E0.length} adversarios a ${this.cfg().dist} casillas. El DM tiene ${S.fear} Miedo.`,"sys");
    let guard=0,idx=0;
    while(guard++<400){
      const P=this.vivos(S,1);if(!P.length){S.fin="dm";break}if(!this.vivos(S,0).length){S.fin="pj";break}
      // Foco en los PJs: van por turnos, el siguiente que no ha actuado
      const p=P[idx%P.length];idx++;S.acc++;
      const sigue=this.turnoPJ(S,p);
      if(!this.vivos(S,0).length){S.fin="pj";break}
      if(!sigue){S.turno++;this.turnoDM(S)}
    }
    if(!S.fin)S.fin="empate";
    const vivosP=this.vivos(S,1).length,vivosE=this.vivos(S,0).length;
    this.L(S,S.fin==="pj"?`Ganan los PJs en ${S.acc} acciones de PJ y ${S.turno} turnos del DM.`:S.fin==="dm"?`Caen todos los PJs tras ${S.acc} acciones y ${S.turno} turnos del DM.`:`Sin final tras ${S.acc} acciones.`,"sys");
    S.vivosP=vivosP;S.vivosE=vivosE;return S},
  lote(st,n){
    const R={n:0,pj:0,dm:0,em:0,acc:0,turno:0,fear:0,caidas:{},pg:{},miedoS:0};
    for(let i=0;i<n;i++){const S=this.correr(st,true);if(!S)return null;R.n++;R[S.fin==="pj"?"pj":S.fin==="dm"?"dm":"em"]++;R.acc+=S.acc;R.turno+=S.turno;R.fear+=S.fear;R.miedoS+=S.miedoS;
      S.U.filter(u=>u.pj).forEach(u=>{R.caidas[u.n]=(R.caidas[u.n]||0)+(this.fuera(u)?1:0);R.pg[u.n]=(R.pg[u.n]||0)+u.pg})}
    return R},
  // ---------- vista ----------
  view(st){
    const c=this.cfg(),D=this.pjsDisp(st),sel=this.elegidos(st).map(p=>p.id),I=this.items(st),S=ui.sim,R=ui.simLote;
    const lista=Object.entries(Saber.enc.lista||{}).sort((a,b)=>(b[1].t||0)-(a[1].t||0));
    const nItems=Object.values(I).reduce((t,q)=>t+q,0);
    const chip=(attr,v,on,l)=>`<button class="chip" ${attr}="${v}" aria-pressed="${on}">${l}</button>`;
    const cfg=`<section class="block deco simcfg"><header><h2>Simular</h2></header>
      <div class="erow"><span class="lab">PJs</span><span class="btns">${D.map(p=>chip("data-simpj",p.id,sel.includes(p.id),esc(st.pjs[p.id]?.n||p.n))).join("")||`<span class="note">Ninguno</span>`}</span></div>
      <div class="erow"><span class="lab">Distancia</span><span class="btns">${[[6,"Cercana"],[12,"Lejana"],[20,"Muy lejana"]].map(([v,l])=>chip("data-simdist",v,c.dist===v,l)).join("")}</span></div>
      <div class="erow"><span class="lab">Miedo inicial</span><span class="step"><button data-simfear="-1" aria-label="Menos Miedo">−</button><span class="v num">${c.miedo??sel.length}</span><button data-simfear="1" aria-label="Más Miedo">+</button></span></div>
      <div class="erow"><span class="lab">DM</span><span class="btns">${Object.entries(SIM_ESTILO).map(([k,v])=>chip("data-simest",k,c.estilo===k,v.l)).join("")}</span></div>
      <div class="btns"><button class="btn" data-simrun ${sel.length&&nItems?"":"disabled"}>▶ Simular</button><button class="btn ghost" data-simlote ${sel.length&&nItems?"":"disabled"}>×200</button></div>
      ${R?this.vLote(R):""}</section>`;
    return `<div class="simgrid">${cfg}${S?this.vRes(S):""}</div>`},
  vLote(R){const p=x=>Math.round(x/R.n*100);
    return `<div class="simlote"><div class="simbar"><span class="w" style="width:${p(R.pj)}%"></span><span class="l" style="width:${p(R.dm)}%"></span></div>
      <p><b class="num">${p(R.pj)}%</b> ganan los PJs · <b class="num">${p(R.dm)}%</b> caen todos${R.em?` · ${p(R.em)}% sin final`:""}</p>
      <p class="note num">Media: ${(R.acc/R.n).toFixed(1)} acciones de PJ · ${(R.turno/R.n).toFixed(1)} turnos del DM · ${(R.miedoS/R.n).toFixed(1)} Miedo gastado</p>
      <div class="simpjs">${Object.keys(R.pg).map(n=>`<span><b>${esc(n)}</b> <span class="num">${(R.pg[n]/R.n).toFixed(1)} PG · cae ${Math.round(R.caidas[n]/R.n*100)}%</span></span>`).join("")}</div></div>`},
  vRes(S){
    const i=Math.max(0,Math.min(S.log.length-1,ui.simI??S.log.length-1)),e=S.log[i];
    const fin=S.fin==="pj"?"Ganan los PJs":S.fin==="dm"?"Caen todos los PJs":"Sin final";
    return `<section class="block deco simres"><header><h2>${fin}</h2><span class="note num">${S.acc} acciones · ${S.turno} turnos del DM · Miedo ${S.fear}</span></header>
      ${this.mapa(S,e)}
      <div class="simnav"><button class="btn ghost" data-simi="${i-1}" ${i?"":"disabled"} aria-label="Anterior">◀</button><input type="range" id="sim-i" min="0" max="${S.log.length-1}" value="${i}" aria-label="Paso"><button class="btn ghost" data-simi="${i+1}" ${i<S.log.length-1?"":"disabled"} aria-label="Siguiente">▶</button></div>
      <p class="simnow ${e.k}">${esc(e.t)}</p>
      ${this.fichas(S,e)}
      <ol class="simlog">${S.log.map((l,j)=>`<li class="${l.k}${j===i?" on":""}"><button data-simi="${j}">${esc(l.t)}</button></li>`).join("")}</ol></section>`},
  fichas(S,e){
    return `<div class="simfx">${S.U.map((u,j)=>{const [, ,pg,es,hope,ar]=e.f[j],out=pg>=u.pgM;
      return `<div class="simu ${u.pj?"pj":"ad"}${out?" out":""}" ${u.pj?"":`style="--ty:${ACOL[u.ty]}"`}><b>${esc(u.n)}</b>
        <span class="num">PG ${pg}/${u.pgM}${u.pj?` · Es ${es}/${u.esM} · Arm ${ar}/${u.arM} · <span class="hope">◆ ${hope}</span>`:""}</span></div>`}).join("")}
      <div class="simu dm"><b>DM</b><span class="num">Miedo ${e.fear}</span></div></div>`},
  // Mapa de la posición en ese paso: cuadrícula, PJs a la izquierda y adversarios a la derecha
  mapa(S,e){
    const P=e.f.map(([x,y])=>[x,y]),xs=P.map(p=>p[0]),ys=P.map(p=>p[1]);
    const x0=Math.min(...xs)-2,x1=Math.max(...xs)+2,y0=Math.min(...ys)-2,y1=Math.max(...ys)+2,W=x1-x0,H=Math.max(6,y1-y0);
    let g="";for(let x=Math.ceil(x0);x<=x1;x++)g+=`<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0+H}"/>`;for(let y=Math.ceil(y0);y<=y0+H;y++)g+=`<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}"/>`;
    const tok=S.U.map((u,j)=>{const [x,y,pg]=e.f[j],out=pg>=u.pgM,num=(u.n.match(/ (\d+)$/)||[])[1],ini=num?u.n[0]+num:u.n.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9 ]/g,"").split(" ").map(w=>w[0]).join("").slice(0,2);
      return `<g class="simt${out?" out":""}" transform="translate(${x} ${y})"><title>${esc(u.n)}</title><circle r=".45" fill="${u.pj?"var(--gold)":ACOL[u.ty]}"/><text y=".16">${esc(ini)}</text></g>`}).join("");
    return `<svg class="simmap" viewBox="${x0} ${y0} ${W} ${H}" role="img" aria-label="Posiciones"><g class="simgrid0">${g}</g>${tok}</svg>`},
  click(b,st){const d=b.dataset,c=this.cfg();
    if(d.simpj){const sel=this.elegidos(st).map(p=>p.id),i=sel.indexOf(d.simpj);if(i<0)sel.push(d.simpj);else sel.splice(i,1);c.pjs=sel;this.saveCfg();render();return true}
    if(d.simdist){c.dist=+d.simdist;this.saveCfg();render();return true}
    if(d.simfear){c.miedo=Math.max(0,Math.min(12,(c.miedo??this.elegidos(st).length)+ +d.simfear));this.saveCfg();render();return true}
    if(d.simest){c.estilo=d.simest;this.saveCfg();render();return true}
    if(b.hasAttribute("data-simrun")){ui.sim=this.correr(st,false);ui.simI=null;render();return true}
    if(b.hasAttribute("data-simlote")){ui.simLote=this.lote(st,200);render();return true}
    if(d.simi!==undefined){ui.simI=+d.simi;render();return true}
    return false},
  input(t){if(t.id==="sim-i"){ui.simI=+t.value;render();const r=$("#sim-i");if(r)r.focus();return true}return false},
  change(t){return false}
};
