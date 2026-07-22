// One-off asset-processing script: converts the light white-to-gray
// gradient background baked into the user-provided customer-support headset
// icon into true transparency, so the icon-badge shows just the blue
// headset glyph instead of a washed-out gray square behind it.
//
// The source PNG already has an alpha channel (hasAlpha: true) but every
// pixel - including the corners - is fully opaque; the "background" is
// just very low-saturation white/gray RGB values. The headset glyph itself
// is saturated blue throughout (no black/gray outline strokes), so a soft
// threshold on color saturation (max channel - min channel) cleanly
// separates glyph from background without touching the glyph's own pixels.
//
// Not part of the app build/runtime - run manually with:
//   node scripts/remove-support-icon-bg.cjs
const sharp = require('sharp');
const path = require('path');

const FILE = path.join(__dirname, '..', 'src', 'assets', 'dashboard-icons', 'customer-support.png');

const LOW = 15;   // saturation at/below this -> fully transparent (background)
const HIGH = 100;  // saturation at/above this -> fully opaque (glyph)

async function run() {
  const img = sharp(FILE).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const sat = max - min;
    let alpha;
    if (sat <= LOW) alpha = 0;
    else if (sat >= HIGH) alpha = 255;
    else alpha = Math.round(((sat - LOW) / (HIGH - LOW)) * 255);
    data[i + 3] = Math.min(data[i + 3], alpha);
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(FILE);

  console.log(`wrote ${FILE}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
