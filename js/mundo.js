/* Mundo: el mapa de Velmara siempre de fondo, con marcadores de lo que conoce cada PJ.
   Tocar un marcador (o una entrada del buscador) abre una ventana encima del mapa. Se pueden abrir
   varias, moverlas por la barra de título y cambiarles el tamaño por la esquina. La posición de las
   ventanas se recuerda en este dispositivo. Coordenadas del mapa: 1000 × 750. */
const Mundo=(()=>{
  const W=1000,H=750,IMG_LO="img/velmara-2048.webp",IMG_HI="img/velmara.webp";
  let el,svg,ctx,view={x:0,y:0,w:W},hiLoaded=false,fitted=false,mounted=false;
  let wins=[],z=10,q="",cat="",sOpen=innerWidth>=760,placing=null,gesture=null,pointers=new Map();
  try{wins=JSON.parse(localStorage.getItem("v-wins")||"[]").filter(w=>w&&w.id)}catch(e){}
  const save=()=>{try{localStorage.setItem("v-wins",JSON.stringify(wins.map(({id,x,y,w,h})=>({id,x,y,w,h}))))}catch(e){}};
  const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const visibleNow=()=>svg&&document.body.contains(svg)&&svg.getBoundingClientRect().width>0;
  const K=()=>view.w/(svg?.clientWidth||1000);

  function mount(root,c){
    ctx=c;el=root;
    el.innerHTML=`<div class="mundo-shell">
      <div class="mundo-stage" id="wstage">
        <svg id="wsvg" xmlns="http://www.w3.org/2000/svg"><image id="wimg" href="${IMG_LO}" x="0" y="0" width="${W}" height="${H}"/><g id="wmarks"></g></svg>
        <div class="map-zoom"><button data-wz="1" aria-label="Acercar">+</button><button data-wz="-1" aria-label="Alejar">−</button><button data-wz="0" aria-label="Ver todo">⤢</button></div>
        <div class="wsearch" id="wsearch"></div>
        <div class="wnow" id="wnow"></div>
        <div class="whint" id="whint" hidden></div>
        <div class="wlayer" id="wlayer"></div>
      </div></div>`;
    svg=el.querySelector("#wsvg");
    svg.addEventListener("wheel",e=>{e.preventDefault();zoomAt(e.deltaY<0?1.2:1/1.2,e.clientX,e.clientY)},{passive:false});
    svg.addEventListener("pointerdown",down);svg.addEventListener("pointermove",move);svg.addEventListener("pointerup",up);svg.addEventListener("pointercancel",up);
    el.addEventListener("click",click);el.addEventListener("input",input);
    el.querySelector("#wlayer").addEventListener("pointerdown",winDown);
    if(!mounted){mounted=true;addEventListener("resize",()=>{if(visibleNow()){applyView();marks();clampWins()}});
      document.addEventListener("pointermove",winMove);document.addEventListener("pointerup",winUp);document.addEventListener("pointercancel",winUp)}
    refresh(true);
  }
  function refresh(refit){
    if(!visibleNow())return;
    if(refit||!fitted){fit();fitted=true}else applyView();
    const E=ctx.entries();wins=wins.filter(w=>E[w.id]);
    marks();search();now();windows();
  }

  /* ---------- Vista ---------- */
  function fit(){const r=svg.getBoundingClientRect(),a=r.width/Math.max(1,r.height);
    if(a>=W/H){view.w=H*a;view.x=-(view.w-W)/2;view.y=0}else{view.w=W;view.x=0;view.y=-(W/a-H)/2}applyView()}
  function applyView(){const r=svg.getBoundingClientRect(),h=view.w*(r.height/Math.max(1,r.width));
    svg.setAttribute("viewBox",`${view.x} ${view.y} ${view.w} ${h}`);
    if(!hiLoaded&&view.w<W*.7){hiLoaded=true;const im=new Image();im.onload=()=>svg.querySelector("#wimg").setAttribute("href",IMG_HI);im.src=IMG_HI}}
  function toMap(cx,cy){const r=svg.getBoundingClientRect(),h=view.w*(r.height/r.width);return {x:view.x+(cx-r.left)/r.width*view.w,y:view.y+(cy-r.top)/r.height*h}}
  function zoomAt(f,px,py){const p=toMap(px,py),nw=Math.min(W*2.5,Math.max(60,view.w/f)),s=nw/view.w;
    view.x=p.x-(p.x-view.x)*s;view.y=p.y-(p.y-view.y)*s;view.w=nw;applyView();marks()}

  /* ---------- Mapa: arrastrar, pellizcar, marcadores ---------- */
  function down(e){
    svg.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===2){const [a,b]=[...pointers.values()];gesture={pinch:Math.hypot(a.x-b.x,a.y-b.y),w:view.w};return}
    if(placing){const p=toMap(e.clientX,e.clientY),id=placing;placing=null;hint();ctx.setPos(id,Math.round(p.x),Math.round(p.y));return}
    const m=e.target.closest?.("[data-mark]");
    if(m&&ctx.isDM()){const p=toMap(e.clientX,e.clientY);gesture={drag:m.dataset.mark,sx:e.clientX,sy:e.clientY,moved:false,p};return}
    gesture={pan:true,sx:e.clientX,sy:e.clientY,vx:view.x,vy:view.y,mark:m?.dataset.mark};
  }
  function move(e){
    if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(gesture?.pinch&&pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);zoomAt(view.w/(gesture.w*gesture.pinch/d),(a.x+b.x)/2,(a.y+b.y)/2);return}
    if(gesture?.drag){if(Math.hypot(e.clientX-gesture.sx,e.clientY-gesture.sy)>5)gesture.moved=true;
      if(gesture.moved){gesture.p=toMap(e.clientX,e.clientY);const g=svg.querySelector(`[data-mark="${gesture.drag}"]`);g?.setAttribute("transform",`translate(${gesture.p.x} ${gesture.p.y})`)}return}
    if(gesture?.pan){const f=view.w/svg.getBoundingClientRect().width;
      if(Math.hypot(e.clientX-gesture.sx,e.clientY-gesture.sy)>5)gesture.mark=null;
      view.x=gesture.vx-(e.clientX-gesture.sx)*f;view.y=gesture.vy-(e.clientY-gesture.sy)*f;applyView()}
  }
  function up(e){
    pointers.delete(e.pointerId);const g=gesture;if(pointers.size===0)gesture=null;if(!g)return;
    if(g.drag){if(g.moved)ctx.setPos(g.drag,Math.round(g.p.x),Math.round(g.p.y));else open(g.drag);return}
    if(g.pan&&g.mark)open(g.mark);
  }
  const ICON={lugares:'<path d="M0 -26 C-9 -26 -14 -19 -14 -13 C-14 -4 0 8 0 8 C0 8 14 -4 14 -13 C14 -19 9 -26 0 -26Z"/>',
    personas:'<circle cx="0" cy="-16" r="8"/><path d="M-12 4 C-12 -6 12 -6 12 4Z"/>',
    organizaciones:'<path d="M-12 -24 H12 V-4 L0 6 L-12 -4Z"/>',mundo:'<circle cx="0" cy="-10" r="12"/>',artefactos:'<path d="M0 -26 L11 -10 L0 6 L-11 -10Z"/>',cronica:'<rect x="-11" y="-24" width="22" height="26" rx="2"/>'};
  function marks(){
    if(!visibleNow())return;
    const E=ctx.entries(),k=K(),s=Math.max(.35,Math.min(1.6,k*1.1));let h="";
    for(const [id,e] of Object.entries(E)){if(!e.pos)continue;const [x,y]=e.pos,open=wins.some(w=>w.id===id);
      h+=`<g class="wmark${open?" on":""}${e.oculto?" hid":""}" data-mark="${id}" transform="translate(${x} ${y})"><g transform="scale(${s})">
        <g class="wpin">${ICON[e.cat]||ICON.lugares}</g>
        <text y="26" text-anchor="middle" class="wlabel">${esc(e.n)}</text></g></g>`}
    svg.querySelector("#wmarks").innerHTML=h;
  }

  /* ---------- Buscador, avisos y pistas ---------- */
  function search(){
    const box=el.querySelector("#wsearch");if(!box)return;
    if(box.contains(document.activeElement)&&document.activeElement.tagName==="INPUT"){list();return}
    box.classList.toggle("shut",!sOpen);
    if(!sOpen){box.innerHTML=`<button class="btn" data-wsearch="1">Buscar</button>`;return}
    box.innerHTML=`<div class="wsearch-in"><input type="search" id="wq" placeholder="Buscar en lo que sabes…" value="${esc(q)}" aria-label="Buscar"><button class="wx" data-wsearch="0" aria-label="Plegar el buscador">×</button></div>
      <div class="wcats">${[["","Todo"],...CATS].map(([k,l])=>`<button class="chip" data-wcat="${k}" aria-pressed="${cat===k}">${l}</button>`).join("")}</div><div class="wlist" id="wlist"></div>`;
    list();
  }
  function list(){
    const L=el.querySelector("#wlist");if(!L)return;
    const E=ctx.entries(),t=q.trim().toLowerCase();
    const rows=Object.entries(E).filter(([,e])=>(!cat||e.cat===cat)&&(!t||(e.n+" "+(e.sub||"")+" "+(e.txt||"")).toLowerCase().includes(t)))
      .sort((a,b)=>t&&(a[1].n.toLowerCase().includes(t)!==b[1].n.toLowerCase().includes(t))?(a[1].n.toLowerCase().includes(t)?-1:1):a[1].cat===b[1].cat?(a[1].cat==="cronica"?(a[1].orden||0)-(b[1].orden||0):a[1].n.localeCompare(b[1].n,"es")):CATS.findIndex(c=>c[0]===a[1].cat)-CATS.findIndex(c=>c[0]===b[1].cat));
    L.innerHTML=rows.length?rows.map(([id,e])=>`<button class="wrow${e.oculto?" hid":""}" data-wopen="${id}"><b>${esc(e.n)}</b><small>${esc(CATS.find(c=>c[0]===e.cat)?.[1]||"")}${e.sub?" · "+esc(e.sub):""}${e.pos?"":" · sin marcador"}</small></button>`).join("")
      :`<p class="note">${Object.keys(E).length?"Nada coincide.":ctx.isDM()?"Importa el vault desde la Mesa del DM.":"Todavía no sabes nada. El DM irá desvelando lo que descubráis."}</p>`;
  }
  function now(){const n=el.querySelector("#wnow");if(n)n.innerHTML=ctx.nowHTML()}
  function hint(){const h=el.querySelector("#whint");if(!h)return;h.hidden=!placing;
    h.innerHTML=placing?`<span>Toca el mapa donde va <b>${esc(ctx.entries()[placing]?.n||"")}</b>.</span><button class="btn ghost" data-wcancel>Cancelar</button>`:""}

  /* ---------- Ventanas ---------- */
  function open(id){
    let w=wins.find(x=>x.id===id);
    if(w){w.z=++z;windows();return}
    const r=el.querySelector("#wstage").getBoundingClientRect(),n=wins.length,mob=r.width<640;
    const ww=mob?r.width-16:Math.min(440,r.width*.42),hh=mob?Math.min(r.height*.6,480):Math.min(560,r.height-40);
    w={id,x:mob?8:Math.min(r.width-ww-12,r.width*.5+n*28),y:mob?r.height-hh-8-n*14:20+n*28,w:ww,h:hh,z:++z};
    if(libre()){w.x+=r.left;w.y+=r.top;w.v=1}
    wins.push(w);save();windows();marks();
  }
  function close(id){wins=wins.filter(w=>w.id!==id);save();windows();marks()}
  // En pantallas anchas las ventanas van en coordenadas de la pantalla (capa fija) y pueden ponerse a los lados del mapa
  const libre=()=>innerWidth>=1000;
  function clampWins(){const r=el.querySelector("#wstage")?.getBoundingClientRect();if(!r)return;
    if(libre()){modo(r);wins.forEach(w=>{w.w=Math.min(w.w,innerWidth-8);w.h=Math.min(w.h,innerHeight-8);
      w.x=Math.max(-w.w+80,Math.min(w.x,innerWidth-60));w.y=Math.max(0,Math.min(w.y,innerHeight-40))});windows();return}
    modo(r);
    // En pantallas estrechas la ventana entera queda dentro; en grandes se puede sacar medio fuera
    const small=r.width<640;
    wins.forEach(w=>{w.w=Math.min(w.w,r.width-8);w.h=Math.min(w.h,r.height-8);
      w.x=small?Math.max(0,Math.min(w.x,r.width-w.w)):Math.max(-w.w+80,Math.min(w.x,r.width-60));w.y=Math.max(0,Math.min(w.y,r.height-40))});windows()}
  // Pasa las ventanas guardadas al sistema de coordenadas actual (mapa o pantalla)
  function modo(r){const f=libre();wins.forEach(w=>{if(!!w.v===f)return;if(f){w.x+=r.left;w.y+=r.top}else{w.x-=r.left;w.y-=r.top}w.v=f?1:0})}
  function windows(){
    const layer=el?.querySelector("#wlayer");if(!layer)return;
    const r0=el.querySelector("#wstage")?.getBoundingClientRect();if(r0)modo(r0);layer.classList.toggle("free",libre());
    const E=ctx.entries();
    // Las ventanas que siguen abiertas se actualizan sin perder lo que se está escribiendo dentro
    const have=new Map([...layer.children].map(d=>[d.dataset.win,d]));
    for(const [id,d] of have)if(!wins.some(w=>w.id===id))d.remove();
    wins.forEach(w=>{
      let d=have.get(w.id);const e=E[w.id];
      if(!d){d=document.createElement("section");d.className="win";d.dataset.win=w.id;d.setAttribute("role","dialog");
        d.innerHTML=`<header class="whead"><span class="wtitle"></span><button class="wx" data-wclose="${w.id}" aria-label="Cerrar">×</button></header><div class="wbody"></div><span class="wgrip" aria-hidden="true"></span>`;layer.appendChild(d)}
      Object.assign(d.style,{left:w.x+"px",top:w.y+"px",width:w.w+"px",height:w.h+"px",zIndex:w.z||10});
      d.querySelector(".wtitle").innerHTML=`<small>${esc(e.sub||CATS.find(c=>c[0]===e.cat)?.[1]||"")}</small>${esc(e.n)}`;
      const body=d.querySelector(".wbody");
      if(!body.contains(document.activeElement)||!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){const st=body.scrollTop;body.innerHTML=ctx.body(w.id);body.scrollTop=st}
    });
  }
  let wg=null;
  function winDown(e){
    const d=e.target.closest(".win");if(!d)return;const w=wins.find(x=>x.id===d.dataset.win);if(!w)return;
    if(w.z!==z){w.z=++z;d.style.zIndex=w.z}
    const grip=e.target.closest(".wgrip"),head=e.target.closest(".whead")&&!e.target.closest("button");
    if(!grip&&!head)return;e.preventDefault();
    wg={w,d,grip:!!grip,sx:e.clientX,sy:e.clientY,ox:w.x,oy:w.y,ow:w.w,oh:w.h,id:e.pointerId};
  }
  function winMove(e){if(!wg||e.pointerId!==wg.id)return;const dx=e.clientX-wg.sx,dy=e.clientY-wg.sy,w=wg.w;
    if(wg.grip){w.w=Math.max(240,wg.ow+dx);w.h=Math.max(160,wg.oh+dy)}else{w.x=wg.ox+dx;w.y=wg.oy+dy}
    Object.assign(wg.d.style,{left:w.x+"px",top:w.y+"px",width:w.w+"px",height:w.h+"px"})}
  function winUp(e){if(!wg||e.pointerId!==wg.id)return;wg=null;clampWins();save()}

  function click(e){
    const b=e.target.closest("button");if(!b||!el.contains(b))return;const d=b.dataset;
    if(d.wz!==undefined){const r=svg.getBoundingClientRect();if(d.wz==="0")fit();else zoomAt(d.wz==="1"?1.5:1/1.5,r.left+r.width/2,r.top+r.height/2);marks();return}
    if(d.wopen){if(innerWidth<760){sOpen=false;search()}open(d.wopen);const p=ctx.entries()[d.wopen]?.pos;if(p)center(p);return}
    if(d.wclose){close(d.wclose);return}
    if(d.wsearch){sOpen=d.wsearch==="1";search();if(sOpen)el.querySelector("#wq")?.focus();return}
    if(d.wcat!==undefined){cat=d.wcat;search();return}
    if(d.wplace){placing=d.wplace;hint();return}
    if(b.hasAttribute("data-wcancel")){placing=null;hint();return}
    if(d.wunplace){ctx.setPos(d.wunplace,null);return}
  }
  function center(p){const r=svg.getBoundingClientRect(),h=view.w*(r.height/r.width);
    if(p[0]<view.x||p[0]>view.x+view.w||p[1]<view.y||p[1]>view.y+h){view.x=p[0]-view.w/2;view.y=p[1]-h/2;applyView();marks()}}
  function input(e){if(e.target.id==="wq"){q=e.target.value;list()}}
  // Los enlaces dentro de una ventana abren otra
  function place(id){placing=id;hint()}
  return {mount,refresh,open,close,place};
})();
