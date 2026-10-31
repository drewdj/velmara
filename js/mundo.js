/* Mundo: el mapa entero de Velmara. Es un mapa como la Zona Norte (se puede pintar, poner puntos y escribir; sin línea de tiempo)
   con una capa encima: los marcadores de lo que conoce cada PJ, una barra para buscar y ventanas.
   Tocar un marcador (o un resultado de la búsqueda) abre una ventana encima del mapa. Se pueden abrir
   varias, moverlas por la barra de título y cambiarles el tamaño por la esquina. La posición de las
   ventanas se recuerda en este dispositivo. Coordenadas del mapa: 1000 × 750. */
const Mundo=(()=>{
  let el,M=null,api=null,ctx,mounted=false;
  let wins=[],z=10,q="",placing=null,g=null;
  try{wins=JSON.parse(localStorage.getItem("v-wins")||"[]").filter(w=>w&&w.id)}catch(e){}
  const save=()=>{try{localStorage.setItem("v-wins",JSON.stringify(wins.map(({id,x,y,w,h})=>({id,x,y,w,h}))))}catch(e){}};
  const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const stage=()=>el?.querySelector("#mstage");

  // Capa que se monta sobre el motor del mapa (crearMapa en mapa.js)
  const capa={
    html:()=>`<div class="wsearch" id="wsearch"><input type="search" id="wq" placeholder="Buscar en lo que sabes…" autocomplete="off" aria-label="Buscar"><div class="wlist" id="wlist" hidden></div></div>
      <div class="wnow" id="wnow"></div><div class="whint" id="whint" hidden></div><div class="wlayer" id="wlayer"></div>`,
    mount(a,root){api=a;el=root;
      el.addEventListener("click",click);el.addEventListener("input",input);
      el.querySelector("#wq").addEventListener("keydown",e=>{if(e.key==="Escape"){q="";e.target.value="";list();e.target.blur()}
        if(e.key==="Enter"){const f=el.querySelector("#wlist [data-wopen]");if(f)f.click()}});
      el.querySelector("#wlayer").addEventListener("pointerdown",winDown);
      if(!mounted){mounted=true;document.addEventListener("pointermove",winMove);document.addEventListener("pointerup",winUp);document.addEventListener("pointercancel",winUp)}},
    refresh(){const E=ctx.entries();wins=wins.filter(w=>E[w.id]);list();now();windows();hint()},
    resize(){clampWins()},
    layer(K){
      const E=ctx.entries(),s=Math.max(.35,Math.min(1.6,K*1.1));let h="";
      for(const [id,e] of Object.entries(E)){if(!e.pos)continue;const [x,y]=e.pos,open=wins.some(w=>w.id===id);
        h+=`<g class="wmark${open?" on":""}${e.oculto?" hid":""}" data-mark="${id}" transform="translate(${x} ${y})"><g transform="scale(${s})">
          <g class="wpin">${ICON[e.cat]||ICON.lugares}</g><text y="26" text-anchor="middle" class="wlabel">${esc(e.n)}</text></g></g>`}
      return h},
    // Marcadores: tocar abre su ventana; el DM los arrastra. Mientras se coloca uno, el toque lo pone ahí.
    down(e,p,tool){
      if(placing){const id=placing;placing=null;hint();ctx.setPos(id,Math.round(p.x),Math.round(p.y));return true}
      const m=e.target.closest?.("[data-mark]");if(!m||tool!=="mover")return false;
      g={id:m.dataset.mark,drag:ctx.isDM(),sx:e.clientX,sy:e.clientY,moved:false,p,pid:e.pointerId};return true},
    move(e){if(!g||e.pointerId!==g.pid)return false;
      if(Math.hypot(e.clientX-g.sx,e.clientY-g.sy)>5)g.moved=true;
      if(g.drag&&g.moved){g.p=api.toMap(e.clientX,e.clientY);el.querySelector(`[data-mark="${g.id}"]`)?.setAttribute("transform",`translate(${g.p.x} ${g.p.y})`)}
      return true},
    up(e){if(!g||e.pointerId!==g.pid)return false;const x=g;g=null;
      if(x.drag&&x.moved)ctx.setPos(x.id,Math.round(x.p.x),Math.round(x.p.y));else if(!x.moved)open(x.id);return true}
  };
  const ICON={lugares:'<path d="M0 -26 C-9 -26 -14 -19 -14 -13 C-14 -4 0 8 0 8 C0 8 14 -4 14 -13 C14 -19 9 -26 0 -26Z"/>',
    personas:'<circle cx="0" cy="-16" r="8"/><path d="M-12 4 C-12 -6 12 -6 12 4Z"/>',
    organizaciones:'<path d="M-12 -24 H12 V-4 L0 6 L-12 -4Z"/>',mundo:'<circle cx="0" cy="-10" r="12"/>',artefactos:'<path d="M0 -26 L11 -10 L0 6 L-11 -10Z"/>',cronica:'<rect x="-11" y="-24" width="22" height="26" rx="2"/>'};

  function mount(root,c){
    ctx=c;
    if(!M)M=crearMapa({W:1000,H:750,lo:"img/velmara-2048.webp",hi:"img/velmara.webp",path:"tienda/mapamundo",timeline:false,extra:capa});
    M.mount(root,{me:c.me,isDM:c.canDM,viewAs:c.viewAs,pjName:c.pjName,toast:c.toast});
  }
  const refresh=()=>M?.refresh();

  /* ---------- Búsqueda: una barra; según escribes salen los resultados ---------- */
  function list(){
    const L=el?.querySelector("#wlist");if(!L)return;
    const t=q.trim().toLowerCase();if(!t){L.hidden=true;L.innerHTML="";return}
    const E=ctx.entries();
    const rows=Object.entries(E).filter(([,e])=>(e.n+" "+(e.sub||"")+" "+(e.txt||"")).toLowerCase().includes(t))
      .sort((a,b)=>(a[1].n.toLowerCase().includes(t)===b[1].n.toLowerCase().includes(t))?a[1].n.localeCompare(b[1].n,"es"):a[1].n.toLowerCase().includes(t)?-1:1).slice(0,12);
    L.hidden=false;
    L.innerHTML=rows.length?rows.map(([id,e])=>`<button class="wrow${e.oculto?" hid":""}" data-wopen="${id}"><b>${esc(e.n)}</b>${e.sub?`<small>${esc(e.sub)}</small>`:""}</button>`).join(""):`<p class="note">Nada.</p>`;
  }
  function now(){const n=el?.querySelector("#wnow");if(n)n.innerHTML=ctx.nowHTML()}
  function hint(){const h=el?.querySelector("#whint");if(!h)return;h.hidden=!placing;
    h.innerHTML=placing?`<span>Toca el mapa donde va <b>${esc(ctx.entries()[placing]?.n||"")}</b>.</span><button class="btn ghost" data-wcancel>Cancelar</button>`:""}

  /* ---------- Ventanas ---------- */
  function open(id){
    let w=wins.find(x=>x.id===id);
    if(w){w.z=++z;windows();return}
    const r=stage()?.getBoundingClientRect();if(!r){wins.push({id,x:20,y:20,w:420,h:520,z:++z});save();return}
    const n=wins.length,mob=r.width<640;
    const ww=mob?r.width-16:Math.min(440,r.width*.42),hh=mob?Math.min(r.height*.6,480):Math.min(560,r.height-40);
    w={id,x:mob?8:Math.min(r.width-ww-12,r.width*.5+n*28),y:mob?r.height-hh-8-n*14:20+n*28,w:ww,h:hh,z:++z};
    if(libre()){w.x+=r.left;w.y+=r.top;w.v=1}
    wins.push(w);save();windows();api?.redraw();
  }
  function close(id){wins=wins.filter(w=>w.id!==id);save();windows();api?.redraw()}
  // En pantallas anchas las ventanas van en coordenadas de la pantalla (capa fija) y pueden ponerse a los lados del mapa
  const libre=()=>innerWidth>=1000;
  function clampWins(){const r=stage()?.getBoundingClientRect();if(!r)return;
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
    const r0=stage()?.getBoundingClientRect();if(r0)modo(r0);layer.classList.toggle("free",libre());
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
    if(d.wopen){q="";const i=el.querySelector("#wq");if(i){i.value="";i.blur()}list();open(d.wopen);const p=ctx.entries()[d.wopen]?.pos;if(p)M.center(p);return}
    if(d.wclose){close(d.wclose);return}
    if(d.wplace){placing=d.wplace;hint();return}
    if(b.hasAttribute("data-wcancel")){placing=null;hint();return}
    if(d.wunplace){ctx.setPos(d.wunplace,null);return}
  }
  function input(e){if(e.target.id==="wq"){q=e.target.value;list()}}
  function place(id){placing=id;hint()}
  return {mount,refresh,open,close,place};
})();
