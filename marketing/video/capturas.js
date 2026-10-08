// Captura 4 estados reales de la reserva (en celular, 3x) y la posición de cada toque.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = __dirname;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  const F = 'http://localhost:8765/marketing/flyer/fonts/';
  const ff = (fam, file, w, st) => `@font-face{font-family:"${fam}";src:url(${F}${file}) format("woff2");font-weight:${w};font-style:${st};}`;
  const css = [ff('Fraunces', 'fraunces-latin-400-normal.woff2', 400, 'normal'), ff('Fraunces', 'fraunces-latin-400-italic.woff2', 400, 'italic'), ff('Fraunces', 'fraunces-latin-300-normal.woff2', 300, 'normal'),
    ...[400, 500, 600, 700, 800].map(w => ff('Manrope', `manrope-latin-${w}-normal.woff2`, w, 'normal'))].join('\n');
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
  await p.goto('http://localhost:8765/barberia/?limpio=1'); await p.waitForTimeout(1200);
  await p.click('.price >> nth=0'); await p.waitForTimeout(400);
  await p.click('#nextBtn'); await p.waitForTimeout(300);
  await p.click('#proPick .opt[data-id="martin"]'); await p.click('#nextBtn'); await p.waitForTimeout(900);
  await p.addStyleTag({ content: '.wa-float,.mobile-cta,.toast{display:none!important} .steps{display:none!important} .booking{border-radius:0!important;box-shadow:none!important;border:0!important} *{transition:none!important;animation:none!important} .success__icon circle,.success__icon path{stroke-dashoffset:0!important}' });
  // día con varios ocupados y huecos libres (no el primero, para que haya un "toque")
  const days = await p.$$eval('.cal__day:not(:disabled)', xs => xs.map(x => x.dataset.date));
  let best = null, bestBusy = -1;
  for (const d of days.slice(1, 9)) { await p.click(`.cal__day[data-date="${d}"]`); await p.waitForTimeout(100);
    const n = await p.$$eval('#slots .slot.is-busy', x => x.length); if (n > bestBusy && n < 9) { bestBusy = n; best = d; } }
  const box = await p.$('#booking');
  const H = 760, info = {};
  // Pantalla completa del celular (390 px de ancho) sin la barra de pasos; el encabezado del sitio se captura aparte
  async function shot(name) {
    await p.mouse.move(0, 0);
    await p.evaluate(() => { document.querySelector('.nav').style.visibility = 'hidden'; document.querySelector('#booking').scrollIntoView({ block: 'start' }); window.scrollBy(0, -12); });
    await p.waitForTimeout(250);
    const r = await box.boundingBox();
    const clip = { x: 0, y: Math.max(0, r.y - 12), width: 390, height: H };
    await p.screenshot({ path: path.join(OUT, name + '.png'), clip });
    return { x: 0, y: clip.y };
  }
  const rel = async (sel, r) => { const e = await (await p.$(sel)).boundingBox(); return { x: e.x - r.x + e.width / 2, y: e.y - r.y + e.height / 2 }; };
  // 1) día inicial seleccionado
  await p.click(`.cal__day[data-date="${days[0]}"]`); await p.waitForTimeout(150);
  let r = await shot('s1');
  info.tapDia = await rel(`.cal__day[data-date="${best}"]`, r);
  // 2) día elegido con sus horarios
  await p.click(`.cal__day[data-date="${best}"]`); await p.waitForTimeout(150);
  r = await shot('s2');
  const libres = await p.$$('#slots .slot:not(.is-busy)'); const objetivo = libres[Math.min(4, libres.length - 1)];
  const hora = await objetivo.getAttribute('data-time');
  info.tapHora = await rel(`#slots .slot[data-time="${hora}"]`, r);
  // 3) horario seleccionado
  await objetivo.click(); await p.waitForTimeout(150);
  r = await shot('s3');
  // 4) confirmado
  await p.click('#nextBtn'); await p.waitForTimeout(300);
  await p.fill('#bookingForm [name=nombre]', 'Lucas Fernández'); await p.fill('#bookingForm [name=telefono]', '223 555 0101');
  await p.click('#nextBtn'); await p.waitForTimeout(900);
  r = await shot('s4');
  // Encabezado fijo del sitio (nombre del local + menú), tal como se ve en el celular
  await p.evaluate(() => { const n = document.querySelector('.nav'); n.style.visibility = 'visible'; n.classList.add('is-scrolled'); n.classList.remove('is-open'); n.style.background = getComputedStyle(document.body).backgroundColor; n.style.backdropFilter = 'none'; n.style.webkitBackdropFilter = 'none'; });
  await p.waitForTimeout(200);
  const nh = await p.evaluate(() => document.querySelector('.nav').offsetHeight);
  await p.screenshot({ path: path.join(OUT, 'nav.png'), clip: { x: 0, y: 0, width: 390, height: nh } });
  info.ancho = 390; info.alto = H; info.nav = nh; info.dia = best; info.hora = hora;
  fs.writeFileSync(path.join(OUT, 'toques.json'), JSON.stringify(info, null, 1));
  console.log(info);
  await b.close();
})();
