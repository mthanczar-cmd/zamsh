const sharp = require('sharp');

/**
 * POMOCNICZA: Escapowanie znaków XML w tekście
 */
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * 1. WOLNE TERMINY (9:16 InstaStory)
 */
async function generateScheduleCanvas(headerText = 'Wolne Terminy', slots = []) {
  const width = 1080;
  const height = 1920;

  const sortedSlots = [...slots].sort((a, b) => {
    const matchA = a.day ? a.day.match(/\d+/g) : null;
    const matchB = b.day ? b.day.match(/\d+/g) : null;
    if (!matchA) return 1;
    if (!matchB) return -1;
    return parseInt(matchA[0], 10) - parseInt(matchB[0], 10);
  });

  let currentY = 420;
  const rowSpacing = 130;

  let slotsSvg = '';
  sortedSlots.forEach((item) => {
    if (!item.day) return;
    const dayEsc = escapeXml(item.day.toUpperCase());
    const hoursEsc = escapeXml(item.hours || '');

    slotsSvg += `
      <text x="540" y="${currentY}" font-family="sans-serif" font-size="26" font-weight="bold" fill="#2b2927" text-anchor="middle">${dayEsc}</text>
      <text x="540" y="${currentY + 36}" font-family="sans-serif" font-size="22" fill="#8c857b" text-anchor="middle">${hoursEsc}</text>
    `;
    currentY += rowSpacing;
  });

  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f7f5f0"/>
    <text x="540" y="260" font-family="serif" font-size="56" fill="#2b2927" text-anchor="middle">${escapeXml(headerText)}</text>
    <line x1="340" y1="310" x2="740" y2="310" stroke="#e6e1d8" stroke-width="2"/>
    ${slotsSvg}
    <text x="540" y="${height - 120}" font-family="serif" font-size="32" fill="#2b2927" text-anchor="middle">zamsh. studio</text>
  </svg>
  `;

  return await sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * 2. PRZED I PO
 */
async function generateBeforeAfter(beforeBuffer, afterBuffer, aspectRatio = '9:16', titleText = '') {
  let width = 1080;
  let height = 1920;

  if (aspectRatio === '1:1') height = 1080;
  else if (aspectRatio === '4:5') height = 1350;

  const topHeaderHeight = titleText ? 140 : 80;
  const bottomFooterHeight = 100;
  const drawHeight = height - topHeaderHeight - bottomFooterHeight;
  const halfWidth = Math.floor(width / 2) - 2;

  // Przetworzenie zdjęć Przed i Po do dokładnego wymiaru (Crop / Cover)
  const resizedBefore = await sharp(beforeBuffer)
    .resize(halfWidth, drawHeight, { fit: 'cover' })
    .toBuffer();

  const resizedAfter = await sharp(afterBuffer)
    .resize(halfWidth, drawHeight, { fit: 'cover' })
    .toBuffer();

  // Szablon SVG jako nakładka (Tło, Napisy, Ramki)
  const titleSvg = titleText 
    ? `<text x="540" y="75" font-family="sans-serif" font-size="28" font-weight="bold" fill="#2b2927" text-anchor="middle">${escapeXml(titleText.toUpperCase())}</text>`
    : '';

  const overlaySvg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    ${titleSvg}
    
    <!-- Badges PRZED / PO -->
    <rect x="40" y="${topHeaderHeight + 30}" width="90" height="36" fill="#f7f5f0" rx="4"/>
    <text x="85" y="${topHeaderHeight + 53}" font-family="sans-serif" font-size="14" font-weight="bold" fill="#2b2927" text-anchor="middle">PRZED</text>
    
    <rect x="${halfWidth + 44}" y="${topHeaderHeight + 30}" width="90" height="36" fill="#f7f5f0" rx="4"/>
    <text x="${halfWidth + 89}" y="${topHeaderHeight + 53}" font-family="sans-serif" font-size="14" font-weight="bold" fill="#2b2927" text-anchor="middle">PO</text>

    <!-- Stopka -->
    <text x="540" y="${height - 40}" font-family="serif" font-size="28" fill="#2b2927" text-anchor="middle">zamsh. studio</text>
  </svg>
  `;

  // Kompozycja elementów w Sharp
  return await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 247, g: 245, b: 240, alpha: 1 }
    }
  })
  .composite([
    { input: resizedBefore, top: topHeaderHeight, left: 0 },
    { input: resizedAfter, top: topHeaderHeight, left: halfWidth + 4 },
    { input: Buffer.from(overlaySvg), top: 0, left: 0 }
  ])
  .png()
  .toBuffer();
}

/**
 * 3. STANDARDOWY POST (Kwadrat 1:1)
 */
async function generatePost(title = 'zamsh.', subtitle = '') {
  const width = 1080;
  const height = 1080;

  const subtitleSvg = subtitle
    ? `<text x="540" y="560" font-family="sans-serif" font-size="22" fill="#8c857b" text-anchor="middle">${escapeXml(subtitle)}</text>`
    : '';

  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f7f5f0"/>
    <text x="540" y="500" font-family="serif" font-size="48" fill="#2b2927" text-anchor="middle">${escapeXml(title)}</text>
    ${subtitleSvg}
  </svg>
  `;

  return await sharp(Buffer.from(svg)).png().toBuffer();
}

module.exports = { generatePost, generateBeforeAfter, generateScheduleCanvas };