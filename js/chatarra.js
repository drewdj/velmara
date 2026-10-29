/* Chatarra: inventario común de piezas del marco de campaña Motherboard (Daggerheart).
   En el reglamento cada PJ lleva su chatarra; en Velmara es de todo el grupo (petición de David):
   lo que alguien gasta al fabricar desaparece para todos. Con la chatarra se fabrican aumentos
   (mejoras que se equipan, en ranuras: 2 en tier 1 y una más por tier) y artilugios (se gastan al usarlos).
   Estado: st.chatarra = {p:{pieza:n}, rec:{id:{n,tipo,t,coste:{pieza:n}}}, hechos:{id:{rec,n,tipo,t,pj,por,ts}}} */
const CHATARRA=[
  {k:"frag",n:"Fragmentos",dado:6,p:[["engranaje","Engranaje",1],["bobina","Bobina",2],["cable","Cable",3],["gatillo","Gatillo",4],["lente","Lente",5],["cristal","Cristal",6]]},
  {k:"metal",n:"Metales",dado:8,p:[["aluminio","Aluminio",1],["cobre","Cobre",3],["cobalto","Cobalto",5],["plata","Plata",6],["platino","Platino",7],["oro","Oro",8]]},
  {k:"comp",n:"Componentes",dado:10,p:[["fusible","Fusible",1],["circuito","Circuito",3],["disco","Disco",6],["rele","Relé",8],["condensador","Condensador",9],["bateria","Batería",10]]},
  {k:"reliq",n:"Reliquias",dado:0,p:[["reliquia","Reliquia",20]]} // botín especial de remanentes importantes; no se tira
];
const PIEZA=Object.fromEntries(CHATARRA.flatMap(g=>g.p.map(([k,n,v])=>[k,{k,n,v,g:g.k}])));
// Una tirada de dado da la pieza con el umbral más alto que no lo supere
const piezaDe=(g,r)=>{let k=g.p[0][0];for(const [pk,,v] of g.p)if(r>=v)k=pk;return k};
// Recetas del marco (Core Rulebook, módulo Motherboard, p. 354). ef = lo que cambia en la hoja al equiparlo:
// dmg daño, atk tiradas de ataque, arm Puntuación de Armadura, ev Evasión, alc pasos de alcance. pre = tier mínimo (Precompile).
// En el libro mejoran el Ikonis; en Velmara mejoran las armas del PJ.
const AU=(n,en,t,coste,ef,pre)=>({n,en,tipo:"aumento",t,coste,...(ef?{ef}:{}),...(pre?{pre}:{})});
const CH_RECETAS={
  "au-force":AU("Potencia","Force","+1 al daño.",{engranaje:3,lente:2,aluminio:4,condensador:1},{dmg:1}),
  "au-guard":AU("Guarda","Guard","+1 a la Puntuación de Armadura.",{cable:3,plata:2,platino:2,fusible:3},{arm:1}),
  "au-converge":AU("Convergencia","Converge","+1 a las tiradas de ataque.",{bobina:4,cristal:2,oro:5,disco:3},{atk:1}),
  "au-amplify":AU("Amplificar","Amplify","Al acertar un ataque, tira un dado de daño más y descarta el menor.",{cristal:4,cobalto:4,cobre:4,condensador:4}),
  "au-scope":AU("Mira","Scope","Aumenta el alcance un paso (Cuerpo a cuerpo a Muy Cercana, Cercana a Lejana, etc.).",{lente:5,plata:3,circuito:2,rele:2},{alc:1}),
  "au-deny":AU("Negación","Deny","+2 a la Puntuación de Armadura.",{bobina:6,cable:3,cobre:2,bateria:4},{arm:2}),
  "au-target":AU("Fijar blanco","Target","+2 a las tiradas de ataque.",{cable:10,oro:7,fusible:5,circuito:5,bateria:2},{atk:2}),
  "au-split":AU("Dividir","Split","Al atacar, marca un Estrés para elegir otro objetivo dentro del alcance.",{engranaje:12,lente:5,aluminio:15,rele:9}),
  "au-fix":AU("Reparar","Fix","Cuando hagas daño Grave, borra un Punto de Golpe.",{bobina:6,cable:4,cristal:1,cobalto:5,plata:5,rele:7,bateria:2}),
  "au-scare":AU("Espanto","Scare","Con un éxito crítico en un ataque, el objetivo marca un Estrés.",{gatillo:6,cobre:8,aluminio:9,disco:10}),
  "au-sear":AU("Abrasar","Sear","+2 al daño.",{gatillo:11,platino:11,circuito:11,disco:7},{dmg:2},2),
  "au-absorb":AU("Absorber","Absorb","Puedes marcar una casilla de Armadura más contra el daño que recibes.",{engranaje:26,oro:13,rele:15,bateria:8},null,2),
  "au-kick":AU("Patada","Kick","Al acertar un ataque, puedes marcar 2 Estrés para que el objetivo marque un Punto de Golpe más.",{gatillo:33,cristal:13,cobalto:23,disco:16},null,2),
  "au-block":AU("Bloqueo","Block","+3 a la Puntuación de Armadura; −1 a la Evasión.",{cristal:27,aluminio:67,rele:33,condensador:4,bateria:5},{arm:3,ev:-1},3),
  "au-zip":AU("Impulso","Zip","Muévete hasta distancia Lejana como parte de un ataque.",{bobina:37,plata:43,fusible:67,condensador:12},null,3),
  "au-bury":AU("Sepultar","Bury","+3 al daño.",{gatillo:28,circuito:28,rele:28,reliquia:1},{dmg:3},3),
  "au-follow":AU("Insistir","Follow","Marca 2 Estrés para repetir tu tirada de ataque.",{engranaje:75,lente:67,cobre:30,circuito:33},null,4),
  "au-override":AU("Anular","Override","Tus tiradas de ataque tienen ventaja.",{cable:63,oro:71,disco:58,reliquia:5},null,4),
  "punto-caliente":{n:"Punto caliente",en:"Hotspot",tipo:"artilugio",t:"Actívalo para dejar Inmovilizados a todos los remanentes a distancia Muy Cercana.",coste:{gatillo:5,cable:8,cobre:9,fusible:6,rele:3,bateria:1}}
};
const CH_EF=[["dmg","Daño"],["atk","Ataque"],["arm","Armadura"],["ev","Evasión"],["alc","Alcance (pasos)"]];
const chEfTxt=ef=>CH_EF.filter(([k])=>+ef?.[k]).map(([k,n])=>`${n} ${ef[k]>0?"+":""}${ef[k]}`).join(" · ");
// Lo que suman a la hoja los aumentos que lleva un PJ (con el efecto actual de su receta)
function chEfectos(st,id){const R=chRecetas(st),o={dmg:0,atk:0,arm:0,ev:0,alc:0,L:[]};
  for(const x of Object.values(st.chatarra?.hechos||{})){if(x.pj!==id||x.tipo!=="aumento")continue;const ef=R[x.rec]?.ef||x.ef;if(!ef)continue;
    for(const [k] of CH_EF)o[k]+=+ef[k]||0;o.L.push(`${x.n}: ${chEfTxt(ef)}`)}
  return o}
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
    const v=(c.p[k]||0)+d;if(v<0)no(`No queda ningún ${PIEZA[k].n.toLowerCase()}.`);c.p[k]=v;
    log(st,`${PJ[pj]?.n||"El DM"} ${d>0?"añade":"gasta"} ${Math.abs(d)} ${PIEZA[k].n.toLowerCase()} de la chatarra (quedan ${v}).`);return st},
  // DM: vaciar el almacén de piezas (y, si se pide, lo fabricado)
  chVaciar(st,todo){need(st);const c=chFix(st);c.p={};if(todo)c.hechos={};log(st,todo?"El DM vacía la chatarra y retira todo lo fabricado.":"El DM vacía el almacén de chatarra.");return st},
  // Botín tras un combate: n = {frag,metal,comp} dados que tirar; devuelve lo que salió en st._botin
  chTirar(st,pj,n,tiradas){need(st);const c=chFix(st),got={};
    for(const g of CHATARRA)for(const r of tiradas[g.k]||[]){const k=piezaDe(g,r);got[k]=(got[k]||0)+1;c.p[k]=(c.p[k]||0)+1}
    if(Object.keys(got).length)log(st,`${PJ[pj]?.n||"El DM"} añade a la chatarra: ${chCosteTxt(got)}.`);return st},
  chReceta(st,id,x){need(st);const c=chFix(st);
    if(x===null){if(CH_RECETAS[id])c.rec[id]={borrado:true};else delete c.rec[id];return st}
    if(!String(x.n||"").trim())no("Ponle nombre.");
    const coste={};for(const [k,n] of Object.entries(x.coste||{}))if(PIEZA[k]&&+n>0)coste[k]=Math.min(99,Math.round(+n));
    if(!Object.keys(coste).length)no("Indica cuántas piezas cuesta.");
    const ef={};for(const [k] of CH_EF){const v=Math.round(+x.ef?.[k]||0);if(v)ef[k]=Math.max(-5,Math.min(5,v))}
    const pre=Math.round(+x.pre||0);
    if(!c.rec[id]&&!CH_RECETAS[id])log(st,`Nueva receta en la chatarra: «${String(x.n).trim().slice(0,60)}».`);
    c.rec[id]={n:String(x.n).trim().slice(0,60),tipo:x.tipo==="artilugio"?"artilugio":"aumento",t:String(x.t||"").slice(0,600),coste,ef,pre:pre>=2&&pre<=4?pre:0};return st},
  chFabricar(st,pj,rid,hid){need(st);const c=chFix(st),r=chRecetas(st)[rid];if(!r)no("Esa receta ya no existe.");
    const f=chFalta(st,r.coste);if(f.length)no(`Faltan piezas: ${chCosteTxt(Object.fromEntries(f))}.`);
    for(const [k,n] of Object.entries(r.coste))c.p[k]-=n;
    c.hechos[hid]={rec:rid,n:r.n,tipo:r.tipo,t:r.t||"",pj:null,por:pj||"",ts:Date.now()};
    log(st,`${PJ[pj]?.n||"El DM"} fabrica «${r.n}» con la chatarra del grupo.`);return st},
  // Equipar (to = id del PJ) o devolver al almacén común (to = null)
  chEquipar(st,pj,hid,to){need(st);const c=chFix(st),x=c.hechos[hid];if(!x)no("Eso ya no está.");
    if(to){if(x.pj&&x.pj!==to)no(`Lo lleva ${PJ[x.pj]?.n||"otro PJ"}.`);
      const pre=chRecetas(st)[x.rec]?.pre;if(pre&&tierDe(st.hojas?.[to]?.nivel||1)<pre)no(`«${x.n}» pide tier ${pre} (Precompile).`);
      if(x.tipo==="aumento"){const usadas=Object.values(c.hechos).filter(y=>y.pj===to&&y.tipo==="aumento").length,max=chRanuras(st.hojas?.[to]);
        if(usadas>=max)no(`${PJ[to]?.n||"Ese PJ"} ya tiene ocupadas sus ${max} ranuras de aumento.`)}}
    log(st,to?`${PJ[to]?.n||to} se equipa «${x.n}».`:`«${x.n}» vuelve al almacén de chatarra.`);x.pj=to||null;return st},
  // Gastar un artilugio (o desmontar algo): desaparece para todos
  chGastar(st,pj,hid){need(st);const c=chFix(st),x=c.hechos[hid];if(!x)no("Eso ya no está.");
    delete c.hechos[hid];log(st,`${PJ[pj]?.n||"El DM"} ${x.tipo==="artilugio"?"usa":"desmonta"} «${x.n}».`);return st}
});
