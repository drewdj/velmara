/* Cartas al estilo de Daggerheart. Arriba, una escena pintada con SVG (cielo del color del tipo,
   halo, círculo rúnico, niebla) y la silueta del objeto; en medio, el filete dorado con etiqueta y
   medallón; abajo, el texto sobre papel. Un toque en la carta muestra el texto entero.
   Si existe ARTE[id] (ruta a una imagen), se usa como ilustración. */
const ARTE={}; // p. ej. ARTE["baston-corto"]="img/equipo/baston-corto.png"
// Ilustraciones de las cartas de dominio en img/cartas/{id}.webp
const ARTE_DOM=new Set(CARTAS_DOMINIO.map(c=>c.id)); // todas las del SRD tienen ilustración
const arteDom=id=>ARTE[id]||(ARTE_DOM.has(id)?`img/cartas/${id}.webp`:null);

const escC=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
let artSeq=0;

// Siluetas en una caja de 100×100
const GLYPH={
 espada:'<path d="M50 4 L56 62 L50 70 L44 62Z"/><rect x="33" y="62" width="34" height="6" rx="2"/><rect x="47" y="68" width="6" height="20" rx="2"/><circle cx="50" cy="92" r="5"/>',
 daga:'<path d="M50 22 L56 66 L50 72 L44 66Z"/><rect x="37" y="66" width="26" height="5" rx="2"/><rect x="47" y="71" width="6" height="16" rx="2"/><circle cx="50" cy="91" r="4"/>',
 hacha:'<rect x="47" y="8" width="6" height="88" rx="3"/><path d="M53 14 C74 10 86 22 86 38 C86 52 74 60 53 56Z"/><path d="M47 18 C36 20 30 28 30 36 C30 44 36 50 47 52Z"/>',
 martillo:'<rect x="47" y="20" width="6" height="76" rx="3"/><rect x="24" y="8" width="52" height="24" rx="3"/><rect x="20" y="12" width="6" height="16" rx="2"/><rect x="74" y="12" width="6" height="16" rx="2"/>',
 baston:'<path d="M48 96 C44 80 54 70 49 56 C45 44 55 36 51 22" fill="none" stroke-width="7" stroke-linecap="round"/><circle cx="51" cy="14" r="9"/><path d="M45 10 C48 4 56 4 58 12" fill="none" stroke-width="3"/>',
 arco:'<path d="M38 6 C78 28 78 72 38 94" fill="none" stroke-width="7" stroke-linecap="round"/><path d="M38 6 L38 94" fill="none" stroke-width="1.6"/><rect x="58" y="44" width="8" height="12" rx="2"/>',
 ballesta:'<rect x="46" y="22" width="8" height="74" rx="3"/><path d="M12 40 C30 24 70 24 88 40" fill="none" stroke-width="6" stroke-linecap="round"/><path d="M12 40 L50 56 L88 40" fill="none" stroke-width="1.6"/><rect x="42" y="70" width="16" height="8" rx="2"/>',
 asta:'<rect x="47" y="20" width="6" height="78" rx="3"/><path d="M50 2 L58 24 L50 30 L42 24Z"/><path d="M53 26 C70 24 80 34 78 48 C68 42 60 40 53 42Z"/>',
 varita:'<rect x="47" y="30" width="6" height="66" rx="3"/><path d="M50 4 L54 16 L66 16 L56 23 L60 35 L50 28 L40 35 L44 23 L34 16 L46 16Z"/>',
 escudo:'<path d="M50 6 L86 18 C86 56 72 80 50 94 C28 80 14 56 14 18Z"/><path d="M50 18 L74 26 C74 52 64 70 50 80 C36 70 26 52 26 26Z" fill="none" stroke-width="2.5"/>',
 latigo:'<rect x="44" y="70" width="10" height="26" rx="4"/><path d="M49 70 C49 40 82 46 78 26 C74 8 40 10 36 26 C33 38 52 40 56 30" fill="none" stroke-width="4" stroke-linecap="round"/>',
 anillos:'<circle cx="36" cy="40" r="18" fill="none" stroke-width="8"/><circle cx="64" cy="60" r="18" fill="none" stroke-width="8"/><circle cx="50" cy="20" r="5"/>',
 armadura:'<path d="M30 10 L42 6 C44 14 56 14 58 6 L70 10 L92 22 L84 46 L74 42 L74 94 L26 94 L26 42 L16 46 L8 22Z"/><path d="M50 18 L50 90 M34 40 L66 40 M34 60 L66 60" fill="none" stroke-width="2"/>',
 pocion:'<rect x="42" y="6" width="16" height="10" rx="2"/><path d="M44 16 L44 34 C26 42 20 56 22 70 C25 88 75 88 78 70 C80 56 74 42 56 34 L56 16Z"/><path d="M26 62 C40 56 60 68 74 60" fill="none" stroke-width="2"/>',
 receta:'<rect x="22" y="16" width="56" height="70" rx="3"/><rect x="16" y="10" width="68" height="12" rx="6"/><rect x="16" y="80" width="68" height="12" rx="6"/><path d="M32 36 H68 M32 48 H68 M32 60 H58" fill="none" stroke-width="2.5"/>',
 gema:'<path d="M30 14 H70 L88 36 L50 92 L12 36Z"/><path d="M12 36 H88 M30 14 L40 36 L50 92 L60 36 L70 14" fill="none" stroke-width="2"/>',
 objeto:'<path d="M34 24 C34 12 66 12 66 24 L64 30 C82 40 88 60 82 78 C76 94 24 94 18 78 C12 60 18 40 36 30Z"/><path d="M34 30 H66" fill="none" stroke-width="3"/><circle cx="50" cy="62" r="9" fill="none" stroke-width="3"/>',
 persona:'<path d="M50 8 C34 8 26 22 28 38 C30 50 38 56 50 56 C62 56 70 50 72 38 C74 22 66 8 50 8Z"/><path d="M50 56 C30 56 16 70 12 96 H88 C84 70 70 56 50 56Z"/><path d="M28 38 C24 30 26 16 36 10 M72 38 C76 30 74 16 64 10" fill="none" stroke-width="2.5"/><path d="M38 66 L50 84 L62 66" fill="none" stroke-width="2.5"/>',
 lugar:'<path d="M14 92 V50 L24 40 L34 50 V92Z"/><path d="M66 92 V50 L76 40 L86 50 V92Z"/><path d="M34 92 V30 L50 8 L66 30 V92Z"/><path d="M44 92 V74 C44 66 56 66 56 74 V92Z" fill="#3A3550"/><path d="M47 40 H53 V50 H47Z" fill="#3A3550"/><path d="M6 92 H94" fill="none" stroke-width="3"/>',
 // Emblemas de dominio
 Arcana:'<circle cx="50" cy="50" r="30" fill="none" stroke-width="4"/><path d="M50 8 L58 42 L92 50 L58 58 L50 92 L42 58 L8 50 L42 42Z"/>',
 Blade:'<path d="M50 4 L57 60 L50 68 L43 60Z"/><rect x="30" y="60" width="40" height="7" rx="2"/><rect x="46" y="67" width="8" height="20" rx="2"/><path d="M18 30 L82 30" fill="none" stroke-width="3"/>',
 Bone:'<path d="M30 20 a9 9 0 1 1 10 -6 L66 60 a9 9 0 1 1 6 10 L40 30 a9 9 0 1 1 -10 -10Z"/><path d="M70 20 a9 9 0 1 0 -10 -6 L34 60 a9 9 0 1 0 -6 10 L60 30 a9 9 0 1 0 10 -10Z"/>',
 Codex:'<path d="M12 22 C26 16 40 16 50 24 C60 16 74 16 88 22 V82 C74 76 60 76 50 84 C40 76 26 76 12 82Z"/><path d="M50 24 V84" fill="none" stroke-width="3"/>',
 Grace:'<path d="M50 88 C20 66 8 50 8 34 C8 20 18 12 30 12 C40 12 46 18 50 26 C54 18 60 12 70 12 C82 12 92 20 92 34 C92 50 80 66 50 88Z"/>',
 Midnight:'<path d="M62 8 C36 12 20 32 20 54 C20 76 38 92 60 92 C72 92 82 88 90 80 C60 82 42 62 46 38 C48 24 54 14 62 8Z"/><circle cx="74" cy="30" r="4"/><circle cx="84" cy="50" r="2.5"/>',
 Sage:'<path d="M50 94 C50 70 50 50 50 30" fill="none" stroke-width="4"/><path d="M50 60 C20 60 12 34 14 14 C38 14 52 30 50 60Z"/><path d="M50 50 C76 50 88 30 86 10 C64 10 50 24 50 50Z"/>',
 Splendor:'<circle cx="50" cy="50" r="20"/><path d="M50 4 V20 M50 80 V96 M4 50 H20 M80 50 H96 M17 17 L28 28 M72 72 L83 83 M83 17 L72 28 M28 72 L17 83" fill="none" stroke-width="5" stroke-linecap="round"/>',
 Valor:'<path d="M50 6 L86 18 C86 56 72 80 50 94 C28 80 14 56 14 18Z"/><path d="M50 26 L56 44 L74 44 L60 56 L66 74 L50 62 L34 74 L40 56 L26 44 L44 44Z" fill="#fff" fill-opacity=".35" stroke="none"/>'
};
function glyphFor(kind,id,it){
  if(kind==="armadura")return "armadura";
  if(kind==="item"){if(it.k==="rec")return "receta";if(it.k==="cons")return "pocion";return it.r==="r"?"gema":"objeto"}
  const m=[["escudo","escudo"],["gema","gema"],["pistola|rifle","ballesta"],["chakram|abanico|brazal|nudilleras","anillos"],["porra|garrote|pico","martillo"],
    ["cuchillos|escalpelo|alambre","daga"],["jabalinas|justa","asta"],["capa","armadura"],["dardo","latigo"],["daga","daga"],["hacha","hacha"],["martillo|maza","martillo"],["baston","baston"],
    ["ballesta|trabuco","ballesta"],["arco","arco"],["alabarda|lanza|guadana","asta"],["varita|cetro","varita"],
    ["latigo|garfio","latigo"],["anillos|runas|guanteletes|nudillos","anillos"],["espada|sable|estoque|falcata|urok|hoja","espada"]];
  for(const [re,g] of m)if(new RegExp(re).test(id))return g;
  return "espada";
}
const UPRIGHT=new Set(["lugar","persona","armadura","pocion","receta","gema","objeto","escudo"]);
// Tono de cada escena: [halo, cielo]
const TINT={fis:["#F2913A","#3B2350"],mag:["#7C6CFF","#241A52"],arm:["#8FB6E8","#22304F"],c:["#5FC9A8","#173F45"],
  pc:["#6BB3FF","#1B3358"],r:["#E06CFF","#3A1650"],rec:["#F5C35A","#4A2E14"]};

// Escena pintada: cielo, halo, círculo rúnico, chispas, niebla y silueta (o imagen)
function scene(w,h,tint,glyph,img,opts={}){
  // Las ilustraciones de equipo necesitan el objeto entero, también en miniaturas.
  if(typeof img==="string"&&img.startsWith("img/equipo/"))opts={...opts,fit:true};
  const k="a"+(artSeq++),[glow,sky]=tint,cx=w/2,cy=opts.cy??h*.5,R=Math.min(w,h)*.36;
  let sparks="";for(let i=0;i<14;i++){const a=(i*137.5)%360*Math.PI/180,r=R*(.7+((i*53)%40)/50);
    sparks+=`<circle cx="${(cx+Math.cos(a)*r).toFixed(1)}" cy="${(cy+Math.sin(a)*r*.8).toFixed(1)}" r="${(1.5+(i%3)).toFixed(1)}" fill="#FFF3D6" opacity="${(.35+(i%4)*.15).toFixed(2)}"/>`}
  const ticks=Array.from({length:24},(_,i)=>{const a=i*15*Math.PI/180;return `M${(cx+Math.cos(a)*R*1.02).toFixed(1)} ${(cy+Math.sin(a)*R*1.02).toFixed(1)} L${(cx+Math.cos(a)*R*(i%2?1.07:1.12)).toFixed(1)} ${(cy+Math.sin(a)*R*(i%2?1.07:1.12)).toFixed(1)}`}).join(" ");
  const rot=UPRIGHT.has(glyph)||opts.emblem?0:38,sc=(opts.size??R*2.3)/100;
  // Con opts.fit la imagen se ve entera (sobre una copia desenfocada que rellena el hueco); si no, recorta para llenar
  const art=img?(opts.fit?`<filter id="${k}f"><feGaussianBlur stdDeviation="${Math.round(Math.min(w,h)/20)}"/></filter><image href="${escC(img)}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" filter="url(#${k}f)" opacity=".55"/><image href="${escC(img)}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`
     :`<image href="${escC(img)}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`)
   :`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#FAC472" stroke-opacity=".35" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="${R*.82}" fill="none" stroke="#FAC472" stroke-opacity=".18" stroke-width="1.5" stroke-dasharray="3 7"/>
    <path d="${ticks}" stroke="#FAC472" stroke-opacity=".35" stroke-width="2"/>${sparks}
    <g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${sc}) translate(-50 -50)" fill="url(#${k}m)" stroke="${opts.emblem?"#FFF3D6":"#3A3550"}" stroke-width="${opts.emblem?1.2:1.6}" stroke-linejoin="round" filter="url(#${k}s)">${GLYPH[glyph]}</g>`;
  return `<defs>
    <radialGradient id="${k}g" cx="50%" cy="${(cy/h*100).toFixed(0)}%" r="70%"><stop offset="0" stop-color="${glow}" stop-opacity=".95"/><stop offset=".45" stop-color="${glow}" stop-opacity=".25"/><stop offset="1" stop-color="${sky}" stop-opacity="0"/></radialGradient>
    <linearGradient id="${k}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky}"/><stop offset="1" stop-color="#140D24"/></linearGradient>
    <linearGradient id="${k}m" x1="0" y1="0" x2="1" y2="1">${opts.emblem?`<stop offset="0" stop-color="#FFE6A8"/><stop offset=".6" stop-color="#F9A72B"/><stop offset="1" stop-color="#B9661A"/>`:`<stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#D5D2DC"/><stop offset="1" stop-color="#8A8698"/>`}</linearGradient>
    <filter id="${k}s" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="${glow}" flood-opacity=".9"/></filter>
   </defs>
   <rect width="${w}" height="${h}" fill="url(#${k}b)"/><rect width="${w}" height="${h}" fill="url(#${k}g)"/>
   <path d="M0 ${h*.78} C${w*.2} ${h*.7} ${w*.35} ${h*.84} ${w*.55} ${h*.76} S${w*.85} ${h*.7} ${w} ${h*.8} V${h} H0Z" fill="#140D24" opacity=".55"/>
   <path d="M0 ${h*.88} C${w*.25} ${h*.82} ${w*.5} ${h*.92} ${w*.7} ${h*.86} S${w*.9} ${h*.84} ${w} ${h*.9} V${h} H0Z" fill="#140D24" opacity=".8"/>
   ${art}`;
}

// medal: {kind:"hex"|"shield", big, small}
function cardSVG(glyph,img,banner,medal,tint){
  const badge=medal.kind==="shield"
    ?`<path d="M580 545 H720 V655 L650 700 L580 655Z" fill="#FBF7EE" stroke="url(#gold)" stroke-width="12" stroke-linejoin="round"/>
      <text x="650" y="622" class="m-big" text-anchor="middle">${escC(medal.big)}</text><text x="650" y="658" class="m-small" style="font-size:22px" text-anchor="middle">${escC(medal.small)}</text>`
    :`<path d="M610 548 H690 L735 618 L690 688 H610 L565 618Z" fill="#FBF7EE" stroke="url(#gold)" stroke-width="12" stroke-linejoin="round"/>
      <text x="650" y="${medal.small?612:632}" class="m-big" text-anchor="middle">${escC(medal.big)}</text>${medal.small?`<text x="650" y="652" class="m-small" text-anchor="middle">${escC(medal.small)}</text>`:""}`;
  return `<svg class="cframe" viewBox="0 0 740 700" aria-hidden="true">
   <defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FAC472"/><stop offset=".5" stop-color="#F9A72B"/><stop offset="1" stop-color="#E08A1E"/></linearGradient></defs>
   <svg width="740" height="618" viewBox="0 0 740 618">${scene(740,618,tint,glyph,img,{cy:290})}</svg>
   <rect y="618" width="740" height="82" fill="#FBF7EE"/>
   <g fill="none" stroke="url(#gold)" stroke-linejoin="miter">
    <path d="M0 455 L52 512 L52 612" stroke-width="7"/>
    <path d="M0 560 L50 620 L570 620" stroke-width="9"/>
    <path d="M96 600 L320 600" stroke-width="4"/>
    <path d="M730 618 H740" stroke-width="9"/>
   </g>
   <path d="M76 540 H292 L304 552 V576 L292 588 H76 L64 576 V552Z" fill="url(#gold)"/>
   <text x="184" y="575" class="c-banner" text-anchor="middle">${escC(banner)}</text>
   ${badge}
  </svg>`;
}
const HAND='<path d="M8 30 L8 12 C8 9 12 9 12 12 L12 22 L12 7 C12 4 16 4 16 7 L16 21 L16 5 C16 2 20 2 20 5 L20 21 L20 8 C20 5 24 5 24 8 L24 26 L26 22 C28 18 32 20 30 24 L25 36 C23 40 20 42 16 42 L14 42 C10 42 8 38 8 34Z"/>';
const SHIELD='<path d="M12 2 L22 5 C22 15 18 21 12 25 C6 21 2 15 2 5Z"/>';
function hands(n){return `<span class="hands" aria-label="${n===2?"Dos manos":"Una mano"}">${`<svg viewBox="0 0 34 44">${HAND}</svg>`.repeat(n)}</span>`}
// "Fiable: +1..." → nombre del rasgo en negrita, como en las cartas
function fmtFeature(f){const i=f.indexOf(":");return i>0&&i<24?`<b>${escC(f.slice(0,i))}:</b>${escC(f.slice(i+1))}`:escC(f)}

function weaponCard(w){
  const tipo=w.g==="sec"?"Arma secundaria":"Arma principal";
  const [dado,tipoD]=w.d.split(" ");
  return `<div class="dh-card" tabindex="0">${cardSVG(glyphFor("arma",w.id),ARTE[w.id],"EQUIPO",{kind:"hex",big:dado,small:tipoD==="mág"?"mágico":"físico"},TINT[tipoD==="mág"?"mag":"fis"])}
   <div class="cbody"><h4>${escC(w.n)}</h4><div class="ctype">${tipo} · Tier ${w.tier||2}${w.hf?" · H&amp;F":""}</div>
   <div class="ctrait">${escC(w.tr)}, ${escC(w.a)}</div>${w.f?`<p class="clamp">${fmtFeature(w.f)}</p>`:""}</div>${hands(w.h)}</div>`;
}
function armorCard(a){
  return `<div class="dh-card" tabindex="0">${cardSVG("armadura",ARTE[a.id],"EQUIPO",{kind:"shield",big:a.sc,small:"puntuación"},TINT.arm)}
   <div class="cbody"><h4>${escC(a.n)}</h4><div class="ctype">Armadura · Tier ${a.tier||2}${a.hf?" · H&amp;F":""}</div>
   <div class="ctrait">Umbrales ${escC(a.u.replace(/ /g,""))}</div>${a.f?`<p class="clamp">${fmtFeature(a.f)}</p>`:""}</div>
   <span class="slots" aria-label="${a.sc} espacios de armadura">${`<svg viewBox="0 0 24 27">${SHIELD}</svg>`.repeat(a.sc)}</span></div>`;
}
// cost: {p, uno, varios} para mostrar el precio de una tienda concreta (si no, el de su rareza en vales)
function itemCard(it,cost){
  const banner=it.k==="rec"?"RECETA":it.k==="cons"?"CONSUMIBLE":it.k==="mat"?"MATERIAL":"BOTÍN";
  const p=cost?cost.p:price(it);
  const tipo=it.k==="rec"?"Receta permanente":`${RAR[it.r]?.n||""} · ${it.k==="cons"?"consumible":it.k==="mat"?"material":"objeto"}`;
  return `<div class="dh-card r-${it.r}" tabindex="0">${cardSVG(glyphFor("item",it.id,it),ARTE[it.id],banner,{kind:"hex",big:p,small:cost?(p===1?cost.uno:cost.varios):p===1?"vale":"vales"},TINT[it.r]||TINT.c)}
   <div class="cbody"><h4>${escC(cap(it.n.replace("Receta: ","")))}</h4><div class="ctype">${tipo}${it.hf?" · H&amp;F":""}${it.vel?" · Velmara":""}</div>
   <p class="clamp">${it.k==="rec"?`<b>Ingrediente:</b> ${escC(it.ing)} `:""}${escC(it.t)}</p></div></div>`;
}
// Carta pequeña para la mochila: ilustración, nombre, cantidad y efecto resumido
function miniCard(it,qty){
  return `<div class="mini" tabindex="0"><svg class="mart" viewBox="0 0 300 170" aria-hidden="true">${scene(300,170,TINT[it.r],glyphFor("item",it.id,it),ARTE[it.id],{cy:82,size:110})}</svg>
   ${qty>1?`<span class="qty num">×${qty}</span>`:""}<div class="mbody"><h4>${escC(cap(it.n.replace("Receta: ","")))}</h4>
   <div class="mtype">${it.k==="rec"?"Receta":it.k==="cons"?"Consumible":it.k==="mat"?"Material":"Objeto"} · ${escC(RAR[it.r].n)}</div>
   <p class="clamp">${escC(it.k==="rec"?`${it.ing} ${it.t}`:it.t)}</p></div></div>`;
}
// Carta de dominio: banderín del color del dominio con el nivel, coste de recuperación arriba a la derecha
function domainCard(c){
  const D=DOMINIOS[c.d];
  return `<div class="dh-card dom" tabindex="0" style="--dom:${D.c}"><svg class="cframe" viewBox="0 0 740 640" aria-hidden="true">
   <svg width="740" height="600" viewBox="0 0 740 600">${scene(740,600,[D.c,mix(D.c,"#140D24")],c.d,arteDom(c.id),{cy:300,size:300,emblem:true})}</svg>
   <path d="M60 0 H200 V230 L130 270 L60 230Z" fill="${D.c}" stroke="#FAC472" stroke-width="6"/>
   <text x="130" y="120" class="d-lv" text-anchor="middle">${c.lv}</text>${DOM_ICON[c.d]?`<g transform="translate(88 136) scale(.336)" fill="#fff">${DOM_ICON[c.d]}</g>`:`<text x="130" y="175" class="d-dn" text-anchor="middle">${escC(D.n.toUpperCase())}</text>`}
   <circle cx="650" cy="80" r="52" fill="#FBF7EE" stroke="#F9A72B" stroke-width="8"/>
   <path d="M646 46 L622 86 H642 L636 114 L662 74 H642Z" fill="${D.c}"/><text x="676" y="112" class="d-rc" text-anchor="middle">${c.rc}</text>
   <rect y="596" width="740" height="44" fill="#FBF7EE"/><path d="M0 600 H740" stroke="${D.c}" stroke-width="12"/><path d="M0 612 H740" stroke="#F9A72B" stroke-width="4"/>
   <rect x="250" y="578" width="240" height="50" rx="25" fill="${D.c}" stroke="#F9A72B" stroke-width="4"/><text x="370" y="614" class="d-ty" text-anchor="middle">${escC(TIPO_CARTA[c.ty].toUpperCase())}</text>
  </svg><div class="cbody"><h4>${escC(c.n)}</h4>
   ${c.ty==="Grimoire"&&spells(c.t).length>1?`<div class="spells">${spells(c.t).map(([n,d])=>`<div class="spell"><b>${escC(n)}</b><span class="sd">${escC(d)}</span></div>`).join("")}</div>`
     :`<p class="clamp dtx">${escC(c.t).replace(/\n/g,"<br>")}</p>`}</div></div>`;
}
// Un grimorio trae varios hechizos seguidos ("Nombre: efecto. Nombre: efecto."): los separamos
function spells(t){
  const re=/(?:^|(?<=[.!)”"]\s))([A-ZÁÉÍÓÚÑ][^.:]{1,40}):\s/g,out=[];let m,last=null;
  while((m=re.exec(t))){if(last)last[1]=t.slice(last.end,m.index).trim();last={0:m[1],1:"",end:re.lastIndex};out.push(last)}
  if(last)last[1]=t.slice(last.end).trim();
  return out.map(x=>[x[0],x[1]]);
}
function mix(a,b){const p=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16));const A=p(a),B=p(b);return "#"+A.map((v,i)=>Math.round(v*.45+B[i]*.55).toString(16).padStart(2,"0")).join("")}
// Carta de rasgos (clase, subclase, ascendencia, comunidad), con el marco de las de dominio.
// o: {tipo, n, sub, c (color), glyph, emblem, img, imgs:[dos imágenes partidas], doms:[dominios para el banderín], feats:[{n,t,t2,pre}]}
// Ascendencia mixta: la ilustración se parte en dos, una mitad de cada ascendencia
function featSplit([a,b]){const k="fs"+(artSeq++);
  return `<defs><clipPath id="${k}l"><rect width="370" height="600"/></clipPath><clipPath id="${k}r"><rect x="370" width="370" height="600"/></clipPath></defs>
   <rect width="740" height="600" fill="#140D24"/>
   <image href="${escC(a)}" x="0" y="0" width="370" height="600" preserveAspectRatio="xMidYMid slice" clip-path="url(#${k}l)"/>
   <image href="${escC(b)}" x="370" y="0" width="370" height="600" preserveAspectRatio="xMidYMid slice" clip-path="url(#${k}r)"/>
   <path d="M370 0 V600" stroke="#FAC472" stroke-width="6"/>`}
function featCard(o){
  const ban=o.doms?.length?o.doms.map((d,i)=>DOM_ICON[d]?`<g transform="translate(88 ${o.doms.length>1?22+i*100:76}) scale(.336)" fill="#fff">${DOM_ICON[d]}</g>`:"").join("")
    :`<g transform="translate(80 60) scale(1)" fill="#fff" stroke="none">${GLYPH[o.glyph]||""}</g>`;
  return `<div class="dh-card dom feat" tabindex="0" style="--dom:${o.c}"><svg class="cframe" viewBox="0 0 740 640" aria-hidden="true">
   <svg width="740" height="600" viewBox="0 0 740 600">${o.imgs?.length>1?featSplit(o.imgs):scene(740,600,[o.c,mix(o.c,"#140D24")],o.glyph,o.img||null,{cy:300,size:300,emblem:!!o.emblem})}</svg>
   <path d="M60 0 H200 V230 L130 270 L60 230Z" fill="${o.c}" stroke="#FAC472" stroke-width="6"/>${ban}
   <rect y="596" width="740" height="44" fill="#FBF7EE"/><path d="M0 600 H740" stroke="${o.c}" stroke-width="12"/><path d="M0 612 H740" stroke="#F9A72B" stroke-width="4"/>
   <rect x="220" y="578" width="300" height="50" rx="25" fill="${o.c}" stroke="#F9A72B" stroke-width="4"/><text x="370" y="614" class="d-ty" text-anchor="middle">${escC(o.tipo.toUpperCase())}</text>
  </svg><div class="cbody"><h4>${escC(o.n)}</h4>${o.sub?`<div class="ctype">${escC(o.sub)}</div>`:""}
   <div class="feats-l">${o.feats.map(f=>`<p class="clamp ft">${f.pre?`<span class="fpre">${escC(f.pre)}</span> `:""}<b>${escC(f.n)}.</b> ${escC(f.t)}${f.t2?` <small class="ft2">${escC(f.t2)}</small>`:""}</p>`).join("")}</div></div></div>`;
}

