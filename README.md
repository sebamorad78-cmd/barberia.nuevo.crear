# Web de turnos para barberías, salones, spas y nail bars

Sitio estático (HTML + CSS + JS, sin instalar nada) pensado como **maqueta para vender** a locales.

## Las 3 páginas

| Página | Para qué sirve |
|---|---|
| `index.html` | La web del local: servicios y precios, promos, galería, equipo, opiniones, horarios, mapa, FAQ y **reserva online en 4 pasos** con seña. |
| `admin.html` | **Panel del dueño** (PIN demo `1234`): agenda por profesional, turnos manuales, bloqueo de horarios, estados (atendido / no vino), clientes, recordatorios y pedido de reseñas por WhatsApp, y estadísticas. Viene con datos de ejemplo. |
| `vender.html` | **Tu página comercial**: beneficios, demos en vivo de los 4 rubros, generador de demo con el nombre del local, cómo trabajás, planes y precios, preguntas frecuentes. |

## 4 estilos
`barberia` (oscuro y dorado) · `salon` (crema y rosa) · `spa` (verde salvia) · `unas` (nail bar, negro y nude).
Cada uno tiene sus propios servicios, equipo, fotos, promos, opiniones y FAQ.

## Cómo vender con esto
1. Mandale al local tu `vender.html`, o mostrásela en persona.
2. En `index.html` tocá **"Personalizar demo"**: elegí estilo, nombre, frase, color, WhatsApp, dirección, Instagram, ajuste de precios (%) y si se pide seña → **Aplicar**.
3. **Copiar link para el cliente** genera la web del local ya personalizada y sin el panel.
4. Mostrale también el **panel del dueño** (`admin.html`, PIN `1234`). Si abrís la web y el panel en dos pestañas y reservás un turno, el panel avisa al instante.
5. Si el local quiere probar solo, en `vender.html` está el generador "Mirá cómo quedaría tu web".

## Qué editar
Todo está en **`js/config.js`**:
- `VENDEDOR`: tu nombre, WhatsApp, email y **planes con precios** (se muestran en `vender.html` y en el pie de la demo).
- `MODO`: estilo por defecto.
- `comunes`: horarios, feriados, anticipación mínima, **seña** (porcentaje, alias, link de Mercado Pago), PIN del panel y contacto.
- Cada estilo (`barberia`, `salon`, `spa`, `unas`): textos, servicios, precios, equipo, fotos, promos, opiniones y FAQ.
- Fotos propias: guardalas en `assets/fotos/` y usá `"assets/fotos/archivo.jpg"`.
- `MOSTRAR_SELECTOR_DEMO = false` cuando le entregues la web a un cliente (oculta el panel de demo, el aviso de demo y los datos de ejemplo).

### Parámetros del link (opcional)
`?modo=salon&nombre=Mi%20Local&eslogan=...&color=aa3355&wa=5491122334455&dir=...&ig=usuario&ajuste=15&sena=0&alias=mi.alias&limpio=1`

## Publicar
Subí toda la carpeta a Netlify (app.netlify.com/drop), Hostinger, Vercel o GitHub Pages. Si cambiás CSS/JS, actualizá el `?v=...` en los `.html`.

## Importante
Es una **maqueta**: los turnos se guardan en el navegador de quien la usa (perfecto para mostrar). Para un local real, el siguiente paso es conectar una base de datos (por ejemplo Supabase) para que web y panel compartan la agenda, con usuarios reales en lugar del PIN.
