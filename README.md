# Velmara

Web de la campaña de Daggerheart de Velmara: lugares que los jugadores pueden visitar entre sesiones.

- `index.html`: portada.
- `tienda/`: Tienda de las Tres Agujas (vales, botes compartidos, equipo único de tier 2).
- `js/store.js`: estado compartido en Firebase Realtime Database, con transacciones.
- `js/firebase-config.js`: configuración pública del proyecto de Firebase.
- `database.rules.json`: reglas de la base de datos (copiar en la consola de Firebase).

La mesa del DM se abre añadiendo `#dm` a la dirección de la tienda.
Sin configuración de Firebase, la tienda funciona en modo prueba (solo en el navegador).
