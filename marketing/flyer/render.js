// Genera los archivos finales del flyer a partir de flyer.html.
// Uso: servir la carpeta del proyecto en http://localhost:8765 y correr
//   node marketing/flyer/render.js
const { chromium } = require('playwright');
const path = require('path');
const OUT = path.join(__dirname, '..', '..', 'entrega');
const URL = 'http://localhost:8765/marketing/flyer/flyer.html';
const mmPx = mm => mm * 96 / 25.4;

(async () => {
  const b = await chromium.launch();
  async function abrir(q, w, h, dsf) {
    const p = await b.newPage({ viewport: { width: Math.round(mmPx(w)), height: Math.round(mmPx(h)) }, deviceScaleFactor: dsf || 1 });
    await p.goto(URL + q); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
    return p;
  }
  // PDF A5 exacto (para mandar por mail o imprimir en casa)
  let p = await abrir('', 148, 210);
  await p.pdf({ path: path.join(OUT, 'flyer-A5.pdf'), width: '148mm', height: '210mm', printBackground: true, pageRanges: '1' });
  // PNG A5 a 300 dpi (vista previa / imprenta que pida imagen)
  await p.close(); p = await abrir('', 148, 210, 300 / 96);
  await p.screenshot({ path: path.join(OUT, 'flyer-A5-300dpi.png'), clip: { x: 0, y: 0, width: mmPx(148), height: mmPx(210) } });
  // PDF para imprenta: A5 + 3 mm de sangrado por lado (154 x 216 mm)
  await p.close(); p = await abrir('?bleed=1', 154, 216);
  await p.pdf({ path: path.join(OUT, 'flyer-A5-imprenta-sangrado3mm.pdf'), width: '154mm', height: '216mm', printBackground: true, pageRanges: '1' });
  // Redes: 1080 x 1350 (4:5) para WhatsApp e Instagram
  await p.close(); p = await abrir('?social=1', 148, 185, 1080 / mmPx(148));
  await p.screenshot({ path: path.join(OUT, 'flyer-redes-1080x1350.png'), clip: { x: 0, y: 0, width: mmPx(148), height: mmPx(185) } });
  await b.close();
  console.log('listo');
})();
