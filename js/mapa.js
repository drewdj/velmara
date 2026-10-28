/* Mapa interactivo de la Zona Norte.
   Coordenadas en un lienzo de 1000×1000 sobre la imagen. Todo se guarda en Firebase bajo
   tienda/mapa: items (marcas, trazos, líneas, áreas, textos, imágenes, zonas reveladas),
   grupos (con sus etapas de viaje) y conf (niebla y escala). Cada elemento es un nodo propio,
   así que dibujar no bloquea al resto. Sin Firebase funciona en memoria (modo prueba). */
const Mapa=(()=>{
  const S=1000,IMG_LO="img/zona-norte-2048.webp",IMG_HI="img/zona-norte.webp";
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
    ["pin","Marca con nota","M12 21 C12 21 5 14 5 9.5 a7 7 0 0 1 14 0 C19 14 12 21 12 21Z M12 7 a2.5 2.5 0 1 0 0.01 0"],
    ["draw","Lápiz libre","M4 20 L5 15 L16 4 L20 8 L9 19Z M14 6 L18 10"],
    ["line","Línea por puntos","M4 18 L10 8 L15 14 L20 5 M4 18 h0.1 M10 8 h0.1 M15 14 h0.1 M20 5 h0.1"],
    ["area","Área","M5 7 L14 4 L20 11 L16 20 L6 17Z"],
    ["text","Texto","M5 5 H19 M12 5 V20 M9 20 H15"],
    ["img","Imagen","M4 5 H20 V19 H4Z M4 16 L9 11 L13 15 L15 13 L20 18 M15 8.5 a1.5 1.5 0 1 0 0.01 0"],
    ["ruler","Medir distancia","M3 16 L16 3 L21 8 L8 21Z M7 12 L9 14 M10 9 L12 11 M13 6 L15 8"]];
  const DM_TOOLS=[["reveal","Revelar niebla (DM)","M12 2.5 V5.5 M12 18.5 V21.5 M2.5 12 H5.5 M18.5 12 H21.5 M5.3 5.3 L7.4 7.4 M16.6 16.6 L18.7 18.7 M5.3 18.7 L7.4 16.6 M16.6 7.4 L18.7 5.3 M12 8 a4 4 0 1 0 0.01 0"]];

  let el,svg,ctx,ref=null,mode="local",mounted=false,hiLoaded=false,fitted=false;
  let data={items:{},grupos:{},conf:{niebla:false,kmAncho:420,kmDia:30}};
  let view={x:0,y:0,w:S},tool="mover",color=COLORS[0],width=3,vis="all",icon="marca";
  let draft=null,sel=null,selGroup=null,panel="capas",asPlayer=false,ruler=null,etapaName="";
  let layers={pin:true,draw:true,grp:true,fog:true};
  let anims=[],pointers=new Map(),gesture=null,pendingImg=null,raf=0;

  const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  const r1=n=>Math.round(n*10)/10;
  const isDM=()=>ctx.isDM()&&!asPlayer&&!ctx.viewAs?.();
  const me=()=>ctx.isDM()?"dm":ctx.me();
  const who=by=>by==="dm"?"DM":(ctx.pjName(by)||"Alguien");
  const canEdit=it=>ctx.isDM()||it.by===me();
  const visible=it=>it.vis==="all"||!it.vis||it.by===me()||(it.vis==="dm"&&isDM());
  const k=()=>view.w/(svg?.clientWidth||1000); // unidades de mapa por píxel de pantalla

  /* ---------- Datos ---------- */
  function connect(){
    const cfg=window.FIREBASE_CONFIG;
    if(!cfg||!window.firebase){mode="local";return}
    try{
      const app=firebase.apps.length?firebase.app():firebase.initializeApp(cfg);
      ref=app.database().ref("tienda/mapa");mode="live";
      for(const col of ["items","grupos"]){
        const r=ref.child(col);
        r.on("child_added",s=>{data[col][s.key]=fixItem(s.val());onRemote(col,s.key,true)});
        r.on("child_changed",s=>{const old=data[col][s.key];data[col][s.key]=fixItem(s.val());onRemote(col,s.key,false,old)});
        r.on("child_removed",s=>{delete data[col][s.key];if(sel===s.key)sel=null;if(selGroup===s.key)selGroup=null;draw();side()});
      }
      ref.child("conf").on("value",s=>{data.conf={...data.conf,...(s.val()||{})};draw();side()});
    }catch(e){console.error(e);mode="local"}
  }
  function fixItem(v){if(!v)return v;if(v.pts&&!Array.isArray(v.pts))v.pts=Object.values(v.pts);
    if(v.etapas&&!Array.isArray(v.etapas))v.etapas=Object.values(v.etapas);(v.etapas||[]).forEach(e=>{if(e.pts&&!Array.isArray(e.pts))e.pts=Object.values(e.pts)});return v}
  let drawT=0;
  function onRemote(col,id,added,old){
    // Etapa nueva de otro: se anima al llegar
    if(col==="grupos"&&old&&(data.grupos[id].etapas||[]).length>(old.etapas||[]).length){
      const g=data.grupos[id],e=g.etapas[g.etapas.length-1];if(Date.now()-(e.ts||0)<20000&&visible(g))play([id],true)}
    clearTimeout(drawT);drawT=setTimeout(()=>{draw();side()},16);
  }
  function put(col,id,obj){
    obj=JSON.parse(JSON.stringify(obj));delete obj._confirm;
    if(mode==="live")ref.child(col).child(id).set(obj).catch(err);
    data[col][id]=obj;draw();side();
  }
  function del(col,id){if(mode==="live")ref.child(col).child(id).remove().catch(err);delete data[col][id];draw();side()}
  function setConf(p){Object.assign(data.conf,p);if(mode==="live")ref.child("conf").update(p).catch(err);draw();side()}
  function err(e){console.error(e);ctx.toast("No se pudo guardar en el mapa.",true)}

  /* ---------- Montaje ---------- */
  function mount(root,c){
    ctx=c;el=root;
    el.innerHTML=`<div class="map-shell">
      <div class="map-tools" id="mtools"></div>
      <div class="map-stage" id="mstage">
        <svg id="msvg" xmlns="http://www.w3.org/2000/svg"><defs id="mdefs"></defs>
          <image id="mimg" href="${IMG_LO}" x="0" y="0" width="${S}" height="${S}"/>
          <g id="gl-fog"></g><g id="gl-area"></g><g id="gl-draw"></g><g id="gl-grp"></g><g id="gl-pin"></g><g id="gl-anim"></g><g id="gl-draft"></g>
        </svg>
        <div class="map-zoom"><button data-mz="1" aria-label="Acercar">+</button><button data-mz="-1" aria-label="Alejar">−</button><button data-mz="0" aria-label="Ver todo">⤢</button></div>
        <div class="map-hint" id="mhint"></div>
      </div>
      <aside class="map-side" id="mside"></aside>
      <input type="file" id="mfile" accept="image/*" hidden>
    </div>`;
    svg=el.querySelector("#msvg");
    if(!mounted){connect();mounted=true;addEventListener("resize",()=>{if(visibleNow()){applyView();draw()}});document.addEventListener("keydown",key)}
    bind();refresh(true);
  }
  const visibleNow=()=>svg&&document.body.contains(svg)&&svg.getBoundingClientRect().width>0;
  // Al volver a la pestaña del mapa: encajar si hacía falta y redibujar con lo que llegó mientras tanto
  function refresh(refit){if(!visibleNow())return;if(refit||!fitted){fit();fitted=true}else applyView();tools();draw();side();hint()}
  function fit(){const r=svg.getBoundingClientRect(),a=r.width/Math.max(1,r.height);
    if(a>=1){view.w=S*a;view.x=-(view.w-S)/2;view.y=0}else{view.w=S;view.x=0;view.y=-(S/a-S)/2}applyView()}
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
    svg.addEventListener("dblclick",e=>{if(draft&&["line","area","etapa"].includes(draft.t)){e.preventDefault();finish()}});
    el.addEventListener("click",click);el.addEventListener("change",change);el.addEventListener("input",input);
    el.querySelector("#mfile").addEventListener("change",loadImage);
  }
  function key(e){
    if(!visibleNow()||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
    if(e.key==="Escape"){draft=null;ruler=null;pendingImg=null;draw();hint()}
    if(e.key==="Enter"&&draft)finish();
    if(e.key==="Backspace"&&draft?.pts?.length){draft.pts.pop();draw()}
    if((e.key==="Delete")&&sel&&canEdit(data.items[sel]||{}))removeSel();
  }
  function down(e){
    svg.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===2){const [a,b]=[...pointers.values()];gesture={pinch:Math.hypot(a.x-b.x,a.y-b.y),w:view.w};draft=draft?.t==="draw"||draft?.t==="reveal"?null:draft;return}
    const p=toMap(e.clientX,e.clientY);
    const hit=e.target.closest?.("[data-id]");
    if(tool==="mover"){
      if(hit){const id=hit.dataset.id,kind=hit.dataset.kind;
        if(kind==="g"){selGroup=id;sel=null;panel="grupos"}else{sel=id;selGroup=null;panel="detalle"}
        const it=data.items[id];
        if(kind!=="g"&&it&&canEdit(it)&&it.x!=null)gesture={drag:id,ox:p.x-it.x,oy:p.y-it.y,moved:false};
        else gesture={pan:true,sx:e.clientX,sy:e.clientY,vx:view.x,vy:view.y};
        draw();side();return}
      gesture={pan:true,sx:e.clientX,sy:e.clientY,vx:view.x,vy:view.y,click:true};return}
    if(tool==="draw"||tool==="reveal"){draft={t:tool,pts:[[r1(p.x),r1(p.y)]],color,w:tool==="reveal"?width*14:width};return}
    if(tool==="ruler"){ruler={a:p,b:p};draw();return}
    if(["line","area","etapa"].includes(tool)){if(!draft)draft={t:tool,pts:[],color,w:width};draft.pts.push([r1(p.x),r1(p.y)]);draw();hint();return}
    if(tool==="pin"){const id=uid();put("items",id,{t:"pin",x:r1(p.x),y:r1(p.y),icon,color,title:ICON_N[icon],note:"",vis,by:me(),ts:Date.now()});sel=id;panel="detalle";setTool("mover");return}
    if(tool==="text"){const id=uid();put("items",id,{t:"text",x:r1(p.x),y:r1(p.y),text:"Texto",size:18,color,vis,by:me(),ts:Date.now()});sel=id;panel="detalle";setTool("mover");side();setTimeout(()=>el.querySelector("#md-text")?.select(),30);return}
    if(tool==="img"){if(!pendingImg){el.querySelector("#mfile").click();return}
      const id=uid();put("items",id,{t:"img",x:r1(p.x),y:r1(p.y),src:pendingImg.src,ar:pendingImg.ar,size:60,title:"",vis,by:me(),ts:Date.now()});pendingImg=null;sel=id;panel="detalle";setTool("mover");return}
  }
  function move(e){
    if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(gesture?.pinch&&pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);
      zoomAt(view.w/(gesture.w*gesture.pinch/d),(a.x+b.x)/2,(a.y+b.y)/2);return}
    const p=toMap(e.clientX,e.clientY);
    if(gesture?.pan){const r=svg.getBoundingClientRect(),f=view.w/r.width;
      if(Math.abs(e.clientX-gesture.sx)+Math.abs(e.clientY-gesture.sy)>4)gesture.click=false;
      view.x=gesture.vx-(e.clientX-gesture.sx)*f;view.y=gesture.vy-(e.clientY-gesture.sy)*f;applyView();return}
    if(gesture?.drag){const it=data.items[gesture.drag];it.x=r1(p.x-gesture.ox);it.y=r1(p.y-gesture.oy);gesture.moved=true;draw();return}
    if(draft&&(draft.t==="draw"||draft.t==="reveal")){const l=draft.pts[draft.pts.length-1];if(Math.hypot(p.x-l[0],p.y-l[1])>k()*2){draft.pts.push([r1(p.x),r1(p.y)]);drawDraft()}return}
    if(ruler){ruler.b=p;drawDraft();return}
  }
  function up(e){
    pointers.delete(e.pointerId);
    if(gesture?.drag&&gesture.moved){const it=data.items[gesture.drag];put("items",gesture.drag,it)}
    if(gesture?.pan&&gesture.click){sel=null;selGroup=selGroup;draw();side()}
    if(pointers.size===0)gesture=null;
    if(draft&&(draft.t==="draw"||draft.t==="reveal")&&pointers.size===0){
      const pts=simplify(draft.pts,k()*1.2);
      if(pts.length>1)put("items",uid(),{t:draft.t,pts,color:draft.color,w:r1(draft.w*k()),vis:draft.t==="reveal"?"all":vis,by:me(),ts:Date.now()});
      draft=null;draw()}
    if(ruler&&tool==="ruler"){/* la medida se queda visible hasta la siguiente */}
  }
  function finish(){
    if(!draft)return;const d=draft;draft=null;
    if(d.t==="etapa"){if(d.pts.length<2||!selGroup){draw();hint();return}
      const g=structuredClone(data.grupos[selGroup]);g.etapas=g.etapas||[];
      // La etapa empieza donde está el grupo
      const last=g.etapas.length?g.etapas[g.etapas.length-1].pts.slice(-1)[0]:null;
      const pts=last?[last,...d.pts]:d.pts;
      g.etapas.push({pts,n:etapaName||`Etapa ${g.etapas.length+1}`,ts:Date.now(),by:me()});etapaName="";
      put("grupos",selGroup,g);setTool("mover");play([selGroup],true);return}
    if((d.t==="line"&&d.pts.length<2)||(d.t==="area"&&d.pts.length<3)){draw();hint();return}
    const id=uid();put("items",id,{t:d.t,pts:d.pts,color:d.color,w:r1(d.w*k()),vis,by:me(),title:"",note:"",ts:Date.now()});
    sel=id;panel="detalle";draw();side();hint();
  }
  function simplify(pts,eps){ // Ramer–Douglas–Peucker
    if(pts.length<3)return pts;const [a,b]=[pts[0],pts[pts.length-1]];let md=0,mi=0;
    for(let i=1;i<pts.length-1;i++){const p=pts[i],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;
      const d=Math.abs(dy*p[0]-dx*p[1]+b[0]*a[1]-b[1]*a[0])/L;if(d>md){md=d;mi=i}}
    if(md>eps)return simplify(pts.slice(0,mi+1),eps).slice(0,-1).concat(simplify(pts.slice(mi),eps));
    return [a,b];
  }
  function loadImage(e){
    const f=e.target.files[0];e.target.value="";if(!f)return;
    const img=new Image(),url=URL.createObjectURL(f);
    img.onload=()=>{const m=480,s=Math.min(1,m/Math.max(img.width,img.height)),c=document.createElement("canvas");
      c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      pendingImg={src:c.toDataURL("image/webp",.78),ar:c.height/c.width};URL.revokeObjectURL(url);hint()};
    img.src=url;
  }

  /* ---------- Dibujo ---------- */
  const pathD=pts=>pts.map((p,i)=>(i?"L":"M")+p[0]+" "+p[1]).join(" ");
  const smoothD=pts=>{if(pts.length<3)return pathD(pts);let d=`M${pts[0][0]} ${pts[0][1]}`;
    for(let i=1;i<pts.length-1;i++){const mx=(pts[i][0]+pts[i+1][0])/2,my=(pts[i][1]+pts[i+1][1])/2;d+=` Q${pts[i][0]} ${pts[i][1]} ${mx} ${my}`}
    const l=pts[pts.length-1];return d+` L${l[0]} ${l[1]}`};
  function draw(){
    if(!visibleNow())return;
    const K=k(),items=Object.entries(data.items).filter(([,it])=>it&&visible(it));
    const selCls=id=>id===sel?" m-sel":"";
    let area="",drw="",pin="",fog="";
    for(const [id,it] of items){
      const dim=it.vis!=="all"&&it.vis?` opacity=".75"`:"";
      if(it.t==="area"&&layers.draw)area+=`<path data-id="${id}" class="m-hit${selCls(id)}" d="${pathD(it.pts)} Z" fill="${it.color}" fill-opacity=".22" stroke="${it.color}" stroke-width="${it.w}" stroke-dasharray="${it.w*3} ${it.w*2}"${dim}/>`;
      if((it.t==="draw"||it.t==="line")&&layers.draw)drw+=`<path data-id="${id}" class="m-hit${selCls(id)}" d="${it.t==="draw"?smoothD(it.pts):pathD(it.pts)}" fill="none" stroke="${it.color}" stroke-width="${it.w}" stroke-linecap="round" stroke-linejoin="round"${dim}/>`
        +`<path data-id="${id}" d="${pathD(it.pts)}" fill="none" stroke="transparent" stroke-width="${Math.max(it.w,K*12)}"/>`;
      if(it.t==="reveal"&&ctx.isDM()&&!asPlayer&&tool==="reveal")drw+=`<path data-id="${id}" class="m-hit" d="${smoothD(it.pts)}" fill="none" stroke="#FAC472" stroke-opacity=".25" stroke-width="${it.w}" stroke-linecap="round"/>`;
      if(it.t==="pin"&&layers.pin){const s=K*30;
        pin+=`<g data-id="${id}" class="m-pin${selCls(id)}" transform="translate(${it.x} ${it.y}) scale(${s/24})"${dim}>
          <path d="M12 23 C12 23 3 14.5 3 9.5 a9 9 0 0 1 18 0 C21 14.5 12 23 12 23Z" fill="${it.color}" stroke="#1B1230" stroke-width="1.2" transform="translate(-12 -23)"/>
          <g transform="translate(-12 -23) translate(5.2 2.6) scale(.57)" fill="#1B1230" stroke="#1B1230" stroke-width=".6">${ICONS[it.icon]||ICONS.marca}</g></g>`;
        if(it.title&&view.w<S*1.1)pin+=`<text x="${it.x}" y="${it.y+K*14}" class="m-label" font-size="${K*13}" text-anchor="middle">${esc(it.title)}</text>`}
      if(it.t==="text"&&layers.pin)pin+=`<text data-id="${id}" class="m-text${selCls(id)}" x="${it.x}" y="${it.y}" font-size="${it.size*K}" fill="${it.color}" text-anchor="middle"${dim}>${esc(it.text)}</text>`;
      if(it.t==="img"&&layers.pin){const w=it.size,h=w*(it.ar||1);
        pin+=`<g data-id="${id}" class="m-imgw${selCls(id)}"${dim}><rect x="${it.x-w/2-K*3}" y="${it.y-h/2-K*3}" width="${w+K*6}" height="${h+K*6}" fill="#FBF7EE" stroke="#F9A72B" stroke-width="${K*1.5}"/><image href="${it.src}" x="${it.x-w/2}" y="${it.y-h/2}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/></g>`}
    }
    // Niebla: tapa solo el mapa base (lo dibujado sigue encima); lo revelado se recorta del velo y el DM la ve translúcida
    if(data.conf.niebla&&layers.fog){
      const rev=items.filter(([,it])=>it.t==="reveal").map(([,it])=>`<path d="${smoothD(it.pts)}" fill="none" stroke="#000" stroke-width="${it.w}" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
      svg.querySelector("#mdefs").innerHTML=`<filter id="fogblur" filterUnits="userSpaceOnUse" x="-2000" y="-2000" width="5000" height="5000"><feGaussianBlur stdDeviation="6"/></filter>
        <mask id="fogmask" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="5000" height="5000"><rect x="-2000" y="-2000" width="5000" height="5000" fill="#fff"/><g filter="url(#fogblur)">${rev}</g></mask>`;
      fog=`<rect x="-2000" y="-2000" width="5000" height="5000" fill="#120B22" opacity="${isDM()?.55:.97}" mask="url(#fogmask)" pointer-events="none"/>`;
    }
    let grp="";
    if(layers.grp)for(const [id,g] of Object.entries(data.grupos)){
      if(!g||!visible(g))continue;const et=g.etapas||[];
      const playing=anims.some(a=>a.id===id);
      et.forEach((e,i)=>{if(playing&&i>=anims.find(a=>a.id===id).from)return;
        grp+=`<path d="${pathD(e.pts)}" fill="none" stroke="${g.color}" stroke-width="${K*3}" stroke-dasharray="${K*8} ${K*6}" stroke-linecap="round" opacity="${i===et.length-1?.95:.55}"/>`});
      if(!playing){const pos=groupPos(g);if(pos)grp+=token(id,g,pos,K)}
    }
    svg.querySelector("#gl-area").innerHTML=area;svg.querySelector("#gl-draw").innerHTML=drw;
    svg.querySelector("#gl-pin").innerHTML=pin;svg.querySelector("#gl-fog").innerHTML=fog;svg.querySelector("#gl-grp").innerHTML=grp;
    drawDraft();
  }
  function groupPos(g){const et=g.etapas||[];if(et.length){const l=et[et.length-1].pts;return l[l.length-1]}return g.x!=null?[g.x,g.y]:null}
  function token(id,g,pos,K){const r=K*13,ini=(g.n||"?").split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase();
    return `<g data-id="${id}" data-kind="g" class="m-token${id===selGroup?" m-sel":""}"><circle cx="${pos[0]}" cy="${pos[1]}" r="${r}" fill="${g.color}" stroke="#FDFCF7" stroke-width="${K*2.5}"/>
      <text x="${pos[0]}" y="${pos[1]+K*4.5}" font-size="${K*12}" text-anchor="middle" class="m-ini">${esc(ini)}</text>
      <text x="${pos[0]}" y="${pos[1]+r+K*14}" font-size="${K*13}" text-anchor="middle" class="m-label">${esc(g.n)}</text></g>`}
  function drawDraft(){
    const K=k();let h="";
    if(draft){const d=draft;
      if(d.t==="area"&&d.pts.length)h+=`<path d="${pathD(d.pts)} Z" fill="${d.color}" fill-opacity=".2" stroke="${d.color}" stroke-width="${d.w*K}"/>`;
      else if(d.t==="reveal")h+=`<path d="${smoothD(d.pts)}" fill="none" stroke="#FAC472" stroke-opacity=".4" stroke-width="${d.w*K}" stroke-linecap="round" stroke-linejoin="round"/>`;
      else if(d.t==="etapa"){const g=data.grupos[selGroup],st=g&&groupPos(g),pts=st?[st,...d.pts]:d.pts;
        h+=`<path d="${pathD(pts)}" fill="none" stroke="${g?.color||color}" stroke-width="${K*3}" stroke-dasharray="${K*8} ${K*6}"/>`}
      else h+=`<path d="${d.t==="draw"?smoothD(d.pts):pathD(d.pts)}" fill="none" stroke="${d.color}" stroke-width="${d.w*K}" stroke-linecap="round" stroke-linejoin="round"/>`;
      if(d.t!=="draw"&&d.t!=="reveal")h+=d.pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="${K*4}" fill="#FDFCF7" stroke="#1B1230" stroke-width="${K}"/>`).join("");
    }
    if(ruler){const {a,b}=ruler,km=Math.hypot(b.x-a.x,b.y-a.y)/S*(+data.conf.kmAncho||420),dias=km/(+data.conf.kmDia||30);
      h+=`<path d="M${a.x} ${a.y} L${b.x} ${b.y}" stroke="#FDFCF7" stroke-width="${K*2.5}" stroke-dasharray="${K*6} ${K*4}"/><circle cx="${a.x}" cy="${a.y}" r="${K*4}" fill="#F9A72B"/><circle cx="${b.x}" cy="${b.y}" r="${K*4}" fill="#F9A72B"/>
        <g transform="translate(${b.x+K*10} ${b.y-K*10})"><rect x="0" y="${-K*18}" width="${K*150}" height="${K*24}" fill="#1B1230" stroke="#F9A72B" stroke-width="${K}"/><text x="${K*8}" y="0" font-size="${K*14}" class="m-label" fill="#FDFCF7">${Math.round(km)} km · ${dias.toFixed(1).replace(".",",")} días</text></g>`}
    svg.querySelector("#gl-draft").innerHTML=h;
  }

  /* ---------- Animación de grupos ---------- */
  function play(ids,onlyLast){
    cancelAnimationFrame(raf);
    anims=ids.map(id=>{const g=data.grupos[id],et=g?.etapas||[];if(!et.length)return null;
      const from=onlyLast?et.length-1:0,segs=et.slice(from);
      const pts=segs.flatMap((e,i)=>i?e.pts.slice(1):e.pts),cum=[0];
      for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
      const marks=[];let acc=0;segs.forEach((e,i)=>{marks.push({at:acc,n:e.n});for(let j=1;j<e.pts.length;j++)acc+=Math.hypot(e.pts[j][0]-e.pts[j-1][0],e.pts[j][1]-e.pts[j-1][1])});
      return {id,from,pts,cum,len:cum[cum.length-1],marks}}).filter(Boolean);
    if(!anims.length)return;
    const speed=+data.conf.vel||90,t0=performance.now(),dur=Math.max(...anims.map(a=>a.len))/speed*1000+600;
    const step=t=>{const el2=t-t0,K=k();let h="";
      for(const a of anims){const g=data.grupos[a.id];if(!g)continue;const d=Math.min(a.len,el2/1000*speed);
        let i=1;while(i<a.cum.length&&a.cum[i]<d)i++;
        const p0=a.pts[i-1],p1=a.pts[Math.min(i,a.pts.length-1)],seg=(a.cum[Math.min(i,a.cum.length-1)]-a.cum[i-1])||1,f=(d-a.cum[i-1])/seg;
        const pos=[p0[0]+(p1[0]-p0[0])*f,p0[1]+(p1[1]-p0[1])*f],trail=[...a.pts.slice(0,i),pos];
        h+=`<path d="${pathD(trail)}" fill="none" stroke="${g.color}" stroke-width="${K*4}" stroke-linecap="round" stroke-linejoin="round"/>`;
        h+=`<path d="${pathD(trail)}" fill="none" stroke="#FDFCF7" stroke-width="${K*1.2}" stroke-dasharray="${K*2} ${K*6}" stroke-linecap="round"/>`;
        const mk=[...a.marks].reverse().find(m=>m.at<=d);
        h+=token(a.id,g,pos,K);
        if(mk&&el2<dur-300)h+=`<text x="${pos[0]}" y="${pos[1]-K*22}" font-size="${K*15}" text-anchor="middle" class="m-label m-etapa">${esc(mk.n)}</text>`}
      svg.querySelector("#gl-anim").innerHTML=h;
      if(el2<dur)raf=requestAnimationFrame(step);else{anims=[];svg.querySelector("#gl-anim").innerHTML="";draw()}};
    draw();raf=requestAnimationFrame(step);
  }

  /* ---------- Barra de herramientas y panel ---------- */
  // En móvil el panel va debajo del mapa: al elegir algo que se hace sobre el mapa, traerlo a la vista
  function showStage(){const st=el.querySelector("#mstage"),r=st.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight)st.scrollIntoView({block:"center",behavior:"smooth"})}
  function setTool(t){tool=t;if(t!=="mover")showStage();if(!["line","area","etapa"].includes(t))draft=null;ruler=null;tools();hint();draw();side()}
  function tools(){
    const T=[...TOOLS,...(ctx.isDM()?DM_TOOLS:[])];el.querySelector(".map-shell").dataset.tool=tool;
    el.querySelector("#mtools").innerHTML=T.map(([id,n,d])=>`<button class="mtool" data-tool="${id}" aria-pressed="${tool===id}" title="${n}" aria-label="${n}"><svg viewBox="0 0 24 24"><path d="${d}"/></svg></button>`).join("")
      +`<span class="msep"></span>`+COLORS.map(c=>`<button class="mcolor" data-color="${c}" aria-pressed="${color===c}" style="--c:${c}" aria-label="Color ${c}"></button>`).join("")
      +`<span class="msep"></span><button class="mtool" data-undo title="Deshacer lo último que hiciste" aria-label="Deshacer"><svg viewBox="0 0 24 24"><path d="M9 7 L4 12 L9 17 M4 12 H15 a5 5 0 0 1 0 10 H12"/></svg></button>`;
  }
  function hint(){
    const h=el?.querySelector("#mhint");if(!h)return;
    const msg={pin:"Toca el mapa para poner una marca.",draw:"Arrastra para dibujar.",line:"Toca para añadir puntos. Doble toque o Intro para terminar.",
      area:"Toca para marcar las esquinas. Doble toque o Intro para cerrar.",text:"Toca donde quieras escribir.",img:pendingImg?"Toca el mapa para colocar la imagen.":"Elige una imagen.",
      ruler:"Arrastra para medir.",reveal:"Pinta las zonas que el grupo ya conoce.",etapa:`Toca el camino que sigue ${esc(data.grupos[selGroup]?.n||"el grupo")}. Doble toque o Intro para terminar.`}[tool];
    const finishBtn=draft&&["line","area","etapa"].includes(draft.t)?`<button class="btn" data-finish>Terminar</button><button class="btn ghost" data-cancel-draft>Cancelar</button>`:"";
    h.innerHTML=msg?`<span>${msg}</span>${finishBtn}`:"";h.hidden=!msg;
  }
  function side(){
    const s=el?.querySelector("#mside");if(!s||!document.body.contains(s))return;
    if(s.contains(document.activeElement)&&/INPUT|TEXTAREA/.test(document.activeElement.tagName))return; // no pisar lo que se está escribiendo
    const tabs=[["capas","Capas"],["grupos","Grupos"],["detalle","Detalle"]];
    let body="";
    if(panel==="detalle")body=detail();
    else if(panel==="grupos")body=groups();
    else body=layersPanel();
    s.innerHTML=`<nav class="mside-tabs">${tabs.map(([k2,l])=>`<button data-panel="${k2}" aria-selected="${panel===k2}">${l}</button>`).join("")}</nav><div class="mside-body">${body}</div>`;
  }
  const visSel=(v,id)=>`<select id="${id}" aria-label="Quién lo ve"><option value="all" ${v==="all"?"selected":""}>Lo ve todo el grupo</option><option value="me" ${v==="me"?"selected":""}>Solo yo</option>${ctx.isDM()?`<option value="dm" ${v==="dm"?"selected":""}>Secreto del DM</option>`:`<option value="dm" ${v==="dm"?"selected":""}>Yo y el DM</option>`}</select>`;
  function layersPanel(){
    const mine=Object.values(data.items).filter(it=>it?.by===me()).length;
    return `<section><h3>Capas</h3>
      ${[["pin","Marcas, textos e imágenes"],["draw","Dibujos, líneas y áreas"],["grp","Grupos y rutas"],["fog","Niebla"]].map(([k2,l])=>`<label class="toggle"><input type="checkbox" data-layer="${k2}" ${layers[k2]?"checked":""}> ${l}</label>`).join("")}</section>
     <section><h3>Al dibujar</h3><label class="mlab" for="m-width">Grosor</label><input type="range" id="m-width" min="1" max="12" value="${width}">
      <label class="mlab" for="m-vis">Quién lo ve</label>${visSel(vis,"m-vis")}
      <label class="mlab">Icono de las marcas</label><div class="micons">${Object.keys(ICONS).map(i=>`<button data-icon="${i}" aria-pressed="${icon===i}" title="${ICON_N[i]}" aria-label="${ICON_N[i]}"><svg viewBox="0 0 24 24">${ICONS[i]}</svg></button>`).join("")}</div>
      <p class="note">Has puesto ${mine} cosa${mine===1?"":"s"} en el mapa.</p></section>
     <section><h3>Distancias</h3><p class="note">La regla calcula con ${data.conf.kmAncho||420} km de ancho de mapa y ${data.conf.kmDia||30} km por día de viaje.</p>
      ${ctx.isDM()?`<div class="mrow"><label class="mlab" for="m-km">Ancho del mapa (km)</label><input type="number" id="m-km" min="10" max="5000" value="${data.conf.kmAncho||420}"></div>
      <div class="mrow"><label class="mlab" for="m-kmd">Km por día</label><input type="number" id="m-kmd" min="1" max="200" value="${data.conf.kmDia||30}"></div>`:""}</section>
     ${ctx.isDM()?`<section><h3>DM</h3><label class="toggle"><input type="checkbox" id="m-fog" ${data.conf.niebla?"checked":""}> Niebla de guerra activa</label>
      <p class="note">Con la niebla activa, los jugadores solo ven lo que revelas con el pincel de revelar. Tú la ves translúcida.</p>
      <label class="toggle"><input type="checkbox" id="m-asplayer" ${asPlayer?"checked":""}> Ver como jugador</label>
      <div class="mrow"><label class="mlab" for="m-vel">Velocidad de animación</label><input type="range" id="m-vel" min="30" max="300" value="${data.conf.vel||90}"></div></section>`:""}`;
  }
  function detail(){
    const it=sel&&data.items[sel];
    if(!it)return `<p class="note">Toca algo del mapa con la herramienta de mover para ver su nota o editarlo.</p>`;
    const ed=canEdit(it),dis=ed?"":"disabled";
    const kind={pin:"Marca",draw:"Dibujo",line:"Línea",area:"Área",text:"Texto",img:"Imagen",reveal:"Zona revelada"}[it.t];
    let f=`<p class="note">${kind} de <b>${esc(who(it.by))}</b>${it.vis==="me"?" · solo para su autor":it.vis==="dm"?" · secreto":""}</p>`;
    if(it.t==="text")f+=`<label class="mlab" for="md-text">Texto</label><input type="text" id="md-text" value="${esc(it.text)}" maxlength="80" ${dis}>
      <label class="mlab" for="md-size">Tamaño</label><input type="range" id="md-size" min="10" max="60" value="${it.size}" ${dis}>`;
    else if(it.t!=="reveal")f+=`<label class="mlab" for="md-title">Título</label><input type="text" id="md-title" value="${esc(it.title)}" maxlength="60" ${dis}>
      <label class="mlab" for="md-note">Nota</label><textarea id="md-note" maxlength="1000" ${dis}>${esc(it.note)}</textarea>`;
    if(it.t==="img")f+=`<label class="mlab" for="md-size">Tamaño</label><input type="range" id="md-size" min="15" max="300" value="${it.size}" ${dis}>`;
    if(it.t==="pin")f+=`<label class="mlab">Icono</label><div class="micons">${Object.keys(ICONS).map(i=>`<button data-seticon="${i}" aria-pressed="${it.icon===i}" title="${ICON_N[i]}" aria-label="${ICON_N[i]}" ${dis}><svg viewBox="0 0 24 24">${ICONS[i]}</svg></button>`).join("")}</div>`;
    if(it.t==="pin"&&ctx.isDM())f+=`<label class="mlab" for="md-lugar">Enlace a un lugar</label><select id="md-lugar"><option value="">Ninguno</option>${ctx.lugares().map(l=>`<option value="${l.id}" ${it.lugar===l.id?"selected":""}>${esc(l.n)}</option>`).join("")}</select>`;
    if(it.lugar)f+=`<button class="btn" data-golugar="${it.lugar}">Ir a ${esc(ctx.lugares().find(l=>l.id===it.lugar)?.n||"")}</button>`;
    if(it.t!=="reveal"&&ed)f+=`<label class="mlab">Color</label><div class="mcolors">${COLORS.map(c=>`<button class="mcolor" data-setcolor="${c}" aria-pressed="${it.color===c}" style="--c:${c}" aria-label="Color ${c}"></button>`).join("")}</div>
      <label class="mlab" for="md-vis">Quién lo ve</label>${visSel(it.vis||"all","md-vis")}`;
    if(ed)f+=`<div class="btns"><button class="btn warn" data-delsel>Borrar</button></div>`;
    return f;
  }
  function groups(){
    const G=Object.entries(data.grupos).filter(([,g])=>g&&visible(g));
    const g=selGroup&&data.grupos[selGroup];
    let h=`<section><h3>Grupos en el mapa</h3>${G.length?`<div class="mglist">${G.map(([id,x])=>`<button class="mgroup" data-selgroup="${id}" aria-pressed="${id===selGroup}"><i style="background:${x.color}"></i><span>${esc(x.n)}</span><small>${(x.etapas||[]).length} etapa${(x.etapas||[]).length===1?"":"s"}</small></button>`).join("")}</div>`:`<p class="note">Todavía no hay grupos.</p>`}
      <div class="btns"><button class="btn" data-playall ${G.length?"":"disabled"}>Reproducir todos los viajes</button></div></section>
      <section><h3>Nuevo grupo</h3><input type="text" id="mg-name" placeholder="Por ejemplo: Los Disipadores" maxlength="40" aria-label="Nombre del grupo">
      <div class="btns"><button class="btn ghost" data-newgroup>Crear y colocar</button></div><p class="note">Se crea con el color elegido. Luego toca el mapa para su punto de partida.</p></section>`;
    if(g){const ed=canEdit(g),et=g.etapas||[];
      h+=`<section class="mgsel"><h3 style="color:${g.color}">${esc(g.n)}</h3><p class="note">Creado por ${esc(who(g.by))}.</p>
        <div class="btns"><button class="btn" data-play="${selGroup}" ${et.length?"":"disabled"}>Reproducir viaje</button><button class="btn ghost" data-playlast="${selGroup}" ${et.length?"":"disabled"}>Última etapa</button><button class="btn ghost" data-center="${selGroup}">Centrar</button></div>
        ${ed?`<label class="mlab" for="mg-etapa">Nombre de la próxima etapa</label><input type="text" id="mg-etapa" value="${esc(etapaName)}" placeholder="Etapa ${et.length+1} (por ejemplo: Sesión 10)" maxlength="40">
        <div class="btns"><button class="btn" data-addetapa>${et.length||groupPos(g)?"Dibujar etapa":"Colocar en el mapa"}</button>${et.length?`<button class="btn ghost" data-undoetapa>Quitar última etapa</button>`:""}</div>
        <label class="mlab" for="mg-rename">Nombre</label><input type="text" id="mg-rename" value="${esc(g.n)}" maxlength="40">
        <label class="mlab">Color</label><div class="mcolors">${COLORS.map(c=>`<button class="mcolor" data-gcolor="${c}" aria-pressed="${g.color===c}" style="--c:${c}" aria-label="Color ${c}"></button>`).join("")}</div>
        <label class="mlab" for="mg-vis">Quién lo ve</label>${visSel(g.vis||"all","mg-vis")}`:""}
        ${et.length?`<h4>Etapas</h4><ol class="metapas">${et.map(e=>`<li>${esc(e.n)}</li>`).join("")}</ol>`:""}
        ${ed?`<div class="btns"><button class="btn warn" data-delgroup>${g._confirm?"Pulsa otra vez para borrar":"Borrar grupo"}</button></div>`:""}</section>`}
    return h;
  }
  function removeSel(){if(sel)del("items",sel);sel=null;side()}

  function click(e){
    const b=e.target.closest("button");if(!b||!el.contains(b))return;const d=b.dataset;
    if(d.tool){if(d.tool==="img"&&!pendingImg)el.querySelector("#mfile").click();setTool(d.tool);return}
    if(d.color){color=d.color;tools();return}
    if(d.mz!==undefined){const r=svg.getBoundingClientRect();if(d.mz==="0"){fit();draw()}else zoomAt(d.mz==="1"?1.5:1/1.5,r.left+r.width/2,r.top+r.height/2);return}
    if(b.hasAttribute("data-undo")){const mine=Object.entries(data.items).filter(([,it])=>it?.by===me()).sort((a,b2)=>b2[1].ts-a[1].ts)[0];if(mine)del("items",mine[0]);else ctx.toast("No hay nada tuyo que deshacer.");return}
    if(b.hasAttribute("data-finish"))return finish();
    if(b.hasAttribute("data-cancel-draft")){draft=null;draw();hint();return}
    if(d.panel){panel=d.panel;side();return}
    if(d.icon){icon=d.icon;side();return}
    const it=sel&&data.items[sel];
    if(d.seticon&&it){it.icon=d.seticon;if(Object.values(ICON_N).includes(it.title)||!it.title)it.title=ICON_N[d.seticon];put("items",sel,it);return}
    if(d.setcolor&&it){it.color=d.setcolor;put("items",sel,it);return}
    if(b.hasAttribute("data-delsel"))return removeSel();
    if(d.golugar)return ctx.goLugar(d.golugar);
    if(d.selgroup){selGroup=d.selgroup;side();draw();return}
    if(b.hasAttribute("data-playall"))return play(Object.keys(data.grupos).filter(id=>visible(data.grupos[id])),false);
    if(d.play)return play([d.play],false);
    if(d.playlast)return play([d.playlast],true);
    if(d.center){const p=groupPos(data.grupos[d.center]);if(p){const r=svg.getBoundingClientRect(),h=view.w*(r.height/r.width);view.x=p[0]-view.w/2;view.y=p[1]-h/2;applyView();draw()}return}
    if(b.hasAttribute("data-newgroup")){const n=el.querySelector("#mg-name").value.trim();if(!n)return ctx.toast("Ponle un nombre al grupo.",true);
      const id=uid();put("grupos",id,{n,color,vis:"all",by:me(),etapas:[],ts:Date.now()});selGroup=id;setTool("place");hintPlace();return}
    const g=selGroup&&data.grupos[selGroup];
    if(b.hasAttribute("data-addetapa")&&g){if(!groupPos(g)){setTool("place");hintPlace();return}setTool("etapa");draft={t:"etapa",pts:[],color:g.color,w:3};hint();return}
    if(b.hasAttribute("data-undoetapa")&&g){g.etapas.pop();put("grupos",selGroup,g);return}
    if(d.gcolor&&g){g.color=d.gcolor;put("grupos",selGroup,g);return}
    if(b.hasAttribute("data-delgroup")&&g){if(!g._confirm){g._confirm=true;side();return}del("grupos",selGroup);selGroup=null;return}
  }
  // Colocar un grupo nuevo: el siguiente toque fija su punto de partida
  function hintPlace(){const h=el.querySelector("#mhint");h.hidden=false;h.innerHTML=`<span>Toca el mapa donde empieza ${esc(data.grupos[selGroup]?.n||"el grupo")}.</span>`;
    svg.addEventListener("pointerdown",function once(e){if(tool!=="place")return svg.removeEventListener("pointerdown",once,true);
      e.stopImmediatePropagation();const p=toMap(e.clientX,e.clientY),g=data.grupos[selGroup];if(g){g.x=r1(p.x);g.y=r1(p.y);put("grupos",selGroup,g)}
      svg.removeEventListener("pointerdown",once,true);setTool("mover");panel="grupos";side()},true)}
  function change(e){
    const t=e.target,it=sel&&data.items[sel],g=selGroup&&data.grupos[selGroup];
    if(t.dataset.layer){layers[t.dataset.layer]=t.checked;draw();return}
    if(t.id==="m-vis"){vis=t.value;return}
    if(t.id==="m-fog")return setConf({niebla:t.checked});
    if(t.id==="m-asplayer"){asPlayer=t.checked;draw();return}
    if(t.id==="m-km")return setConf({kmAncho:Math.max(10,+t.value||420)});
    if(t.id==="m-kmd")return setConf({kmDia:Math.max(1,+t.value||30)});
    if(t.id==="m-vel")return setConf({vel:+t.value});
    if(it&&t.id==="md-vis"){it.vis=t.value;return put("items",sel,it)}
    if(it&&t.id==="md-lugar"){it.lugar=t.value||null;return put("items",sel,it)}
    if(it&&["md-title","md-note","md-text","md-size"].includes(t.id)){const f={"md-title":"title","md-note":"note","md-text":"text","md-size":"size"}[t.id];
      it[f]=t.type==="range"?+t.value:t.value;t.blur();return put("items",sel,it)}
    if(g&&t.id==="mg-rename"){g.n=t.value.trim()||g.n;t.blur();return put("grupos",selGroup,g)}
    if(g&&t.id==="mg-vis"){g.vis=t.value;return put("grupos",selGroup,g)}
  }
  function input(e){const t=e.target;
    if(t.id==="m-width"){width=+t.value;return}
    if(t.id==="mg-etapa"){etapaName=t.value.slice(0,40);return}
    if(t.id==="md-size"&&sel&&data.items[sel]){data.items[sel].size=+t.value;draw()}}

  return {mount,refresh};
})();
