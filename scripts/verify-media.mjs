// scripts/verify-media.mjs
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const thumbsDir = path.join(ROOT, 'public', 'thumbs');
const productsDir = path.join(ROOT, 'public', 'products');

// Lista de slugs-alvo: se existir DB, deixe TODO e use mocks; aqui use os mocks atuais
const slugs = [
  "tee-oversized-preta",
  "tee-classic-branca",
  "regata-essential-preta",
  "drop-zero-limited",
  "acessorio-bucket-preto",
  "moletom-classic-cinza",
  "oversized-classic-off",
  "regatas-verao-pack",
];

const missing = [];

for (const slug of slugs) {
  const reqs = [
    path.join(productsDir, slug, 'front.webp'),
    path.join(productsDir, slug, 'back.webp'),
    path.join(productsDir, slug, 'detail-1.webp'),
    path.join(thumbsDir, `${slug}.webp`)
  ];
  for (const req of reqs) {
    if (!fs.existsSync(req)) missing.push(req);
  }
}

if (missing.length) {
  console.log('⚠️  Faltam arquivos de mídia:');
  for (const m of missing) console.log(' -', path.relative(ROOT, m));
  process.exit(0); // Apenas avisa; não quebra CI
} else {
  console.log('✅ Mídia verificada: todos os arquivos obrigatórios existem.');
}