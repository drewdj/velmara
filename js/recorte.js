/* Encuadre de imágenes: al subir una foto eliges qué parte se ve (arrastrar y acercar).
   Sale cuadrada, así el círculo del retrato, la ficha y las cartas muestran lo mismo. */
function recortar(src,out=640){
  return new Promise(res=>{
    const img=new Image();
    img.onerror=()=>res(Promise.reject(new Error("No se pudo leer esa imagen.")));
    img.onload=()=>{
      const iw=img.naturalWidth,ih=img.naturalHeight,ov=document.createElement("div");
      ov.className="rc-over";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-label","Encuadrar imagen");
      ov.innerHTML=`<div class="rc-box deco"><span class="tab-label">Elige qué parte se ve</span>
        <div class="rc-view"><img alt="" draggable="false"><i class="rc-ring" aria-hidden="true"></i></div>
        <p class="note">Arrastra para mover. Acerca con la barra, la rueda o dos dedos. El círculo es lo que sale en el retrato.</p>
        <input type="range" class="rc-zoom" min="1" max="4" step="0.01" value="1" aria-label="Acercar">
        <div class="btns"><button class="btn ghost" data-rc="no">Cancelar</button><button class="btn" data-rc="ok">Usar así</button></div></div>`;
      document.body.appendChild(ov);
      const view=ov.querySelector(".rc-view"),im=ov.querySelector("img"),zr=ov.querySelector(".rc-zoom");im.src=src;
      let V=view.clientWidth,z=1,ox=0,oy=0;
      const sc=()=>V/Math.min(iw,ih)*z;
      const fit=()=>{const s=sc();ox=Math.min(0,Math.max(V-iw*s,ox));oy=Math.min(0,Math.max(V-ih*s,oy));
        im.style.width=iw*s+"px";im.style.height=ih*s+"px";im.style.transform=`translate(${ox}px,${oy}px)`};
      // Zoom manteniendo fijo el punto (px,py) de la vista
      const zoom=(nz,px=V/2,py=V/2)=>{nz=Math.min(4,Math.max(1,nz));const s0=sc();z=nz;const s1=sc();
        ox=px-(px-ox)*s1/s0;oy=py-(py-oy)*s1/s0;zr.value=z;fit()};
      {const s=sc();ox=(V-iw*s)/2;oy=(V-ih*s)/2;fit()}
      const P=new Map();let pinch=null;
      view.addEventListener("pointerdown",e=>{view.setPointerCapture(e.pointerId);P.set(e.pointerId,[e.clientX,e.clientY]);
        if(P.size===2){const [a,b]=[...P.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),z}}});
      view.addEventListener("pointermove",e=>{const p=P.get(e.pointerId);if(!p)return;
        if(P.size===2&&pinch){P.set(e.pointerId,[e.clientX,e.clientY]);const [a,b]=[...P.values()],r=view.getBoundingClientRect();
          zoom(pinch.z*Math.hypot(a[0]-b[0],a[1]-b[1])/pinch.d,(a[0]+b[0])/2-r.left,(a[1]+b[1])/2-r.top);return}
        ox+=e.clientX-p[0];oy+=e.clientY-p[1];P.set(e.pointerId,[e.clientX,e.clientY]);fit()});
      const up=e=>{P.delete(e.pointerId);if(P.size<2)pinch=null};
      view.addEventListener("pointerup",up);view.addEventListener("pointercancel",up);
      view.addEventListener("wheel",e=>{e.preventDefault();const r=view.getBoundingClientRect();zoom(z*(e.deltaY<0?1.1:1/1.1),e.clientX-r.left,e.clientY-r.top)},{passive:false});
      zr.addEventListener("input",()=>zoom(+zr.value));
      const onR=()=>{const k=ox/V,l=oy/V;V=view.clientWidth;ox=k*V;oy=l*V;fit()};addEventListener("resize",onR);
      const fin=ok=>{removeEventListener("resize",onR);document.removeEventListener("keydown",kd,true);
        let d=null;
        if(ok){const s=sc(),sw=V/s,n=Math.max(64,Math.min(out,Math.round(sw))),c=document.createElement("canvas");c.width=c.height=n;
          c.getContext("2d").drawImage(img,-ox/s,-oy/s,sw,sw,0,0,n,n);
          d=c.toDataURL("image/webp",.82);if(!d.startsWith("data:image/webp"))d=c.toDataURL("image/jpeg",.85)}
        ov.remove();res(d)};
      const kd=e=>{if(e.key==="Escape"){e.stopPropagation();fin(false)}else if(e.key==="Enter"){e.preventDefault();e.stopPropagation();fin(true)}};
      document.addEventListener("keydown",kd,true);
      ov.addEventListener("click",e=>{const b=e.target.closest("[data-rc]");if(b)fin(b.dataset.rc==="ok");else if(e.target===ov)fin(false)});
      ov.querySelector('[data-rc="ok"]').focus();
    };
    img.src=src;
  });
}
// Desde un archivo: lo encuadra y devuelve la data URL (null si se cancela)
function recortarArchivo(file,out){const url=URL.createObjectURL(file);
  return recortar(url,out).finally(()=>URL.revokeObjectURL(url))}
