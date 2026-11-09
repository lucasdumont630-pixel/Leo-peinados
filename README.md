# Leo Peinados

Web de una página para la peluquería Leo Peinados. HTML, CSS y JS sin dependencias ni paso de compilación: abre `index.html` o súbela tal cual a cualquier hosting estático (Vercel, Netlify, GitHub Pages).

## Qué cambiar antes de publicar

- **`script.js` → `CONFIG`**: número de WhatsApp, teléfono, dirección, Instagram y horario (se usa para el aviso "Abierto ahora").
- **`index.html`**:
  - Servicios y precios (sección `#servicios`).
  - Horario visible (sección `#contacto`), igual que en `CONFIG`.
  - Las reseñas son textos de ejemplo: cámbialas por reseñas reales.
  - Las cifras del principio (+10 años, 4,9★) también son de ejemplo.
- **Fotos**: la galería y "Sobre Leo" usan degradados de relleno. Pon las fotos en `img/` y asígnalas en `styles.css` (`.g--1` … `.g--6`, `.about__img`) con `background-image: url(img/foto.jpg)`.
