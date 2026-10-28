/* Almacén compartido de Velmara: un único estado en Firebase Realtime Database.
   Cada cambio va en una transacción, así que dos jugadores nunca cogen la misma pieza.
   Sin configuración de Firebase funciona en "modo prueba" (solo en este navegador). */
const Store={
  mode:"wait",state:null,subs:[],ref:null,
  path:"tienda/estado",
  emit(){this.subs.forEach(f=>f())},
  // Firebase borra objetos vacíos y valores null: los recuperamos al leer
  fix(st){
    if(!st)return null;
    st.botes=st.botes||{};st.log=Array.isArray(st.log)?st.log:Object.values(st.log||{});st.pjs=st.pjs||{};
    // PJs y objetos creados después en el Compendio entran con valores iniciales
    // Los PJs de antes se quitan con todo lo suyo (hoja, inventario, puntos, botes y pagos)
    for(const v of PJS_VIEJOS){delete st.pjs[v];if(st.hojas)delete st.hojas[v];for(const t in st.puntos||{})delete st.puntos[t][v];
      for(const k in st.botes)if(st.botes[k].para===v||st.botes[k].por===v)delete st.botes[k];else if(st.botes[k].aportes)delete st.botes[k].aportes[v];
      for(const k in st.pagos||{})if(st.pagos[k].pj===v)delete st.pagos[k]}
    // Cada PJ tiene inventario y hoja: los de la lista y los que ya tengan hoja aunque su ficha aún no haya llegado
    st.hojas=st.hojas||{};
    const ids=[...new Set([...PJS.map(p=>p.id),...Object.keys(st.hojas),...Object.keys(st.pjs)])].filter(k=>!PJS_VIEJOS.includes(k));
    for(const k of ids)if(!st.pjs[k])st.pjs[k]={};
    // Tiendas (v3): puntos, existencias y pagos por tienda. Lo de antes (vales y stock globales) pasa a las Tres Agujas.
    if(!st.puntos){st.puntos={"tres-agujas":{}};for(const k in st.pjs)st.puntos["tres-agujas"][k]=st.pjs[k].vales||0}
    if(!st.exist){st.exist={"tres-agujas":{}};for(const k in st.stock||{})st.exist["tres-agujas"]["o:"+k]=st.stock[k]}
    delete st.stock;for(const k in st.pjs)delete st.pjs[k].vales;
    st.pagos=st.pagos||{};
    if(typeof fillShop==="function")for(const t of TIENDAS)fillShop(st,t,false);
    for(const k in st.pjs){const p=st.pjs[k];p.inv=p.inv||{};p.arma=p.arma??null;p.sec=p.sec??null;p.armadura=p.armadura??null;p.bolsa=Array.isArray(p.bolsa)?p.bolsa:Object.values(p.bolsa||{});p.propios=p.propios||{}}
    for(const k in st.botes){const b=st.botes[k];b.aportes=b.aportes||{};b.tienda=b.tienda||"tres-agujas";b.ref=b.ref||"o:"+b.item;if(b.p==null)b.p=ITEM[b.item]?price(ITEM[b.item]):1}
    // Hojas de personaje: lo que falte (o Firebase haya borrado por vacío) vuelve a su valor inicial
    if(typeof hojaInicial==="function"){
      let saved=false;
      const fill=(d,v)=>{if(Array.isArray(d))return Array.isArray(v)?v:(v&&typeof v==="object"?Object.values(v):saved?[]:d);
        if(d&&typeof d==="object"){const o={...(v||{})};for(const k in d)o[k]=fill(d[k],o[k]);return o}
        return v===undefined||v===null?d:v};
      // Una hoja ya guardada con listas vacías no recupera las cartas iniciales
      // Las hojas de antes del creador (sin v:2) empiezan de cero
      for(const k of ids){if(st.hojas[k]&&st.hojas[k].v!==2)delete st.hojas[k];saved=!!st.hojas[k];st.hojas[k]=fill(hojaInicial(k),st.hojas[k])}
    }
    // Lugares y tiendas nuevos aparecen con sus valores iniciales sin tocar los ya guardados
    if(typeof mundoInicial==="function"){
      const base=mundoInicial(),m=st.mundo||{};
      st.mundo={...m,nivel:Math.max(1,Math.min(10,+m.nivel||1)),lugares:{...base.lugares,...(m.lugares||{})},tiendas:{...base.tiendas,...(m.tiendas||{})}};
      for(const k in st.mundo.lugares)st.mundo.lugares[k].nota=st.mundo.lugares[k].nota||"";
      for(const k in st.mundo.tiendas)st.mundo.tiendas[k].nota=st.mundo.tiendas[k].nota||"";
    }
    return st;
  },
  async init(RuleError){
    this.RuleError=RuleError;
    const cfg=window.FIREBASE_CONFIG;
    if(!cfg||!cfg.databaseURL){this.mode="local";this.state=null;this.emit();return}
    // Hay configuración pero la librería de Firebase no cargó (bloqueador, red): mejor avisar que fingir
    if(!window.firebase){console.error("No se pudo cargar Firebase");this.mode="error";this.emit();return}
    try{
      const app=firebase.apps.length?firebase.app():firebase.initializeApp(cfg);
      this.ref=app.database().ref(this.path);
      firebase.database().ref(".info/connected").on("value",s=>{if(this.mode!=="wait"){this.mode=s.val()?"live":"offline";this.emit()}});
      await new Promise(res=>{
        this.ref.on("value",s=>{this.state=this.fix(s.val());if(this.mode==="wait")this.mode="live";this.emit();res()},
          e=>{console.error(e);this.mode="error";this.emit();res()});
      });
    }catch(e){console.error(e);this.mode="error";this.emit()}
  },
  async mutate(fn){
    if(this.mode==="local"){const n=fn(this.state?structuredClone(this.state):null);this.state=this.fix(n);this.emit();return}
    if(!this.ref)throw new this.RuleError("Sin conexión con la tienda.");
    let ruleErr=null;
    const r=await this.ref.transaction(cur=>{
      ruleErr=null;
      try{return fn(this.fix(cur?structuredClone(cur):null))}
      catch(e){
        if(!(e instanceof this.RuleError))throw e;
        ruleErr=e;
        // Con el valor aún sin cargar devolvemos null: Firebase reintenta con el del servidor
        return cur===null?null:undefined;
      }
    },undefined,false);
    if(ruleErr)throw ruleErr;
    if(!r.committed)throw new this.RuleError("No se pudo guardar. Prueba otra vez.");
  }
};
