/* Reglas de Velmara: funciones puras que reciben el estado, lo cambian o lanzan Nope con el motivo. */
class Nope extends Error{}
const no=m=>{throw new Nope(m)};
function freshState(){
  const pjs={};PJS.forEach(p=>pjs[p.id]={vales:3,arma:null,sec:null,armadura:null,inv:{}});
  const stock={};ITEMS.forEach(i=>{if(i.s!=null)stock[i.id]=i.s});
  return {v:2,mundo:mundoInicial(),pjs,stock,botes:{},log:[{t:Date.now(),x:"Empieza la partida. Tres vales por cabeza."}]};
}
// Al principio solo se ve Aelrennor y la tienda está cerrada hasta que el DM la abra
function mundoInicial(){
  const lugares={},tiendas={};
  LUGARES.forEach((l,i)=>{lugares[l.id]={visible:i===0,nota:""};l.tiendas.forEach(t=>tiendas[t.id]={abierta:false,nota:""})});
  return {lugares,tiendas};
}
const SHOP="tres-agujas";
function shopOpen(st,id){if(!st.mundo?.tiendas?.[id]?.abierta)no(`${TIENDA[id].n} está cerrada ahora mismo.`)}
function log(st,x){st.log=[{t:Date.now(),x},...(st.log||[])].slice(0,60)}
function need(st){if(!st||!st.pjs)no("La partida todavía no ha empezado. Avisa al DM.");return st}
const holderOf=(st,slot,id)=>PJS.find(p=>st.pjs[p.id][slot]===id)?.id;
function pending(st,para,itemId){return Object.values(st.botes||{}).filter(b=>b.para===para&&b.item===itemId).length}
function checkCanReceive(st,para,it){
  const have=st.pjs[para].inv[it.id]||0, pend=pending(st,para,it.id);
  if(it.k==="cons"&&have+pend>=MAX_CONS)no(`${PJ[para].n} ya lleva ${MAX_CONS} de «${it.n}» (máximo por PJ).`);
  if(it.k==="rec"&&have+pend>0)no(`${PJ[para].n} ya tiene «${it.n}».`);
}
function reserve(st,it){
  if(it.s==null)return;
  if((st.stock[it.id]??0)<=0)no(`«${it.n}» está agotado.`);
  st.stock[it.id]--;
}
const A={
  equip(st,pj,slot,id){
    need(st);shopOpen(st,SHOP);const me=st.pjs[pj];
    if(id){
      const other=holderOf(st,slot,id);
      if(other&&other!==pj)no(`Esa ya la ha cogido ${PJ[other].n}.`);
      if(slot==="sec"&&me.arma&&WEAPON[me.arma].h===2)no("Tu arma principal es a dos manos: no te deja llevar secundaria.");
      if(slot==="arma"&&WEAPON[id].h===2&&me.sec){log(st,`${PJ[pj].n} deja su ${WEAPON[me.sec].n} para usar un arma a dos manos.`);me.sec=null}
      me[slot]=id;
      log(st,`${PJ[pj].n} se lleva ${slot==="armadura"?ARMOR[id].n:WEAPON[id].n}.`);
    }else{
      const old=me[slot];me[slot]=null;
      if(old)log(st,`${PJ[pj].n} devuelve ${slot==="armadura"?ARMOR[old].n:WEAPON[old].n} a la armería.`);
    }
    return st;
  },
  buy(st,pj,itemId,para){
    need(st);shopOpen(st,SHOP);const it=ITEM[itemId],p=price(it),me=st.pjs[pj];
    if(me.vales<p)no(`Te faltan ${p-me.vales} vale(s). Abre un bote para que el grupo ponga el resto.`);
    checkCanReceive(st,para,it);reserve(st,it);
    me.vales-=p;st.pjs[para].inv[itemId]=(st.pjs[para].inv[itemId]||0)+1;
    log(st,para===pj?`${PJ[pj].n} compra ${it.n} (${p} vale${p>1?"s":""}).`:`${PJ[pj].n} compra ${it.n} para ${PJ[para].n} (${p} vale${p>1?"s":""}).`);
    return st;
  },
  openPot(st,pj,itemId,para,id){
    need(st);shopOpen(st,SHOP);const it=ITEM[itemId];
    checkCanReceive(st,para,it);reserve(st,it);
    st.botes[id]={item:itemId,para,por:pj,aportes:{},t:Date.now()};
    log(st,`${PJ[pj].n} abre un bote para ${it.n} (para ${PJ[para].n}).`);
    return A.give(st,pj,id,1,true);
  },
  give(st,pj,id,d,quiet){
    need(st);const b=st.botes[id];if(!b)no("Ese bote ya no existe.");
    const it=ITEM[b.item],p=price(it),me=st.pjs[pj];
    const sum=Object.values(b.aportes).reduce((a,n)=>a+n,0),mine=b.aportes[pj]||0;
    if(d>0){shopOpen(st,SHOP);if(me.vales<1)no("No te quedan vales.");if(sum>=p)no("El bote ya está completo.");}
    if(d<0&&mine<1)no("No has puesto vales en este bote.");
    me.vales-=d;b.aportes[pj]=mine+d;if(!b.aportes[pj])delete b.aportes[pj];
    if(!quiet)log(st,`${PJ[pj].n} ${d>0?"pone":"retira"} 1 vale ${d>0?"en":"del"} bote de ${it.n}.`);
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
    Object.entries(b.aportes).forEach(([k,n])=>st.pjs[k].vales+=n);
    if(ITEM[b.item].s!=null)st.stock[b.item]++;
    delete st.botes[id];
    log(st,`${PJ[pj].n} cancela el bote de ${ITEM[b.item].n}; cada uno recupera sus vales.`);
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
    need(st);const r=ITEM[recId],me=st.pjs[pj];if(!me.inv[recId])no("No conoces esa receta.");
    const it=ITEM[r.mk];if((me.inv[it.id]||0)>=MAX_CONS)no(`Ya llevas ${MAX_CONS} de «${it.n}».`);
    me.inv[it.id]=(me.inv[it.id]||0)+1;
    log(st,`${PJ[pj].n} prepara ${it.n} (gasta: ${r.ing.replace(/\.$/,"").toLowerCase()}).`);return st;
  },
  vales(st,pj,d){need(st);const me=st.pjs[pj];if(me.vales+d<0)no("No puede quedar en negativo.");me.vales+=d;log(st,`El DM ${d>0?"da":"quita"} ${Math.abs(d)} vale a ${PJ[pj].n}.`);return st},
  valesAll(st,n){need(st);PJS.forEach(p=>st.pjs[p.id].vales+=n);log(st,`El DM reparte ${n} vales a cada PJ.`);return st},
  reset(st){const n=freshState();if(st?.mundo)n.mundo=st.mundo;return n},
  lugar(st,id,patch){need(st);Object.assign(st.mundo.lugares[id],patch);
    if("visible" in patch)log(st,patch.visible?`Se abre el camino a ${LUGARES.find(l=>l.id===id).n}.`:`${LUGARES.find(l=>l.id===id).n} deja de estar disponible.`);return st},
  tienda(st,id,patch){need(st);Object.assign(st.mundo.tiendas[id],patch);
    if("abierta" in patch)log(st,`${TIENDA[id].n} ${patch.abierta?"abre sus puertas":"cierra"}.`);return st}
};


