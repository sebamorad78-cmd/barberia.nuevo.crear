// Capturas reales del sistema para el carrusel: web del local (hero) y panel del dueño.
// Uso: servir el proyecto en http://localhost:8765 y correr  node marketing/carrusel/capturas.js
const { chromium } = require('playwright');
const path = require('path');
const OUT = __dirname;
const F = 'http://localhost:8765/marketing/flyer/fonts/';
const ff = (fam, file, w, st) => `@font-face{font-family:"${fam}";src:url(${F}${file}) format("woff2");font-weight:${w};font-style:${st};}`;
const css = [ff('Fraunces', 'fraunces-latin-400-normal.woff2', 400, 'normal'), ff('Fraunces', 'fraunces-latin-400-italic.woff2', 400, 'italic'), ff('Fraunces', 'fraunces-latin-300-normal.woff2', 300, 'normal'), ff('Fraunces', 'fraunces-latin-500-normal.woff2', 500, 'normal'),
  ...[400, 500, 600, 700, 800].map(w => ff('Manrope', `manrope-latin-${w}-normal.woff2`, w, 'normal'))];
// Tipografías de los otros rubros (opcional): FUENTES=carpeta con los .woff2 de @fontsource
const fs = require('fs'), FD = process.env.FUENTES;
if (FD) for (const [fam, pre] of [['Playfair Display', 'playfair-display'], ['Cormorant Garamond', 'cormorant-garamond'], ['Instrument Serif', 'instrument-serif']])
  for (const w of [400, 500, 600]) for (const st of ['normal', 'italic']) {
    const f = `${pre}-latin-${w}-${st}.woff2`;
    if (fs.existsSync(path.join(FD, f))) css.push(`@font-face{font-family:"${fam}";src:url(https://fonts.local/${f}) format("woff2");font-weight:${w};font-style:${st};}`);
  }
const CSS = css.join('\n');
const QUIET = '.wa-float,.mobile-cta,.toast,.demo-badge,.demo-bar,.demo-panel,.demo-fab{display:none!important} *{transition:none!important;animation:none!important}';
(async () => {
  const b = await chromium.launch();
  async function page(w, h) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 3 });
    await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: CSS }));
    await p.route('https://fonts.local/**', r => r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(path.join(FD, path.basename(r.request().url()))) }));
    return p;
  }
  // 1) Web de cada rubro, primera pantalla en el celular
  let p;
  for (const m of ['barberia', 'salon', 'spa', 'unas']) {
    p = await page(390, 760);
    await p.goto(`http://localhost:8765/${m}/?limpio=1`); await p.waitForTimeout(1500);
    await p.addStyleTag({ content: QUIET + ' .hero__title .w > span{transform:none!important} [data-reveal],.reveal{opacity:1!important;transform:none!important}' }); await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(OUT, `web-${m}.png`) });
    await p.close();
  }
  // 2) Panel del dueño en el celular (agenda del día)
  p = await page(390, 760);
  await p.goto('http://localhost:8765/admin.html?modo=barberia'); await p.waitForTimeout(800);
  await p.fill('#loginForm [name=pin]', '1234'); await p.press('#loginForm [name=pin]', 'Enter'); await p.waitForTimeout(1200);
  await p.addStyleTag({ content: QUIET }); await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(OUT, 'panel-movil.png') });
  await p.close();
  // 3) Panel en computadora
  p = await page(1280, 800);
  await p.goto('http://localhost:8765/admin.html?modo=barberia'); await p.waitForTimeout(800);
  await p.fill('#loginForm [name=pin]', '1234'); await p.press('#loginForm [name=pin]', 'Enter'); await p.waitForTimeout(1200);
  await p.addStyleTag({ content: QUIET }); await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(OUT, 'panel-pc.png') });
  await b.close(); console.log('ok');
})();
