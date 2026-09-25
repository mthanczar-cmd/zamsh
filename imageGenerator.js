const { createCanvas, loadImage } = require('canvas');

/**
 * Generowanie grafiki PRZED i PO
 */
async function generateBeforeAfter(beforeBuffer, afterBuffer, aspectRatio = '1:1', titleText = '') {
  let width = 1080;
  let height = 1080;

  if (aspectRatio === '9:16') {
    height = 1920;
  } else if (aspectRatio === '4:5') {
    height = 1350;
  }

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Wczytanie obrazów
  const imgBefore = await loadImage(beforeBuffer);
  const imgAfter = await loadImage(afterBuffer);

  // Tło
  ctx.fillStyle = '#f7f5f0';
  ctx.fillRect(0, 0, width, height);

  // Obliczenie wymiarów połówek
  const halfWidth = width / 2;
  const padding = 20; 
  const topHeaderHeight = titleText ? 140 : 80;
  const bottomFooterHeight = 100;
  const drawHeight = height - topHeaderHeight - bottomFooterHeight;

  // Rysowanie kadrowanych zdjęć (Left = Before, Right = After)
  drawCoverImage(ctx, imgBefore, 0, topHeaderHeight, halfWidth - 2, drawHeight);
  drawCoverImage(ctx, imgAfter, halfWidth + 2, topHeaderHeight, halfWidth - 2, drawHeight);

  // Środkowa linia separatora
  ctx.strokeStyle = '#f7f5f0';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(halfWidth, topHeaderHeight);
  ctx.lineTo(halfWidth, topHeaderHeight + drawHeight);
  ctx.stroke();

  // Etykiety PRZED / PO
  drawBadge(ctx, 'PRZED', 40, topHeaderHeight + 30);
  drawBadge(ctx, 'PO', halfWidth + 40, topHeaderHeight + 30);

  // Nagłówek (Góra)
  if (titleText) {
    ctx.fillStyle = '#2b2927';
    ctx.font = '500 28px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(titleText.toUpperCase(), width / 2, 75);
  }

  // Znak wodny / Podpis zamsz. (Dół)
  ctx.fillStyle = '#2b2927';
  ctx.font = '300 28px "Cormorant Garamond", serif';
  ctx.textAlign = 'center';
  ctx.fillText('zamsh. studio', width / 2, height - 40);

  return canvas.toBuffer('image/png');
}

/**
 * Pomocnicza funkcja do wyśrodkowanego przycinania (object-fit: cover)
 */
function drawCoverImage(ctx, img, x, y, targetWidth, targetHeight) {
  const imgRatio = img.width / img.height;
  const targetRatio = targetWidth / targetHeight;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = img.width;
  let sourceHeight = img.height;

  if (imgRatio > targetRatio) {
    sourceWidth = img.height * targetRatio;
    sourceX = (img.width - sourceWidth) / 2;
  } else {
    sourceHeight = img.width / targetRatio;
    sourceY = (img.height - sourceHeight) / 2;
  }

  ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, targetWidth, targetHeight);
}

/**
 * Pomocnicze etykiety PRZED / PO
 */
function drawBadge(ctx, text, x, y) {
  ctx.save();
  ctx.fillStyle = 'rgba(247, 245, 240, 0.9)';
  ctx.fillRect(x, y, 90, 36);

  ctx.fillStyle = '#2b2927';
  ctx.font = '600 12px "Montserrat", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, x + 45, y + 22);
  ctx.restore();
}

/**
 * Zachowana funkcja dla klasycznych postów
 */
async function generatePost(title, subtitle) {
  const canvas = createCanvas(1080, 1080);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f7f5f0';
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.fillStyle = '#2b2927';
  ctx.font = '400 48px "Cormorant Garamond", serif';
  ctx.textAlign = 'center';
  ctx.fillText(title || 'zamsh.', 540, 500);

  if (subtitle) {
    ctx.font = '300 20px "Montserrat", sans-serif';
    ctx.fillStyle = '#8c857b';
    ctx.fillText(subtitle, 540, 560);
  }

  return canvas.toBuffer('image/png');
}

module.exports = { generatePost, generateBeforeAfter };