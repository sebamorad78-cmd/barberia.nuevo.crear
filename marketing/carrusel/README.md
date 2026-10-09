# Carrusel de Instagram (5 placas, 1080 x 1350)

1. Servir el proyecto: `python3 -m http.server 8765`
2. (Opcional, si cambió la web) `node marketing/carrusel/capturas.js` — vuelve a sacar las capturas reales de la web y del panel.
   Con `FUENTES=carpeta` (los .woff2 de @fontsource de Playfair Display, Cormorant Garamond e Instrument Serif) las pantallas de salón, spa y uñas salen con su tipografía real.
3. `node marketing/carrusel/render.js` → `entrega/carrusel/placa-1.png` … `placa-5.png`

Los textos se editan en `carrusel.html`.
