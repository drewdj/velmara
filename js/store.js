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
    st.botes=st.botes||{};st.log=Array.isArray(st.log)?st.log:Object.values(st.log||{});st.stock=st.stock||{};st.pjs=st.pjs||{};
    for(const k in st.pjs){const p=st.pjs[k];p.inv=p.inv||{};p.arma=p.arma??null;p.sec=p.sec??null;p.armadura=p.armadura??null;p.vales=p.vales||0}
    for(const k in st.botes){st.botes[k].aportes=st.botes[k].aportes||{}}
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
    if(this.mode==="local"){const n=fn(this.state?structuredClone(this.state):null);this.state=n;this.emit();return}
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
