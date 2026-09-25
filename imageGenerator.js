const { createCanvas } = require('canvas');
const fs = require('fs');

async function generatePost(slots, style = '1', outputPath = './post.png') {
  const width = 1080;
  const height = 1080;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // KONFIGURACJA JASNYCH, STYLOWYCH PALET PALET KOLORYSTYCZNYCH
  let bgGradient, frameColor, titleColor, subtitleColor, cardBg, cardBorder, textColor, footerColor;

  if (style === '2') {
    // STYL 2: Jasny Pudrowy Róż / Nude (Subtelny & Beauty)
    bgGradient = ['#fdfbfb', '#f4ece8'];
    frameColor = '#e2c7bf';
    titleColor = '#4a3e3d';
    subtitleColor = '#b58378';
    cardBg = '#ffffff';
    cardBorder = '#eee2de';
    textColor = '#4a3e3d';
    footerColor = '#8c7b77';
  } else if (style === '3') {
    // STYL 3: Modern Minimalist / Czysta Biel i Szarość
    bgGradient = ['#ffffff', '#f1f3f5'];
    frameColor = '#dbe2e8';
    titleColor = '#1a202c';
    subtitleColor = '#718096';
    cardBg = '#ffffff';
    cardBorder = '#e2e8f0';
    textColor = '#2d3748';
    footerColor = '#a0aec0';
  } else {
    // STYL 1 (Domyślny): JAPANDI / Warm Beige (Ciepłe Drewno, Piasek, Naturalny Ziemisty)
    bgGradient = ['#f7f4ef', '#eae3d9'];
    frameColor = '#c4b5a5';
    titleColor = '#2d2926';
    subtitleColor = '#7a6a58';
    cardBg = 'rgba(255, 255, 255, 0.75)';
    cardBorder = '#dcd3c5';
    textColor = '#2d2926';
    footerColor = '#6b5e52';
  }

  // 1. Tło - subtelny gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, bgGradient[0]);
  gradient.addColorStop(1, bgGradient[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtelna ramka
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 50, width - 100, height - 100);

  // 3. Nagłówek
  ctx.fillStyle = titleColor;
  ctx.font = '500 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WOLNE TERMINY', width / 2, 175);

  ctx.fillStyle = subtitleColor;
  ctx.font = '24px sans-serif';
  ctx.fillText('— ZAPISZ SIĘ PRZEZ BOOKSY —', width / 2, 225);

  // Linia dekoracyjna pod nagłówkiem
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 80, 260);
  ctx.lineTo(width / 2 + 80, 260);
  ctx.stroke();

  // 4. Lista terminów
  let startY = 350;
  const lineHeight = 80;

  slots.forEach((slot) => {
    // Tło pojedynczego kafelka
    ctx.fillStyle = cardBg;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(160, startY - 42, width - 320, 60, 16);
      ctx.fill();
      ctx.strokeStyle = cardBorder;
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      ctx.fillRect(160, startY - 42, width - 320, 60);
    }

    // Tekst terminu
    ctx.fillStyle = textColor;
    ctx.font = '30px sans-serif';
    ctx.fillText(slot, width / 2, startY);
    startY += lineHeight;
  });

  // 5. Podpis na dole
  ctx.fillStyle = footerColor;
  ctx.font = '22px sans-serif';
  ctx.fillText('Rezerwacja online przez Booksy lub wiadomość prywatną', width / 2, height - 110);

  // Zapis do pliku
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log('✅ SUKCES! Jasny, minimalistyczny post został zapisany jako post.png');
}

module.exports = { generatePost, generateLastMinutePost: generatePost };