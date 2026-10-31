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
    "id": "gran-baston",
    "img": "img/equipo/armas/gran-baston-v1.jpg"
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
