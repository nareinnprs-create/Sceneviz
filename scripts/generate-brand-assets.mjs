import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MARK_SVG = path.join(REPO_ROOT, 'docs', 'brand', '01_logo', 'sceneviz_app_icon_concept.svg');
const ICON_SVG = path.join(REPO_ROOT, 'app', 'icon.svg');

const CYAN = '#16C5D0';

function pngToIco(pngBuffer, width, height) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(width >= 256 ? 0 : width, 0);
  entry.writeUInt8(height >= 256 ? 0 : height, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);
  return Buffer.concat([header, entry, pngBuffer]);
}

async function rasterize(svgPath, outPath, width, height = width) {
  const svg = fs.readFileSync(svgPath);
  await sharp(svg, { density: 384 })
    .resize(width, height, { fit: 'fill' })
    .png()
    .toFile(outPath);
  console.log(`  • ${path.relative(REPO_ROOT, outPath)}  ${width}x${height}`);
}

function wordmarkOg() {
  const mark = fs.readFileSync(ICON_SVG, 'utf8')
    .replace(/^[\s\S]*<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="og-bg" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#101319"/><stop offset=".55" stop-color="#0A2830"/><stop offset="1" stop-color="#101319"/>
    </linearGradient>
    <radialGradient id="og-glow" cx=".72" cy=".38" r=".6">
      <stop stop-color="#16C5D0" stop-opacity=".38"/><stop offset="1" stop-color="#16C5D0" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#og-bg)"/>
  <ellipse cx="880" cy="240" rx="420" ry="440" fill="url(#og-glow)"/>
  <g transform="translate(84,150) scale(0.62)">${mark}</g>
  <text x="470" y="320" fill="#F4F5F7" font-family="'Space Grotesk', Inter, Arial, sans-serif" font-size="104" font-weight="700" letter-spacing="6">SCENEVIZ</text>
  <text x="474" y="372" fill="${CYAN}" font-family="Inter, Arial, sans-serif" font-size="27" letter-spacing="9">IDEAS INTO MOVING WORLDS.</text>
  <text x="474" y="432" fill="#818996" font-family="Inter, Arial, sans-serif" font-size="22">AI image · video · cinema · lip-sync studio</text>
</svg>`;
}

async function main() {
  console.log('Generating Sceneviz brand assets…');
  await rasterize(MARK_SVG, path.join(REPO_ROOT, 'public', 'banner.png'), 1024, 1024);
  await rasterize(MARK_SVG, path.join(REPO_ROOT, 'app', 'apple-icon.png'), 180, 180);
  const ogTmp = path.join(REPO_ROOT, 'app', '.og-temp.svg');
  fs.writeFileSync(ogTmp, wordmarkOg());
  await rasterize(ogTmp, path.join(REPO_ROOT, 'app', 'opengraph-image.png'), 1200, 630);
  fs.rmSync(ogTmp, { force: true });

  const fav32 = await sharp(MARK_SVG, { density: 384 })
    .resize(32, 32, { fit: 'fill' })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(REPO_ROOT, 'app', 'favicon.ico'), pngToIco(fav32, 32, 32));
  console.log('  • app\\favicon.ico  32x32');
  console.log('Done.');
}

main().catch((err) => { console.error(err); process.exit(1); });
