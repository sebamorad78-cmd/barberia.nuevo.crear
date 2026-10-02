# Web de turnos — Barbería / Salón de belleza

Sitio estático (HTML + CSS + JS, sin instalar nada) con reserva de turnos online.

## Qué incluye
- Hero animado, servicios y precios por categoría, nosotros, galería con lightbox, equipo, opiniones, horarios + mapa, preguntas frecuentes.
- **Reserva en 4 pasos**: servicio(s) → profesional → día y hora → datos. Calcula duración y total, respeta horarios, días cerrados, anticipación mínima y turnos ya tomados.
- Al confirmar: mensaje armado por **WhatsApp**, botón a **Google Calendar** y descarga **.ics**.
- Indicador "Abierto / Cerrado" en vivo, botón flotante de WhatsApp, barra de reserva fija en celular.
- Dos estilos: **barbería** (oscuro y dorado) y **salón** (crema y rosa).

## Cómo personalizar
Todo se edita en **`js/config.js`**: modo, nombre, textos, servicios, precios, duraciones, horarios, equipo, fotos, contacto y FAQ.
- `MODO = "barberia"` o `"salon"`.
- `MOSTRAR_SELECTOR_DEMO = false` antes de publicar.
- Fotos propias: guardalas en `assets/fotos/` y usá `"assets/fotos/archivo.jpg"` en el config.

## Ver en tu compu
Abrí `index.html` en el navegador (o `python3 -m http.server` en esta carpeta).

## Publicar
Subí toda la carpeta a Hostinger, Netlify, Vercel o GitHub Pages. Si cambiás CSS/JS, actualizá el `?v=FECHA` en `index.html`.

## Importante
Por ahora las reservas se guardan **en el navegador de quien reserva** y te llegan por WhatsApp. Para tener una agenda central (panel del negocio, turnos bloqueados para todos, recordatorios automáticos) el próximo paso es conectar una base de datos (por ejemplo Supabase).
