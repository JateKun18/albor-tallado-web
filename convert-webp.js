const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const DIRS = [
  'assets/CATALOGO/CUENCO_JARDIN',
  'assets/CATALOGO/JARDIN_EN_COPA',
  'assets/CATALOGO/HOJA_Y_ROSA',
];

const BASE = path.resolve(__dirname);

async function convertDir(dir) {
  const full = path.join(BASE, dir);
  const files = fs.readdirSync(full).filter(f => f.toLowerCase().endsWith('.png'));
  for (const file of files) {
    const input = path.join(full, file);
    const output = path.join(full, file.replace(/\.png$/i, '.webp'));
    if (fs.existsSync(output)) {
      console.log(`SKIP (exists): ${output}`);
      continue;
    }
    await sharp(input).webp({ quality: 85 }).toFile(output);
    const inSz = fs.statSync(input).size;
    const outSz = fs.statSync(output).size;
    console.log(`OK: ${file} → webp  ${(inSz/1024).toFixed(0)}KB → ${(outSz/1024).toFixed(0)}KB`);
  }
}

(async () => {
  for (const d of DIRS) await convertDir(d);
  console.log('Done.');
})();
