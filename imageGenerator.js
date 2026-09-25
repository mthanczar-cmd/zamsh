const { createCanvas, loadImage } = require('canvas');

/**
 * POMOCNICZA: Bezpieczne ustawianie stylu tekstu dla node-canvas
 */
function setSafeFont(ctx, size = 30, weight = 'normal', family = 'sans-serif') {
  // W środowisku headless Linux używamy wyłącznie podstawowych rodzin systemowych
  ctx.font = `${weight} ${size}px ${family}`;
}

/**
 * 1. MODUŁ: WOLNE TERMINY (9:16 InstaStory)
 */
async function generateScheduleCanvas(headerText, slots = []) {
  const width = 1080;
  const height = 1920;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Wymuszenie czystego, beżowego tła
  ctx.fillStyle = '#f7f5f0';
  ctx.fillRect(0, 0, width, height);

  // Nagłówek
  ctx.fillStyle = '#2b2927';
  setSafeFont(ctx, 56, 'normal', 'serif');
  ctx.textAlign = 'center';
  ctx.fillText(headerText || 'Wolne Terminy', width / 2, 260);

  // Linia pod nagłówkiem
  ctx.strokeStyle = '#e6e1d8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(340, 310);
  ctx.lineTo(740, 310);
  ctx.stroke();

  // Sortowanie chronologiczne
  const sortedSlots = [...slots].sort((a, b) => {
    const matchA = a.day ? a.day.match(/\d+/g) : null;
    const matchB = b.day ? b.day.match(/\d+/g) : null;
    if (!matchA) return 1;
    if (!matchB) return -1;
    return parseInt(matchA[0], 10) - parseInt(matchB[0], 10);
  });

  // Lista terminów
  let currentY = 420;
  const rowSpacing = 130;

  sortedSlots.forEach((item) => {
    if (!item.day) return;

    // Dzień
    ctx.fillStyle = '#2b2927';
    setSafeFont(ctx, 26, 'bold', 'sans-serif');
    ctx.textAlign = 'center';
    ctx.fillText(item.day.toUpperCase(), width / 2, currentY);

    // Godziny
    if (item.hours) {
      ctx.fillStyle = '#8c857b';
      setSafeFont(ctx, 22, 'normal', 'sans-serif');
      ctx.fillText(item.hours, width / 2, currentY + 36);
    }

    currentY += rowSpacing;
  });

  // Znak wodny
  ctx.fillStyle = '#2b2927';
  setSafeFont(ctx, 32, 'normal', 'serif');
  ctx.textAlign = 'center';
  ctx.fillText('zamsh. studio', width / 2, height - 120);

  return canvas.toBuffer('image/png');
}

/**
 * 2. MODUŁ: PRZED I PO
 */
async function generateBeforeAfter(beforeBuffer, afterBuffer, aspectRatio = '9:16', titleText = '') {
  let width = 1080;
  let height = 1920;

  if (aspectRatio === '1:1') height = 1080;
  else if (aspectRatio === '4:5') height = 1350;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Tło
  ctx.fillStyle = '#f7f5f0';
  ctx.fillRect(0, 0, width, height);

  const imgBefore = await loadImage(beforeBuffer);
  const imgAfter = await loadImage(afterBuffer);

  const halfWidth = width / 2;
  const topHeaderHeight = titleText ? 140 : 80;
  const bottomFooterHeight = 100;
  const drawHeight = height - topHeaderHeight - bottomFooterHeight;

  drawCoverImage(ctx, imgBefore, 0, topHeaderHeight, halfWidth - 2, drawHeight);
  drawCoverImage(ctx, imgAfter, halfWidth + 2, topHeaderHeight, halfWidth - 2, drawHeight);

  // Linia podziału
  ctx.strokeStyle = '#f7f5f0';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(halfWidth, topHeaderHeight);
  ctx.lineTo(halfWidth, topHeaderHeight + drawHeight);
  ctx.stroke();

  drawBadge(ctx, 'PRZED', 40, topHeaderHeight + 30);
  drawBadge(ctx, 'PO', halfWidth + 40, topHeaderHeight + 30);

  if (titleText) {
    ctx.fillStyle = '#2b2927';
    setSafeFont(ctx, 28, 'bold', 'sans-serif');
    ctx.textAlign = 'center';
    ctx.fillText(titleText.toUpperCase(), width / 2, 75);
  }

  ctx.fillStyle = '#2b2927';
  setSafeFont(ctx, 28, 'normal', 'serif');
  ctx.textAlign = 'center';
  ctx.fillText('zamsh. studio', width / 2, height - 40);

  return canvas.toBuffer('image/png');
}

/**
 * 3. MODUŁ: STANDARD
 */
async function generatePost(title, subtitle) {
  const canvas = createCanvas(1080, 1080);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f7f5f0';
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.fillStyle = '#2b2927';
  setSafeFont(ctx, 48, 'normal', 'serif');
  ctx.textAlign = 'center';
  ctx.fillText(title || 'zamsh.', 540, 500);

  if (subtitle) {
    setSafeFont(ctx, 20, 'normal', 'sans-serif');
    ctx.fillStyle = '#8c857b';
    ctx.fillText(subtitle, 540, 560);
  }

  return canvas.toBuffer('image/png');
}

function drawCoverImage(ctx, img, x, y, targetWidth, targetHeight) {
  const imgRatio = img.width / img.height;
  const targetRatio = targetWidth / targetHeight;

  let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;

  if (imgRatio > targetRatio) {
    sourceWidth = img.height * targetRatio;
    sourceX = (img.width - sourceWidth) / 2;
  } else {
    sourceHeight = img.width / targetRatio;
    sourceY = (img.height - sourceHeight) / 2;
  }

  ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, targetWidth, targetHeight);
}

function drawBadge(ctx, text, x, y) {
  ctx.save();
  ctx.fillStyle = 'rgba(247, 245, 240, 0.9)';
  ctx.fillRect(x, y, 90, 36);

  ctx.fillStyle = '#2b2927';
  setSafeFont(ctx, 12, 'bold', 'sans-serif');
  ctx.textAlign = 'center';
  ctx.fillText(text, x + 45, y + 22);
  ctx.restore();
}

module.exports = { generatePost, generateBeforeAfter, generateScheduleCanvas };