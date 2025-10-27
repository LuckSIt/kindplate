#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const viteCacheDir = path.join(__dirname, 'node_modules', '.vite');

console.log('🧹 Очистка кэша Vite...');

if (fs.existsSync(viteCacheDir)) {
  fs.rmSync(viteCacheDir, { recursive: true, force: true });
  console.log('✅ Кэш Vite очищен');
} else {
  console.log('ℹ️ Кэш Vite не найден');
}

console.log('🚀 Теперь запустите: npm run dev');



