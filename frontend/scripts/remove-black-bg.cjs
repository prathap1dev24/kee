// One-off asset-processing script: converts the near-solid-black background
// of the dashboard product photos to transparency, so the badge shows just
// the product floating on the card's own background instead of a black
// square. Not part of the app build/runtime - run manually with:
//   node scripts/remove-black-bg.js
//
// Uses a soft luminance threshold (not a hard cutoff) so the edge between
// product and background fades smoothly instead of leaving a jagged/haloed
// cutout line.
const sharp = require('sharp');
const path = require('path');

const DIR = path.join(__dirname, '..', 'src', 'assets', 'dashboard-icons');
const FILES = ['used-machines', 'ecm-service', 'meter-service', 'scanning-service'];

const LOW = 26;   // pixels this dark or darker become fully transparent
const HIGH = 70;  // pixels this bright or brighter stay fully opaque

async function processOne(name) {
  const inputPath = path.join(DIR, `${name}.jpg`);
  const outputPath = path.join(DIR, `${name}.png`);

  const img = sharp(inputPath).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const lum = Math.max(r, g, b);
    let alpha;
    if (lum <= LOW) alpha = 0;
    else if (lum >= HIGH) alpha = 255;
    else alpha = Math.round(((lum - LOW) / (HIGH - LOW)) * 255);
    data[i + 3] = Math.min(data[i + 3], alpha);
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);

  console.log(`wrote ${outputPath}`);
}

(async () => {
  for (const name of FILES) {
    await processOne(name);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
