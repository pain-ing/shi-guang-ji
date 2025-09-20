/* Build ICO using sharp */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pngToIco = require('png-to-ico').default || require('png-to-ico');
const publicDir = path.join(__dirname, '..', 'public');
const src = path.join(publicDir, 'shiguangji-icon.png');

async function ensureSquare(input) {
  const img = sharp(input);
  const meta = await img.metadata();
  const side = Math.max(meta.width, meta.height);
  // Extend canvas to square with transparent background
  const left = Math.floor((side - meta.width) / 2);
  const top = Math.floor((side - meta.height) / 2);
  const buf = await img
    .extend({ top, bottom: side - meta.height - top, left, right: side - meta.width - left, background: { r:0, g:0, b:0, alpha:0 } })
    .resize(side, side, { fit: 'contain' })
    .png()
    .toBuffer();
  return sharp(buf);
}

async function main() {
  if (!fs.existsSync(src)) {
    console.error('Source PNG not found at', src);
    process.exit(1);
  }
  const sizes = [16, 24, 32, 48, 64, 128, 256, 512];
  const base = await ensureSquare(src);

  // Write multi-size PNGs
  for (const s of sizes) {
    const out = path.join(publicDir, `icon-${s}.png`);
    await base.clone().resize(s, s).png().toFile(out);
    console.log('Wrote', out);
  }

  // Create ICO using png-to-ico with recommended sizes
  const ico = path.join(publicDir, 'icon.ico');
  const icoSources = [16, 24, 32, 48, 64, 128, 256].map(s => path.join(publicDir, `icon-${s}.png`));
  try {
    const buf = await pngToIco(icoSources);
    fs.writeFileSync(ico, buf);
    console.log('Wrote', ico);
  } catch (e) {
    console.warn('ICO creation failed:', e.message);
    process.exit(1);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
