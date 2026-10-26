/* Cartas de equipo y botín al estilo de Daggerheart: arte arriba, filete dorado con
   etiqueta y medallón (hexágono de daño, escudo de puntuación o precio en vales), texto abajo.
   Si existe ARTE[id] (ruta a una imagen), se usa en lugar del icono. */
const ARTE={}; // p. ej. ARTE["baston-corto"]="img/equipo/baston-corto.png"

const escC=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

// Siluetas en una caja de 100×100, dibujadas en vertical; la carta las inclina.
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
 objeto:'<path d="M34 24 C34 12 66 12 66 24 L64 30 C82 40 88 60 82 78 C76 94 24 94 18 78 C12 60 18 40 36 30Z"/><path d="M34 30 H66" fill="none" stroke-width="3"/><circle cx="50" cy="62" r="9" fill="none" stroke-width="3"/>'
};
function glyphFor(kind,id,it){
  if(kind==="armadura")return "armadura";
  if(kind==="item"){if(it.k==="rec")return "receta";if(it.k==="cons")return "pocion";return it.r==="r"?"gema":"objeto"}
  const m=[["escudo","escudo"],["daga","daga"],["hacha","hacha"],["martillo|maza","martillo"],["baston","baston"],
    ["ballesta|trabuco","ballesta"],["arco","arco"],["alabarda|lanza|guadana","asta"],["varita|cetro","varita"],
    ["latigo|garfio","latigo"],["anillos|runas|guanteletes|nudillos","anillos"],["espada|sable|estoque|falcata|urok|hoja","espada"]];
  for(const [re,g] of m)if(new RegExp(re).test(id))return g;
  return "espada";
}
const HAND='<path d="M8 30 L8 12 C8 9 12 9 12 12 L12 22 L12 7 C12 4 16 4 16 7 L16 21 L16 5 C16 2 20 2 20 5 L20 21 L20 8 C20 5 24 5 24 8 L24 26 L26 22 C28 18 32 20 30 24 L25 36 C23 40 20 42 16 42 L14 42 C10 42 8 38 8 34Z"/>';
const SHIELD='<path d="M12 2 L22 5 C22 15 18 21 12 25 C6 21 2 15 2 5Z"/>';

// medal: {kind:"hex", big, small} | {kind:"shield", big, small}
const UPRIGHT=new Set(["armadura","pocion","receta","gema","objeto","escudo"]);
function cardSVG(glyph,img,banner,medal){
  const rot=UPRIGHT.has(glyph)?0:38;
  const art=img?`<image href="${escC(img)}" x="70" y="20" width="600" height="560" preserveAspectRatio="xMidYMid meet"/>`
    :`<g transform="translate(370 300) rotate(${rot}) translate(-210 -210) scale(4.2)" fill="url(#silver)" stroke="#5d5a66" stroke-width="1.4" stroke-linejoin="round" filter="url(#lift)">${GLYPH[glyph]}</g>`;
  const badge=medal.kind==="shield"
    ?`<path d="M580 545 H720 V655 L650 700 L580 655Z" fill="#fff" stroke="url(#gold)" stroke-width="12" stroke-linejoin="round"/>
      <text x="650" y="622" class="m-big" text-anchor="middle">${escC(medal.big)}</text><text x="650" y="658" class="m-small" style="font-size:22px" text-anchor="middle">${escC(medal.small)}</text>`
    :`<path d="M610 548 H690 L735 618 L690 688 H610 L565 618Z" fill="#fff" stroke="url(#gold)" stroke-width="12" stroke-linejoin="round"/>
      <text x="650" y="${medal.small?612:632}" class="m-big" text-anchor="middle">${escC(medal.big)}</text>${medal.small?`<text x="650" y="652" class="m-small" text-anchor="middle">${escC(medal.small)}</text>`:""}`;
  return `<svg class="cframe" viewBox="0 0 740 700" aria-hidden="true">
   <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FAC472"/><stop offset=".5" stop-color="#F9A72B"/><stop offset="1" stop-color="#E08A1E"/></linearGradient>
    <linearGradient id="silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#C9C7CF"/><stop offset="1" stop-color="#8E8B97"/></linearGradient>
    <filter id="lift" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#281C45" flood-opacity=".35"/></filter>
   </defs>
   ${art}
   <g fill="none" stroke="url(#gold)" stroke-linejoin="miter">
    <path d="M0 455 L52 512 L52 612" stroke-width="7"/>
    <path d="M0 560 L50 620 L570 620" stroke-width="9"/>
    <path d="M96 600 L320 600" stroke-width="4"/>
    <path d="M730 612 H740" stroke-width="9"/>
   </g>
   <path d="M76 540 H292 L304 552 V576 L292 588 H76 L64 576 V552Z" fill="url(#gold)"/>
   <text x="184" y="575" class="c-banner" text-anchor="middle">${escC(banner)}</text>
   ${badge}
  </svg>`;
}
function hands(n){return `<span class="hands" aria-label="${n===2?"Dos manos":"Una mano"}">${`<svg viewBox="0 0 34 44">${HAND}</svg>`.repeat(n)}</span>`}

function weaponCard(w){
  const tipo=w.g==="sec"?"Arma secundaria":"Arma principal";
  const [dado,tipoD]=w.d.split(" ");
  return `<div class="dh-card">${cardSVG(glyphFor("arma",w.id),ARTE[w.id],"EQUIPO",{kind:"hex",big:dado,small:tipoD==="mág"?"mágico":"físico"})}
   <div class="cbody"><h4>${escC(w.n)}</h4><div class="ctype">${tipo}${w.hf?" · H&amp;F":""}</div>
   <div class="ctrait">${escC(w.tr)}, ${escC(w.a)}</div>${w.f?`<p>${fmtFeature(w.f)}</p>`:""}</div>${hands(w.h)}</div>`;
}
function armorCard(a){
  return `<div class="dh-card">${cardSVG("armadura",ARTE[a.id],"EQUIPO",{kind:"shield",big:a.sc,small:"puntuación"})}
   <div class="cbody"><h4>${escC(a.n)}</h4><div class="ctype">Armadura${a.hf?" · H&amp;F":""}</div>
   <p><b>Umbrales base:</b> ${escC(a.u.replace(/ /g,""))}</p>${a.f?`<p>${fmtFeature(a.f)}</p>`:""}</div>
   <span class="slots" aria-label="${a.sc} espacios de armadura">${`<svg viewBox="0 0 24 27">${SHIELD}</svg>`.repeat(a.sc)}</span></div>`;
}
function itemCard(it){
  const banner=it.k==="rec"?"RECETA":it.k==="cons"?"CONSUMIBLE":"BOTÍN";
  const p=price(it);
  const tipo=it.k==="rec"?"Receta permanente":`${RAR[it.r].n} · ${it.k==="cons"?"consumible":"reutilizable"}`;
  return `<div class="dh-card r-${it.r}">${cardSVG(glyphFor("item",it.id,it),ARTE[it.id],banner,{kind:"hex",big:p,small:p===1?"vale":"vales"})}
   <div class="cbody"><h4>${escC(cap(it.n.replace("Receta: ","")))}</h4><div class="ctype">${tipo}${it.hf?" · H&amp;F":""}</div>
   ${it.k==="rec"?`<p><b>Ingrediente:</b> ${escC(it.ing)}</p>`:""}<p>${escC(it.t)}</p></div></div>`;
}
const cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
// "Fiable: +1..." → nombre del rasgo en negrita, como en las cartas
function fmtFeature(f){const i=f.indexOf(":");return i>0&&i<24?`<b>${escC(f.slice(0,i))}:</b>${escC(f.slice(i+1))}`:escC(f)}
