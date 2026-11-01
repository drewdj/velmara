// Ilustraciones base de equipo. Cargar después de cartas.js y antes de contenido.js.
// Los overrides del DM en Firebase conservan prioridad al mezclar el contenido.
(() => {
  const images = [
  {
    "category": "armaduras",
    "id": "gambeson",
    "img": "img/equipo/armaduras/gambeson-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "cuero",
    "img": "img/equipo/armaduras/cuero-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "cota",
    "img": "img/equipo/armaduras/cota-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "placas",
    "img": "img/equipo/armaduras/placas-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "tunica",
    "img": "img/equipo/armaduras/tunica-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "brigantina",
    "img": "img/equipo/armaduras/brigantina-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "escamas",
    "img": "img/equipo/armaduras/escamas-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "bandas",
    "img": "img/equipo/armaduras/bandas-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "elundria",
    "img": "img/equipo/armaduras/elundria-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "hueso-harrow",
    "img": "img/equipo/armaduras/hueso-harrow-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "peto-hierrarbol",
    "img": "img/equipo/armaduras/peto-hierrarbol-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "runetan-flotante",
    "img": "img/equipo/armaduras/runetan-flotante-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "tyris-blanda",
    "img": "img/equipo/armaduras/tyris-blanda-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "rosasalvaje",
    "img": "img/equipo/armaduras/rosasalvaje-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "tunica-encantador",
    "img": "img/equipo/armaduras/tunica-encantador-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "manto-halcon",
    "img": "img/equipo/armaduras/manto-halcon-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "tunica-araña",
    "img": "img/equipo/armaduras/tunica-araña-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "habito-tormenta",
    "img": "img/equipo/armaduras/habito-tormenta-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "tablillas-raromadera",
    "img": "img/equipo/armaduras/tablillas-raromadera-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "coraza-trol",
    "img": "img/equipo/armaduras/coraza-trol-v1.jpg"
  },
  {
    "category": "armaduras",
    "id": "placas-sol",
    "img": "img/equipo/armaduras/placas-sol-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "p-men-salud",
    "img": "img/equipo/objetos/p-men-salud-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "p-men-res",
    "img": "img/equipo/objetos/p-men-res-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "p-atributo",
    "img": "img/equipo/objetos/p-atributo-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "veneno-grindle",
    "img": "img/equipo/objetos/veneno-grindle-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "hojas-varik",
    "img": "img/equipo/objetos/hojas-varik-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "gota-lunar",
    "img": "img/equipo/objetos/gota-lunar-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "frag-inestable",
    "img": "img/equipo/objetos/frag-inestable-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "vela-protectora",
    "img": "img/equipo/objetos/vela-protectora-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "pastilla-lira",
    "img": "img/equipo/objetos/pastilla-lira-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "hierba-pipa",
    "img": "img/equipo/objetos/hierba-pipa-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "saco-dormir",
    "img": "img/equipo/objetos/saco-dormir-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "carcaj",
    "img": "img/equipo/objetos/carcaj-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "antorcha",
    "img": "img/equipo/objetos/antorcha-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "orbes",
    "img": "img/equipo/objetos/orbes-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "capa-arcana",
    "img": "img/equipo/objetos/capa-arcana-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "piedra-apariencia",
    "img": "img/equipo/objetos/piedra-apariencia-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "abrojos",
    "img": "img/equipo/objetos/abrojos-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "garfio",
    "img": "img/equipo/objetos/garfio-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "catalejo",
    "img": "img/equipo/objetos/catalejo-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "p-salud",
    "img": "img/equipo/objetos/p-salud-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "p-res",
    "img": "img/equipo/objetos/p-res-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "polvo-chasquido",
    "img": "img/equipo/objetos/polvo-chasquido-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "p-estabilidad",
    "img": "img/equipo/objetos/p-estabilidad-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "arcilla",
    "img": "img/equipo/objetos/arcilla-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "humo-oscuro",
    "img": "img/equipo/objetos/humo-oscuro-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "branquias",
    "img": "img/equipo/objetos/branquias-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "costurador",
    "img": "img/equipo/objetos/costurador-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "frag-mejorado",
    "img": "img/equipo/objetos/frag-mejorado-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "leche-yakamel",
    "img": "img/equipo/objetos/leche-yakamel-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "limo-rojo",
    "img": "img/equipo/objetos/limo-rojo-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "niebla-cisca",
    "img": "img/equipo/objetos/niebla-cisca-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "semilla-espino",
    "img": "img/equipo/objetos/semilla-espino-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "botella-duende",
    "img": "img/equipo/objetos/botella-duende-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "estuche",
    "img": "img/equipo/objetos/estuche-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "prisma",
    "img": "img/equipo/objetos/prisma-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "flechas-perf",
    "img": "img/equipo/objetos/flechas-perf-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "piedra-valor",
    "img": "img/equipo/objetos/piedra-valor-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "duende-corrector",
    "img": "img/equipo/objetos/duende-corrector-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "guardasaberes",
    "img": "img/equipo/objetos/guardasaberes-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "cuerda",
    "img": "img/equipo/objetos/cuerda-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "brujula",
    "img": "img/equipo/objetos/brujula-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "anillo-retorno",
    "img": "img/equipo/objetos/anillo-retorno-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "cenidor",
    "img": "img/equipo/objetos/cenidor-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "rec-men-salud",
    "img": "img/equipo/objetos/rec-men-salud-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "rec-men-res",
    "img": "img/equipo/objetos/rec-men-res-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "rec-atributo",
    "img": "img/equipo/objetos/rec-atributo-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "rec-salud",
    "img": "img/equipo/objetos/rec-salud-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "rec-res",
    "img": "img/equipo/objetos/rec-res-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "rec-estabilidad",
    "img": "img/equipo/objetos/rec-estabilidad-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "piedra-sangre",
    "img": "img/equipo/objetos/piedra-sangre-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "gran-piedra",
    "img": "img/equipo/objetos/gran-piedra-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "anillo-resist",
    "img": "img/equipo/objetos/anillo-resist-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "colgante",
    "img": "img/equipo/objetos/colgante-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "homet",
    "img": "img/equipo/objetos/homet-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "yorgi",
    "img": "img/equipo/objetos/yorgi-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "piedra-canal",
    "img": "img/equipo/objetos/piedra-canal-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "lupa",
    "img": "img/equipo/objetos/lupa-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "moneda-eclipse",
    "img": "img/equipo/objetos/moneda-eclipse-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "sombrero",
    "img": "img/equipo/objetos/sombrero-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "hilo-cose",
    "img": "img/equipo/objetos/hilo-cose-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "lente-memoria",
    "img": "img/equipo/objetos/lente-memoria-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "silbato-vinculo",
    "img": "img/equipo/objetos/silbato-vinculo-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "farol-polvo",
    "img": "img/equipo/objetos/farol-polvo-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "clavo-suspension",
    "img": "img/equipo/objetos/clavo-suspension-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "polvo-disipador",
    "img": "img/equipo/objetos/polvo-disipador-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "ampolla-reparadora",
    "img": "img/equipo/objetos/ampolla-reparadora-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "sal-silente",
    "img": "img/equipo/objetos/sal-silente-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "placa-azurmetal",
    "img": "img/equipo/objetos/placa-azurmetal-v1.jpg"
  },
  {
    "category": "objetos",
    "id": "pasta-sutura",
    "img": "img/equipo/objetos/pasta-sutura-v1.jpg"
  },
  {
    "category": "armas",
    "id": "espada-ancha",
    "img": "img/equipo/armas/espada-ancha-v1.jpg"
  },
  {
    "category": "armas",
    "id": "espada-larga",
    "img": "img/equipo/armas/espada-larga-v1.jpg"
  },
  {
    "category": "armas",
    "id": "hacha-batalla",
    "img": "img/equipo/armas/hacha-batalla-v1.jpg"
  },
  {
    "category": "armas",
    "id": "mandoble",
    "img": "img/equipo/armas/mandoble-v1.jpg"
  },
  {
    "category": "armas",
    "id": "maza",
    "img": "img/equipo/armas/maza-v1.jpg"
  },
  {
    "category": "armas",
    "id": "martillo",
    "img": "img/equipo/armas/martillo-v1.jpg"
  },
  {
    "category": "armas",
    "id": "daga",
    "img": "img/equipo/armas/daga-v1.jpg"
  },
  {
    "category": "armas",
    "id": "baston",
    "img": "img/equipo/armas/baston-v1.jpg"
  },
  {
    "category": "armas",
    "id": "sable",
    "img": "img/equipo/armas/sable-v1.jpg"
  },
  {
    "category": "armas",
    "id": "estoque",
    "img": "img/equipo/armas/estoque-v1.jpg"
  },
  {
    "category": "armas",
    "id": "alabarda",
    "img": "img/equipo/armas/alabarda-v1.jpg"
  },
  {
    "category": "armas",
    "id": "lanza",
    "img": "img/equipo/armas/lanza-v1.jpg"
  },
  {
    "category": "armas",
    "id": "arco-corto",
    "img": "img/equipo/armas/arco-corto-v1.jpg"
  },
  {
    "category": "armas",
    "id": "ballesta",
    "img": "img/equipo/armas/ballesta-v1.jpg"
  },
  {
    "category": "armas",
    "id": "arco-largo",
    "img": "img/equipo/armas/arco-largo-v1.jpg"
  },
  {
    "category": "armas",
    "id": "falcata",
    "img": "img/equipo/armas/falcata-v1.jpg"
  },
  {
    "category": "armas",
    "id": "nudillos",
    "img": "img/equipo/armas/nudillos-v1.jpg"
  },
  {
    "category": "armas",
    "id": "urok",
    "img": "img/equipo/armas/urok-v1.jpg"
  },
  {
    "category": "armas",
    "id": "latigo-cuchillas",
    "img": "img/equipo/armas/latigo-cuchillas-v1.jpg"
  },
  {
    "category": "armas",
    "id": "alabarda-acero",
    "img": "img/equipo/armas/alabarda-acero-v1.jpg"
  },
  {
    "category": "armas",
    "id": "guadana",
    "img": "img/equipo/armas/guadana-v1.jpg"
  },
  {
    "category": "armas",
    "id": "trabuco",
    "img": "img/equipo/armas/trabuco-v1.jpg"
  },
  {
    "category": "armas",
    "id": "gran-arco",
    "img": "img/equipo/armas/gran-arco-v1.jpg"
  },
  {
    "category": "armas",
    "id": "arco-pelofino",
    "img": "img/equipo/armas/arco-pelofino-v2.jpg"
  },
  {
    "category": "armas",
    "id": "guanteletes",
    "img": "img/equipo/armas/guanteletes-v1.jpg"
  },
  {
    "category": "armas",
    "id": "hacha-consagrada",
    "img": "img/equipo/armas/hacha-consagrada-v1.jpg"
  },
  {
    "category": "armas",
    "id": "anillos",
    "img": "img/equipo/armas/anillos-v1.jpg"
  },
  {
    "category": "armas",
    "id": "runas",
    "img": "img/equipo/armas/runas-v1.jpg"
  },
  {
    "category": "armas",
    "id": "hoja-retornante",
    "img": "img/equipo/armas/hoja-retornante-v1.jpg"
  },
  {
    "category": "armas",
    "id": "baston-corto",
    "img": "img/equipo/armas/baston-corto-v1.jpg"
  },
  {
    "category": "armas",
    "id": "baston-doble",
    "img": "img/equipo/armas/baston-doble-v1.jpg"
  },
  {
    "category": "armas",
    "id": "cetro",
    "img": "img/equipo/armas/cetro-v1.jpg"
  },
  {
    "category": "armas",
    "id": "varita",
    "img": "img/equipo/armas/varita-v1.jpg"
  },
  {
    "category": "armas",
    "id": "gran-baston",
    "img": "img/equipo/armas/gran-baston-v1.jpg"
  },
  {
    "category": "armas",
    "id": "hoja-ego",
    "img": "img/equipo/armas/hoja-ego-v1.jpg"
  },
  {
    "category": "armas",
    "id": "espada-lanzamiento",
    "img": "img/equipo/armas/espada-lanzamiento-v1.jpg"
  },
  {
    "category": "armas",
    "id": "daga-devoradora",
    "img": "img/equipo/armas/daga-devoradora-v1.jpg"
  },
  {
    "category": "armas",
    "id": "martillo-exota",
    "img": "img/equipo/armas/martillo-exota-v1.jpg"
  },
  {
    "category": "armas",
    "id": "arco-yutari",
    "img": "img/equipo/armas/arco-yutari-v1.jpg"
  },
  {
    "category": "armas",
    "id": "arco-anciano",
    "img": "img/equipo/armas/arco-anciano-v1.jpg"
  },
  {
    "category": "armas",
    "id": "cetro-elias",
    "img": "img/equipo/armas/cetro-elias-v1.jpg"
  },
  {
    "category": "armas",
    "id": "varita-embeleso",
    "img": "img/equipo/armas/varita-embeleso-v1.jpg"
  },
  {
    "category": "armas",
    "id": "baston-guardian",
    "img": "img/equipo/armas/baston-guardian-v1.jpg"
  },
  {
    "category": "armas",
    "id": "espada-corta",
    "img": "img/equipo/armas/espada-corta-v1.jpg"
  },
  {
    "category": "armas",
    "id": "escudo-redondo",
    "img": "img/equipo/armas/escudo-redondo-v1.jpg"
  },
  {
    "category": "armas",
    "id": "escudo-torre",
    "img": "img/equipo/armas/escudo-torre-v1.jpg"
  },
  {
    "category": "armas",
    "id": "daga-pequena",
    "img": "img/equipo/armas/daga-pequena-v1.jpg"
  },
  {
    "category": "armas",
    "id": "latigo",
    "img": "img/equipo/armas/latigo-v1.jpg"
  },
  {
    "category": "armas",
    "id": "garfio-agarre",
    "img": "img/equipo/armas/garfio-agarre-v1.jpg"
  },
  {
    "category": "armas",
    "id": "ballesta-mano",
    "img": "img/equipo/armas/ballesta-mano-v1.jpg"
  },
  {
    "category": "armas",
    "id": "escudo-pinchos",
    "img": "img/equipo/armas/escudo-pinchos-v1.jpg"
  },
  {
    "category": "armas",
    "id": "daga-parada",
    "img": "img/equipo/armas/daga-parada-v1.jpg"
  },
  {
    "category": "armas",
    "id": "hacha-retornante",
    "img": "img/equipo/armas/hacha-retornante-v1.jpg"
  },
  {
    "category": "armas",
    "id": "katana-mejorada",
    "img": "img/equipo/armas/katana-mejorada-v1.jpg"
  },
  {
    "category": "armas",
    "id": "nudilleras-mejoradas",
    "img": "img/equipo/armas/nudilleras-mejoradas-v1.jpg"
  },
  {
    "category": "armas",
    "id": "cimitarra-mejorada",
    "img": "img/equipo/armas/cimitarra-mejorada-v1.jpg"
  },
  {
    "category": "armas",
    "id": "daga-retorcida-mejorada",
    "img": "img/equipo/armas/daga-retorcida-mejorada-v1.jpg"
  },
  {
    "category": "armas",
    "id": "espada-latigo-mejorada",
    "img": "img/equipo/armas/espada-latigo-mejorada-v1.jpg"
  },
  {
    "category": "armas",
    "id": "dardo-cuerda-mejorado",
    "img": "img/equipo/armas/dardo-cuerda-mejorado-v1.jpg"
  },
  {
    "category": "armas",
    "id": "pico-guerra",
    "img": "img/equipo/armas/pico-guerra-v1.jpg"
  },
  {
    "category": "armas",
    "id": "baston-estoque",
    "img": "img/equipo/armas/baston-estoque-v1.jpg"
  },
  {
    "category": "armas",
    "id": "abanico-cuchillas",
    "img": "img/equipo/armas/abanico-cuchillas-v1.jpg"
  },
  {
    "category": "armas",
    "id": "escalpelo-cirujano",
    "img": "img/equipo/armas/escalpelo-cirujano-v1.jpg"
  },
  {
    "category": "armas",
    "id": "lanza-justa",
    "img": "img/equipo/armas/lanza-justa-v1.jpg"
  },
  {
    "category": "armas",
    "id": "jabalinas",
    "img": "img/equipo/armas/jabalinas-v1.jpg"
  },
  {
    "category": "armas",
    "id": "espada-brillante-mejorada",
    "img": "img/equipo/armas/espada-brillante-mejorada-v1.jpg"
  },
  {
    "category": "armas",
    "id": "hoja-sombria-mejorada",
    "img": "img/equipo/armas/hoja-sombria-mejorada-v1.jpg"
  },
  {
    "category": "armas",
    "id": "chakram-mejorado",
    "img": "img/equipo/armas/chakram-mejorado-v1.jpg"
  },
  {
    "category": "armas",
    "id": "daga-conjuro-mejorada",
    "img": "img/equipo/armas/daga-conjuro-mejorada-v1.jpg"
  },
  {
    "category": "armas",
    "id": "pistola-runica-mejorada",
    "img": "img/equipo/armas/pistola-runica-mejorada-v1.jpg"
  },
  {
    "category": "armas",
    "id": "rifle-arcano-mejorado",
    "img": "img/equipo/armas/rifle-arcano-mejorado-v1.jpg"
  },
  {
    "category": "armas",
    "id": "garrote-encantado",
    "img": "img/equipo/armas/garrote-encantado-v1.jpg"
  },
  {
    "category": "armas",
    "id": "cuchilla-desplazamiento",
    "img": "img/equipo/armas/cuchilla-desplazamiento-v1.jpg"
  },
  {
    "category": "armas",
    "id": "brazaletes-hechizados",
    "img": "img/equipo/armas/brazaletes-hechizados-v1.jpg"
  },
  {
    "category": "armas",
    "id": "gema-furia",
    "img": "img/equipo/armas/gema-furia-v1.jpg"
  },
  {
    "category": "armas",
    "id": "laud-encantado",
    "img": "img/equipo/armas/laud-encantado-v1.jpg"
  },
  {
    "category": "armas",
    "id": "arco-astillas",
    "img": "img/equipo/armas/arco-astillas-v1.jpg"
  },
  {
    "category": "armas",
    "id": "hachuela-mejorada",
    "img": "img/equipo/armas/hachuela-mejorada-v1.jpg"
  },
  {
    "category": "armas",
    "id": "nudilleras-torpe-mejoradas",
    "img": "img/equipo/armas/nudilleras-torpe-mejoradas-v1.jpg"
  },
  {
    "category": "armas",
    "id": "cuchillos-arrojadizos-mejorados",
    "img": "img/equipo/armas/cuchillos-arrojadizos-mejorados-v1.jpg"
  },
  {
    "category": "armas",
    "id": "capa-combate-mejorada",
    "img": "img/equipo/armas/capa-combate-mejorada-v1.jpg"
  },
  {
    "category": "armas",
    "id": "escudo-runico-mejorado",
    "img": "img/equipo/armas/escudo-runico-mejorado-v1.jpg"
  },
  {
    "category": "armas",
    "id": "runas-foco-mejoradas",
    "img": "img/equipo/armas/runas-foco-mejoradas-v1.jpg"
  },
  {
    "category": "armas",
    "id": "porra-plegable",
    "img": "img/equipo/armas/porra-plegable-v1.jpg"
  },
  {
    "category": "armas",
    "id": "brazal-sobrenatural",
    "img": "img/equipo/armas/brazal-sobrenatural-v1.jpg"
  },
  {
    "category": "armas",
    "id": "baston-segmentado",
    "img": "img/equipo/armas/baston-segmentado-v1.jpg"
  },
  {
    "category": "armas",
    "id": "alambre-cuchillas",
    "img": "img/equipo/armas/alambre-cuchillas-v1.jpg"
  }
];
  const collections = {armas: WEAPONS, armaduras: ARMORS, objetos: ITEMS};
  for (const {category, id, img} of images) {
    const item = collections[category]?.find(x => x.id === id);
    if (!item) throw new Error('Ilustración sin entrada de catálogo: ' + category + '/' + id);
    if (!item.img) item.img = img;
    if (!ARTE[id]) ARTE[id] = item.img;
  }
})();
