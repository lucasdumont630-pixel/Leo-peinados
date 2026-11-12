# La Argentina Estilista

Web de una página para la peluquería La Argentina Estilista. HTML, CSS y JS sin dependencias ni paso de compilación: abre `index.html` o súbela tal cual a cualquier hosting estático (Vercel, Netlify, GitHub Pages).

## Qué cambiar antes de publicar

- **`script.js` → `CONFIG`**: número de WhatsApp, teléfono, dirección, Instagram y horario. El horario genera la tabla de horarios, el aviso "Abierto/Cerrado" y los días y horas que se pueden elegir al reservar.
- **`index.html`**:
  - Servicios y precios (sección `#servicios`).
  - Las reseñas son textos de ejemplo: cámbialas por reseñas reales.
  - Duraciones aproximadas de cada servicio.
- **Fotos**: la galería y "Sobre Leo" usan degradados de relleno. Pon las fotos en `img/` y asígnalas en `styles.css` (`.tile[data-tone="1"]` … `"6"`) cambiando el fondo por `background: url(img/foto.jpg) center / cover`.

## Versión de un solo archivo

`python3 tools/build-artifact.py salida.html` junta HTML, CSS y JS en un único archivo (sirve para vistas previas).
