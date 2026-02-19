import sharp from 'sharp';
import toIco from 'to-ico';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');

// Создаем папку icons если не существует
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

const sourceImage = join(publicDir, 'kandlate.png');

// Размеры иконок для PWA (Android, iOS, Windows)
const sizes = [
  // Standard PWA icons
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  
  // Apple Touch Icons
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 120, name: 'apple-touch-icon-120x120.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 167, name: 'apple-touch-icon-167x167.png' }, // iPad Pro
  { size: 180, name: 'apple-touch-icon-180x180.png' },
  
  // Favicon sizes
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' },
];

async function generateIcons() {
  console.log('Генерация иконок из', sourceImage);
  
  for (const { size, name } of sizes) {
    const outputPath = join(iconsDir, name);
    
    await sharp(sourceImage)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 } // Прозрачный фон
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Создан ${name} (${size}x${size})`);
  }
  
  // Создаем maskable иконку с отступами (для Android)
  const maskableSizes = [192, 512];
  for (const size of maskableSizes) {
    const padding = Math.floor(size * 0.1); // 10% отступ для safe zone
    const innerSize = size - (padding * 2);
    
    const outputPath = join(iconsDir, `maskable-icon-${size}x${size}.png`);
    
    // Создаем иконку с фоном и отступами для maskable
    const resizedIcon = await sharp(sourceImage)
      .resize(innerSize, innerSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toBuffer();
    
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 34, g: 197, b: 94, alpha: 1 } // Зеленый фон #22c55e
      }
    })
      .composite([{
        input: resizedIcon,
        top: padding,
        left: padding
      }])
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Создан maskable-icon-${size}x${size}.png`);
  }
  
  // Копируем основную иконку в корень public для совместимости
  await sharp(sourceImage)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toFile(join(publicDir, 'logo192.png'));
  console.log('✓ Обновлен logo192.png');
  
  await sharp(sourceImage)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toFile(join(publicDir, 'logo512.png'));
  console.log('✓ Обновлен logo512.png');
  
  // Apple touch icon в корень
  await sharp(sourceImage)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toFile(join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Создан apple-touch-icon.png');

  // favicon.ico для вкладки браузера (чтобы во вкладке был логотип компании, а не дефолтный)
  const png32 = await sharp(sourceImage)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();
  const png16 = await sharp(sourceImage)
    .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();
  const icoBuffer = await toIco([png32, png16]);
  writeFileSync(join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✓ Создан favicon.ico (для вкладки браузера)');
  
  console.log('\n✅ Все иконки успешно сгенерированы!');
}

generateIcons().catch(console.error);

