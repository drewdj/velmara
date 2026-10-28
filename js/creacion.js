/* Creación y subida de nivel de personajes, según el Core Rulebook de Daggerheart (SRD 1.0).
   Aquí están las reglas como datos (clases, subclases, ascendencias, comunidades, equipo de tier 1, avances)
   y calcHoja(), que saca de la hoja todo lo que se calcula solo: evasión, PG, estrés, umbrales, armadura y daño. */
const F=(n,t)=>({n,t});
const CLASE_INFO={
 bard:{items:["Una novela romántica","Una carta que nunca abriste"],
  esp:F("Montar una escena","Gasta 3 Esperanza para Distraer temporalmente a un objetivo a Cercana: −2 a su Dificultad."),
  rasgos:[F("Arenga","Una vez por sesión, describe cómo arengas al grupo y da a cada uno (tú incluido) un Dado de Arenga: d6 a nivel 1, d8 desde nivel 5. Se suma a una tirada de acción, reacción o daño, o limpia tanto Estrés como saque. Los no gastados se pierden al final de la sesión.")],
  subs:[
   {id:"trovador",n:"Trovador",en:"Troubadour",sc:"pre",d:"Música para dar fuerza a los tuyos.",
    base:[F("Intérprete nato","Tres canciones, una vez cada una por descanso largo. Relajante: tú y tus aliados a Cercana limpiáis 1 PG. Épica: un objetivo a Cercana queda Vulnerable temporalmente. Desgarradora: tú y tus aliados a Cercana ganáis 1 Esperanza.")],
    esp:[F("Maestro","Cuando das un Dado de Arenga, ese aliado gana 1 Esperanza o limpia 1 Estrés.")],
    mae:[F("Virtuoso","Puedes cantar cada canción de «Intérprete nato» dos veces por descanso largo.")]},
   {id:"orador",n:"Orador",en:"Wordsmith",sc:"pre",d:"Palabras ingeniosas que cautivan a la gente.",
    base:[F("Discurso inspirador","Una vez por descanso largo, un discurso sentido: todos tus aliados a Lejana limpian 2 Estrés."),F("Alma de poeta","Tras una tirada de acción para impresionar, persuadir u ofender, puedes gastar 1 Esperanza para sumar 1d4.")],
    esp:[F("Elocuente","Una vez por sesión, al animar a un aliado: encuentra un objeto común que necesite, o le Ayudas sin gastar Esperanza, o gana un movimiento de descanso extra en su próximo descanso.")],
    mae:[F("Poesía épica","Tu Dado de Arenga pasa a d10. Al Ayudar a un aliado narrando su hazaña como en unas memorias, tiras d10 como dado de ventaja.")]}],
  preg:["¿Quién de tu comunidad te enseñó a confiar tanto en ti?","Estuviste enamorado una vez. ¿De quién, y cómo te hizo daño?","Siempre has admirado a otro bardo. ¿Quién es y por qué lo idolatras?"],
  conex:["¿Qué te hizo ver que íbamos a ser tan buenos amigos?","¿Qué hago que te molesta?","¿Por qué me coges de la mano por la noche?"]},
 druid:{items:["Una bolsita de piedras y huesos","Un colgante extraño encontrado en la tierra"],
  esp:F("Evolución","Gasta 3 Esperanza para adoptar una Forma bestial sin marcar Estrés; además, +1 a un rasgo mientras dure esa forma."),
  rasgos:[F("Forma bestial","Marca 1 Estrés para transformarte en una criatura de tu tier o menor. En esa forma no usas armas ni lanzas hechizos de cartas, pero sí tus demás rasgos; sumas su bonificador a tu Evasión y atacas con su rasgo y su daño. Si marcas tu último PG, vuelves a tu forma."),
   F("Toque salvaje","A voluntad, efectos naturales pequeños e inofensivos: hacer crecer una flor, una brisa, encender una hoguera.")],
  subs:[
   {id:"elementos",n:"Guardián de los Elementos",en:"Warden of the Elements",sc:"ins",d:"Encarna los elementos de lo salvaje.",
    base:[F("Encarnación elemental","Marca 1 Estrés para Canalizar un elemento hasta que recibas daño Grave o descanses. Fuego: quien te dañe en Cuerpo a cuerpo recibe 1d10 mágico. Tierra: +Competencia a tus umbrales. Agua: al dañar a alguien en Cuerpo a cuerpo, los demás enemigos a Muy Cercana marcan 1 Estrés. Aire: flotas y tienes ventaja en tiradas de Agilidad.")],
    esp:[F("Aura elemental","Una vez por descanso, mientras Canalizas, un aura a Cercana. Fuego: el enemigo que marque PG marca también 1 Estrés. Tierra: tus aliados +1 a Fuerza. Agua: si te dañan, marca 1 Estrés para mover al atacante dentro de Muy Cercana. Aire: el daño de ataques más allá de Cuerpo a cuerpo a ti o a un aliado se reduce 1d8.")],
    mae:[F("Dominio elemental","Mientras Canalizas. Fuego: +1 a Competencia en ataques y hechizos de daño. Tierra: al marcar PG, tira 1d6 por PG; cada 6 marca uno menos. Agua: si un ataque te acierta, marca 1 Estrés para dejar al atacante Vulnerable. Aire: +1 a Evasión y puedes volar.")]},
   {id:"renovacion",n:"Guardián de la Renovación",en:"Warden of Renewal",sc:"ins",d:"Magia poderosa para curar al grupo.",
    base:[F("Claridad natural","Una vez por descanso largo, creas un espacio sereno a Cercana. Descansar unos minutos ahí limpia tanto Estrés como tu Instinto, repartido entre tú y tus aliados."),F("Regeneración","Toca a una criatura y gasta 3 Esperanza: limpia 1d4 PG.")],
    esp:[F("Alcance regenerador","«Regeneración» llega a Muy Cercana."),F("Protección del guardián","Una vez por descanso largo, gasta 2 Esperanza: 1d4 aliados a Cercana limpian 2 PG.")],
    mae:[F("Defensor","En Forma bestial, cuando un aliado a Cercana marque 2 o más PG, puedes marcar 1 Estrés para que marque uno menos.")]}],
  preg:["¿Por qué tu comunidad dependía tanto de la naturaleza y sus criaturas?","¿Cuál fue el primer animal salvaje con el que te uniste? ¿Por qué terminó ese vínculo?","¿Quién te está dando caza? ¿Qué quiere de ti?"],
  conex:["¿Qué me confiaste para que me lance al peligro por ti cada vez?","¿A qué animal digo que te pareces?","¿Qué mote cariñoso me has puesto?"]},
 guardian:{items:["Un tótem de tu mentor","Una llave secreta"],
  esp:F("Tanque de primera línea","Gasta 3 Esperanza para limpiar 2 casillas de Armadura."),
  rasgos:[F("Imparable","Una vez por descanso largo, te vuelves Imparable con un Dado Imparable (d4 a nivel 1, d6 desde nivel 5) empezando en 1. Cada vez que tu daño haga marcar PG, súbelo uno; si se pasa del máximo o acaba la escena, se termina. Mientras dure: reduces un umbral la gravedad del daño físico, sumas el valor del dado a tu daño y no puedes quedar Inmovilizado ni Vulnerable.")],
  subs:[
   {id:"firme",n:"Firme",en:"Stalwart",sc:null,d:"Aguanta golpes duros y sigue luchando.",
    base:[F("Inquebrantable","+1 permanente a tus umbrales de daño."),F("Voluntad de hierro","Al recibir daño físico, puedes marcar una casilla de Armadura extra para reducir la gravedad.")],
    esp:[F("Implacable","+2 permanente a tus umbrales de daño."),F("Compañeros de armas","Cuando un aliado a Muy Cercana recibe daño, puedes marcar una casilla de Armadura para reducir un umbral la gravedad.")],
    mae:[F("Impertérrito","+3 permanente a tus umbrales de daño."),F("Protector leal","Si un aliado a Cercana con 2 PG o menos va a recibir daño, marca 1 Estrés para correr a su lado y recibirlo tú.")]},
   {id:"venganza",n:"Venganza",en:"Vengeance",sc:null,d:"Abate a quien os haga daño.",
    base:[F("Tranquilo","Una casilla de Estrés más."),F("Revancha","Si un enemigo en Cuerpo a cuerpo te acierta, marca 2 Estrés para que marque 1 PG.")],
    esp:[F("Represalia","Si un enemigo daña a un aliado en Cuerpo a cuerpo, +1 a tu Competencia en tu siguiente ataque acertado contra él.")],
    mae:[F("Némesis","Gasta 2 Esperanza para Priorizar a un enemigo hasta tu próximo descanso: al atacarle puedes intercambiar tus dados de Esperanza y Miedo. Solo uno a la vez.")]}],
  preg:["¿A quién de tu comunidad no pudiste proteger, y por qué sigues pensando en esa persona?","Te encargaron proteger algo importante y llevarlo a un lugar peligroso. ¿Qué es y adónde va?","Consideras que tienes una debilidad. ¿Cuál es y cómo te ha afectado?"],
  conex:["¿Cómo te salvé la vida la primera vez que nos vimos?","¿Qué regalo pequeño te hice que siempre llevas encima?","¿Qué mentira te he contado sobre mí que te crees del todo?"]},
 ranger:{items:["Un trofeo de tu primera presa","Una brújula que parece rota"],
  esp:F("Contenerlos","Al acertar un ataque con arma, gasta 3 Esperanza para usar esa misma tirada contra dos enemigos más a su alcance."),
  rasgos:[F("Foco del explorador","Gasta 1 Esperanza y ataca. Si aciertas, haces el daño normal y el objetivo pasa a ser tu Foco: sabes en qué dirección está, cuando le dañas marca 1 Estrés y, si fallas contra él, puedes terminar el Foco para repetir los dados de Dualidad.")],
  subs:[
   {id:"bestia",n:"Vinculado a la bestia",en:"Beastbound",sc:"agi",d:"Un vínculo profundo con un animal.",
    base:[F("Compañero","Tienes un animal compañero (Evasión 10, dos Experiencias a +2, ataque d6 en Cuerpo a cuerpo). Al subir de nivel, eliges también una mejora para él.")],
    esp:[F("Entrenamiento experto","Una mejora más para tu compañero."),F("Unidos en combate","Si te ataca un enemigo que está al alcance cuerpo a cuerpo de tu compañero, +2 a tu Evasión contra ese ataque.")],
    mae:[F("Entrenamiento avanzado","Dos mejoras más para tu compañero."),F("Amigo leal","Una vez por descanso largo, si un ataque fuera a marcar el último Estrés de tu compañero o tu último PG, estando a Cercana, uno corre a recibirlo por el otro.")]},
   {id:"buscasendas",n:"Buscasendas",en:"Wayfinder",sc:"agi",d:"Caza a tu presa y golpea con fuerza letal.",
    base:[F("Depredador implacable","Al tirar daño, marca 1 Estrés para +1 a tu Competencia. Si haces daño Grave, el enemigo marca 1 Estrés."),F("Camino adelante","Si vas a un sitio donde ya estuviste, o llevas algo que estuvo allí, conoces el camino más corto.")],
    esp:[F("Depredador esquivo","Cuando tu Foco te ataca, +2 a tu Evasión contra ese ataque.")],
    mae:[F("Depredador supremo","Antes de atacar a tu Foco, gasta 1 Esperanza: si aciertas, quitas 1 Miedo al DM.")]}],
  preg:["Una criatura terrible hirió a tu comunidad y juraste cazarla. ¿Qué es y qué rastro deja?","Tu primera presa casi te mata. ¿Qué era y qué parte de ti cambió para siempre?","Has recorrido tierras peligrosas, pero ¿a qué lugar te niegas a ir?"],
  conex:["¿Qué competición amistosa tenemos?","¿Por qué actúas distinto cuando estamos a solas?","¿De qué amenaza me has pedido que esté pendiente, y por qué te preocupa?"]},
 rogue:{items:["Útiles de falsificación","Un garfio con cuerda"],
  esp:F("Esquiva del pícaro","Gasta 3 Esperanza: +2 a tu Evasión hasta que un ataque te acierte (o hasta tu próximo descanso)."),
  rasgos:[F("Encubierto","Cuando estarías Oculto, estás Encubierto: además, sigues sin ser visto si te quedas quieto aunque un enemigo llegue a donde podría verte. Al atacar o acabar un movimiento a la vista de un enemigo, dejas de estarlo."),
   F("Ataque furtivo","Al acertar un ataque estando Encubierto, o con un aliado en Cuerpo a cuerpo de tu objetivo, suma tantos d6 como tu tier al daño.")],
  subs:[
   {id:"nocturno",n:"Caminante nocturno",en:"Nightwalker",sc:"fin",d:"Manipula las sombras para moverte.",
    base:[F("Paso de sombra","Al entrar en una zona oscura o en una sombra, marca 1 Estrés para reaparecer en otra sombra a Lejana. Reapareces Encubierto.")],
    esp:[F("Nube oscura","Tirada de Lanzamiento (15): una nube oscura a Cercana; nadie ve a través de ella y quedas Encubierto frente a quien no te vea."),F("Adrenalina","Mientras estés Vulnerable, suma tu nivel a tus tiradas de daño.")],
    mae:[F("Sombra fugaz","+1 permanente a tu Evasión; «Paso de sombra» llega a Muy Lejana."),F("Desaparición","Marca 1 Estrés para quedar Encubierto en cualquier momento (y librarte de Inmovilizado) hasta que saques Miedo o descanses.")]},
   {id:"sindicato",n:"Sindicato",en:"Syndicate",sc:"fin",d:"Una red de contactos allá donde vayas.",
    base:[F("Bien relacionado","En cada pueblo o lugar importante conoces a alguien de allí. Ponle nombre, di para qué puede servir y elige: te debe un favor pero es difícil de encontrar; pedirá algo a cambio; siempre está metido en líos; estuvisteis juntos; no acabasteis bien.")],
    esp:[F("Contactos por todas partes","Una vez por sesión, un contacto turbio aparece: te da una herramienta u objeto que haga falta, o +3 a tu dado de Esperanza o Miedo en la siguiente tirada, o suma 2d8 a tu siguiente daño.")],
    mae:[F("Refuerzos fiables","«Contactos por todas partes» tres veces por sesión, con dos opciones más: te protege y marcas 1 PG menos, o te respalda en una conversación y tiras d20 como dado de Esperanza.")]}],
  preg:["¿Qué te pillaron haciendo para que te desterraran de tu comunidad?","Tenías otra vida e intentas dejarla atrás. ¿Quién de tu pasado te sigue persiguiendo?","¿De quién te costó más despedirte?"],
  conex:["¿Qué te convencí de hacer hace poco que nos metió en un lío?","¿Qué he descubierto de tu pasado que guardo en secreto?","¿A quién conoces de mi pasado, y cómo influye en lo que piensas de mí?"]},
 seraph:{items:["Un fardo de ofrendas","El símbolo de tu dios"],
  esp:F("Soporte vital","Gasta 3 Esperanza: un aliado a Cercana limpia 1 PG."),
  rasgos:[F("Dados de plegaria","Al empezar cada sesión, tira tantos d4 como tu rasgo de Lanzamiento. Puedes gastarlos para ti o un aliado a Lejana: reducir daño recibido, sumar a una tirada ya hecha o ganar esa Esperanza. Los no gastados se pierden al final de la sesión.")],
  subs:[
   {id:"portador",n:"Portador divino",en:"Divine Wielder",sc:"fue",d:"Domina el campo de batalla con un arma legendaria.",
    base:[F("Arma espiritual","Tu arma equipada de Cuerpo a cuerpo o Muy Cercana puede volar para atacar a Cercana y volver. Marca 1 Estrés para alcanzar a otro enemigo con la misma tirada."),F("Toque compasivo","Una vez por descanso largo, toca a una criatura: limpia 2 PG o 2 Estrés.")],
    esp:[F("Devoto","Al tirar tus Dados de plegaria, tira uno más y descarta el menor. «Toque compasivo» dos veces por descanso largo.")],
    mae:[F("Resonancia sagrada","En el daño de «Arma espiritual», los dados que coincidan valen el doble.")]},
   {id:"centinela",n:"Centinela alado",en:"Winged Sentinel",sc:"fue",d:"Vuela y golpea con fuerza desde el cielo.",
    base:[F("Alas de luz","Puedes volar. Volando: marca 1 Estrés para cargar con alguien de tu tamaño o menor; gasta 1 Esperanza para +1d8 de daño al acertar.")],
    esp:[F("Rostro etéreo","Volando, ventaja en tiradas de Presencia. Si aciertas con Esperanza una de Presencia, puedes quitar 1 Miedo al DM en vez de ganar Esperanza.")],
    mae:[F("Ascendido","+4 permanente a tu umbral Grave."),F("Poder de los dioses","Volando, el daño extra de «Alas de luz» es 1d12.")]}],
  preg:["¿A qué dios te consagraste? ¿Qué hazaña increíble hizo por ti en un momento desesperado?","¿Cómo cambió tu aspecto al hacer tu juramento?","¿De qué forma extraña te comunicas con tu dios?"],
  conex:["¿Qué promesa me hiciste aceptar por si mueres en batalla?","¿Por qué me haces tantas preguntas sobre mi dios?","Me has pedido proteger a un miembro del grupo por encima de todos, incluso de ti. ¿A quién y por qué?"]},
 sorcerer:{items:["Un orbe que susurra","Una reliquia familiar"],
  esp:F("Magia volátil","Gasta 3 Esperanza para repetir cualquier número de dados de daño de un ataque mágico."),
  rasgos:[F("Sentido arcano","Notas la presencia de personas y objetos mágicos a Cercana."),F("Ilusión menor","Tirada de Lanzamiento (10): una ilusión visual no más grande que tú a Cercana, convincente desde Cercana o más lejos."),
   F("Canalizar poder bruto","Una vez por descanso largo, pasa una carta de dominio de tu mano al baúl y gana tanta Esperanza como su nivel, o suma el doble de su nivel al daño de un hechizo.")],
  subs:[
   {id:"elemental",n:"Origen elemental",en:"Elemental Origin",sc:"ins",d:"Canaliza magia bruta con la forma de un elemento.",
    base:[F("Elementalista","Elige aire, tierra, fuego, rayo o agua. Puedes darle formas inofensivas. Gasta 1 Esperanza y describe cómo te ayuda en una tirada: +2 a la tirada o +3 a su daño.")],
    esp:[F("Evasión natural","Si un ataque te acierta, marca 1 Estrés y describe cómo te defiende tu elemento: suma 1d6 a tu Evasión contra él.")],
    mae:[F("Trascendencia","Una vez por descanso largo, te conviertes en tu elemento hasta tu próximo descanso. Elige dos: +4 al umbral Grave, +1 a un rasgo, +1 a Competencia, +2 a Evasión.")]},
   {id:"primigenio",n:"Origen primigenio",en:"Primal Origin",sc:"ins",d:"Amplía tus hechizos de formas potentes.",
    base:[F("Manipular la magia","Tras lanzar un hechizo o atacar con un arma mágica, marca 1 Estrés para: ampliar un alcance, +2 a la tirada, doblar un dado de daño o alcanzar a otro objetivo.")],
    esp:[F("Ayuda encantada","Al Ayudar con una tirada de Lanzamiento tiras d8 como dado de ventaja. Una vez por descanso largo, puedes intercambiar los dados de Dualidad de ese aliado.")],
    mae:[F("Carga arcana","Quedas Cargado al recibir daño mágico o gastando 2 Esperanza. Al acertar un ataque mágico Cargado, gasta la Carga para +10 al daño o +3 a la Dificultad de la reacción que provoque.")]}],
  preg:["¿Qué hiciste para que la gente de tu comunidad desconfíe de ti?","¿Qué mentor te enseñó a controlar tu magia, y por qué ya no puede guiarte?","Tienes un miedo profundo que escondes. ¿Cuál es y por qué te asusta?"],
  conex:["¿Por qué confías tanto en mí?","¿Qué hice para que tengas cuidado conmigo?","¿Por qué guardamos en secreto nuestro pasado en común?"]},
 warrior:{items:["El dibujo de alguien a quien amas","Una piedra de afilar"],
  esp:F("Sin piedad","Gasta 3 Esperanza: +1 a tus tiradas de ataque hasta tu próximo descanso."),
  rasgos:[F("Ataque de oportunidad","Si un enemigo en Cuerpo a cuerpo intenta salir, tirada de reacción con el rasgo que elijas contra su Dificultad. Si aciertas, elige uno (dos con crítico): no se mueve, le haces el daño de tu arma principal o te mueves con él."),
   F("Entrenamiento de combate","Ignoras la carga al equiparte armas. Al hacer daño físico, suma tu nivel a la tirada.")],
  subs:[
   {id:"valiente",n:"Llamada del valiente",en:"Call of the Brave",sc:null,d:"Usa la fuerza de tus enemigos para alimentar la tuya.",
    base:[F("Coraje","Si fallas una tirada con Miedo, ganas 1 Esperanza."),F("Ritual de batalla","Una vez por descanso largo, antes de algo muy peligroso o de un rival muy superior, describe tu ritual: limpia 2 Estrés y gana 2 Esperanza.")],
    esp:[F("Crecerse ante el reto","Con 2 PG o menos sin marcar, puedes tirar d20 como dado de Esperanza.")],
    mae:[F("Camaradería","Una Tirada en equipo más por sesión, y a quien la inicie contigo solo le cuesta 2 Esperanza.")]},
   {id:"matador",n:"Llamada del matador",en:"Call of the Slayer",sc:null,d:"Abate enemigos con una fuerza inmensa.",
    base:[F("Matador","En una tirada con Esperanza, puedes guardar un d6 de Matador en vez de ganar Esperanza (tantos como tu Competencia). Gástalos en ataque o daño. Al final de la sesión, cada uno sin gastar se convierte en 1 Esperanza.")],
    esp:[F("Especialista en armas","Al acertar, gasta 1 Esperanza para sumar un dado de daño de tu arma secundaria. Una vez por descanso largo, repite los 1 de tus dados de Matador.")],
    mae:[F("Preparación marcial","El grupo gana el movimiento de descanso «Preparación marcial»: quien lo elige gana un d6 de Matador.")]}],
  preg:["¿Quién te enseñó a luchar, y por qué se quedó cuando te fuiste de casa?","Hace años alguien te derrotó y te dejó por muerto. ¿Quién fue y cómo te traicionó?","¿Qué lugar legendario siempre has querido visitar, y por qué es tan especial?"],
  conex:["Nos conocíamos mucho antes de este grupo. ¿De qué?","¿Con qué tarea cotidiana te suelo ayudar fuera del combate?","¿Qué miedo te estoy ayudando a superar?"]},
 wizard:{items:["Un libro que intentas traducir","Una diminuta mascota elemental inofensiva"],
  esp:F("Esta vez no","Gasta 3 Esperanza para obligar a un enemigo a Lejana a repetir una tirada de ataque o de daño."),
  rasgos:[F("Prestidigitación","A voluntad, efectos mágicos pequeños: cambiar un color, crear un olor, encender una vela, hacer flotar algo diminuto, iluminar una sala o reparar un objeto pequeño."),
   F("Patrones extraños","Elige un número del 1 al 12. Cuando lo saques en un dado de Dualidad, gana 1 Esperanza o limpia 1 Estrés. Puedes cambiarlo en un descanso largo.")],
  subs:[
   {id:"conocimiento",n:"Escuela del Conocimiento",en:"School of Knowledge",sc:"con",d:"Entiende a fondo el mundo que te rodea.",
    base:[F("Preparado","Una carta de dominio más de tu nivel o menor."),F("Experto","Al usar una Experiencia, puedes marcar 1 Estrés en vez de gastar Esperanza; entonces su bonificador cuenta doble.")],
    esp:[F("Consumado","Una carta de dominio más de tu nivel o menor."),F("Memoria perfecta","Una vez por descanso, al recuperar una carta del baúl, su coste baja 1.")],
    mae:[F("Brillante","Una carta de dominio más de tu nivel o menor."),F("Pericia afinada","Al usar una Experiencia, tira 1d6: con 5 o más, no gastas Esperanza.")]},
   {id:"guerra",n:"Escuela de la Guerra",en:"School of War",sc:"con",d:"Magia entrenada para la violencia.",
    base:[F("Mago de batalla","Una casilla de PG más."),F("Enfréntate a tu miedo","Si aciertas un ataque con Miedo, +1d10 de daño mágico.")],
    esp:[F("Conjurar escudo","Mientras tengas al menos 2 Esperanza, suma tu Competencia a tu Evasión."),F("Alimentado por el miedo","El daño extra de «Enfréntate a tu miedo» pasa a 2d10.")],
    mae:[F("Prosperar en el caos","Al acertar, tras tirar daño, marca 1 Estrés para que el objetivo marque 1 PG más."),F("Sin miedo","El daño extra de «Enfréntate a tu miedo» pasa a 3d10.")]}],
  preg:["¿Qué responsabilidades confiaba tu comunidad en ti? ¿Cómo les fallaste?","Llevas la vida buscando un libro u objeto muy importante. ¿Cuál es y por qué?","Tienes un rival poderoso. ¿Quién es y por qué quieres vencerle?"],
  conex:["¿Qué favor te he pedido que no sabes si podrás cumplir?","¿Qué afición rara compartimos?","¿Qué secreto mío te he confiado solo a ti?"]}
};
// Ascendencias: dos rasgos cada una. Con ascendencia mixta se toma el primero de una y el segundo de otra.
const ASCENDENCIAS=[
 {id:"clank",n:"Clank",d:"Seres mecánicos con conciencia, de metal, madera o piedra.",f:[F("Diseño con propósito","Decide quién te hizo y para qué. Elige la Experiencia que mejor encaje con ese propósito: +1 permanente."),F("Eficiente","En un descanso corto puedes elegir un movimiento de descanso largo.")]},
 {id:"drakona",n:"Drakona",d:"Como dragones sin alas en forma humanoide, con aliento elemental.",f:[F("Escamas","Si fueras a recibir daño Grave, marca 1 Estrés para marcar 1 PG menos."),F("Aliento elemental","Elige un elemento. Puedes usar tu aliento contra objetivos a Muy Cercana como un arma de Instinto de d8 mágico con tu Competencia.")]},
 {id:"enano",n:"Enano",d:"Bajos, anchos y muy resistentes; piel y uñas duras.",f:[F("Piel gruesa","Si recibes daño Menor, puedes marcar 2 Estrés en vez de 1 PG."),F("Fortaleza","Gasta 3 Esperanza para reducir a la mitad un daño físico recibido.")]},
 {id:"elfo",n:"Elfo",d:"Altos, de orejas puntiagudas y sentidos agudos.",f:[F("Reflejos rápidos","Marca 1 Estrés para tener ventaja en una tirada de reacción."),F("Trance celestial","En un descanso, entras en trance y eliges un movimiento de descanso más.")]},
 {id:"hada",n:"Hada",d:"Humanoides alados con rasgos de insecto.",f:[F("Doblasuertes","Una vez por sesión, tras una tirada de acción tuya o de un aliado a Cercana, gasta 3 Esperanza para repetir los dados de Dualidad."),F("Alas","Puedes volar. Volando, tras el ataque de un enemigo, marca 1 Estrés para +2 a tu Evasión contra él.")]},
 {id:"fauno",n:"Fauno",d:"Humanoides con rasgos de cabra, cuernos y pezuñas.",f:[F("Salto caprino","Saltas a cualquier punto a Cercana como si te movieras normal, salvando obstáculos y huecos."),F("Coz","Al acertar en Cuerpo a cuerpo, marca 1 Estrés para patear: +2d6 de daño y tú o el objetivo salís despedidos a Muy Cercana.")]},
 {id:"firbolg",n:"Firbolg",d:"Humanoides bovinos, altos, fuertes y peludos.",f:[F("Embestida","Si aciertas una tirada de Agilidad para pasar de Lejana o Muy Lejana a Cuerpo a cuerpo, marca 1 Estrés: 1d12 físico a todos los que estén en Cuerpo a cuerpo."),F("Inamovible","Cuando fueras a marcar Estrés, tira 1d6: con 6, no lo marcas.")]},
 {id:"fungril",n:"Fungril",d:"Humanoides seta, de mil formas y colores.",f:[F("Red fúngica","Tirada de Instinto (12) para hablar con otros fungril a cualquier distancia por tu red de micelio."),F("Conexión con la muerte","Tocando un cadáver reciente, marca 1 Estrés para sacarle un recuerdo ligado a una emoción o sensación.")]},
 {id:"galapa",n:"Galapa",d:"Tortugas antropomorfas con un caparazón donde se esconden.",f:[F("Caparazón","Suma tu Competencia a tus umbrales de daño."),F("Replegarse","Marca 1 Estrés para meterte en el caparazón: resistencia al daño físico, desventaja en tiradas de acción y no puedes moverte.")]},
 {id:"gigante",n:"Gigante",d:"Enormes, de brazos largos y de uno a tres ojos.",f:[F("Aguante","Una casilla de PG más al crear el personaje."),F("Alcance","Lo que tenga alcance Cuerpo a cuerpo cuenta como Muy Cercana.")]},
 {id:"goblin",n:"Goblin",d:"Pequeños, de ojos grandes y orejas enormes.",f:[F("Pie firme","Ignoras la desventaja en tiradas de Agilidad."),F("Sentido del peligro","Una vez por descanso, marca 1 Estrés para que un enemigo repita un ataque contra ti o un aliado a Muy Cercana.")]},
 {id:"mediano",n:"Mediano",d:"Pequeños, de pies grandes y peludos, con brújula interior.",f:[F("Traesuertes","Al empezar cada sesión, todo el grupo gana 1 Esperanza."),F("Brújula interior","Si sacas un 1 en tu dado de Esperanza, puedes repetirlo.")]},
 {id:"humano",n:"Humano",d:"Manos hábiles, orejas redondas y cuerpos hechos para aguantar.",f:[F("Gran aguante","Una casilla de Estrés más al crear el personaje."),F("Adaptabilidad","Si fallas una tirada en la que usaste una Experiencia, marca 1 Estrés para repetirla.")]},
 {id:"infernis",n:"Infernis",d:"Descendientes de demonios, con cuernos y colmillos.",f:[F("Sin miedo","Si sacas Miedo, puedes marcar 2 Estrés para convertirlo en Esperanza."),F("Rostro temible","Ventaja en tiradas para intimidar a criaturas hostiles.")]},
 {id:"katari",n:"Katari",d:"Humanoides felinos de garras retráctiles.",f:[F("Instinto felino","En una tirada de Agilidad, gasta 2 Esperanza para repetir el dado de Esperanza."),F("Garras retráctiles","Tirada de Agilidad para arañar a alguien en Cuerpo a cuerpo: si aciertas, queda Vulnerable temporalmente.")]},
 {id:"orco",n:"Orco",d:"Rasgos cuadrados y colmillos de jabalí.",f:[F("Robusto","Con 1 PG restante, los ataques contra ti tienen desventaja."),F("Colmillos","Al acertar en Cuerpo a cuerpo, gasta 1 Esperanza para cornear: +1d6 de daño.")]},
 {id:"ribbet",n:"Ribbet",d:"Ranas antropomorfas de manos y pies palmeados.",f:[F("Anfibio","Respiras y te mueves con naturalidad bajo el agua."),F("Lengua larga","Te agarras a cosas a Cercana con la lengua. Marca 1 Estrés para usarla como arma de Fineza a Cercana de d12 físico con tu Competencia.")]},
 {id:"simiah",n:"Simiah",d:"Simios antropomorfos de extremidades largas y pies prensiles.",f:[F("Trepador nato","Ventaja en tiradas de Agilidad para mantener el equilibrio y trepar."),F("Ágil","+1 permanente a tu Evasión al crear el personaje.")]}
];
const COMUNIDADES=[
 {id:"highborne",n:"Highborne",es:"De alta cuna",d:"Una vida de elegancia, riqueza y prestigio en lo más alto de la sociedad.",adj:"afable, franco, intrigante, emprendedor, ostentoso, imperturbable",f:F("Privilegio","Ventaja en tiradas para tratar con nobles, negociar precios o usar tu reputación para conseguir lo que quieres.")},
 {id:"loreborne",n:"Loreborne",es:"Del saber",d:"Una sociedad que valora el conocimiento académico o político.",adj:"directo, elocuente, curioso, paciente, apasionado, ingenioso",f:F("Leído","Ventaja en tiradas sobre la historia, la cultura o la política de una persona o lugar importante.")},
 {id:"orderborne",n:"Orderborne",es:"Del orden",d:"Un colectivo centrado en la disciplina o la fe.",adj:"ambicioso, benévolo, pensativo, prudente, sardónico, estoico",f:F("Entregado","Anota tres dichos o valores de tu crianza. Una vez por descanso, si describes cómo encarnas uno en tu acción, tira d20 como dado de Esperanza.")},
 {id:"ridgeborne",n:"Ridgeborne",es:"De las cumbres",d:"Criado entre picos rocosos y acantilados.",adj:"audaz, curtido, indomable, leal, reservado, testarudo",f:F("Firme","Ventaja en tiradas para cruzar acantilados y cornisas peligrosos, moverte por entornos duros y usar tus conocimientos de supervivencia.")},
 {id:"seaborne",n:"Seaborne",es:"Del mar",d:"Vivir en o junto a una gran masa de agua.",adj:"franco, cooperativo, exultante, fiero, resuelto, curtido",f:F("Conocer la marea","Al sacar Miedo, pon una ficha en tu carta de comunidad (máximo tu nivel). Antes de una tirada de acción, gasta las que quieras: +1 por ficha. Se pierden al final de la sesión.")},
 {id:"slyborne",n:"Slyborne",es:"De los bajos fondos",d:"Un grupo al margen de la ley: ladrones, timadores y contrabandistas.",adj:"calculador, astuto, temible, perspicaz, sagaz, tenaz",f:F("Granuja","Ventaja en tiradas para negociar con criminales, detectar mentiras o encontrar un buen escondite.")},
 {id:"underborne",n:"Underborne",es:"Del subsuelo",d:"Una sociedad subterránea, de madrigueras a grandes ciudades en cavernas.",adj:"sereno, escurridizo, indomable, inventivo, ingenioso, sencillo",f:F("Vida en penumbra","Con poca luz o mucha sombra, ventaja en tiradas para esconderte, investigar o percibir detalles en esa zona.")},
 {id:"wanderborne",n:"Wanderborne",es:"Nómada",d:"Una vida errante, sin hogar fijo, entre muchas culturas.",adj:"inescrutable, magnánimo, alegre, fiable, avispado, poco convencional",f:F("Fardo nómada","Llevas un Fardo nómada. Una vez por sesión, gasta 1 Esperanza para sacar de él un objeto común que te venga bien.")},
 {id:"wildborne",n:"Wildborne",es:"Del bosque",d:"Criado en lo profundo del bosque, cuidando de la tierra.",adj:"curtido, leal, protector, solitario, sabio, vibrante",f:F("Pie ligero","Te mueves en silencio. Ventaja en tiradas para moverte sin que te oigan.")}
];
const ASC=Object.fromEntries(ASCENDENCIAS.map(a=>[a.id,a])),COM=Object.fromEntries(COMUNIDADES.map(c=>[c.id,c]));
const SUB=Object.fromEntries(Object.entries(CLASE_INFO).flatMap(([k,c])=>c.subs.map(s=>[s.id,{...s,clase:k}])));
const RASGO=Object.fromEntries(RASGOS.map(([k,n])=>[k,n]));
// Equipo de tier 1 para empezar (no está en las tiendas: va a la lista del PJ como objeto propio)
const W1=(g,id,n,tr,a,d,h,f)=>({g,id:"t1-"+id,n,tr,a,d,h,f:f||"",tier:1});
const T1_ARMAS=[
 W1("fis","espada-ancha","Espada ancha","Agilidad","Cuerpo a cuerpo","d8 fís",1,"Fiable: +1 a las tiradas de ataque."),
 W1("fis","espada-larga","Espada larga","Agilidad","Cuerpo a cuerpo","d8+3 fís",2),
 W1("fis","hacha","Hacha de batalla","Fuerza","Cuerpo a cuerpo","d10+3 fís",2),
 W1("fis","mandoble","Mandoble","Fuerza","Cuerpo a cuerpo","d10+3 fís",2,"Masivo: −1 a Evasión; al acertar, tira un dado de daño extra y descarta el menor."),
 W1("fis","maza","Maza","Fuerza","Cuerpo a cuerpo","d8+1 fís",1),
 W1("fis","martillo","Martillo de guerra","Fuerza","Cuerpo a cuerpo","d12+3 fís",2,"Pesado: −1 a Evasión."),
 W1("fis","daga","Daga","Fineza","Cuerpo a cuerpo","d8+1 fís",1),
 W1("fis","baston","Bastón","Instinto","Cuerpo a cuerpo","d10+3 fís",2),
 W1("fis","alfanje","Alfanje","Presencia","Cuerpo a cuerpo","d8+1 fís",1),
 W1("fis","estoque","Estoque","Presencia","Cuerpo a cuerpo","d8 fís",1,"Rápido: al atacar, puedes marcar 1 Estrés para atacar a otra criatura a tu alcance."),
 W1("fis","alabarda","Alabarda","Fuerza","Muy Cercana","d10+2 fís",2,"Engorrosa: −1 a Fineza."),
 W1("fis","lanza","Lanza","Fineza","Muy Cercana","d10+2 fís",2,"Engorrosa: −1 a Fineza."),
 W1("fis","arco-corto","Arco corto","Agilidad","Lejana","d6+3 fís",2),
 W1("fis","ballesta","Ballesta","Fineza","Lejana","d6+1 fís",1),
 W1("fis","arco-largo","Arco largo","Agilidad","Muy Lejana","d8+3 fís",2,"Engorroso: −1 a Fineza."),
 W1("mag","guanteletes","Guanteletes arcanos","Fuerza","Cuerpo a cuerpo","d10+3 mág",2),
 W1("mag","hacha-sagrada","Hacha consagrada","Fuerza","Cuerpo a cuerpo","d8+1 mág",1),
 W1("mag","anillos","Anillos brillantes","Agilidad","Muy Cercana","d10+1 mág",2),
 W1("mag","runas","Runas de mano","Instinto","Muy Cercana","d10 mág",1),
 W1("mag","hoja-retornante","Hoja retornante","Fineza","Cercana","d8 mág",1,"Retornante: al lanzarla dentro de su alcance, vuelve a tu mano tras el ataque."),
 W1("mag","baston-corto","Bastón corto","Instinto","Cercana","d8+1 mág",1),
 W1("mag","baston-doble","Bastón doble","Instinto","Lejana","d6+3 mág",2),
 W1("mag","cetro","Cetro","Presencia","Lejana","d6 mág",2,"Versátil: también se usa así: Presencia, Cuerpo a cuerpo, d8."),
 W1("mag","varita","Varita","Conocimiento","Lejana","d6+1 mág",1),
 W1("mag","gran-baston","Gran bastón","Conocimiento","Muy Lejana","d6 mág",2,"Potente: al acertar, tira un dado de daño extra y descarta el menor."),
 W1("sec","espada-corta","Espada corta","Agilidad","Cuerpo a cuerpo","d8 fís",1,"Emparejada: +2 al daño del arma principal contra objetivos en Cuerpo a cuerpo."),
 W1("sec","escudo-redondo","Escudo redondo","Fuerza","Cuerpo a cuerpo","d4 fís",1,"Protector: +1 a la puntuación de Armadura."),
 W1("sec","escudo-torre","Escudo torre","Fuerza","Cuerpo a cuerpo","d6 fís",1,"Barrera: +2 a la puntuación de Armadura; −1 a Evasión."),
 W1("sec","daga-pequena","Daga pequeña","Fineza","Cuerpo a cuerpo","d8 fís",1,"Emparejada: +2 al daño del arma principal contra objetivos en Cuerpo a cuerpo."),
 W1("sec","latigo","Látigo","Presencia","Muy Cercana","d6 fís",1,"Sobresalto: marca 1 Estrés para hacer chasquear el látigo y que los enemigos en Cuerpo a cuerpo retrocedan a Cercana."),
 W1("sec","garfio","Garfio de agarre","Fineza","Cercana","d6 fís",1,"Enganche: al acertar, puedes atraer al objetivo a Cuerpo a cuerpo."),
 W1("sec","ballesta-mano","Ballesta de mano","Fineza","Lejana","d6+1 fís",1)
];
const T1_ARMADURAS=[
 {id:"t1-gambeson",n:"Gambesón",u:"5 / 11",sc:3,f:"Flexible: +1 a Evasión.",tier:1},
 {id:"t1-cuero",n:"Armadura de cuero",u:"6 / 13",sc:3,f:"",tier:1},
 {id:"t1-cota",n:"Cota de malla",u:"7 / 15",sc:4,f:"Pesada: −1 a Evasión.",tier:1},
 {id:"t1-placas",n:"Placas completas",u:"8 / 17",sc:4,f:"Muy pesada: −2 a Evasión y −1 a Agilidad.",tier:1}
];
const T1=Object.fromEntries([...T1_ARMAS,...T1_ARMADURAS].map(x=>[x.id,x]));
const REPARTO=[2,1,1,0,0,-1]; // valores de rasgo al crear el personaje

/* Subir de nivel. Cada nivel: logros de tier (niveles 2, 5 y 8), dos avances con casilla libre de tu tier o anterior,
   +1 a los umbrales (ya va en el nivel) y una carta de dominio nueva. Casillas por tier, como en la hoja oficial. */
const AVANCES=[
 {k:"rasgos",n:"+1 a dos rasgos sin marcar",d:"Quedan marcados hasta el siguiente logro de tier (niveles 5 y 8)."},
 {k:"pg",n:"Una casilla de PG más"},
 {k:"estres",n:"Una casilla de Estrés más"},
 {k:"exp",n:"+1 a dos Experiencias"},
 {k:"carta",n:"Una carta de dominio más",d:"De tu nivel o menor."},
 {k:"ev",n:"+1 a tu Evasión"},
 {k:"sub",n:"Mejorar tu subclase",d:"Especialización y, después, maestría. Tacha el multiclase de este tier.",min:3},
 {k:"comp",n:"+1 a tu Competencia",d:"Cuenta como los dos avances del nivel. Un dado de daño más.",coste:2,min:3},
 {k:"multi",n:"Multiclase",d:"Cuenta como los dos avances. Una clase más: uno de sus dominios, su rasgo de clase y una base de subclase.",coste:2,min:3}
];
const AV=Object.fromEntries(AVANCES.map(a=>[a.k,a]));
const CASILLAS={rasgos:3,pg:2,estres:2,exp:1,carta:1,ev:1,sub:1,comp:1,multi:1};
const tierDe=n=>n<=1?1:n<=4?2:n<=7?3:4;
const epocaDe=n=>n>=8?2:n>=5?1:0; // los rasgos marcados se limpian en los niveles 5 y 8
function subidasDe(h){return Object.entries(h.subidas||{}).map(([k,s])=>({...s,l:+k.slice(1)})).filter(s=>s.l>1).sort((a,b)=>a.l-b.l)}
function avancesDe(h){return subidasDe(h).flatMap(s=>(s.a||[]).map(a=>({...a,l:s.l,t:a.t||tierDe(s.l)})))}
// Casillas libres de un avance para quien sube a nivel n
function casillasLibres(h,k,n){const T=tierDe(n),A=avancesDe(h);let libres=0;
  for(let t=2;t<=T;t++){if((AV[k].min||2)>t)continue;
    // Multiclase y mejora de subclase se excluyen en el mismo tier; multiclase, una sola vez en toda la hoja
    if(k==="multi"&&(A.some(a=>a.k==="multi")||A.some(a=>a.k==="sub"&&a.t===t)))continue;
    if(k==="sub"&&A.some(a=>a.k==="multi"&&a.t===t))continue;
    libres+=Math.max(0,CASILLAS[k]-A.filter(a=>a.k===k&&a.t===t).length)}
  return libres}
const rasgosMarcados=(h,n)=>new Set(avancesDe(h).filter(a=>a.k==="rasgos"&&epocaDe(a.l)===epocaDe(n)).flatMap(a=>a.r||[]));
const nivelSub=h=>Math.min(3,1+avancesDe(h).filter(a=>a.k==="sub").length);
const multiDe=h=>avancesDe(h).find(a=>a.k==="multi")||null;
// Dominios a los que tiene acceso (los de su clase y, con multiclase, el elegido)
function dominiosDe(h){const c=CLASES[h.clase];const m=multiDe(h);return m?.dom?[...c.dom,m.dom]:c.dom.slice()}
function cartaPermitida(h,x,n){const c=CLASES[h.clase];if(c.dom.includes(x.d))return x.lv<=n;const m=multiDe(h);return !!m&&m.dom===x.d&&x.lv<=Math.ceil(n/2)}

// Rasgos de ascendencia que tiene (primero de una, segundo de otra si es mixta)
function rasgosAsc(h){const a=ASC[h.asc1],b=ASC[h.asc2||h.asc1];return [a?.f[0],b?.f[1]].filter(Boolean)}
const tieneAsc=(h,i,id)=>(i===0?h.asc1:(h.asc2||h.asc1))===id;
function nombreAsc(h){if(h.ascN)return h.ascN;const a=ASC[h.asc1]?.n,b=h.asc2&&h.asc2!==h.asc1?ASC[h.asc2]?.n:"";return [a,b].filter(Boolean).join(" / ")||""}

// Modificadores fijos que trae el texto del equipo (Evasión, Armadura, umbrales y rasgos)
function modsEquipo(f){const m={ev:0,arm:0,um:0,r:{}};if(!f)return m;const s=f.replace(/−/g,"-");
  const T={"Agilidad":"agi","Fuerza":"fue","Fineza":"fin","Instinto":"ins","Presencia":"pre","Conocimiento":"con"};
  for(const x of s.matchAll(/([+-]\d+) a (?:la |tu |tus )?(Evasión|puntuación de Armadura|umbrales de daño|Agilidad|Fuerza|Fineza|Instinto|Presencia|Conocimiento)(?! hasta| contra| mientras)/g)){
    const v=+x[1],k=x[2];if(k==="Evasión")m.ev+=v;else if(k==="puntuación de Armadura")m.arm+=v;else if(k==="umbrales de daño")m.um+=v;else m.r[T[k]]=(m.r[T[k]]||0)+v}
  return m}

/* Todo lo que se calcula de la hoja. Lo que el jugador ajusta a mano va en h.aj y se suma al final. */
function calcHoja(st,id){
  const h=st.hojas[id],s=st.pjs[id]||{},c=CLASES[h.clase]||CLASES.warrior,n=h.nivel||1,A=avancesDe(h),aj=h.aj||{};
  const r={};for(const [k] of RASGOS)r[k]=+(h.rasgos?.[k]||0);
  let ev=c.ev,pg=c.pg,es=6,comp=1,um=0,ug=0,arm=0;
  const L=[];// de dónde sale cada cosa, para explicarlo en la hoja
  comp+=[2,5,8].filter(x=>n>=x).length;
  for(const a of A){if(a.k==="rasgos")(a.r||[]).forEach(k=>r[k]++);if(a.k==="pg")pg++;if(a.k==="estres")es++;if(a.k==="ev")ev++;if(a.k==="comp")comp++}
  if(tieneAsc(h,0,"gigante")){pg++;L.push("Aguante: +1 PG")}
  if(tieneAsc(h,0,"humano")){es++;L.push("Gran aguante: +1 Estrés")}
  if(tieneAsc(h,1,"simiah")){ev++;L.push("Ágil: +1 Evasión")}
  const sub=SUB[h.sub],ns=nivelSub(h);
  if(h.sub==="firme"){const b=[1,3,6][ns-1];um+=b;L.push(`Firme: +${b} a los umbrales`)}
  if(h.sub==="venganza"){es++;L.push("Tranquilo: +1 Estrés")}
  if(h.sub==="guerra"){pg++;L.push("Mago de batalla: +1 PG")}
  if(h.sub==="centinela"&&ns>=3){ug+=4;L.push("Ascendido: +4 al umbral Grave")}
  if(h.sub==="nocturno"&&ns>=3){ev++;L.push("Sombra fugaz: +1 Evasión")}
  if(tieneAsc(h,0,"galapa")){um+=comp;L.push(`Caparazón: +${comp} (Competencia) a los umbrales`)}
  // Equipo: armadura y armas equipadas
  const G=k=>s[k]?gearInfo(st,id,s[k]):null,ga=G("armadura"),gw=[G("arma"),G("sec")].filter(Boolean);
  const pieza=[ga?.a,...gw.map(g=>g.w)].filter(Boolean);
  for(const x of pieza){const m=modsEquipo(x.f);ev+=m.ev;arm+=m.arm;um+=m.um;for(const k in m.r)r[k]+=m.r[k]}
  ev+=+aj.ev||0;pg+=+aj.pg||0;es+=+aj.es||0;comp+=+aj.comp||0;um+=+aj.um||0;arm+=+aj.arm||0;
  let mayor,grave,sc=0;
  if(ga?.a){const [m,g]=ga.a.u.split("/").map(x=>+x.trim());mayor=m+n+um;grave=g+n+um+ug;sc=ga.a.sc}
  else{mayor=n+um;grave=2*n+um+ug}
  sc=Math.max(0,Math.min(12,sc+arm));
  // Ataques: tantos dados como Competencia; el guerrero suma su nivel al daño físico
  const TR={"Agilidad":"agi","Fuerza":"fue","Fineza":"fin","Instinto":"ins","Presencia":"pre","Conocimiento":"con"};
  const ataques=gw.filter(g=>g.w).map(g=>{const w=g.w,[dado,tipo]=w.d.split(" "),mm=dado.match(/^d(\d+)([+-]\d+)?$/);
    let extra=mm?+(mm[2]||0):0;if(h.clase==="warrior"&&tipo==="fís")extra+=n;
    const dmg=mm?`${comp}d${mm[1]}${extra?(extra>0?"+":"")+extra:""}`:dado;
    return {n:w.n,rasgo:w.tr,mod:r[TR[w.tr]]??0,alc:w.a,dmg,tipo:tipo==="mág"?"mágico":"físico",sec:g.slot==="sec"}});
  return {r,ev,pg:Math.max(1,pg),es:Math.max(1,es),esp:6,comp:Math.max(1,comp),mayor,grave,arm:sc,armN:ga?.n||"",ataques,
    sc:sub?.sc||null,nsub:ns,tier:tierDe(n),L};
}
// Rasgos de subclase que tiene ahora (base, especialización, maestría)
function rasgosSub(h){const s=SUB[h.sub];if(!s)return [];const ns=nivelSub(h);return [...s.base.map(f=>({...f,t2:"Base"})),...(ns>=2?s.esp.map(f=>({...f,t2:"Especialización"})):[]),...(ns>=3?s.mae.map(f=>({...f,t2:"Maestría"})):[])]}
