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
