import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const pub = join(import.meta.dirname, '..', 'public');
const svg = readFileSync(join(pub, 'icon.svg'));

const targets = [
  [192, 'icon-192.png'],
  [512, 'icon-512.png'],
  [180, 'apple-touch-icon.png'],
];

for (const [size, name] of targets) {
  await sharp(svg).resize(size, size).png().toFile(join(pub, name));
  console.log('wrote', name);
}
console.log('icons done');
