# Velmara

Web de la campaña de Daggerheart de Velmara: los jugadores eligen su personaje, visitan los lugares que el DM va desbloqueando y gestionan su inventario.

- `index.html`: la aplicación (elegir personaje, Lugares, Inventario, Mesa del DM).
- `js/datos.js`: personajes, lugares, tiendas, catálogo y equipo de tier 2.
- `js/reglas.js`: reglas (vales, botes, piezas únicas, apertura de tiendas).
- `js/cartas.js`: cartas de equipo y botín al estilo Daggerheart. Para poner arte a una carta, añade `ARTE["id"]="img/..."`.
- `js/store.js`: estado compartido en Firebase Realtime Database, con transacciones.
- `js/firebase-config.js`: configuración pública del proyecto de Firebase.
- `database.rules.json`: reglas de la base de datos (copiar en la consola de Firebase).

La Mesa del DM se abre añadiendo `#dm` a la dirección. Sin configuración de Firebase, la web funciona en modo prueba.
