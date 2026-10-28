/* Contenido editable por el DM: personajes, armas, armaduras y objetos de la tienda.
   Lo que hay en js/datos.js es la base; en Firebase (tienda/contenido/{col}/{id}) se guardan los cambios
   y lo nuevo. Al cargar se mezcla todo y se reconstruyen las tablas (PJ, ITEM, WEAPON, ARMOR), así el resto
   de la web no nota la diferencia. {borrado:true} quita una entrada; img es una imagen ya reducida (data URL). */
const COLS={
  pjs:{n:"Personajes jugadores",arr:PJS,map:PJ},
  armas:{n:"Armas",arr:WEAPONS,map:WEAPON},
  armaduras:{n:"Armaduras",arr:ARMORS,map:ARMOR},
  objetos:{n:"Objetos y consumibles",arr:ITEMS,map:ITEM},
  tiendas:{n:"Tiendas",arr:TIENDAS,map:TIENDA}
};
const BASE=Object.fromEntries(Object.entries(COLS).map(([k,c])=>[k,c.arr.map(x=>structuredClone(x))]));
const Contenido={
  data:{},mode:"local",ref:null,subs:[],
  emit(){this.subs.forEach(f=>f())},
  init(){
    const cfg=window.FIREBASE_CONFIG;
    if(!cfg||!window.firebase){this.mode="local";this.listo=true;return}
    this.mode="live";
    const app=firebase.apps.length?firebase.app():firebase.initializeApp(cfg);
    this.ref=app.database().ref("tienda/contenido");
    this.ref.on("value",s=>{this.data=s.val()||{};this.aplicar();this.listo=true;this.emit()},e=>console.error(e));
  },
  aplicar(){
    for(const [k,c] of Object.entries(COLS)){
      const ov=this.data[k]||{},seen=new Set(),all=[];
      for(const b of BASE[k]){seen.add(b.id);const o=ov[b.id];all.push(o?{...b,...o,id:b.id}:{...b})}
      for(const [id,o] of Object.entries(ov))if(!seen.has(id)&&o&&!(k==="pjs"&&PJS_VIEJOS.includes(id)))all.push({...o,id,nuevo:true});
      // Lo borrado sale de las listas pero sigue en la tabla: quien ya lo tenga lo conserva
      c.arr.length=0;c.arr.push(...all.filter(x=>!x.borrado));
      for(const key in c.map)delete c.map[key];
      for(const x of all)c.map[x.id]=x;
    }
    for(const key in ARTE)delete ARTE[key];
    for(const k of ["armas","armaduras","objetos"])for(const x of COLS[k].arr)if(x.img)ARTE[x.id]=x.img;
  },
  esBase:(col,id)=>BASE[col].some(x=>x.id===id),
  // Guarda solo lo que difiere de la base (o todo, si es nuevo)
  async guardar(col,id,obj){
    const b=BASE[col].find(x=>x.id===id);let v=obj;
    if(b){v={};for(const [key,val] of Object.entries(obj))if(key!=="id"&&key!=="nuevo"&&JSON.stringify(val)!==JSON.stringify(b[key]))v[key]=val;if(!Object.keys(v).length)v=null}
    else{v={...obj};delete v.id;delete v.nuevo}
    if(this.mode==="local"){this.data[col]=this.data[col]||{};if(v)this.data[col][id]=v;else delete this.data[col][id];this.aplicar();this.emit();return}
    await this.ref.child(`${col}/${id}`).set(v);
  },
  // Borrar solo marca: quien ya lo tenga lo sigue viendo en su inventario. restaurar lo deshace.
  async borrar(col,id,on=true){
    if(this.mode==="local"){this.data[col]=this.data[col]||{};const o={...(this.data[col][id]||{})};if(on)o.borrado=true;else delete o.borrado;
      if(Object.keys(o).length)this.data[col][id]=o;else delete this.data[col][id];this.aplicar();this.emit();return}
    await this.ref.child(`${col}/${id}/borrado`).set(on?true:null);
  }
};
// Reduce una imagen a lo justo para la web (lado mayor 640 px, WebP o JPEG) y la devuelve como data URL
function reducirImagen(file,max=640){
  return new Promise((res,rej)=>{
    const img=new Image(),url=URL.createObjectURL(file);
    img.onload=()=>{const s=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement("canvas");
      c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      URL.revokeObjectURL(url);let d=c.toDataURL("image/webp",.82);if(!d.startsWith("data:image/webp"))d=c.toDataURL("image/jpeg",.85);res(d)};
    img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error("No se pudo leer esa imagen."))};img.src=url;
  });
}
