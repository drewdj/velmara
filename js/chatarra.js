/* Chatarra: inventario común de piezas del marco de campaña Motherboard (Daggerheart).
   En el reglamento cada PJ lleva su chatarra; en Velmara es de todo el grupo (petición de David):
   lo que alguien gasta al fabricar desaparece para todos. Con la chatarra se fabrican aumentos
   (mejoras que se equipan, en ranuras: 2 en tier 1 y una más por tier) y artilugios (se gastan al usarlos).
   Estado: st.chatarra = {p:{pieza:n}, rec:{id:{n,tipo,t,coste:{pieza:n}}}, hechos:{id:{rec,n,tipo,t,pj,por,ts}}} */
const CHATARRA=[
  {k:"frag",n:"Fragmentos",dado:6,p:[["engranaje","Engranaje",1],["bobina","Bobina",2],["cable","Cable",3],["gatillo","Gatillo",4],["lente","Lente",5],["cristal","Cristal",6]]},
  {k:"metal",n:"Metales",dado:8,p:[["aluminio","Aluminio",1],["cobre","Cobre",3],["cobalto","Cobalto",5],["plata","Plata",6],["platino","Platino",7],["oro","Oro",8]]},
  {k:"comp",n:"Componentes",dado:10,p:[["fusible","Fusible",1],["circuito","Circuito",3],["disco","Disco",6],["rele","Relé",8],["condensador","Condensador",9],["bateria","Batería",10]]}
];
const PIEZA=Object.fromEntries(CHATARRA.flatMap(g=>g.p.map(([k,n,v])=>[k,{k,n,v,g:g.k}])));
// Una tirada de dado da la pieza con el umbral más alto que no lo supere
const piezaDe=(g,r)=>{let k=g.p[0][0];for(const [pk,,v] of g.p)if(r>=v)k=pk;return k};
// Recetas que trae el marco (el resto las crea el grupo o el DM)
const CH_RECETAS={
  "punto-caliente":{n:"Punto caliente",tipo:"artilugio",t:"Actívalo para dejar Inmovilizados a todos los remanentes a distancia Muy Cercana.",coste:{gatillo:5,cable:8,cobre:9,fusible:6,rele:3,bateria:1}}
};
const chRanuras=h=>tierDe(h?.nivel||1)+1;
function chFix(st){const c=st.chatarra=st.chatarra||{};c.p=c.p||{};c.rec=c.rec||{};c.hechos=c.hechos||{};return c}
function chRecetas(st){const r=st?.chatarra?.rec||{},o={};
  for(const [id,x] of Object.entries(CH_RECETAS))if(!r[id]?.borrado)o[id]=x;
  for(const [id,x] of Object.entries(r))if(!x.borrado)o[id]={...(o[id]||{}),...x};
  return o}
const chFalta=(st,coste)=>Object.entries(coste||{}).filter(([k,n])=>(st.chatarra?.p?.[k]||0)<n).map(([k,n])=>[k,n-(st.chatarra?.p?.[k]||0)]);
const chCosteTxt=c=>Object.entries(c||{}).filter(([,n])=>n>0).map(([k,n])=>`${n} ${PIEZA[k]?.n.toLowerCase()||k}`).join(", ");
Object.assign(A,{
  // Añadir o gastar piezas a mano (d puede ser negativo)
  chPieza(st,pj,k,d){need(st);const c=chFix(st);if(!PIEZA[k])no("Esa pieza no existe.");
    const v=(c.p[k]||0)+d;if(v<0)no(`No queda ningún ${PIEZA[k].n.toLowerCase()}.`);c.p[k]=v;return st},
  // Botín tras un combate: n = {frag,metal,comp} dados que tirar; devuelve lo que salió en st._botin
  chTirar(st,pj,n,tiradas){need(st);const c=chFix(st),got={};
    for(const g of CHATARRA)for(const r of tiradas[g.k]||[]){const k=piezaDe(g,r);got[k]=(got[k]||0)+1;c.p[k]=(c.p[k]||0)+1}
    if(Object.keys(got).length)log(st,`${PJ[pj]?.n||"El DM"} añade a la chatarra: ${chCosteTxt(got)}.`);return st},
  chReceta(st,id,x){need(st);const c=chFix(st);
    if(x===null){if(CH_RECETAS[id])c.rec[id]={borrado:true};else delete c.rec[id];return st}
    if(!String(x.n||"").trim())no("Ponle nombre.");
    const coste={};for(const [k,n] of Object.entries(x.coste||{}))if(PIEZA[k]&&+n>0)coste[k]=Math.min(99,Math.round(+n));
    if(!Object.keys(coste).length)no("Indica cuántas piezas cuesta.");
    c.rec[id]={n:String(x.n).trim().slice(0,60),tipo:x.tipo==="artilugio"?"artilugio":"aumento",t:String(x.t||"").slice(0,600),coste};return st},
  chFabricar(st,pj,rid,hid){need(st);const c=chFix(st),r=chRecetas(st)[rid];if(!r)no("Esa receta ya no existe.");
    const f=chFalta(st,r.coste);if(f.length)no(`Faltan piezas: ${chCosteTxt(Object.fromEntries(f))}.`);
    for(const [k,n] of Object.entries(r.coste))c.p[k]-=n;
    c.hechos[hid]={rec:rid,n:r.n,tipo:r.tipo,t:r.t||"",pj:null,por:pj||"",ts:Date.now()};
    log(st,`${PJ[pj]?.n||"El DM"} fabrica «${r.n}» con la chatarra del grupo.`);return st},
  // Equipar (to = id del PJ) o devolver al almacén común (to = null)
  chEquipar(st,pj,hid,to){need(st);const c=chFix(st),x=c.hechos[hid];if(!x)no("Eso ya no está.");
    if(to){if(x.pj&&x.pj!==to)no(`Lo lleva ${PJ[x.pj]?.n||"otro PJ"}.`);
      if(x.tipo==="aumento"){const usadas=Object.values(c.hechos).filter(y=>y.pj===to&&y.tipo==="aumento").length,max=chRanuras(st.hojas?.[to]);
        if(usadas>=max)no(`${PJ[to]?.n||"Ese PJ"} ya tiene ocupadas sus ${max} ranuras de aumento.`)}}
    x.pj=to||null;return st},
  // Gastar un artilugio (o desmontar algo): desaparece para todos
  chGastar(st,pj,hid){need(st);const c=chFix(st),x=c.hechos[hid];if(!x)no("Eso ya no está.");
    delete c.hechos[hid];log(st,`${PJ[pj]?.n||"El DM"} ${x.tipo==="artilugio"?"usa":"desmonta"} «${x.n}».`);return st}
});
