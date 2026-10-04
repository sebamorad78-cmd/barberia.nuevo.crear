# Web de turnos para barberías, salones, spas y nail bars

Sitio estático (HTML + CSS + JS, sin instalar nada) pensado como **maqueta para vender** a locales.

## Las 3 páginas

| Página | Para qué sirve |
|---|---|
| `index.html` | La web del local: servicios y precios, promos, galería, equipo, opiniones, horarios, mapa, FAQ y **reserva online en 4 pasos** con seña. |
| `admin.html` | **Panel del dueño** (PIN demo `1234`): agenda por profesional, turnos manuales, bloqueo de horarios, estados (atendido / no vino), clientes, recordatorios y pedido de reseñas por WhatsApp, y estadísticas. Viene con datos de ejemplo. |
| `vender.html` | **Tu página comercial**: beneficios, demos en vivo de los 4 rubros, generador de demo con el nombre del local, cómo trabajás, planes y precios, preguntas frecuentes. |

## 4 estilos (paleta y tipografía propias, contraste verificado WCAG AA)
| Rubro | Paleta | Tipografía | Sensación |
|---|---|---|---|
| `barberia` | carbón + latón | Fraunces | tradición, oficio |
| `salon` | marfil + baya + champagne | Playfair Display | femenino, editorial |
| `spa` | salvia + arena | Cormorant Garamond | calma, bienestar |
| `unas` | negro + nude rosado | Instrument Serif | moderno, chic |
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

## Vista previa en WhatsApp (una página por rubro)
WhatsApp no ejecuta JavaScript: arma la tarjeta del link leyendo el HTML. Por eso cada rubro tiene su página con título, descripción e imagen propios:

| Link | Tarjeta en WhatsApp |
|---|---|
| `/barberia/` | "Así se vería la web de tu barbería" + imagen dorada |
| `/salon/` | "Así se vería la web de tu salón de belleza" + imagen marfil y baya |
| `/spa/` | "Así se vería la web de tu spa o centro de estética" + imagen salvia |
| `/unas/` | "Así se vería la web de tu nail bar" + imagen negro y nude |
| `/vender.html` | "Webs con turnos online para tu local · Mar del Plata" |

Las genera `tools/rubros.py` a partir de `index.html` (imágenes en `assets/og/`). **Si cambiás `index.html`, volvé a correrlo**:
`python3 tools/rubros.py --url https://TU-SITIO.netlify.app` (agregá `--imagenes` para redibujar las imágenes; los textos se editan en el mismo script).
Publicando desde GitHub, Netlify lo corre solo con la URL real (ver `netlify.toml`).

## Reservas reales (Supabase)
La web tiene dos modos con el mismo diseño:
- **Demo** (`BACKEND.slug` vacío en `js/config.js`): los turnos se guardan en el navegador y hay datos de ejemplo. Para mostrar y vender.
- **Real** (`BACKEND.slug` con el código del local): las reservas van a la base de datos (proyecto Supabase **turnos-mdp**). La web y el panel comparten la agenda, dos personas no pueden sacar el mismo horario y el dueño entra con email y contraseña.

### Dar de alta un local (10 minutos)
1. **Usuario del dueño:** en supabase.com → proyecto *turnos-mdp* → **Authentication → Users → Add user → Create new user**. Email y contraseña del dueño, con **Auto Confirm User** tildado.
2. **Local:** en **SQL Editor** ejecutá (cambiá los datos):
   `select public.alta_negocio('barberia-don-carlos', 'Barbería Don Carlos', 'dueno@mail.com');`
3. **Su web:** copiá la carpeta del proyecto y en `js/config.js` poné:
   - `BACKEND.slug: "barberia-don-carlos"` (el mismo del paso 2)
   - `MOSTRAR_SELECTOR_DEMO = false`
   - `MODO`, nombre, servicios, precios, horarios, equipo, fotos, contacto y seña (alias / link de Mercado Pago).
4. Publicala (un sitio de Netlify por local) y probá una reserva. El dueño entra a `/admin.html` con su email y contraseña.

### Bueno saber
- **Seguridad:** la web solo puede *reservar*, *ver horarios ocupados* (sin nombres ni teléfonos) y *cancelar con código + teléfono*. Cada dueño ve únicamente su local. La clave de `config.js` es pública por diseño.
- **Antispam:** máximo 4 turnos futuros por teléfono en cada local.
- **Avisos en el panel:** los turnos nuevos aparecen solos (revisa cada 30 segundos).
- **Recordatorios:** el panel arma el mensaje de WhatsApp y el dueño lo envía con un toque (los automáticos requieren la API paga de WhatsApp).
- **Plan gratis de Supabase:** el proyecto se pausa si pasa 7 días sin uso. Con locales usando la web todos los días no pasa, pero cuando tengas clientes pagando conviene el plan Pro (US$ 25/mes para todos tus locales juntos).
- **Recomendado:** en Supabase → Authentication → Sign In / Providers, desactivá "Allow new users to sign up" (los usuarios los creás vos).

## Tarjeta de WhatsApp con el nombre del local
Si el link trae `?nombre=...` (lo genera "Copiar link para el cliente"), la función `netlify/edge-functions/og-nombre.js` pone el nombre del local en la tarjeta de WhatsApp. **Solo funciona publicando desde GitHub** (Netlify Drop no ejecuta funciones); sin ella la tarjeta muestra el texto del rubro.

## Publicar
Subí toda la carpeta a Netlify (app.netlify.com/drop), Hostinger, Vercel o GitHub Pages. Si cambiás CSS/JS, actualizá el `?v=...` en los `.html`.

## Precio del abono
Se muestra en pesos al dólar oficial: actualizá `VENDEDOR.cotizacion` en `js/config.js` cuando cambie el dólar.
