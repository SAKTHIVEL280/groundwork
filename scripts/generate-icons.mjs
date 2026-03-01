// Generate all favicon PNGs from the SVG source
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../apps/web/public');
const svgBuffer = readFileSync(resolve(publicDir, 'favicon.svg'));

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'favicon-192.png' },
  { size: 512, name: 'favicon-512.png' },
];

async function generate() {
  for (const { size, name } of sizes) {
    await sharp(svgBuffer, { density: 400 })
      .resize(size, size)
      .png()
      .toFile(resolve(publicDir, name));
    console.log(`✓ ${name} (${size}x${size})`);
  }

  // Generate ICO (use 32x32 PNG as basis for .ico)
  // ICO is just a PNG wrapped in ICO container for modern browsers
  // We'll generate a 48x48 PNG for the favicon.ico
  const ico48 = await sharp(svgBuffer, { density: 400 })
    .resize(48, 48)
    .png()
    .toBuffer();

  // Create a minimal ICO file with the 48x48 PNG
  // ICO header: 6 bytes, 1 entry: 16 bytes, then PNG data
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // Reserved
  icoHeader.writeUInt16LE(1, 2); // Type: ICO
  icoHeader.writeUInt16LE(1, 4); // Count: 1 image

  const icoEntry = Buffer.alloc(16);
  icoEntry.writeUInt8(48, 0);    // Width
  icoEntry.writeUInt8(48, 1);    // Height
  icoEntry.writeUInt8(0, 2);     // Color palette
  icoEntry.writeUInt8(0, 3);     // Reserved
  icoEntry.writeUInt16LE(1, 4);  // Color planes
  icoEntry.writeUInt16LE(32, 6); // Bits per pixel
  icoEntry.writeUInt32LE(ico48.length, 8);  // Image size
  icoEntry.writeUInt32LE(22, 12); // Offset (6 + 16 = 22)

  const icoBuffer = Buffer.concat([icoHeader, icoEntry, ico48]);
  writeFileSync(resolve(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✓ favicon.ico (48x48)');

  console.log('\nAll icons generated successfully!');
}

generate().catch(console.error);
