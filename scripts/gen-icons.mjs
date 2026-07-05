import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const pub = join(import.meta.dirname, '..', 'public');
const appDir = join(import.meta.dirname, '..', 'src', 'app');
const svg = readFileSync(join(pub, 'icon.svg'));

// PWA/тач-иконки.
const targets = [
  [192, 'icon-192.png'],
  [512, 'icon-512.png'],
  [180, 'apple-touch-icon.png'],
];

for (const [size, name] of targets) {
  await sharp(svg).resize(size, size).png().toFile(join(pub, name));
  console.log('wrote', name);
}

// favicon.ico: PNG-in-ICO (16/32/48), поддерживается всеми современными браузерами.
// Next App Router отдаёт src/app/favicon.ico как /favicon.ico автоматически.
function packIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, buf } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bpp
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += buf.length;
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.buf)]);
}

const icoSizes = [16, 32, 48];
const icoPngs = [];
for (const size of icoSizes) {
  icoPngs.push({ size, buf: await sharp(svg).resize(size, size).png().toBuffer() });
}
writeFileSync(join(appDir, 'favicon.ico'), packIco(icoPngs));
console.log('wrote src/app/favicon.ico (16+32+48)');

console.log('icons done');
