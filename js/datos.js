/* Datos de Velmara: personajes, lugares, catálogo de la tienda y equipo de tier 2 (SRD y Hope & Fear). */
const PJS=[
 {id:"cora",n:"C.O.R.A",j:"Adrián",c:"Mago · Clank"},
 {id:"chimpok",n:"Chimpok",j:"Andrés",c:"Explorador · Simiah"},
 {id:"fungrino",n:"Fungrino",j:"Quique",c:"Bardo · Fungril"},
 {id:"galeryon",n:"Galeryon",j:"Gabriel",c:"Guerrero · Drakona"},
 {id:"geliberto",n:"Geliberto",j:"Mateo",c:"Hechicero · Infernis"},
 // Solo para el DM: no sale al elegir personaje y ve todo lo que hay, compartido o no
 {id:"prueba",n:"PJ de prueba",j:"DM",c:"Lo ve todo",prueba:true}
];
const RAR={c:{n:"Común",p:1},pc:{n:"Poco común",p:2},r:{n:"Raro",p:4},rec:{n:"Receta"}};
const MAX_CONS=5;

// k: cons (consumible) | obj (reutilizable) | rec (receta). s: unidades (sin s = ilimitado)
const ITEMS=[
 // Comunes
 {id:"p-men-salud",n:"Poción menor de salud",r:"c",k:"cons",s:3,t:"Limpia 1d4 PG."},
 {id:"p-men-res",n:"Poción menor de resistencia",r:"c",k:"cons",s:3,t:"Limpia 1d4 Estrés."},
 {id:"p-atributo",n:"Poción de atributo",r:"c",k:"cons",s:3,t:"+1 a la próxima tirada del rasgo que elijas al comprarla."},
 {id:"veneno-grindle",n:"Veneno de diente de grindle",r:"c",k:"cons",s:2,t:"En un arma física: +1d6 a la siguiente tirada de daño."},
 {id:"hojas-varik",n:"Hojas de Varik",r:"c",k:"cons",s:2,t:"Ganas 2 Esperanza."},
 {id:"gota-lunar",n:"Vial de gota lunar",r:"c",k:"cons",s:1,t:"Ves en oscuridad total hasta tu próximo descanso."},
 {id:"frag-inestable",n:"Fragmento arcano inestable",r:"c",k:"cons",s:1,t:"Tirada de Fineza contra un grupo a Lejana: 1d20 de daño mágico."},
 {id:"vela-protectora",n:"Vela protectora",r:"c",k:"cons",s:1,t:"Halo de luz a Cercana durante 1 hora; quien tenga malas intenciones no puede entrar.",hf:1},
 {id:"pastilla-lira",n:"Pastilla de lira",r:"c",k:"cons",s:1,t:"Imitas cualquier voz que hayas oído hasta el final de la escena.",hf:1},
 {id:"hierba-pipa",n:"Hierba de pipa",r:"c",k:"cons",s:2,t:"En un descanso corto, quienes elijan limpiar Estrés limpian 1 más.",hf:1},
 {id:"saco-dormir",n:"Saco de dormir de calidad",r:"c",k:"obj",s:1,t:"En el descanso, limpias 1 Estrés automáticamente."},
 {id:"carcaj",n:"Carcaj cargador",r:"c",k:"obj",s:1,t:"Al acertar con una flecha de este carcaj, suma tu tier al daño (ahora +2)."},
 {id:"antorcha",n:"Antorcha de Alistair",r:"c",k:"obj",s:1,t:"Se enciende a voluntad e ilumina una cueva como si fuera de día."},
 {id:"orbes",n:"Orbes comunicadores",r:"c",k:"obj",s:1,t:"Dos portadores hablan entre sí a cualquier distancia."},
 {id:"capa-arcana",n:"Capa arcana",r:"c",k:"obj",s:1,t:"Si tienes rasgo de lanzamiento, cambias su color, textura y tamaño a voluntad."},
 {id:"piedra-apariencia",n:"Piedra de apariencia",r:"c",k:"obj",s:1,t:"Memoriza el aspecto de alguien que veas; gasta 1 Esperanza para copiarlo como ilusión."},
 {id:"abrojos",n:"Abrojos",r:"c",k:"obj",s:1,t:"Los esparces a Muy Cercana; quien cruce con prisa marca 1 Estrés.",hf:1},
 {id:"garfio",n:"Garfio",r:"c",k:"obj",s:1,t:"Ventaja en tiradas de acción para escalar paredes lisas.",hf:1},
 {id:"catalejo",n:"Catalejo élfico",r:"c",k:"obj",s:1,t:"Aumenta tu vista cien veces.",hf:1},
 // Poco comunes
 {id:"p-salud",n:"Poción de salud",r:"pc",k:"cons",s:2,t:"Limpia 1d4+1 PG."},
 {id:"p-res",n:"Poción de resistencia",r:"pc",k:"cons",s:2,t:"Limpia 1d4+1 Estrés."},
 {id:"polvo-chasquido",n:"Polvo de chasquido",r:"pc",k:"cons",s:2,t:"Marca 1 Estrés y limpia 1 PG."},
 {id:"p-estabilidad",n:"Poción de estabilidad",r:"pc",k:"cons",s:1,t:"Un movimiento de descanso adicional."},
 {id:"arcilla",n:"Arcilla cambiante",r:"pc",k:"cons",s:1,t:"Gasta 1 Esperanza: tu rostro es irreconocible hasta el próximo descanso."},
 {id:"humo-oscuro",n:"Vial de humo oscuro",r:"pc",k:"cons",s:1,t:"Cuando te ataquen, tira tantos d6 como tu Agilidad y suma el mayor a tu Evasión."},
 {id:"branquias",n:"Ungüento de branquias",r:"pc",k:"cons",s:1,t:"Respiras bajo el agua tantos minutos como tu nivel."},
 {id:"costurador",n:"Costurador de armadura",r:"pc",k:"cons",s:1,t:"Gasta X Esperanza y limpia X espacios de Armadura."},
 {id:"frag-mejorado",n:"Fragmento arcano mejorado",r:"pc",k:"cons",s:1,t:"Como el inestable, pero 2d20 de daño mágico."},
 {id:"leche-yakamel",n:"Leche de yakamel",r:"pc",k:"cons",s:1,t:"La próxima vez que limpies PG, limpias 1 más.",hf:1},
 {id:"limo-rojo",n:"Aceite de limo rojo",r:"pc",k:"cons",s:1,t:"Tu siguiente ataque con éxito hace +1d8 mágico y el objetivo queda Ardiendo (1d4 mágico al tomar el foco).",hf:1},
 {id:"niebla-cisca",n:"Botella de niebla cisca",r:"pc",k:"cons",s:1,t:"Niebla a Cercana: quien entra limpia 1 Estrés y queda Oculto.",hf:1},
 {id:"semilla-espino",n:"Semilla de espino",r:"pc",k:"cons",s:1,t:"La lanzas a un punto visible: Restringe temporalmente a todos a Cercana de ese punto.",hf:1},
 {id:"botella-duende",n:"Botella de duende",r:"pc",k:"cons",s:1,t:"Cuando marcas tu último PG, se rompe y limpias todos tus PG.",hf:1},
 {id:"estuche",n:"Estuche para compañero",r:"pc",k:"obj",s:1,t:"Un compañero animal pequeño dentro es inmune al daño y a efectos dañinos."},
 {id:"prisma",n:"Prisma arcano",r:"pc",k:"obj",s:1,t:"Lo colocas y activas: aliados a Cercana +1 a lanzamiento. No se mueve; tras apagarlo, no funciona hasta el próximo descanso largo."},
 {id:"flechas-perf",n:"Flechas perforantes",r:"pc",k:"obj",s:1,t:"3 veces por descanso, al acertar, suma tu Competencia al daño."},
 {id:"piedra-valor",n:"Piedra del valor",r:"pc",k:"obj",s:1,t:"Una armadura sin rasgo gana Resistente: antes de marcar tu último espacio de Armadura, tira 1d6; con 6, reduce la gravedad un umbral sin marcarlo."},
 {id:"duende-corrector",n:"Duende corrector",r:"pc",k:"obj",s:1,t:"Una vez por descanso corto, ventaja en una tirada de ataque."},
 {id:"guardasaberes",n:"Guardasaberes",r:"pc",k:"obj",s:1,t:"Guarda hasta 3 criaturas hostiles; +1 a tus tiradas de acción contra ellas."},
 {id:"cuerda",n:"Cuerda que se ata sola",r:"pc",k:"obj",s:1,t:"Se ata o desata cuando se lo ordenas.",hf:1},
 {id:"brujula",n:"Brújula del ladrón",r:"pc",k:"obj",s:1,t:"En interiores señala la salida más cercana; en exteriores, la entrada más cercana.",hf:1},
 {id:"anillo-retorno",n:"Anillo de retorno",r:"pc",k:"obj",s:1,t:"Al lanzar tu arma principal, vuelve a tu mano tras el ataque.",hf:1},
 {id:"cenidor",n:"Ceñidor del titán",r:"pc",k:"obj",s:1,t:"Una vez por escena, +1 a Competencia en tu siguiente ataque.",hf:1},
 // Recetas (permanentes; fabricas 1 poción como movimiento de descanso)
 {id:"rec-men-salud",n:"Receta: poción menor de salud",r:"rec",k:"rec",p:2,mk:"p-men-salud",ing:"Un vial de sangre.",t:"Fabrica: limpia 1d4 PG."},
 {id:"rec-men-res",n:"Receta: poción menor de resistencia",r:"rec",k:"rec",p:2,mk:"p-men-res",ing:"Un hueso de criatura.",t:"Fabrica: limpia 1d4 Estrés."},
 {id:"rec-atributo",n:"Receta: poción de atributo",r:"rec",k:"rec",p:2,mk:"p-atributo",ing:"Algo ligado al rasgo: pluma (Agilidad), colmillo (Fuerza), hilo de araña (Fineza), musgo (Instinto), pétalo (Presencia), tinta (Conocimiento).",t:"Fabrica: +1 a la próxima tirada de ese rasgo."},
 {id:"rec-salud",n:"Receta: poción de salud",r:"rec",k:"rec",p:4,mk:"p-salud",ing:"Sangre de un adversario de tier 2 o superior.",t:"Fabrica: limpia 1d4+1 PG."},
 {id:"rec-res",n:"Receta: poción de resistencia",r:"rec",k:"rec",p:4,mk:"p-res",ing:"Hueso de un adversario de tier 2 o superior.",t:"Fabrica: limpia 1d4+1 Estrés."},
 {id:"rec-estabilidad",n:"Receta: poción de estabilidad",r:"rec",k:"rec",p:4,mk:"p-estabilidad",ing:"Savia de un árbol de Aelrennor, y marcar 3 Estrés.",t:"Fabrica: un movimiento de descanso adicional."},
 // Raros (vitrina)
 {id:"piedra-sangre",n:"Piedra de sangre",r:"r",k:"obj",s:1,t:"Un arma sin rasgo gana Brutal: cuando sacas el máximo en un dado de daño, tiras otro."},
 {id:"gran-piedra",n:"Gran piedra",r:"r",k:"obj",s:1,t:"Un arma sin rasgo gana Potente: tira un dado de daño extra y descarta el menor."},
 {id:"anillo-resist",n:"Anillo de resistencia",r:"r",k:"obj",s:1,t:"Una vez por descanso largo, tras recibir un ataque con éxito, recibes la mitad del daño."},
 {id:"colgante",n:"Colgante calmante",r:"r",k:"obj",s:1,t:"Cuando fueras a marcar tu último Estrés, tira 1d6; con 5 o más, no lo marcas."},
 {id:"homet",n:"Poción secreta de Homet",r:"r",k:"cons",s:1,t:"Tu siguiente ataque con éxito es crítico."},
 {id:"yorgi",n:"Sangre de Yorgi",r:"r",k:"cons",s:1,t:"Desapareces y reapareces en un punto que veas a Muy Lejana."},
 {id:"piedra-canal",n:"Piedra canalizadora",r:"r",k:"cons",s:1,t:"Sacas un conjuro o grimorio de tu reserva, lo usas una vez y lo devuelves."},
 {id:"lupa",n:"Lupa del encantador",r:"r",k:"obj",s:1,t:"Ves a través de ilusiones y encantamientos.",hf:1},
 {id:"moneda-eclipse",n:"Moneda del eclipse",r:"r",k:"obj",s:1,t:"Una vez por descanso, lánzala. Cara: +1 a ataque hasta que aciertes. Cruz: +1 a Evasión hasta que un ataque falle contra ti.",hf:1},
 {id:"sombrero",n:"Sombrero del hechicero",r:"r",k:"obj",s:1,t:"Una vez por descanso, lanzas un conjuro de tu reserva con coste de recuperación igual o menor que tu tier.",hf:1},
 {id:"hilo-cose",n:"Hilo que se cose solo",r:"r",k:"cons",s:1,t:"Limpia 1 PG o 2 espacios de Armadura.",hf:1}
];
const ITEM=Object.fromEntries(ITEMS.map(i=>[i.id,i]));
const price=i=>i.p ?? RAR[i.r].p;

// Entrega gratuita: 1 unidad de cada. a=alcance, h=manos
const ARMORS=[
 {id:"gambeson",n:"Gambesón mejorado",u:"7 / 16",sc:4,f:"Flexible: +1 a Evasión."},
 {id:"cuero",n:"Cuero mejorado",u:"9 / 20",sc:4,f:""},
 {id:"cota",n:"Cota de malla mejorada",u:"11 / 24",sc:5,f:"Pesada: −1 a Evasión."},
 {id:"placas",n:"Placas mejoradas",u:"13 / 28",sc:5,f:"Muy pesada: −2 a Evasión y −1 a Agilidad."},
 {id:"tunica",n:"Túnica de mago mejorada",u:"6 / 15",sc:3,f:"Encantada: suma tu rasgo de lanzamiento a tus umbrales.",hf:1},
 {id:"brigantina",n:"Brigantina mejorada",u:"9 / 19",sc:4,f:"Forrada: marca 1 Estrés para anular daño Menor.",hf:1},
 {id:"escamas",n:"Escamas mejoradas",u:"11 / 23",sc:4,f:"Engorrosa: −1 a Fineza.",hf:1},
 {id:"bandas",n:"Bandas mejoradas",u:"13 / 27",sc:5,f:"Voluminosa: −1 a Evasión; al recibir daño Grave, marca 1 Estrés.",hf:1},
 // Especiales de tier 2: 6 del manual básico y 7 de Hope & Fear
 {id:"elundria",n:"Cota de Elundria",u:"9 / 21",sc:4,f:"Protegida: reduces el daño mágico que recibes en tu puntuación de Armadura antes de compararlo con tus umbrales."},
 {id:"hueso-harrow",n:"Armadura de hueso de Harrow",u:"9 / 21",sc:4,f:"Resistente: antes de marcar tu última casilla de Armadura, tira 1d6; con un 6, reduce la gravedad un umbral sin marcar la casilla."},
 {id:"peto-hierrarbol",n:"Peto de hierrárbol",u:"9 / 20",sc:4,f:"Reforzado: al marcar tu última casilla de Armadura, tus umbrales suben +2 hasta que limpies al menos una casilla."},
 {id:"runetan-flotante",n:"Armadura flotante runetana",u:"9 / 20",sc:4,f:"Cambiante: cuando te atacan, puedes marcar una casilla de Armadura para dar desventaja a la tirada de ataque."},
 {id:"tyris-blanda",n:"Armadura blanda de Tyris",u:"8 / 18",sc:5,f:"Silenciosa: +2 a las tiradas para moverte sin hacer ruido."},
 {id:"rosasalvaje",n:"Armadura de rosa salvaje",u:"11 / 23",sc:5,f:"Esperanzada: cuando fueras a gastar 1 Esperanza, puedes marcar una casilla de Armadura en su lugar."},
 {id:"tunica-encantador",n:"Túnica del encantador",u:"9 / 20",sc:4,f:"Mnemónica: una vez por escena, recuperas una carta de dominio del baúl sin pagar su coste.",hf:1},
 {id:"manto-halcon",n:"Manto del guardián halcón",u:"9 / 20",sc:4,f:"Planeo: planeas hasta Lejana y no recibes daño por caídas.",hf:1},
 {id:"tunica-ara\u00f1a",n:"Túnica de seda de araña",u:"9 / 20",sc:4,f:"Trepamuros: +1 a Evasión; caminas por las paredes como por el suelo.",hf:1},
 {id:"habito-tormenta",n:"Hábito de hilo de tormenta",u:"9 / 20",sc:4,f:"Absorbente: una vez por escena, al recibir daño mágico, limpias una casilla de Armadura.",hf:1},
 {id:"tablillas-raromadera",n:"Tablillas de raromadera",u:"10 / 21",sc:5,f:"Zancada: no te pueden Inmovilizar y puedes moverte hasta Lejana como parte de una tirada de acción.",hf:1},
 {id:"coraza-trol",n:"Coraza de piel de trol",u:"11 / 23",sc:5,f:"Autocurativa: al descansar, limpias una casilla de Armadura.",hf:1},
 {id:"placas-sol",n:"Placas de sol doradas",u:"12 / 26",sc:5,f:"Resplandeciente: una vez por escena, al gastar Esperanza, limpias una casilla de Armadura.",hf:1}
];
const W=(g,id,n,tr,a,d,h,f)=>({g,id,n,tr,a,d,h,f:f||""});
const WEAPONS=[
 W("fis","espada-ancha","Espada ancha mejorada","Agilidad","Cuerpo a cuerpo","d8+3 fís",1,"Fiable: +1 a las tiradas de ataque."),
 W("fis","espada-larga","Espada larga mejorada","Agilidad","Cuerpo a cuerpo","d8+6 fís",2),
 W("fis","hacha-batalla","Hacha de batalla mejorada","Fuerza","Cuerpo a cuerpo","d10+6 fís",2),
 W("fis","mandoble","Mandoble mejorado","Fuerza","Cuerpo a cuerpo","d10+6 fís",2,"Masivo: −1 a Evasión; al acertar, tira un dado de daño extra y descarta el menor."),
 W("fis","maza","Maza mejorada","Fuerza","Cuerpo a cuerpo","d8+4 fís",1),
 W("fis","martillo","Martillo de guerra mejorado","Fuerza","Cuerpo a cuerpo","d12+6 fís",2,"Pesado: −1 a Evasión."),
 W("fis","daga","Daga mejorada","Fineza","Cuerpo a cuerpo","d8+4 fís",1),
 W("fis","baston","Bastón mejorado","Instinto","Cuerpo a cuerpo","d10+6 fís",2),
 W("fis","sable","Sable mejorado","Presencia","Cuerpo a cuerpo","d8+4 fís",1),
 W("fis","estoque","Estoque mejorado","Presencia","Cuerpo a cuerpo","d8+3 fís",1,"Rápido: al atacar, puedes marcar 1 Estrés para atacar a otra criatura a tu alcance."),
 W("fis","alabarda","Alabarda mejorada","Fuerza","Muy Cercana","d10+5 fís",2,"Engorrosa: −1 a Fineza."),
 W("fis","lanza","Lanza mejorada","Fineza","Muy Cercana","d10+5 fís",2,"Engorrosa: −1 a Fineza."),
 W("fis","arco-corto","Arco corto mejorado","Agilidad","Lejana","d6+6 fís",2),
 W("fis","ballesta","Ballesta mejorada","Fineza","Lejana","d6+4 fís",1),
 W("fis","arco-largo","Arco largo mejorado","Agilidad","Muy Lejana","d8+6 fís",2,"Engorroso: −1 a Fineza."),
 W("fis","falcata","Falcata dorada","Fuerza","Cuerpo a cuerpo","d10+4 fís",1,"Potente: al acertar, tira un dado de daño extra y descarta el menor."),
 W("fis","nudillos","Hojas de nudillo","Fuerza","Cuerpo a cuerpo","d10+6 fís",2,"Brutal: cuando sacas el máximo en un dado de daño, tira otro."),
 W("fis","urok","Espada ancha urok","Fineza","Cuerpo a cuerpo","d8+3 fís",1,"Mortal: cuando haces daño Grave, el objetivo marca 1 PG más."),
 W("fis","latigo-cuchillas","Látigo de cuchillas","Agilidad","Muy Cercana","d8+3 fís",1,"Rápido: al atacar, puedes marcar 1 Estrés para atacar a otra criatura a tu alcance."),
 W("fis","alabarda-acero","Alabarda de acero forjado","Fuerza","Muy Cercana","d8+4 fís",2,"Aterradora: al acertar, el objetivo marca 1 Estrés."),
 W("fis","guadana","Guadaña de guerra","Fineza","Muy Cercana","d8+5 fís",2,"Fiable: +1 a las tiradas de ataque."),
 W("fis","trabuco","Trabuco","Fineza","Cercana","d8+6 fís",2,"Recarga: tras atacar, tira 1d6; con 1, marca 1 Estrés para recargar antes de volver a disparar."),
 W("fis","gran-arco","Gran arco","Fuerza","Lejana","d6+6 fís",2,"Potente: al acertar, tira un dado de daño extra y descarta el menor."),
 W("fis","arco-pelofino","Arco de pelo fino","Agilidad","Muy Lejana","d6+5 fís",2,"Fiable: +1 a las tiradas de ataque."),
 W("mag","guanteletes","Guanteletes arcanos mejorados","Fuerza","Cuerpo a cuerpo","d10+6 mág",2),
 W("mag","hacha-consagrada","Hacha consagrada mejorada","Fuerza","Cuerpo a cuerpo","d8+4 mág",1),
 W("mag","anillos","Anillos brillantes mejorados","Agilidad","Muy Cercana","d10+5 mág",2),
 W("mag","runas","Runas de mano mejoradas","Instinto","Muy Cercana","d10+3 mág",1),
 W("mag","hoja-retornante","Hoja retornante mejorada","Fineza","Cercana","d8+3 mág",1,"Retornante: al lanzarla dentro de su alcance, vuelve a tu mano tras el ataque."),
 W("mag","baston-corto","Bastón corto mejorado","Instinto","Cercana","d8+4 mág",1),
 W("mag","baston-doble","Bastón doble mejorado","Instinto","Lejana","d6+6 mág",2),
 W("mag","cetro","Cetro mejorado","Presencia","Lejana","d6+3 mág",2,"Versátil: también Presencia, Cuerpo a cuerpo, d8+3."),
 W("mag","varita","Varita mejorada","Conocimiento","Lejana","d6+4 mág",1),
 W("mag","gran-baston","Gran bastón mejorado","Conocimiento","Muy Lejana","d6+3 mág",2,"Potente: al acertar, tira un dado de daño extra y descarta el menor."),
 W("mag","hoja-ego","Hoja del ego","Agilidad","Cuerpo a cuerpo","d12+4 mág",1,"Pomposa: necesitas Presencia 0 o menos para usarla."),
 W("mag","espada-lanzamiento","Espada de lanzamiento","Fuerza","Cuerpo a cuerpo","d10+4 mág",2,"Versátil: también Conocimiento, Lejana, d6+3."),
 W("mag","daga-devoradora","Daga devoradora","Fineza","Cuerpo a cuerpo","d8+4 mág",1,"Aterradora: al acertar, el objetivo marca 1 Estrés."),
 W("mag","martillo-exota","Martillo de Exota","Instinto","Cuerpo a cuerpo","d8+6 mág",2,"Eruptivo: al acertar en Cuerpo a cuerpo, los demás adversarios a Muy Cercana superan una reacción (14) o reciben la mitad del daño."),
 W("mag","arco-yutari","Arco de sangre yutari","Fineza","Lejana","d6+4 mág",2,"Brutal: cuando sacas el máximo en un dado de daño, tira otro."),
 W("mag","arco-anciano","Arco anciano","Instinto","Lejana","d6+4 mág",2,"Potente: al acertar, tira un dado de daño extra y descarta el menor."),
 W("mag","cetro-elias","Cetro de Elias","Presencia","Lejana","d6+3 mág",1,"Vigorizante: al acertar, tira 1d4; con 4, limpia 1 Estrés."),
 W("mag","varita-embeleso","Varita del embeleso","Presencia","Lejana","d6+4 mág",1,"Persuasiva: antes de una tirada de Presencia, puedes marcar 1 Estrés para sumar +2."),
 W("mag","baston-guardian","Bastón del guardián","Conocimiento","Lejana","d6+4 mág",2,"Fiable: +1 a las tiradas de ataque."),
 W("sec","espada-corta","Espada corta mejorada","Agilidad","Cuerpo a cuerpo","d8+2 fís",1,"Emparejada: +3 al daño del arma principal contra objetivos en Cuerpo a cuerpo."),
 W("sec","escudo-redondo","Escudo redondo mejorado","Fuerza","Cuerpo a cuerpo","d4+2 fís",1,"Protector: +2 a la puntuación de Armadura."),
 W("sec","escudo-torre","Escudo torre mejorado","Fuerza","Cuerpo a cuerpo","d6+2 fís",1,"Barrera: +3 a la puntuación de Armadura; −1 a Evasión."),
 W("sec","daga-pequena","Daga pequeña mejorada","Fineza","Cuerpo a cuerpo","d8+2 fís",1,"Emparejada: +3 al daño del arma principal contra objetivos en Cuerpo a cuerpo."),
 W("sec","latigo","Látigo mejorado","Presencia","Muy Cercana","d6+2 fís",1,"Sobresaltante: marca 1 Estrés para hacer retroceder a todos los adversarios en Cuerpo a cuerpo hasta Cercana."),
 W("sec","garfio-agarre","Garfio de agarre mejorado","Fineza","Cercana","d6+2 fís",1,"Enganche: al acertar, puedes atraer al objetivo a Cuerpo a cuerpo."),
 W("sec","ballesta-mano","Ballesta de mano mejorada","Fineza","Lejana","d6+3 fís",1),
 W("sec","escudo-pinchos","Escudo con pinchos","Fuerza","Cuerpo a cuerpo","d6+2 fís",1,"Doble función: +1 a la puntuación de Armadura; +1 al daño del arma principal en Cuerpo a cuerpo."),
 W("sec","daga-parada","Daga de parada","Fineza","Cuerpo a cuerpo","d6+2 fís",1,"Parada: cuando te atacan, tira los dados de daño de esta arma; los dados del atacante que coincidan con los tuyos se descartan."),
 W("sec","hacha-retornante","Hacha retornante","Agilidad","Cercana","d6+4 fís",1,"Retornante: al lanzarla dentro de su alcance, vuelve a tu mano tras el ataque."),
 // Hope & Fear (tier 2)
 {...W("fis","katana-mejorada","Katana mejorada","Agilidad","Cuerpo a cuerpo","d10+6 fís",2,"Rápida: al atacar, puedes marcar 1 Estrés para atacar también a otra criatura dentro del alcance."),hf:1},
 {...W("fis","nudilleras-mejoradas","Nudilleras de latón mejoradas","Fuerza","Cuerpo a cuerpo","d8+4 fís",1,""),hf:1},
 {...W("fis","cimitarra-mejorada","Cimitarra mejorada","Presencia","Cuerpo a cuerpo","d8+4 fís",1,""),hf:1},
 {...W("fis","daga-retorcida-mejorada","Daga retorcida mejorada","Conocimiento","Cuerpo a cuerpo","d8+3 fís",1,"Perforante: con el daño de esta arma, el umbral Mayor del objetivo cuenta con −2."),hf:1},
 {...W("fis","espada-latigo-mejorada","Espada látigo mejorada","Fineza","Muy Cercana","d8+3 fís",1,"Versátil: también se puede usar con Fineza, Cuerpo a cuerpo, d10+3."),hf:1},
 {...W("fis","dardo-cuerda-mejorado","Dardo de cuerda mejorado","Instinto","Cercana","d6+4 fís",2,""),hf:1},
 {...W("fis","pico-guerra","Pico de guerra","Fuerza","Cuerpo a cuerpo","d8+3 fís",1,"Letal: cuando haces daño Grave, el objetivo marca 1 PG adicional."),hf:1},
 {...W("fis","baston-estoque","Bastón estoque","Fineza","Cuerpo a cuerpo","d8+4 fís",1,"Retráctil: la hoja se esconde en el bastón para que no la detecten."),hf:1},
 {...W("fis","abanico-cuchillas","Abanico de cuchillas","Presencia","Cuerpo a cuerpo","d8+3 fís",1,"Parada: cuando te atacan, tira los dados de daño de esta arma; los dados del atacante que coincidan con los tuyos se descartan."),hf:1},
 {...W("fis","escalpelo-cirujano","Escalpelo de cirujano","Conocimiento","Cuerpo a cuerpo","d8+3 fís",1,"Aterrador: al acertar, el objetivo marca 1 Estrés."),hf:1},
 {...W("fis","lanza-justa","Lanza de justa","Instinto","Muy Cercana","d10+5 fís",2,"Engorrosa: −1 a Fineza."),hf:1},
 {...W("fis","jabalinas","Jabalinas","Agilidad","Muy Cercana","d6+6 fís",1,"Acopio: puedes lanzarla a un objetivo a Lejana con una tirada de Agilidad sin ir a por ella; siempre tienes otra a mano."),hf:1},
 {...W("mag","espada-brillante-mejorada","Espada brillante mejorada","Fuerza","Cuerpo a cuerpo","d10+6 mág",2,""),hf:1},
 {...W("mag","hoja-sombria-mejorada","Hoja sombría mejorada","Presencia","Cuerpo a cuerpo","d8+3 fís/mág",1,"De otro mundo: al acertar, eliges si el daño es físico o mágico."),hf:1},
 {...W("mag","chakram-mejorado","Chakram encantado mejorado","Fineza","Cercana","d6+4 mág",1,"Rebote: al lanzarlo vuelve a tu mano. Al atacar, puedes marcar 1 Estrés para atacar también a otra criatura a Muy Cercana del primer objetivo."),hf:1},
 {...W("mag","daga-conjuro-mejorada","Daga de conjuro mejorada","Instinto","Cercana","d6+3 mág",1,"Versátil: también se puede usar con Instinto, Cuerpo a cuerpo, d8+3."),hf:1},
 {...W("mag","pistola-runica-mejorada","Pistola rúnica mejorada","Conocimiento","Lejana","d6+6 mág",1,"Recarga: tras atacar, tira 1d6; con un 1, tienes que marcar 1 Estrés para recargarla antes de volver a disparar."),hf:1},
 {...W("mag","rifle-arcano-mejorado","Rifle arcano mejorado","Agilidad","Muy Lejana","d10+6 mág",2,"Apuntado: desventaja si el objetivo está a Muy Cercana de ti o en Cuerpo a cuerpo de un aliado; puedes marcar 1 Estrés para ignorarlo."),hf:1},
 {...W("mag","garrote-encantado","Garrote encantado","Fuerza","Cuerpo a cuerpo","d8+3 mág",1,"Protector: +1 a tu puntuación de Armadura."),hf:1},
 {...W("mag","cuchilla-desplazamiento","Cuchilla de desplazamiento","Fineza","Cuerpo a cuerpo","d8+3 mág",2,"Omnipresente: puedes atacar a objetivos a Muy Lejana, pero con desventaja."),hf:1},
 {...W("mag","brazaletes-hechizados","Brazaletes hechizados","Conocimiento","Cuerpo a cuerpo","d10+6 mág",2,""),hf:1},
 {...W("mag","gema-furia","Gema de furia","Instinto","Cercana","d8+3 mág",1,"Ardiente: si sacas el máximo en un dado de daño, el objetivo marca 1 Estrés."),hf:1},
 {...W("mag","laud-encantado","Laúd encantado","Presencia","Cercana","d8+3 mág",2,"Vigorizante: al acertar, tira 1d4; con un 4, limpias 1 Estrés."),hf:1},
 {...W("mag","arco-astillas","Arco de astillas","Agilidad","Lejana","d6+6 mág",2,"Andanada: gasta 1 Esperanza para atacar a un grupo dentro del alcance; los objetivos que superes reciben la mitad del daño."),hf:1},
 {...W("sec","hachuela-mejorada","Hachuela mejorada","Agilidad","Cuerpo a cuerpo","d8+2 fís",1,"Remate: al acertar con tu arma principal en Cuerpo a cuerpo, puedes marcar 1 Estrés para +1 a tu Competencia en ese ataque."),hf:1},
 {...W("sec","nudilleras-torpe-mejoradas","Nudilleras de mano torpe mejoradas","Fuerza","Cuerpo a cuerpo","d8+2 fís",1,"Emparejada: +3 al daño del arma principal contra objetivos en Cuerpo a cuerpo."),hf:1},
 {...W("sec","cuchillos-arrojadizos-mejorados","Cuchillos arrojadizos mejorados","Fineza","Cuerpo a cuerpo","d8+2 fís",1,"Acopio: puedes lanzarlos a Cercana con una tirada de Fineza sin ir a por ellos; siempre tienes otro a mano."),hf:1},
 {...W("sec","capa-combate-mejorada","Capa de combate mejorada","Presencia","Cuerpo a cuerpo","d4+2 fís",1,"Acolchada: +3 a tus umbrales de daño."),hf:1},
 {...W("sec","escudo-runico-mejorado","Escudo rúnico mejorado","Conocimiento","Cuerpo a cuerpo","d4+2 mág",1,"Protector: +2 a la puntuación de Armadura."),hf:1},
 {...W("sec","runas-foco-mejoradas","Runas de foco mejoradas","Instinto","Muy Cercana","d6+2 mág",1,"Enfocadas: +1 al daño del arma principal contra objetivos a Muy Cercana."),hf:1},
 {...W("sec","porra-plegable","Porra plegable","Fuerza","Cuerpo a cuerpo","d8 fís",1,"No letal: cuando un objetivo fuera a marcar PG por un ataque con esta arma, marca esa misma cantidad de Estrés."),hf:1},
 {...W("sec","brazal-sobrenatural","Brazal sobrenatural","Instinto","Cuerpo a cuerpo","d8 mág",1,"Desvío: cuando te atacan, puedes marcar una casilla de Armadura para sumar tu puntuación de Armadura a tu Evasión contra ese ataque."),hf:1},
 {...W("sec","baston-segmentado","Bastón segmentado","Agilidad","Muy Cercana","d6+4 fís",1,"Doble función: +1 a la puntuación de Armadura; +1 al daño del arma principal en Cuerpo a cuerpo."),hf:1},
 {...W("sec","alambre-cuchillas","Alambre de cuchillas","Fineza","Muy Cercana","d6+3 fís",1,"Enredo: al acertar con tu arma principal a un objetivo a Muy Cercana, puedes gastar 1 Esperanza para dejarlo temporalmente Vulnerable."),hf:1}
];
const ARMOR=Object.fromEntries(ARMORS.map(a=>[a.id,a]));
const WEAPON=Object.fromEntries(WEAPONS.map(w=>[w.id,w]));
const PJ=Object.fromEntries(PJS.map(p=>[p.id,p]));


// Lugares que los jugadores pueden visitar. El DM decide cuáles se ven y qué tiendas abren.
const LUGARES=[
 {id:"aelrennor",n:"Aelrennor",sub:"Capital civil del norte",
  desc:"Ciudad élfica entre árboles gigantes. Pasarelas y puentes entre ramas anchas como caminos, y un mercado en varias alturas que sube y baja con poleas.",
  tiendas:[
   {id:"tres-agujas",n:"Tienda de las Tres Agujas",sub:"Armería, botica y objetos recuperados",
    desc:"Taller de confianza de los Disipadores. Tres plataformas unidas alrededor del mismo árbol: armas abajo, frascos y raíces en medio, una vitrina arriba.",
    cita:"Tres vales por cabeza. Juntadlos o no, pero gastadlos con cabeza."}
  ]}
];
const TIENDA=Object.fromEntries(LUGARES.flatMap(l=>l.tiendas.map(t=>[t.id,{...t,lugar:l.id}])));

// Hoja de personaje. Clases del SRD: dominios, PG y Evasión iniciales.
const CLASES={
 bard:{n:"Bardo",dom:["Grace","Codex"],pg:5,ev:10}, druid:{n:"Druida",dom:["Sage","Arcana"],pg:6,ev:10},
 guardian:{n:"Guardián",dom:["Valor","Blade"],pg:7,ev:9}, ranger:{n:"Explorador",dom:["Bone","Sage"],pg:6,ev:12},
 rogue:{n:"Pícaro",dom:["Midnight","Grace"],pg:6,ev:12}, seraph:{n:"Serafín",dom:["Splendor","Valor"],pg:7,ev:9},
 sorcerer:{n:"Hechicero",dom:["Arcana","Midnight"],pg:6,ev:10}, warrior:{n:"Guerrero",dom:["Blade","Bone"],pg:6,ev:11},
 wizard:{n:"Mago",dom:["Codex","Splendor"],pg:5,ev:11}
};
const DOMINIOS={
 Arcana:{c:"#6A3FB5",n:"Arcana"}, Blade:{c:"#B8282E",n:"Filo"}, Bone:{c:"#7E7A74",n:"Hueso"}, Codex:{c:"#2E5FB0",n:"Códice"},
 Grace:{c:"#C23E8C",n:"Gracia"}, Midnight:{c:"#2A2340",n:"Medianoche"}, Sage:{c:"#3E8441",n:"Sabio"},
 Splendor:{c:"#D4A21C",n:"Esplendor"}, Valor:{c:"#DA6A1E",n:"Valor"}
};
const TIPO_CARTA={Spell:"Hechizo",Ability:"Habilidad",Grimoire:"Grimorio"};
const RASGOS=[["agi","Agilidad","Correr, saltar, maniobrar"],["fue","Fuerza","Levantar, golpear, agarrar"],["fin","Fineza","Controlar, ocultar, trastear"],
 ["ins","Instinto","Percibir, sentir, orientarse"],["pre","Presencia","Encandilar, actuar, engañar"],["con","Conocimiento","Recordar, analizar, comprender"]];
// Lo que ya sabemos de cada PJ (notas del vault); el resto lo rellena cada jugador
const PJ_BASE={
 cora:{clase:"wizard",sub:"Escuela del Conocimiento",asc:"Clank",com:"Loreborne",cartas:["mending-touch","book-of-illiat","book-of-tyfar"]},
 chimpok:{clase:"ranger",sub:"Beastbound",asc:"Simiah / Goblin",com:"Seaborne",cartas:["untouchable","vicious-entangle"]},
 fungrino:{clase:"bard",sub:"Wordsmith",asc:"Fungril / Giant",com:"Highborne",cartas:["inspirational-words","enrapture"]},
 galeryon:{clase:"warrior",sub:"Slayer",asc:"Drakona / Elfo",com:"Orderborne",cartas:["not-good-enough","whirlwind"]},
 geliberto:{clase:"sorcerer",sub:"Elemental",asc:"Infernis / Ribbet",com:"Wildborne",cartas:["unleash-chaos","rune-ward"]}
};
function hojaInicial(id){
  const b=PJ_BASE[id]||{clase:"warrior",sub:"",asc:"",com:"",cartas:[]},c=CLASES[b.clase];
  return {nivel:4,clase:b.clase,sub:b.sub,asc:b.asc,com:b.com,
    rasgos:{agi:0,fue:0,fin:0,ins:0,pre:0,con:0},evasion:c.ev,competencia:2,
    arm:{pts:0,mayor:0,grave:0},armMarc:0,
    pg:{max:c.pg,marc:0},estres:{max:6,marc:0},esperanza:2,
    exp:[{n:"",b:2},{n:"",b:2}],oro:{p:0,b:0,c:0},
    cartas:b.cartas.slice(),baul:[],notas:""};
}
