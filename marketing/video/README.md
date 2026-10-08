# Video (WhatsApp / Instagram)

- `motion.html`: la animación. `?f=45` (1080x1350, feed) o `?f=916` (1080x1920, estados e historias).
  Se puede abrir en el navegador y mover el tiempo con `setT(segundos)` en la consola.
- `s1.png`…`s4.png` + `toques.json`: capturas reales de la reserva y dónde toca el dedo (`capturas.js` las regenera).
- `render.js`: genera los MP4 en `entrega/` cuadro por cuadro (60 fps, H.264).
  Servir el proyecto en http://localhost:8765 y correr `node marketing/video/render.js /carpeta/temporal`.
