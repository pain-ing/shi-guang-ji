/* Icon build script: normalize PNG to square canvas and output multi-size PNGs + ICO */
const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico');

async function getJimp() {
  // Jimp has different entry points depending on version; normalize here
  try {
    const m = await import('jimp');
    return m.Jimp || m.default || m;
  } catch (e) {
    // Fallback to require if available
    try {
      const m2 = require('jimp');
      return m2.Jimp || m2.default || m2;
    } catch (e2) {
      throw e;
    }
  }
}

async function main() {
  const Jimp = await getJimp();
  const publicDir = path.join(__dirname, '..', 'public');
  const srcPng = path.join(publicDir, 'shiguangji-icon.png');
  if (!fs.existsSync(srcPng)) {
    console.error('Source PNG not found:', srcPng);
    process.exit(1);
  }

  const sizes = [16, 32, 48, 64, 128, 256, 512];

  const src = await Jimp.read(srcPng);
  const side = Math.max(src.bitmap.width, src.bitmap.height);
  const bg = new Jimp(side, side, 0x00000000);
  const x = (side - src.bitmap.width) / 2;
  const y = (side - src.bitmap.height) / 2;
  bg.composite(src, x, y);

  for (const size of sizes) {
    const outPath = path.join(publicDir, `icon-${size}.png`);
    const clone = bg.clone();
    clone.resize(size, size); // use default resize algorithm for compatibility
    await clone.writeAsync(outPath);
    console.log('Wrote', outPath);
  }

  // Generate ICO from recommended sizes (16, 32, 48, 256)
  const icoPath = path.join(publicDir, 'icon.ico');
  const pick = [16, 32, 48, 256].map(s => path.join(publicDir, `icon-${s}.png`));
  const icoBuf = await pngToIco(pick);
  fs.writeFileSync(icoPath, icoBuf);
  console.log('Wrote', icoPath);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
