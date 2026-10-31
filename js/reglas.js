/* Reglas de Velmara: funciones puras que reciben el estado, lo cambian o lanzan Nope con el motivo. */
class Nope extends Error{}
const no=m=>{throw new Nope(m)};
function freshState(){
  const pjs={};PJS.forEach(p=>pjs[p.id]={arma:null,sec:null,armadura:null,bolsa:[],inv:{},propios:{}});
  const st={v:3,mundo:mundoInicial(),pjs,puntos:{},exist:{},pagos:{},botes:{},log:[{t:Date.now(),x:"Empieza la partida."}]};
  for(const t of TIENDAS)fillShop(st,t,true);
  return st;
}
// Puntos y existencias iniciales de una tienda (solo lo que falte, salvo que se pida empezar de cero)
function fillShop(st,t,fresh){
  if(fresh||!st.puntos[t.id]){st.puntos[t.id]={};if(t.modo==="grupo")st.puntos[t.id]._grupo=+t.inicial||0;else PJS.forEach(p=>st.puntos[t.id][p.id]=+t.inicial||0)}
  const ex=st.exist[t.id]=fresh?{}:(st.exist[t.id]||{});
  for(const [ref,e] of Object.entries(t.items||{}))if(e&&e.s!=null&&e.s!==""&&ex[ref]==null)ex[ref]=+e.s;
}
function mundoInicial(){
  const lugares={},tiendas={};
  LUGARES.forEach((l,i)=>{lugares[l.id]={visible:i===0,nota:""}});
  TIENDAS.forEach(t=>tiendas[t.id]={abierta:false,nota:""});
  return {lugares,tiendas};
}
// Catálogo: "w:<arma>", "a:<armadura>", "o:<objeto>"
const refX=ref=>{const id=ref.slice(2);return ref[0]==="w"?WEAPON[id]:ref[0]==="a"?ARMOR[id]:ref[0]==="o"?ITEM[id]:null};
function costOf(t,ref){const e=t?.items?.[ref];if(!e)return null;if(e.p!=null&&e.p!=="")return +e.p;const x=refX(ref);return ref[0]==="o"&&x?price(x):0}
const mon=(t,n)=>`${n} ${n===1?String(t.moneda||"puntos").replace(/s$/,""):t.moneda||"puntos"}`;
const potKey=(t,pj)=>t.modo==="grupo"?"_grupo":pj;
function pts(st,tid,pj){return st.puntos?.[tid]?.[potKey(TIENDA[tid],pj)]||0}
function addPts(st,tid,pj,d){const t=TIENDA[tid],k=pj==="_grupo"?pj:potKey(t,pj);st.puntos[tid]=st.puntos[tid]||{};
  const v=(st.puntos[tid][k]||0)+d;if(v<0)no(t.modo==="grupo"?`A la bolsa común le faltan ${mon(t,-v)}.`:`Te faltan ${mon(t,-v)}.${t.botes?" Abre un bote para que el grupo ponga el resto.":""}`);st.puntos[tid][k]=v}
function shopOpen(st,tid){const t=TIENDA[tid];if(!t||t.borrado)no("Esa tienda ya no existe.");if(!st.mundo?.tiendas?.[tid]?.abierta)no(`${t.n} está cerrada ahora mismo.`);return t}
// Devolver una pieza única: si se pagó, se recuperan los puntos en la tienda donde se cogió
function refund(st,id){const pg=st.pagos?.[id];if(pg&&TIENDA[pg.t]&&pg.p)addPts(st,pg.t,pg.pj,pg.p);if(st.pagos)delete st.pagos[id]}
// Avisos para el DM: lo que los jugadores se añaden a la mochila por su cuenta
function aviso(st,pj,x){st.avisos=[{t:Date.now(),pj,x},...(Array.isArray(st.avisos)?st.avisos:Object.values(st.avisos||{}))].slice(0,40)}
function log(st,x){st.log=[{t:Date.now(),x},...(st.log||[])].slice(0,150)}
function need(st){if(!st||!st.pjs)no("La partida todavía no ha empezado. Avisa al DM.");return st}
// Quién tiene una pieza de la armería: equipada en cualquier hueco o guardada en su bolsa
const holderOf=(st,slot,id)=>PJS.find(p=>{const s=st.pjs[p.id];return s.arma===id||s.sec===id||s.armadura===id||(s.bolsa||[]).includes(id)})?.id;
// Tier cuya casilla marca un avance: la del tier actual si queda, si no la de uno anterior
function tierLibre(h,k,n){const A=avancesDe(h);for(let t=tierDe(n);t>=2;t--)if((AV[k].min||2)<=t&&A.filter(a=>a.k===k&&a.t===t).length<CASILLAS[k])return t;return tierDe(n)}
const BOLSA_MAX=2; // armas de inventario, como en la hoja de Daggerheart
// Una referencia de equipo es el id de la armería o "p:<id>" para un objeto propio del jugador
function gearInfo(st,pj,ref){
  if(!ref)return null;
  if(ref.startsWith("p:")){const o=st.pjs[pj].propios[ref.slice(2)];if(!o)return null;
    // Un propio con base es equipo de tier 1 del creador: lleva sus datos de arma o armadura
    // base "w:<id>" / "a:<id>" = copia de un arma o armadura del Compendio; si no, equipo de tier 1 del creador
    const b=!o.base?null:o.base.startsWith("w:")?WEAPON[o.base.slice(2)]:o.base.startsWith("a:")?ARMOR[o.base.slice(2)]:typeof T1!=="undefined"?T1[o.base]:null;
    return {ref,n:o.n,slot:{pri:"arma",sec:"sec",arm:"armadura"}[o.tipo]||null,h:o.h===2?2:1,propio:true,o,...(b?(b.g?{w:b}:{a:b}):{})}}
  if(WEAPON[ref])return {ref,n:WEAPON[ref].n,slot:WEAPON[ref].g==="sec"?"sec":"arma",h:WEAPON[ref].h,w:WEAPON[ref]};
  if(ARMOR[ref])return {ref,n:ARMOR[ref].n,slot:"armadura",h:0,a:ARMOR[ref]};
  return null;
}
function pending(st,para,itemId){return Object.values(st.botes||{}).filter(b=>b.para===para&&b.item===itemId).length}
function checkCanReceive(st,para,it){
  const have=st.pjs[para].inv[it.id]||0, pend=pending(st,para,it.id);
  if(it.k==="cons"&&have+pend>=MAX_CONS)no(`${PJ[para].n} ya lleva ${MAX_CONS} de «${it.n}» (máximo por PJ).`);
  if(it.k==="rec"&&have+pend>0)no(`${PJ[para].n} ya tiene «${it.n}».`);
}
function reserve(st,tid,ref){
  const e=TIENDA[tid].items[ref];if(!e||e.s==null||e.s==="")return;
  const ex=st.exist[tid]=st.exist[tid]||{};if((ex[ref]??0)<=0)no(`«${refX(ref).n}» está agotado.`);
  ex[ref]--;
}
const A={
  // Coger una pieza única. Lo que hubiera en ese hueco vuelve a la tienda (o a la lista, si es propio).
  equip(st,pj,tid,slot,id){
    need(st);const t=shopOpen(st,tid),me=st.pjs[pj],ref=(slot==="armadura"?"a:":"w:")+id,cost=costOf(t,ref);
    if(cost==null)no("Esta tienda no la tiene.");
    const other=holderOf(st,slot,id);
    if(other&&other!==pj)no(`Esa ya la ha cogido ${PJ[other].n}.`);
    if(other===pj)return A.slot(st,pj,id,slot);
    const main=slot==="sec"&&me.arma&&gearInfo(st,pj,me.arma);
    if(main&&main.h===2)no("Tu arma principal es a dos manos: no te deja llevar secundaria.");
    if(cost>0){addPts(st,tid,pj,-cost);st.pagos[id]={pj,t:tid,p:cost}}
    const back=r=>{if(r&&!r.startsWith("p:")){refund(st,r);log(st,`${PJ[pj].n} devuelve ${(WEAPON[r]||ARMOR[r]).n}.`)}};
    if(slot==="arma"&&WEAPON[id].h===2&&me.sec){back(me.sec);me.sec=null}
    back(me[slot]);me[slot]=id;
    log(st,`${PJ[pj].n} se lleva ${slot==="armadura"?ARMOR[id].n:WEAPON[id].n}${cost?` (${mon(t,cost)})`:""}.`);
    return st;
  },
  devolver(st,pj,id){
    need(st);const me=st.pjs[pj];
    ["arma","sec","armadura"].forEach(k=>{if(me[k]===id)me[k]=null});me.bolsa=me.bolsa.filter(x=>x!==id);refund(st,id);
    log(st,`${PJ[pj].n} devuelve ${(WEAPON[id]||ARMOR[id]).n}.`);return st;
  },
  buy(st,pj,tid,ref,para){
    need(st);const t=shopOpen(st,tid),it=refX(ref),cost=costOf(t,ref);
    if(cost==null||!it||ref[0]!=="o")no("Esta tienda no lo vende.");
    checkCanReceive(st,para,it);addPts(st,tid,pj,-cost);reserve(st,tid,ref);
    st.pjs[para].inv[it.id]=(st.pjs[para].inv[it.id]||0)+1;
    log(st,para===pj?`${PJ[pj].n} compra ${it.n} (${mon(t,cost)}).`:`${PJ[pj].n} compra ${it.n} para ${PJ[para].n} (${mon(t,cost)}).`);
    return st;
  },
  openPot(st,pj,tid,ref,para,id){
    need(st);const t=shopOpen(st,tid),it=refX(ref),cost=costOf(t,ref);
    if(!t.botes||t.modo==="grupo")no("En esta tienda no se hacen botes.");
    if(cost==null||!it)no("Esta tienda no lo vende.");
    checkCanReceive(st,para,it);reserve(st,tid,ref);
    st.botes[id]={tienda:tid,ref,item:it.id,p:cost,para,por:pj,aportes:{},t:Date.now()};
    log(st,`${PJ[pj].n} abre un bote para ${it.n} (para ${PJ[para].n}).`);
    return A.give(st,pj,id,1,true);
  },
  give(st,pj,id,d,quiet){
    need(st);const b=st.botes[id];if(!b)no("Ese bote ya no existe.");
    const t=TIENDA[b.tienda],it=ITEM[b.item],p=b.p;
    const sum=Object.values(b.aportes).reduce((a,n)=>a+n,0),mine=b.aportes[pj]||0;
    if(d>0){shopOpen(st,b.tienda);if(sum>=p)no("El bote ya está completo.")}
    if(d<0&&mine<1)no(`No has puesto ${t.moneda} en este bote.`);
    addPts(st,b.tienda,pj,-d);b.aportes[pj]=mine+d;if(!b.aportes[pj])delete b.aportes[pj];
    if(!quiet)log(st,`${PJ[pj].n} ${d>0?"pone":"retira"} ${mon(t,1)} ${d>0?"en":"del"} bote de ${it.n}.`);
    if(sum+d>=p){
      st.pjs[b.para].inv[b.item]=(st.pjs[b.para].inv[b.item]||0)+1;
      const who=Object.entries(b.aportes).map(([k,n])=>`${PJ[k].n} ${n}`).join(", ");
      log(st,`Bote completo: ${PJ[b.para].n} recibe ${it.n} (${who}).`);
      delete st.botes[id];
    }
    return st;
  },
  cancelPot(st,pj,id){
    need(st);const b=st.botes[id];if(!b)no("Ese bote ya no existe.");
    Object.entries(b.aportes).forEach(([k,n])=>addPts(st,b.tienda,k,n));
    const e=TIENDA[b.tienda]?.items?.[b.ref];if(e&&e.s!=null&&e.s!==""){const ex=st.exist[b.tienda]=st.exist[b.tienda]||{};ex[b.ref]=(ex[b.ref]||0)+1}
    delete st.botes[id];
    log(st,`${PJ[pj].n} cancela el bote de ${ITEM[b.item].n}; cada uno recupera lo suyo.`);
    return st;
  },
  use(st,pj,itemId){
    need(st);const inv=st.pjs[pj].inv;if(!inv[itemId])no("No lo tienes.");
    if(--inv[itemId]<=0)delete inv[itemId];
    log(st,`${PJ[pj].n} usa ${ITEM[itemId].n}.`);return st;
  },
  pass(st,pj,itemId,to){
    need(st);const inv=st.pjs[pj].inv,it=ITEM[itemId];if(!inv[itemId])no("No lo tienes.");
    if(it.k==="rec")no("Una receta se aprende: no se puede pasar.");
    checkCanReceive(st,to,it);
    if(--inv[itemId]<=0)delete inv[itemId];
    st.pjs[to].inv[itemId]=(st.pjs[to].inv[itemId]||0)+1;
    log(st,`${PJ[pj].n} le da ${it.n} a ${PJ[to].n}.`);return st;
  },
  brew(st,pj,recId){
    need(st);const r=ITEM[recId],me=st.pjs[pj];if(!Object.values(st.pjs).some(x=>x.inv?.[recId]))no("Nadie del grupo conoce esa receta.");
    const it=ITEM[r.mk];if((me.inv[it.id]||0)>=MAX_CONS)no(`Ya llevas ${MAX_CONS} de «${it.n}».`);
    me.inv[it.id]=(me.inv[it.id]||0)+1;
    log(st,`${PJ[pj].n} prepara ${it.n} (gasta: ${r.ing.replace(/\.$/,"").toLowerCase()}).`);return st;
  },
  // DM: puntos (de un PJ o "_grupo"), reparto y existencias de una tienda
  vales(st,tid,pj,d){need(st);const t=TIENDA[tid];addPts(st,tid,pj,d);log(st,`El DM ${d>0?"da":"quita"} ${mon(t,Math.abs(d))} ${pj==="_grupo"?"a la bolsa común":`a ${PJ[pj].n}`} (${t.n}).`);return st},
  valesAll(st,tid,n){need(st);const t=TIENDA[tid];if(t.modo==="grupo")addPts(st,tid,"_grupo",n);else PJS.filter(p=>!p.prueba).forEach(p=>addPts(st,tid,p.id,n));
    log(st,t.modo==="grupo"?`El DM pone ${mon(t,n)} en la bolsa común (${t.n}).`:`El DM reparte ${mon(t,n)} a cada PJ (${t.n}).`);return st},
  setStock(st,tid,ref,v){need(st);const ex=st.exist[tid]=st.exist[tid]||{};if(v==null)delete ex[ref];else ex[ref]=Math.max(0,v);return st},
  stock(st,tid,ref,d){need(st);const e=TIENDA[tid]?.items?.[ref];if(!e||e.s==null||e.s==="")no("Eso no se agota.");const ex=st.exist[tid]=st.exist[tid]||{};ex[ref]=Math.max(0,(ex[ref]??0)+d);return st},
  // Empezar de cero: existencias, puntos, inventarios y equipo; lugares, tiendas, hojas y objetos propios se quedan
  reset(st){const n=freshState();if(st?.mundo)n.mundo=st.mundo;if(st?.hojas)n.hojas=st.hojas;if(st?.chatarra)n.chatarra=st.chatarra;
    if(st?.pjs)PJS.forEach(p=>{n.pjs[p.id].propios=st.pjs[p.id]?.propios||{}});return n},
  // Inventario: mover una pieza a un hueco (arma, sec, armadura) o quitarla (slot null)
  slot(st,pj,ref,slot){
    need(st);const me=st.pjs[pj],g=gearInfo(st,pj,ref);if(!g)no("No tienes esa pieza.");
    const from=["arma","sec","armadura"].find(k=>me[k]===ref)||(me.bolsa.includes(ref)?"bolsa":ref.startsWith("p:")?"lista":null);
    if(!from)no("No tienes esa pieza.");
    const stash=r=>{if(!r||r.startsWith("p:"))return;
      if(ARMOR[r])no("Una armadura de la armería no cabe en la bolsa: devuélvela en la tienda.");
      if(me.bolsa.length>=BOLSA_MAX)no(`La bolsa ya lleva ${BOLSA_MAX} armas. Suelta o devuelve una antes.`);
      me.bolsa.push(r)};
    const take=()=>{if(from==="bolsa")me.bolsa=me.bolsa.filter(x=>x!==ref);else if(from!=="lista")me[from]=null};
    if(!slot){if(from==="bolsa"||from==="lista")return st;take();stash(ref);return st}
    if(g.slot!==slot)no(`${g.n} no va en ese hueco.`);
    if(from===slot)return st;
    const main=slot==="sec"&&me.arma&&gearInfo(st,pj,me.arma);
    if(main&&main.h===2)no("Tu arma principal es a dos manos: no te deja llevar secundaria.");
    take();const old=me[slot];me[slot]=ref;stash(old);log(st,`${PJ[pj]?.n||pj} se equipa ${g.n}.`);
    if(slot==="arma"&&g.h===2&&me.sec){const s2=me.sec;me.sec=null;stash(s2)}
    return st;
  },
  // Añadir a la mochila algo del Compendio (ref "o:", "w:" o "a:"); se avisa al DM
  anadir(st,pj,ref,pid){need(st);const me=st.pjs[pj],x=refX(ref);if(!x)no("Eso ya no está en el Compendio.");
    if(ref[0]==="o"){checkCanReceive(st,pj,x);me.inv[x.id]=(me.inv[x.id]||0)+1}
    else{if(Object.keys(me.propios).length>=40)no("Demasiados objetos propios.");
      me.propios[pid]={n:x.n,tipo:ref[0]==="a"?"arm":x.g==="sec"?"sec":"pri",...(ref[0]==="w"&&x.h===2?{h:2}:{}),q:1,base:ref,d:""}}
    aviso(st,pj,`${PJ[pj]?.n||pj} se ha añadido «${x.n}» del Compendio.`);log(st,`${PJ[pj]?.n||pj} se añade ${x.n}.`);return st},
  // Cinturón del inventario: objetos sacados de la mochila para ver su carta de un vistazo
  rapido(st,pj,ref,on){need(st);const me=st.pjs[pj],L=(me.rap||[]).filter(r=>r!==ref);
    if(on){if(L.length>=8)no("El cinturón ya lleva 8 cosas.");L.push(ref)}me.rap=L;return st},
  propioNuevo(st,pj,id,obj){need(st);A.propio(st,pj,id,obj);aviso(st,pj,`${PJ[pj]?.n||pj} ha creado un objeto propio: «${obj.n}» (${({obj:"objeto",cons:"consumible",pri:"arma principal",sec:"arma secundaria",arm:"armadura"})[obj.tipo]||"objeto"}).`);return st},
  propio(st,pj,id,obj){need(st);const me=st.pjs[pj];
    if(obj===null){["arma","sec","armadura"].forEach(k=>{if(me[k]==="p:"+id)me[k]=null});if(me.propios[id])log(st,`${PJ[pj]?.n||pj} tira «${me.propios[id].n}».`);delete me.propios[id];return st}
    if(!me.propios[id]&&Object.keys(me.propios).length>=40)no("Demasiados objetos propios.");
    me.propios[id]={...(me.propios[id]||{}),...obj};
    if(me.propios[id].q<=0){["arma","sec","armadura"].forEach(k=>{if(me[k]==="p:"+id)me[k]=null});delete me.propios[id]}
    return st},
  /* Crear un PJ (el creador guiado). d trae la hoja ya hecha y el equipo inicial. La ficha (nombre, foto…) va aparte, en Contenido. */
  crear(st,id,d){need(st);if(st.hojas[id])no("Ese personaje ya existe.");
    st.hojas[id]=d.hoja;const me=st.pjs[id]={arma:null,sec:null,armadura:null,bolsa:[],inv:{},propios:{}};
    let i=0;const put=(o,slot)=>{const k="c"+(i++)+Date.now().toString(36);me.propios[k]={q:1,...o};if(slot)me[slot]="p:"+k};
    const w=x=>({n:x.n,tipo:x.g==="sec"?"sec":"pri",h:x.h,base:x.id,d:""});
    if(d.pri)put(w(T1[d.pri]),"arma");if(d.sec)put(w(T1[d.sec]),"sec");
    if(d.arm)put({n:T1[d.arm].n,tipo:"arm",h:0,base:d.arm,d:""},"armadura");
    if(d.item)put({n:d.item,tipo:"obj",d:"Objeto de clase."});
    put({n:"Equipo básico",tipo:"obj",d:"Una antorcha, 15 m de cuerda y provisiones básicas."});
    if(d.pot)me.inv[d.pot]=1;
    if(d.fardo)put({n:"Fardo nómada",tipo:"obj",d:"Una vez por sesión, gasta 1 Esperanza para sacar un objeto común útil."});
    for(const t of TIENDAS)if(t.modo!=="grupo"){st.puntos[t.id]=st.puntos[t.id]||{};if(st.puntos[t.id][id]==null)st.puntos[t.id][id]=+t.inicial||0}
    log(st,`${d.n} se une a la partida.`);return st},
  // DM: borrar un PJ con todo lo suyo (las piezas de la armería quedan libres al quitar su inventario)
  borrarPJ(st,id){need(st);const n=PJ[id]?.n||id;
    for(const r of Object.keys(st.pagos||{}))if(st.pagos[r].pj===id)delete st.pagos[r];
    for(const t in st.puntos||{})delete st.puntos[t][id];
    for(const k in st.botes||{}){const b=st.botes[k];if(b.para===id||b.por===id){Object.entries(b.aportes||{}).forEach(([q,v])=>{if(q!==id)addPts(st,b.tienda,q,v)});delete st.botes[k]}else if(b.aportes)delete b.aportes[id]}
    delete st.pjs[id];delete st.hojas[id];log(st,`${n} deja la partida.`);return st},
  // DM: nivel al que puede subir el grupo
  nivelGrupo(st,n){need(st);st.mundo.nivel=Math.max(1,Math.min(10,n));log(st,`El grupo ya puede llegar a nivel ${st.mundo.nivel}.`);return st},
  /* Subir un nivel. s: {a:[avances], exp:"nueva experiencia" (niveles 2, 5, 8), carta:id}. Se guarda lo que había antes
     de experiencias y cartas para poder deshacerla. */
  subir(st,pj,s){need(st);const h=st.hojas[pj],n=(h.nivel||1)+1;
    if(n>st.mundo.nivel)no("El DM aún no ha abierto ese nivel.");
    const cost=(s.a||[]).reduce((t,a)=>t+(AV[a.k]?.coste||1),0);if(cost!==2)no("Elige dos avances.");
    const prev={exp:structuredClone(h.exp),cartas:h.cartas.slice(),baul:h.baul.slice()};
    if([2,5,8].includes(n)){if(!s.exp?.trim())no("Escribe tu nueva Experiencia.");h.exp.push({n:s.exp.trim().slice(0,60),b:2})}
    const add=id=>{if(!id)return;if(h.cartas.includes(id)||h.baul.includes(id))no("Ya tienes esa carta.");(h.cartas.length<5?h.cartas:h.baul).push(id)};
    add(s.carta);
    h.subidas=h.subidas||{};const sub=h.subidas["n"+n]={a:[],prev,exp:s.exp?.trim()||"",carta:s.carta||""};
    // Se van marcando de uno en uno, así elegir dos veces el mismo avance gasta dos casillas
    for(const a of s.a){if(casillasLibres(h,a.k,n)<1)no(`«${AV[a.k].n}» ya no tiene casillas libres.`);
      if(a.k==="rasgos"){const M=rasgosMarcados(h,n);if((a.r||[]).length!==2||a.r[0]===a.r[1]||a.r.some(k=>M.has(k)))no("Elige dos rasgos distintos sin marcar.")}
      if(a.k==="exp")(a.i||[]).forEach(i=>{if(h.exp[i])h.exp[i].b++});
      if(a.k==="carta")add(a.id);
      if(a.k==="sub"&&h.sub==="conocimiento")add(a.id); // Consumado y Brillante: una carta más
      sub.a.push({...a,t:tierLibre(h,a.k,n)})}
    h.nivel=n;log(st,`${PJ[pj]?.n||"Un PJ"} sube a nivel ${n}.`);return st},
  bajar(st,pj){need(st);const h=st.hojas[pj],n=h.nivel||1,s=h.subidas?.["n"+n];if(n<=1||!s)no("No hay subida que deshacer.");
    if(s.prev){h.exp=s.prev.exp;h.cartas=s.prev.cartas||[];h.baul=s.prev.baul||[]}
    delete h.subidas["n"+n];h.nivel=n-1;return st},
  // Hoja de personaje: el jugador cambia su propia hoja (mut recibe la hoja y la modifica)
  hoja(st,pj,mut){need(st);mut(st.hojas[pj]);return st},
  // Cambios de lo que se eligió al crear el PJ (clase, herencia, rasgos…): se avisa al DM
  hojaBase(st,pj,campo,v){need(st);const h=st.hojas[pj];if(!h)no("Ese personaje no tiene hoja.");
    const nm=PJ[pj]?.n||pj;let txt;
    if(campo==="clase"){if(!CLASES[v])no("Esa clase no existe.");h.clase=v;h.sub=CLASE_INFO[v].subs[0].id;txt=`clase a ${CLASES[v].n} (${SUB[h.sub].n})`}
    else if(campo==="sub"){if(SUB[v]?.clase!==h.clase)no("Esa subclase no es de tu clase.");h.sub=v;txt=`subclase a ${SUB[v].n}`}
    else if(campo==="asc1"||campo==="asc2"){if(!ASC[v])no("Esa ascendencia no existe.");h[campo]=v;if(h.asc2===h.asc1)h.asc2="";txt=`ascendencia a ${nombreAsc(h)}`}
    else if(campo==="mixta"){if(v){h.asc2=ASCENDENCIAS.find(a=>a.id!==h.asc1).id}else{h.asc2="";h.ascN=""}txt=v?`ascendencia a mixta (${nombreAsc(h)})`:`ascendencia a ${nombreAsc(h)}`}
    else if(campo==="com"){if(!COM[v])no("Esa comunidad no existe.");h.com=v;txt=`comunidad a ${COM[v].es||COM[v].n}`}
    else if(campo==="item"){h.item=String(v).slice(0,80);txt=`objeto de clase a «${h.item}»`}
    else if(campo.startsWith("r.")){const r=campo.slice(2),n=Math.max(-3,Math.min(5,+v||0));if(!RASGO[r])no("Ese rasgo no existe.");h.rasgos[r]=n;txt=`${RASGO[r]} base a ${n>0?"+":""}${n}`}
    else no("No se puede cambiar eso.");
    aviso(st,pj,`${nm} ha cambiado su ${txt}.`);log(st,`${nm} cambia su ${txt}.`);return st},
  lugar(st,id,patch){need(st);Object.assign(st.mundo.lugares[id],patch);
    if("visible" in patch)log(st,patch.visible?`Se abre el camino a ${LUGARES.find(l=>l.id===id).n}.`:`${LUGARES.find(l=>l.id===id).n} deja de estar disponible.`);return st},
  tienda(st,id,patch){need(st);st.mundo.tiendas[id]=st.mundo.tiendas[id]||{abierta:false,nota:""};Object.assign(st.mundo.tiendas[id],patch);
    if("abierta" in patch)log(st,`${TIENDA[id].n} ${patch.abierta?"abre sus puertas":"cierra"}.`);return st}
};


