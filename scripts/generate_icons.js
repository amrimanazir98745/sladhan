import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

const svgPath = path.resolve('public/app-logo.svg');
const svgCode = fs.readFileSync(svgPath, 'utf8');

const sizes = [
  { name: 'public/apple-touch-icon.png', size: 180 },
  { name: 'public/apple-touch-icon-precomposed.png', size: 180 },
  { name: 'public/icon-192.png', size: 192 },
  { name: 'public/icon-512.png', size: 512 },
  { name: 'public/favicon-32x32.png', size: 32 },
  { name: 'public/favicon.png', size: 512 }
];

sizes.forEach(({ name, size }) => {
  const resvg = new Resvg(svgCode, {
    fitTo: {
      mode: 'width',
      value: size,
    },
  });
  const image = resvg.render();
  const pngBuffer = image.asPng();
  fs.writeFileSync(path.resolve(name), pngBuffer);
  console.log(`Generated ${name} (${size}x${size})`);
});
