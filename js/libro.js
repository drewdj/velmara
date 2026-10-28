/* Libro de sesiones: lo que pasó en cada sesión, para leerlo rápido.
   - Las sesiones (nombre y número) son las del mapa: tienda/mapa/sesiones. Se crean y borran desde la pestaña Sesiones.
   - El texto de cada una va en tienda/libro/{sesión}: título, lugar, "en pocas palabras" (tldr), texto en markdown
     e imágenes subidas desde la web (imgs, que el texto usa como ![pie](img:ID)).
   - Las notas de cada jugador van en tienda/sesnotas/{sesión}/{pj}.
   Sin Firebase (modo prueba) todo queda en memoria. */
const Libro={
  libro:{},notas:{},mode:"local",ref:null,subs:[],
  emit(){this.subs.forEach(f=>f())},
  init(){
    const cfg=window.FIREBASE_CONFIG;
    if(!cfg||!window.firebase){this.mode="local";return}
    this.mode="live";
    const app=firebase.apps.length?firebase.app():firebase.initializeApp(cfg);
    this.ref=app.database().ref("tienda");
    this.ref.child("libro").on("value",s=>{this.libro=s.val()||{};this.emit()},e=>console.error(e));
    this.ref.child("sesnotas").on("value",s=>{this.notas=s.val()||{};this.emit()},e=>console.error(e));
  },
  async guardar(id,o){
    o=o?JSON.parse(JSON.stringify(o)):null;
    if(this.mode==="local"){if(o)this.libro[id]=o;else delete this.libro[id];this.emit();return}
    await this.ref.child("libro/"+id).set(o);
  },
  async nota(id,pj,t){
    const v=t.trim()?{t:t.slice(0,8000),ts:Date.now()}:null;
    if(this.mode==="local"){this.notas[id]=this.notas[id]||{};if(v)this.notas[id][pj]=v;else delete this.notas[id][pj];this.emit();return}
    await this.ref.child(`sesnotas/${id}/${pj}`).set(v);
  },
  async borrar(id){
    if(this.mode==="local"){delete this.libro[id];delete this.notas[id];this.emit();return}
    await this.ref.child("libro/"+id).set(null);await this.ref.child("sesnotas/"+id).set(null);
  }
};
// El texto de una sesión: markdown, más imágenes sueltas en su línea (![pie](ruta o img:ID)) y separadores (---)
function libroHTML(md,imgs,link){
  const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  let h="",buf=[];const flush=()=>{if(buf.length)h+=mdHTML(buf.join("\n"),link);buf=[]};
  for(const l of String(md||"").replace(/\r/g,"").split("\n")){
    const m=l.trim().match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if(m){flush();const src=m[2].startsWith("img:")?imgs?.[m[2].slice(4)]:/^(img\/|https:\/\/|data:image\/)/.test(m[2])?m[2]:null;
      h+=src?`<figure class="lfig"><img src="${E(src)}" alt="${E(m[1])}" loading="lazy">${m[1]?`<figcaption>${E(m[1])}</figcaption>`:""}</figure>`:"";continue}
    if(/^\s*(---|\*\*\*)\s*$/.test(l)){flush();h+=`<hr class="lsep">`;continue}
    buf.push(l);
  }
  flush();return h;
}
