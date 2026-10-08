// Renderiza el video cuadro por cuadro (60 fps) y lo codifica en MP4 H.264 de alta calidad.
// Uso: servir el proyecto en http://localhost:8765 y correr  node marketing/video/render.js <carpeta-temporal>
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const FPS = 60, TMP = process.argv[2] || '/tmp/frames';
const OUT = path.join(__dirname, '..', '..', 'entrega');
const FFMPEG = execFileSync('python3', ['-I', '-c', 'import imageio_ffmpeg as f; print(f.get_ffmpeg_exe())']).toString().trim();
const FORMATOS = [{ f: '45', w: 1080, h: 1350, nombre: 'video-feed-1080x1350.mp4' }, { f: '916', w: 1080, h: 1920, nombre: 'video-estados-1080x1920.mp4' }];

(async () => {
  const b = await chromium.launch();
  for (const F of FORMATOS) {
    const dir = path.join(TMP, F.f); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const p = await b.newPage({ viewport: { width: F.w, height: F.h } });
    await p.goto('http://localhost:8765/marketing/video/motion.html?f=' + F.f);
    await p.evaluate(() => document.fonts.ready); await p.waitForFunction(() => window.LISTO);
    await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => i.onload = r))));
    const dur = await p.evaluate(() => window.DURACION), n = Math.round(dur * FPS);
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      await p.evaluate(t => setT(t), i / FPS);
      await p.screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.png') });
    }
    await p.close();
    console.log(F.nombre, n, 'cuadros en', Math.round((Date.now() - t0) / 1000), 's');
    execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, '%04d.png'),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-profile:v', 'high', '-level', '4.2', '-pix_fmt', 'yuv420p',
      '-r', String(FPS), '-movflags', '+faststart', path.join(OUT, F.nombre)]);
  }
  await b.close();
})();
