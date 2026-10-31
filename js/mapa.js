/* Mapa interactivo de la Zona Norte.
   Coordenadas en un lienzo de 1000×1000 sobre la imagen. Todo se guarda en Firebase bajo
   tienda/mapa: items (marcas, trazos, líneas, zonas y textos), sesiones (nombre y número; el texto de cada una vive en la pestaña Sesiones),
   grupos (con la ruta que siguió cada uno en cada sesión) y conf (escala y sesión actual). Cada cosa dibujada recuerda en qué sesión se puso, y la línea
   de tiempo de debajo enseña el mapa hasta la sesión elegida. Sin Firebase funciona en memoria. */
// Fábrica: la Zona Norte (con línea de tiempo) y el mapa del mundo (sin ella, con la capa de Mundo encima) usan el mismo motor.
// O = {W, H, lo, hi, path, timeline, extra}. extra es una capa opcional: marcadores, buscador y ventanas (ver mundo.js).
function crearMapa(O){
  const S=O.W,SH=O.H,IMG_LO=O.lo,IMG_HI=O.hi,X=O.extra||null;
  const COLORS=["#F9A72B","#E5484D","#4CC38A","#3E9BFF","#B48CFF","#FF7AC6","#FDFCF7","#1B1230"];
  const ICONS={
    marca:'<circle cx="12" cy="11" r="4"/>',
    ciudad:'<path d="M5 19 V10 L8 8 L8 5 H10 V8 L12 6.5 L14 8 V5 H16 V8 L19 10 V19Z"/>',
    campamento:'<path d="M3 19 L12 5 L21 19Z M12 19 L9.5 13.5 H14.5Z"/>',
    peligro:'<path d="M12 4 C7 4 5 7.5 5 10.5 C5 13 6.5 14 7.5 14.5 V17 H16.5 V14.5 C17.5 14 19 13 19 10.5 C19 7.5 17 4 12 4Z M9.5 9.5 a1.6 1.6 0 1 0 0.01 0Z M14.5 9.5 a1.6 1.6 0 1 0 0.01 0Z"/>',
    mision:'<path d="M10.5 4 H13.5 L13 14 H11Z M12 16 a1.8 1.8 0 1 0 0.01 0Z"/>',
    tesoro:'<path d="M4 10 C4 6 20 6 20 10 V18 H4Z M4 11 H20 M11 10 H13 V13 H11Z"/>',
    pregunta:'<path d="M8.5 8.5 C8.5 3.5 15.5 3.5 15.5 8 C15.5 11 12.5 11 12.5 14 M12.5 16.5 a1.6 1.6 0 1 0 0.01 0Z" fill="none" stroke-width="2.4"/>',
    ojo:'<path d="M2.5 12 C6 6 18 6 21.5 12 C18 18 6 18 2.5 12Z M12 9 a3 3 0 1 0 0.01 0Z"/>',
    bandera:'<path d="M6 4 V20 M6 5 H18 L15 9 L18 13 H6"/>',
    estrella:'<path d="M12 3 L14.6 9 L21 9.5 L16 13.6 L17.6 20 L12 16.5 L6.4 20 L8 13.6 L3 9.5 L9.4 9Z"/>'
  };
  const ICON_N={marca:"Marca",ciudad:"Ciudad",campamento:"Campamento",peligro:"Peligro",mision:"Misión",tesoro:"Tesoro",pregunta:"Misterio",ojo:"Avistamiento",bandera:"Objetivo",estrella:"Importante"};
  const TOOLS=[["mover","Mover y seleccionar","M5 12 H19 M12 5 V19 M5 12 L8 9 M5 12 L8 15 M19 12 L16 9 M19 12 L16 15 M12 5 L9 8 M12 5 L15 8 M12 19 L9 16 M12 19 L15 16"],
    ["pin","Punto con nota","M12 21 C12 21 5 14 5 9.5 a7 7 0 0 1 14 0 C19 14 12 21 12 21Z M12 7 a2.5 2.5 0 1 0 0.01 0"],
    ["draw","Pintar","M4 20 L5 15 L16 4 L20 8 L9 19Z M14 6 L18 10"],
    ["line","Línea","M4 18 L10 8 L15 14 L20 5 M4 18 h0.1 M10 8 h0.1 M15 14 h0.1 M20 5 h0.1"],
    ["area","Zona","M5 7 L14 4 L20 11 L16 20 L6 17Z"],
    ["text","Texto","M5 5 H19 M12 5 V20 M9 20 H15"],
    ["ruler","Medir","M3 16 L16 3 L21 8 L8 21Z M7 12 L9 14 M10 9 L12 11 M13 6 L15 8"]];
  const WIDTHS=[2,4,8];

  let el,svg,ctx={isDM:()=>false,me:()=>null,toast:()=>{}},ref=null,mode="local",mounted=false,connected=false,sesSubs=[],hiLoaded=false,fitted=false;
  let data={items:{},sesiones:{},grupos:{},conf:{kmAncho:420,kmDia:30,actual:null}};
  let view={x:0,y:0,w:S},tool="mover",color=COLORS[0],width=4;
  let draft=null,sel=null,ruler=null,tpos=null,sesManual=false,setOpen=false,confirmDel=null,gName="";
  let pointers=new Map(),gesture=null,tdrag=false;

  const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  const r1=n=>Math.round(n*10)/10;
  const isDM=()=>ctx.isDM()&&!ctx.viewAs?.(); // el DM que mira la hoja de un PJ ve el mapa como él
  const me=()=>ctx.isDM()?"dm":ctx.me();
  const who=by=>by==="dm"?"DM":(ctx.pjName(by)||"Alguien");
  const canEdit=it=>ctx.isDM()||it.by===me();
  const visible=it=>it.vis==="all"||!it.vis||it.by===me()||(it.vis==="dm"&&isDM());
  const k=()=>view.w/(svg?.clientWidth||1000); // unidades de mapa por píxel de pantalla

  /* ---------- Sesiones ---------- */
  // Los jugadores ven hasta la sesión actual; el DM ve también las que prepara
  const sesList=()=>{if(!O.timeline)return [];const A=Object.entries(data.sesiones).filter(([,x])=>x).sort((a,b)=>a[1].num-b[1].num);
    const cur=data.sesiones[data.conf.actual];return isDM()?A:cur?A.filter(([,x])=>x.num<=cur.num):[]};
  const sesNum=id=>data.sesiones[id]?.num??-Infinity;
  // La línea de tiempo no va a saltos: tpos es continuo (0 = primera sesión, 1 = segunda…).
  // Entre dos sesiones se está viviendo la siguiente: los grupos avanzan por su ruta.
  function tNow(){const L=sesList();if(!L.length)return null;
    if(!sesManual||tpos==null||tpos>L.length-1){const a=L.findIndex(([id])=>id===data.conf.actual);tpos=a>=0?a:L.length-1}return tpos}
  const curIdx=()=>{const t=tNow();return t==null?null:Math.ceil(t-1e-6)};
  function curSes(){const i=curIdx();return i==null?null:sesList()[i][0]}
  const sesIdx=id=>sesList().findIndex(([x])=>x===id);
  // Lo de sesiones posteriores no se ve; lo de las anteriores, más apagado. Lo de antes de las sesiones se ve siempre.
  const inTime=it=>{const i=curIdx();if(i==null||!it.ses)return true;const j=sesIdx(it.ses);return j>=0&&j<=i};
  const isOld=it=>{const i=curIdx();return i!=null&&it.ses&&sesIdx(it.ses)<i};

  /* ---------- Datos ---------- */
  function connect(){
    if(connected)return;connected=true;
    const cfg=window.FIREBASE_CONFIG;
    if(!cfg||!window.firebase){mode="local";return}
    try{
      const app=firebase.apps.length?firebase.app():firebase.initializeApp(cfg);
      ref=app.database().ref(O.path);mode="live";
      for(const col of ["items","sesiones","grupos"]){
        const r=ref.child(col);
        r.on("child_added",s=>{data[col][s.key]=fixItem(s.val());later()});
        r.on("child_changed",s=>{data[col][s.key]=fixItem(s.val());later()});
        r.on("child_removed",s=>{delete data[col][s.key];if(sel===s.key)sel=null;later()});
      }
      ref.child("conf").on("value",s=>{data.conf={...data.conf,...(s.val()||{})};later()});
    }catch(e){console.error(e);mode="local"}
  }
  function fixItem(v){if(v?.pts&&!Array.isArray(v.pts))v.pts=Object.values(v.pts);
    if(v?.rutas)for(const [k2,r] of Object.entries(v.rutas))if(!Array.isArray(r))v.rutas[k2]=Object.values(r);return v}
  let drawT=0;
  const sesEmit=()=>sesSubs.forEach(f=>f());
  const later=()=>{clearTimeout(drawT);drawT=setTimeout(()=>{draw();pop();timeline();settings();sesEmit()},16)};
  function put(col,id,obj){
    obj=JSON.parse(JSON.stringify(obj));
    if(mode==="live")ref.child(col).child(id).set(obj).catch(err);
    data[col][id]=obj;draw();pop();timeline();settings();if(col==="sesiones")sesEmit();
  }
  function del(col,id){if(mode==="live")ref.child(col).child(id).remove().catch(err);delete data[col][id];if(sel===id)sel=null;draw();pop();timeline();settings();if(col==="sesiones")sesEmit()}
  function setConf(p){Object.assign(data.conf,p);if(mode==="live")ref.child("conf").update(p).catch(err);draw();timeline();settings();sesEmit()}
  function err(e){console.error(e);ctx.toast("No se pudo guardar en el mapa.",true)}

  /* ---------- Montaje ---------- */
  function mount(root,c){
    ctx=c;el=root;
    el.innerHTML=`<div class="map-shell">
      <div class="map-tools" id="mtools"></div>
      <div class="map-stage" id="mstage">
        <svg id="msvg" xmlns="http://www.w3.org/2000/svg">
          <image id="mimg" href="${IMG_LO}" x="0" y="0" width="${S}" height="${SH}"/>
          <g id="gl-area"></g><g id="gl-draw"></g><g id="gl-grp"></g><g id="gl-pin"></g><g id="gl-extra"></g><g id="gl-draft"></g>
        </svg>${X?X.html():""}
        <div class="map-zoom"><button data-mz="1" aria-label="Acercar">+</button><button data-mz="-1" aria-label="Alejar">−</button><button data-mz="0" aria-label="Ver todo">⤢</button></div>
        <div class="map-pop" id="mpop" hidden></div>
        <div class="map-hint" id="mhint"></div>
      </div>
    </div>
    <div class="mtime" id="mtime"></div>
    <div class="mset" id="mset"></div>`;
    svg=el.querySelector("#msvg");
    if(!mounted){connect();mounted=true;addEventListener("resize",()=>{if(visibleNow()){applyView();draw();X?.resize?.()}});document.addEventListener("keydown",key)}
    bind();X?.mount(api,el);refresh(true);
  }
  const visibleNow=()=>svg&&document.body.contains(svg)&&svg.getBoundingClientRect().width>0;
  // Al volver a la pestaña del mapa: encajar si hacía falta y redibujar con lo que llegó mientras tanto
  let lastDM=null;
  function refresh(refit){if(!visibleNow())return;if(lastDM!==isDM()){lastDM=isDM();sesManual=false;sel=null;if(draft?.t==="ruta"){draft=null;tool="mover"}}if(refit||!fitted){fit();fitted=true}else applyView();tools();draw();pop();hint();timeline();settings();X?.refresh?.()}
  function fit(){const r=svg.getBoundingClientRect(),a=r.width/Math.max(1,r.height);
    if(a>=S/SH){view.w=SH*a;view.x=-(view.w-S)/2;view.y=0}else{view.w=S;view.x=0;view.y=-(S/a-SH)/2}applyView()}
  function applyView(){
    const r=svg.getBoundingClientRect(),h=view.w*(r.height/Math.max(1,r.width));
    svg.setAttribute("viewBox",`${view.x} ${view.y} ${view.w} ${h}`);
    if(!hiLoaded&&view.w<S*.6){hiLoaded=true;const im=new Image();im.onload=()=>svg.querySelector("#mimg").setAttribute("href",IMG_HI);im.src=IMG_HI}
  }
  function zoomAt(f,px,py){
    const p=toMap(px,py),nw=Math.min(S*3,Math.max(40,view.w/f)),s=nw/view.w;
    view.x=p.x-(p.x-view.x)*s;view.y=p.y-(p.y-view.y)*s;view.w=nw;applyView();draw();
  }
  function toMap(cx,cy){const r=svg.getBoundingClientRect();const h=view.w*(r.height/r.width);
    return {x:view.x+(cx-r.left)/r.width*view.w,y:view.y+(cy-r.top)/r.height*h}}

  /* ---------- Entrada ---------- */
  function bind(){
    svg.addEventListener("wheel",e=>{e.preventDefault();zoomAt(e.deltaY<0?1.2:1/1.2,e.clientX,e.clientY)},{passive:false});
    svg.addEventListener("pointerdown",down);svg.addEventListener("pointermove",move);
    svg.addEventListener("pointerup",up);svg.addEventListener("pointercancel",up);
    svg.addEventListener("dblclick",e=>{if(draft&&["line","area","ruta"].includes(draft.t)){e.preventDefault();finish()}});
    el.addEventListener("click",click);el.addEventListener("change",change);el.addEventListener("input",input);
    // Línea de tiempo: se arrastra con el ratón o el dedo y se queda en la sesión más cercana
    const tm=el.querySelector("#mtime");
    tm.addEventListener("pointerdown",e=>{const tr=e.target.closest("#mtrack");if(!tr)return;tdrag=true;tr.setPointerCapture(e.pointerId);scrub(e.clientX);e.preventDefault()});
    tm.addEventListener("pointermove",e=>{if(tdrag)scrub(e.clientX)});
    const stop=()=>{tdrag=false};tm.addEventListener("pointerup",stop);tm.addEventListener("pointercancel",stop);
    tm.addEventListener("keydown",e=>{if(!e.target.closest("#mtrack"))return;const n=sesList().length,t=tNow();if(t==null)return;
      if(e.key==="ArrowLeft"){setT(Math.max(0,Math.ceil(t-1e-6)-1));e.preventDefault()}if(e.key==="ArrowRight"){setT(Math.min(n-1,Math.floor(t+1e-6)+1));e.preventDefault()}});
  }
  // Cerca de una sesión se queda justo en ella; en medio, donde lo sueltes
  function scrub(x){const tr=el.querySelector("#mtrack"),n=sesList().length;if(!tr||!n)return;
    const r=tr.getBoundingClientRect(),f=Math.min(1,Math.max(0,(x-r.left)/r.width));let t=n===1?0:f*(n-1);
    const near=Math.round(t);if(Math.abs(t-near)*r.width/Math.max(1,n-1)<8)t=near;setT(t)}
  function setT(t){if(t===tpos&&sesManual)return;const was=curSes();tpos=t;sesManual=true;if(curSes()!==was)sel=null;draw();pop();timeline();if(isDM())settings()}
  function key(e){
    if(!visibleNow()||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
    if(e.key==="Escape"){if(tool==="ruta"){tool="mover";tools()}draft=null;ruler=null;sel=null;draw();pop();hint()}
    if(e.key==="Enter"&&draft)finish();
    if(e.key==="Backspace"&&draft?.pts?.length){draft.pts.pop();draw()}
    if((e.key==="Delete")&&sel&&canEdit(data.items[sel]||{}))removeSel();
  }
  const base=()=>({vis:"all",by:me(),ts:Date.now(),...(curSes()?{ses:curSes()}:{})});
  function down(e){
    svg.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===2){const [a,b]=[...pointers.values()];gesture={pinch:Math.hypot(a.x-b.x,a.y-b.y),w:view.w};draft=draft?.t==="draw"?null:draft;return}
    const p=toMap(e.clientX,e.clientY);
    if(X?.down?.(e,p,tool))return;
    const hit=e.target.closest?.("[data-id]");
    if(tool==="mover"){
      if(hit){const id=hit.dataset.id,it=data.items[id];sel=id;
        if(it&&canEdit(it)&&it.x!=null)gesture={drag:id,ox:p.x-it.x,oy:p.y-it.y,moved:false};
        else gesture={pan:true,sx:e.clientX,sy:e.clientY,vx:view.x,vy:view.y};
        draw();pop();return}
      gesture={pan:true,sx:e.clientX,sy:e.clientY,vx:view.x,vy:view.y,click:true};return}
    if(tool==="draw"){draft={t:"draw",pts:[[r1(p.x),r1(p.y)]],color,w:width};return}
    if(tool==="ruler"){ruler={a:p,b:p};draw();return}
    if(["line","area"].includes(tool)){if(!draft)draft={t:tool,pts:[],color,w:width};draft.pts.push([r1(p.x),r1(p.y)]);draw();hint();return}
    // Ruta de un grupo: toques sueltos o arrastrando, como un lápiz
    if(tool==="ruta"&&draft?.t==="ruta"){draft.pts.push([r1(p.x),r1(p.y)]);gesture={ruta:true};drawDraft();hint();return}
    if(tool==="pin"){const id=uid();put("items",id,{t:"pin",x:r1(p.x),y:r1(p.y),icon:"marca",color,title:"",note:"",...base()});sel=id;setTool("mover");pop();setTimeout(()=>el.querySelector("#md-title")?.focus(),30);return}
    if(tool==="text"){const id=uid();put("items",id,{t:"text",x:r1(p.x),y:r1(p.y),text:"Texto",size:18,color,...base()});sel=id;setTool("mover");pop();setTimeout(()=>el.querySelector("#md-text")?.select(),30);return}
  }
  function move(e){
    if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(X?.move?.(e))return;
    if(gesture?.pinch&&pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);
      zoomAt(view.w/(gesture.w*gesture.pinch/d),(a.x+b.x)/2,(a.y+b.y)/2);return}
    const p=toMap(e.clientX,e.clientY);
    if(gesture?.pan){const r=svg.getBoundingClientRect(),f=view.w/r.width;
      if(Math.abs(e.clientX-gesture.sx)+Math.abs(e.clientY-gesture.sy)>4)gesture.click=false;
      view.x=gesture.vx-(e.clientX-gesture.sx)*f;view.y=gesture.vy-(e.clientY-gesture.sy)*f;applyView();return}
    if(gesture?.drag){const it=data.items[gesture.drag];it.x=r1(p.x-gesture.ox);it.y=r1(p.y-gesture.oy);gesture.moved=true;draw();return}
    if(gesture?.ruta&&draft?.t==="ruta"){const l=draft.pts[draft.pts.length-1];if(!l||Math.hypot(p.x-l[0],p.y-l[1])>k()*6){draft.pts.push([r1(p.x),r1(p.y)]);drawDraft()}return}
    if(draft?.t==="draw"){const l=draft.pts[draft.pts.length-1];if(Math.hypot(p.x-l[0],p.y-l[1])>k()*2){draft.pts.push([r1(p.x),r1(p.y)]);drawDraft()}return}
    if(ruler){ruler.b=p;drawDraft();return}
  }
  function up(e){
    pointers.delete(e.pointerId);
    if(X?.up?.(e))return;
    if(gesture?.drag&&gesture.moved){const it=data.items[gesture.drag];put("items",gesture.drag,it)}
    if(gesture?.pan&&gesture.click){sel=null;draw();pop()}
    if(pointers.size===0)gesture=null;
    if(draft?.t==="draw"&&pointers.size===0){
      const pts=simplify(draft.pts,k()*1.2);
      if(pts.length>1)put("items",uid(),{t:"draw",pts,color:draft.color,w:r1(draft.w*k()),...base()});
      draft=null;draw()}
  }
  function finish(){
    if(!draft)return;const d=draft;draft=null;
    if(d.t==="ruta"){const g=data.grupos[d.g],sid=curSes();setTool("mover");if(!g||!sid||!d.pts.length)return;
      const pts=d.pts.length>2?simplify(d.pts,k()*1.5):d.pts;g.rutas={...(g.rutas||{}),[sid]:pts};put("grupos",d.g,g);return}
    if((d.t==="line"&&d.pts.length<2)||(d.t==="area"&&d.pts.length<3)){draw();hint();return}
    const id=uid();put("items",id,{t:d.t,pts:d.pts,color:d.color,w:r1(d.w*k()),title:"",note:"",...base()});
    sel=id;draw();pop();hint();
  }
  function simplify(pts,eps){ // Ramer–Douglas–Peucker
    if(pts.length<3)return pts;const [a,b]=[pts[0],pts[pts.length-1]];let md=0,mi=0;
    for(let i=1;i<pts.length-1;i++){const p=pts[i],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;
      const d=Math.abs(dy*p[0]-dx*p[1]+b[0]*a[1]-b[1]*a[0])/L;if(d>md){md=d;mi=i}}
    if(md>eps)return simplify(pts.slice(0,mi+1),eps).slice(0,-1).concat(simplify(pts.slice(mi),eps));
    return [a,b];
  }

  /* ---------- Dibujo ---------- */
  const pathD=pts=>pts.map((p,i)=>(i?"L":"M")+p[0]+" "+p[1]).join(" ");
  const smoothD=pts=>{if(pts.length<3)return pathD(pts);let d=`M${pts[0][0]} ${pts[0][1]}`;
    for(let i=1;i<pts.length-1;i++){const mx=(pts[i][0]+pts[i+1][0])/2,my=(pts[i][1]+pts[i+1][1])/2;d+=` Q${pts[i][0]} ${pts[i][1]} ${mx} ${my}`}
    const l=pts[pts.length-1];return d+` L${l[0]} ${l[1]}`};
  function draw(){
    if(!visibleNow())return;
    const K=k(),items=Object.entries(data.items).filter(([,it])=>it&&it.t!=="reveal"&&it.t!=="img"&&visible(it)&&inTime(it));
    const selCls=id=>id===sel?" m-sel":"";
    let area="",drw="",pin="";
    for(const [id,it] of items){
      const dim=isOld(it)?` opacity=".45"`:"";
      if(it.t==="area")area+=`<path data-id="${id}" class="m-hit${selCls(id)}" d="${pathD(it.pts)} Z" fill="${it.color}" fill-opacity=".22" stroke="${it.color}" stroke-width="${it.w}" stroke-dasharray="${it.w*3} ${it.w*2}"${dim}/>`;
      if(it.t==="draw"||it.t==="line")drw+=`<path data-id="${id}" class="m-hit${selCls(id)}" d="${it.t==="draw"?smoothD(it.pts):pathD(it.pts)}" fill="none" stroke="${it.color}" stroke-width="${it.w}" stroke-linecap="round" stroke-linejoin="round"${dim}/>`
        +`<path data-id="${id}" d="${pathD(it.pts)}" fill="none" stroke="transparent" stroke-width="${Math.max(it.w,K*12)}"/>`;
      if(it.t==="pin"){const s=K*30;
        pin+=`<g data-id="${id}" class="m-pin${selCls(id)}" transform="translate(${it.x} ${it.y}) scale(${s/24})"${dim}>
          <path d="M12 23 C12 23 3 14.5 3 9.5 a9 9 0 0 1 18 0 C21 14.5 12 23 12 23Z" fill="${it.color}" stroke="#1B1230" stroke-width="1.2" transform="translate(-12 -23)"/>
          <g transform="translate(-12 -23) translate(5.2 2.6) scale(.57)" fill="#1B1230" stroke="#1B1230" stroke-width=".6">${ICONS[it.icon]||ICONS.marca}</g></g>`;
        if(it.title&&view.w<S*1.1)pin+=`<text x="${it.x}" y="${it.y+K*14}" class="m-label" font-size="${K*13}" text-anchor="middle"${dim}>${esc(it.title)}</text>`}
      if(it.t==="text")pin+=`<text data-id="${id}" class="m-text${selCls(id)}" x="${it.x}" y="${it.y}" font-size="${it.size*K}" fill="${it.color}" text-anchor="middle"${dim}>${esc(it.text)}</text>`;
    }
    let grp="";for(const [id,g] of Object.entries(data.grupos)){if(!g?.rutas)continue;const s2=gState(g);if(!s2)continue;
      for(const tr of s2.old)grp+=`<path d="${pathD(tr)}" fill="none" stroke="${g.color}" stroke-width="${K*3}" stroke-dasharray="${K*8} ${K*6}" stroke-linecap="round" opacity=".5"/>`;
      if(s2.trail.length>1)grp+=`<path d="${pathD(s2.trail)}" fill="none" stroke="${g.color}" stroke-width="${K*4}" stroke-linecap="round" stroke-linejoin="round"/><path d="${pathD(s2.trail)}" fill="none" stroke="#FDFCF7" stroke-width="${K*1.2}" stroke-dasharray="${K*2} ${K*6}" stroke-linecap="round"/>`;
      grp+=token(id,g,s2.pos,K)}
    svg.querySelector("#gl-area").innerHTML=area;svg.querySelector("#gl-draw").innerHTML=drw;svg.querySelector("#gl-pin").innerHTML=pin;svg.querySelector("#gl-grp").innerHTML=grp;
    svg.querySelector("#gl-extra").innerHTML=X?X.layer(K):"";
    drawDraft();
  }
  // Camino del grupo en la sesión i: empieza donde acabó en la anterior que tenga ruta
  function prevEnd(g,L,i){for(let j=i-1;j>=0;j--){const r=g.rutas?.[L[j][0]];if(r?.length)return r[r.length-1]}return null}
  function gPath(g,L,i){const pv=prevEnd(g,L,i),r=g.rutas?.[L[i][0]]||[];return pv?[pv,...r]:r.slice()}
  // Punto a una fracción f del recorrido, y el tramo ya hecho
  function along(pts,f){const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
    const L=cum[cum.length-1],d=L*Math.min(1,Math.max(0,f));if(!L)return {pos:pts[pts.length-1],trail:pts.slice(0,1)};
    let i=1;while(i<cum.length-1&&cum[i]<d)i++;const s=(cum[i]-cum[i-1])||1,q=(d-cum[i-1])/s;
    const pos=[r1(pts[i-1][0]+(pts[i][0]-pts[i-1][0])*q),r1(pts[i-1][1]+(pts[i][1]-pts[i-1][1])*q)];return {pos,trail:[...pts.slice(0,i),pos]}}
  function gState(g){const L=sesList(),t=tNow();if(t==null)return null;const i=Math.ceil(t-1e-6),f=i===0?1:t-(i-1);
    const path=gPath(g,L,i);if(!path.length)return null;const {pos,trail}=along(path,f);
    const old=[];for(let j=0;j<i;j++){const pj=gPath(g,L,j);if(pj.length>1)old.push(pj)}return {pos,trail,old}}
  function token(id,g,pos,K){const r=K*13,ini=(g.n||"?").split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase();
    return `<g class="m-token"><circle cx="${pos[0]}" cy="${pos[1]}" r="${r}" fill="${g.color}" stroke="#FDFCF7" stroke-width="${K*2.5}"/>
      <text x="${pos[0]}" y="${pos[1]+K*4.5}" font-size="${K*12}" text-anchor="middle" class="m-ini">${esc(ini)}</text>
      <text x="${pos[0]}" y="${pos[1]+r+K*14}" font-size="${K*13}" text-anchor="middle" class="m-label">${esc(g.n)}</text></g>`}
  function drawDraft(){
    const K=k();let h="";
    if(draft?.t==="ruta"){const g=data.grupos[draft.g],L=sesList(),pv=g&&prevEnd(g,L,curIdx()),pts=pv?[pv,...draft.pts]:draft.pts;
      if(pts.length)h+=`<path d="${pathD(pts)}" fill="none" stroke="${g?.color||color}" stroke-width="${K*4}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${K*8} ${K*5}"/>`+pts.slice(-1).map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="${K*6}" fill="${g?.color||color}" stroke="#FDFCF7" stroke-width="${K*2}"/>`).join("")}
    else if(draft){const d=draft;
      if(d.t==="area"&&d.pts.length)h+=`<path d="${pathD(d.pts)} Z" fill="${d.color}" fill-opacity=".2" stroke="${d.color}" stroke-width="${d.w*K}"/>`;
      else h+=`<path d="${d.t==="draw"?smoothD(d.pts):pathD(d.pts)}" fill="none" stroke="${d.color}" stroke-width="${d.w*K}" stroke-linecap="round" stroke-linejoin="round"/>`;
      if(d.t!=="draw")h+=d.pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="${K*4}" fill="#FDFCF7" stroke="#1B1230" stroke-width="${K}"/>`).join("");
    }
    if(ruler){const {a,b}=ruler,km=Math.hypot(b.x-a.x,b.y-a.y)/S*(+data.conf.kmAncho||420),dias=km/(+data.conf.kmDia||30);
      h+=`<path d="M${a.x} ${a.y} L${b.x} ${b.y}" stroke="#FDFCF7" stroke-width="${K*2.5}" stroke-dasharray="${K*6} ${K*4}"/><circle cx="${a.x}" cy="${a.y}" r="${K*4}" fill="#F9A72B"/><circle cx="${b.x}" cy="${b.y}" r="${K*4}" fill="#F9A72B"/>
        <g transform="translate(${b.x+K*10} ${b.y-K*10})"><rect x="0" y="${-K*18}" width="${K*150}" height="${K*24}" fill="#1B1230" stroke="#F9A72B" stroke-width="${K}"/><text x="${K*8}" y="0" font-size="${K*14}" class="m-label" fill="#FDFCF7">${Math.round(km)} km · ${dias.toFixed(1).replace(".",",")} días</text></g>`}
    svg.querySelector("#gl-draft").innerHTML=h;
  }

  /* ---------- Barra de herramientas, ficha flotante, línea de tiempo y ajustes ---------- */
  // En móvil la línea de tiempo va debajo: al elegir algo que se hace sobre el mapa, traerlo a la vista
  function showStage(){const st=el.querySelector("#mstage"),r=st.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight)st.scrollIntoView({block:"center",behavior:"smooth"})}
  function setTool(t){tool=t;if(t!=="mover"){showStage();sel=null;pop()}if(!["line","area","ruta"].includes(t))draft=null;ruler=null;tools();hint();draw()}
  function tools(){
    el.querySelector(".map-shell").dataset.tool=tool;
    el.querySelector("#mtools").innerHTML=TOOLS.map(([id,n,d])=>`<button class="mtool" data-tool="${id}" aria-pressed="${tool===id}" title="${n}" aria-label="${n}"><svg viewBox="0 0 24 24"><path d="${d}"/></svg></button>`).join("")
      +`<span class="msep"></span>`+COLORS.map(c=>`<button class="mcolor" data-color="${c}" aria-pressed="${color===c}" style="--c:${c}" aria-label="Color ${c}"></button>`).join("")
      +`<span class="msep"></span>`+WIDTHS.map(w=>`<button class="mtool mw" data-width="${w}" aria-pressed="${width===w}" title="Grosor ${w}" aria-label="Grosor ${w}"><i style="width:${w+3}px;height:${w+3}px"></i></button>`).join("")
      +`<span class="msep"></span><button class="mtool" data-undo title="Deshacer lo último que hiciste" aria-label="Deshacer"><svg viewBox="0 0 24 24"><path d="M9 7 L4 12 L9 17 M4 12 H15 a5 5 0 0 1 0 10 H12"/></svg></button>`;
  }
  function hint(){
    const h=el?.querySelector("#mhint");if(!h)return;
    const msg={pin:"Toca el mapa para poner un punto.",draw:"Arrastra para pintar.",line:"Toca para añadir puntos. Doble toque o Intro para terminar.",
      area:"Toca para marcar las esquinas de la zona. Doble toque o Intro para cerrar.",text:"Toca donde quieras escribir.",ruler:"Arrastra para medir.",
      ruta:draft?.t==="ruta"?`Ruta de ${esc(data.grupos[draft.g]?.n||"el grupo")} en ${esc(data.sesiones[curSes()]?.n||"esta sesión")}: toca o arrastra por el camino. Un solo toque lo coloca. Doble toque o Intro para terminar.`:""}[tool];
    const finishBtn=draft&&["line","area","ruta"].includes(draft.t)?`<button class="btn" data-finish>Terminar</button><button class="btn ghost" data-cancel-draft>Cancelar</button>`:"";
    h.innerHTML=msg?`<span>${msg}</span>${finishBtn}`:"";h.hidden=!msg;
  }
  const typing=box=>box.contains(document.activeElement)&&/INPUT|TEXTAREA/.test(document.activeElement.tagName); // no pisar lo que se está escribiendo
  // Ficha flotante de lo seleccionado: título y nota, color y borrar
  function pop(){
    const box=el?.querySelector("#mpop");if(!box)return;const it=sel&&data.items[sel];
    if(!it){box.hidden=true;box.innerHTML="";return}
    if(typing(box)&&!box.hidden)return;
    const ed=canEdit(it),dis=ed?"":"disabled",S2=data.sesiones[it.ses];
    const kind={pin:"Punto",draw:"Trazo",line:"Línea",area:"Zona",text:"Texto"}[it.t]||"Marca";
    let f=`<div class="mphead"><b>${kind}</b><span class="note">de ${esc(who(it.by))}${S2?` · ${esc(S2.n)}`:""}</span><button class="wx" data-closepop aria-label="Cerrar">✕</button></div>`;
    if(it.t==="text")f+=`<input type="text" id="md-text" value="${esc(it.text)}" maxlength="80" aria-label="Texto" ${dis}>
      <label class="mlab" for="md-size">Tamaño</label><input type="range" id="md-size" min="10" max="60" value="${it.size}" ${dis}>`;
    else if(ed)f+=`<input type="text" id="md-title" value="${esc(it.title)}" maxlength="60" placeholder="Título" aria-label="Título">
      <textarea id="md-note" maxlength="1000" placeholder="Nota" aria-label="Nota">${esc(it.note)}</textarea>`;
    else f+=`${it.title?`<b class="mptitle">${esc(it.title)}</b>`:""}${it.note?`<p class="mpnote">${esc(it.note)}</p>`:""}`;
    if(it.lugar&&ctx.lugares?.().some(l=>l.id===it.lugar))f+=`<button class="btn ghost" data-golugar="${it.lugar}">Ir a ${esc(ctx.lugares().find(l=>l.id===it.lugar).n)}</button>`;
    if(ed)f+=`<div class="mcolors">${COLORS.map(c=>`<button class="mcolor" data-setcolor="${c}" aria-pressed="${it.color===c}" style="--c:${c}" aria-label="Color ${c}"></button>`).join("")}</div>
      <div class="btns"><button class="btn warn" data-delsel>Borrar</button></div>`;
    box.innerHTML=f;box.hidden=false;
  }
  // Línea de tiempo de sesiones, debajo del mapa
  function timeline(){
    const box=el?.querySelector("#mtime");if(!box)return;if(!O.timeline){box.hidden=true;box.innerHTML="";return}const L=sesList(),c=curSes(),t=tNow();
    if(!L.length){box.innerHTML=isDM()?`<p class="note">Crea la primera sesión en la pestaña Sesiones para que lo que se dibuje quede guardado por sesiones.</p>`:"";box.hidden=!isDM();return}
    box.hidden=false;
    const pos=i=>L.length===1?50:i/(L.length-1)*100,ci=curIdx(),cur=L[ci][1],mid=t<ci-1e-6;
    const act=data.conf.actual;
    box.innerHTML=`<div class="mtrack" id="mtrack" tabindex="0" role="slider" aria-label="Sesión" aria-valuemin="0" aria-valuemax="${L.length-1}" aria-valuenow="${Math.round(t*100)/100}" aria-valuetext="${esc(cur.n)}">
        <div class="mtline"></div><div class="mtfill" style="width:${pos(t)}%"></div>
        ${L.map(([id,x],i)=>`<span class="mtnode${i<=t+1e-6?" on":""}${id===act?" act":""}" style="left:${pos(i)}%" title="${esc(x.n)}"><i></i><small>${esc(String(x.num))}</small></span>`).join("")}
        <span class="mthandle" style="left:${pos(t)}%"></span></div>
      <div class="mtinfo"><b>${mid?"Durante la ":""}${esc(cur.n)}</b>${c===act&&!mid?`<span class="mtnow">Sesión actual</span>`:""}${ctx.sesTitulo?.(c)?`<p>${esc(ctx.sesTitulo(c))}</p>`:""}${ctx.goSesion?`<button class="btn ghost mtread" data-leerses="${c}">Leer la sesión</button>`:""}</div>`;
  }
  // Ajustes del DM: sesiones y escala. Van debajo para no molestar.
  function settings(){
    const box=el?.querySelector("#mset");if(!box)return;
    if(!isDM()||!O.timeline){box.innerHTML="";box.hidden=true;return}
    if(typing(box))return;box.hidden=false;
    const L=Object.entries(data.sesiones).filter(([,x])=>x).sort((a,b)=>b[1].num-a[1].num),act=data.conf.actual;
    box.innerHTML=`<details class="deco" ${setOpen?"open":""} id="msetd"><summary>Ajustes del mapa <small>solo DM</small></summary>
      <section><h3>Sesiones</h3><p class="note">Lo que se dibuja queda en la sesión que marque la línea de tiempo. Los jugadores ven hasta la sesión actual. Las sesiones se crean, se escriben y se borran en la pestaña Sesiones.</p>
        <div class="msesl">${L.map(([id,x])=>`<div class="mses${id===act?" act":""}"><div class="msesh"><b class="msesn">${esc(x.n)}</b>
          ${id===act?`<span class="mtnow">Actual</span>`:`<button class="btn ghost" data-sesact="${id}">Hacer actual</button>`}</div></div>`).join("")||`<p class="note">Todavía no hay sesiones.</p>`}</div></section>
      <section><h3>Grupos</h3>${grpSet()}</section>
      <section><h3>Distancias</h3><div class="mrow2"><label class="mlab" for="m-km">Ancho del mapa (km)</label><input type="number" id="m-km" min="10" max="5000" value="${data.conf.kmAncho||420}">
        <label class="mlab" for="m-kmd">Km por día de viaje</label><input type="number" id="m-kmd" min="1" max="200" value="${data.conf.kmDia||30}"></div></section></details>`;
  }
  function grpSet(){const G=Object.entries(data.grupos).filter(([,g])=>g),sid=curSes(),sn=esc(data.sesiones[sid]?.n||"");
    return `<p class="note">${sid?`Las rutas se dibujan en la sesión que marque la línea de tiempo: ahora, <b>${sn}</b>. Cada ruta empieza donde acabó el grupo la sesión anterior.`:"Crea antes una sesión."}</p>
      <div class="msesl">${G.map(([id,g])=>{const has=sid&&g.rutas?.[sid]?.length;return `<div class="mses"><div class="msesh"><i class="mgdot" style="background:${g.color}"></i>
        <input type="text" id="mg-n-${id}" data-gname="${id}" value="${esc(g.n)}" maxlength="40" aria-label="Nombre del grupo">
        <button class="btn" data-gruta="${id}" ${sid?"":"disabled"}>${has?"Redibujar":"Dibujar"} ruta en ${sn||"la sesión"}</button>
        ${has?`<button class="btn ghost" data-grutadel="${id}">Quitar esa ruta</button>`:""}
        <button class="btn warn" data-gdel="${id}">${confirmDel===id?"¿Seguro?":"Borrar"}</button></div>
        <div class="mcolors">${COLORS.map(c=>`<button class="mcolor" data-gcolor="${c}" data-g="${id}" aria-pressed="${g.color===c}" style="--c:${c}" aria-label="Color ${c}"></button>`).join("")}</div></div>`}).join("")||`<p class="note">Todavía no hay grupos.</p>`}</div>
      <div class="ctrow"><input type="text" id="mg-new" value="${esc(gName)}" placeholder="Nombre del grupo, por ejemplo: Los jugadores" maxlength="40" aria-label="Nombre del grupo nuevo"><button class="btn" data-gnew>Crear grupo</button></div>`}
  function removeSel(){if(sel)del("items",sel);sel=null;pop()}

  function click(e){
    const b=e.target.closest("button");if(!b||!el.contains(b))return;const d=b.dataset;
    if(d.tool){setTool(d.tool);return}
    if(d.color){color=d.color;tools();return}
    if(d.width){width=+d.width;tools();return}
    if(d.mz!==undefined){const r=svg.getBoundingClientRect();if(d.mz==="0"){fit();draw()}else zoomAt(d.mz==="1"?1.5:1/1.5,r.left+r.width/2,r.top+r.height/2);return}
    if(b.hasAttribute("data-undo")){const mine=Object.entries(data.items).filter(([,it])=>it?.by===me()).sort((a,b2)=>b2[1].ts-a[1].ts)[0];if(mine)del("items",mine[0]);else ctx.toast("No hay nada tuyo que deshacer.");return}
    if(b.hasAttribute("data-finish"))return finish();
    if(b.hasAttribute("data-cancel-draft")){if(draft?.t==="ruta"){tool="mover";tools()}draft=null;draw();hint();return}
    if(b.hasAttribute("data-closepop")){sel=null;draw();pop();return}
    const it=sel&&data.items[sel];
    if(d.setcolor&&it){it.color=d.setcolor;put("items",sel,it);return}
    if(b.hasAttribute("data-delsel"))return removeSel();
    if(d.golugar)return ctx.goLugar(d.golugar);
    if(d.leerses)return ctx.goSesion?.(d.leerses);
    if(d.sesact){setConf({actual:d.sesact});sesManual=false;draw();timeline();return}
    if(b.hasAttribute("data-gnew")){const n=(el.querySelector("#mg-new")?.value||"").trim();if(!n)return ctx.toast("Ponle un nombre al grupo.",true);
      gName="";put("grupos","g"+uid(),{n,color,rutas:{},by:me(),ts:Date.now()});return}
    if(d.gruta){if(!curSes())return;tool="ruta";draft={t:"ruta",g:d.gruta,pts:[]};sel=null;tools();hint();draw();pop();showStage();return}
    if(d.grutadel){const g=data.grupos[d.grutadel],sid=curSes();if(g?.rutas&&sid){delete g.rutas[sid];put("grupos",d.grutadel,g)}return}
    if(d.gcolor){const g=data.grupos[d.g];if(g){g.color=d.gcolor;put("grupos",d.g,g)}return}
    if(d.gdel){if(confirmDel!==d.gdel){confirmDel=d.gdel;settings();return}confirmDel=null;del("grupos",d.gdel);return}
  }
  function change(e){
    const t=e.target,it=sel&&data.items[sel];
    if(t.dataset.gname){const g=data.grupos[t.dataset.gname];if(g){g.n=t.value.trim().slice(0,40)||g.n;t.blur();put("grupos",t.dataset.gname,g)}return}
    if(t.id==="m-km")return setConf({kmAncho:Math.max(10,+t.value||420)});
    if(t.id==="m-kmd")return setConf({kmDia:Math.max(1,+t.value||30)});
    if(it&&["md-title","md-note","md-text","md-size"].includes(t.id)){const f={"md-title":"title","md-note":"note","md-text":"text","md-size":"size"}[t.id];
      it[f]=t.type==="range"?+t.value:t.value;t.blur();return put("items",sel,it)}
  }
  function input(e){const t=e.target;if(t.id==="mg-new")gName=t.value;
    if(t.id==="md-size"&&sel&&data.items[sel]){data.items[sel].size=+t.value;draw()}}
  document.addEventListener("toggle",e=>{if(e.target.id==="msetd")setOpen=e.target.open},true);

  /* ---------- Sesiones para la pestaña Sesiones (las crea y borra el DM desde allí) ---------- */
  function ensure(c){if(!mounted&&c)ctx={...ctx,...c};connect()}
  const sesData=()=>({sesiones:data.sesiones,actual:data.conf.actual});
  function putSes(id,obj){if(obj)put("sesiones",id,obj);else{if(data.conf.actual===id)setConf({actual:null});if(data.sesiones[id])del("sesiones",id)}}
  function setActual(id){sesManual=false;setConf({actual:id})}
  const onSes=f=>sesSubs.push(f);

  // Lo que necesita la capa de encima (mundo.js)
  function center(p){const r=svg.getBoundingClientRect(),h=view.w*(r.height/r.width);
    if(p[0]<view.x||p[0]>view.x+view.w||p[1]<view.y||p[1]>view.y+h){view.x=p[0]-view.w/2;view.y=p[1]-h/2;applyView();draw()}}
  const api={toMap,center,k,redraw:()=>draw(),visible:()=>visibleNow(),tool:()=>tool};
  return {mount,refresh,ensure,sesData,putSes,setActual,onSes,uid,center,redraw:()=>draw()};
}
const Mapa=crearMapa({W:1000,H:1000,lo:"img/zona-norte-2048.webp",hi:"img/zona-norte.webp",path:"tienda/mapa",timeline:true});
