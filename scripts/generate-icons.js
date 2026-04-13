const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Brand colors
const AMBER = '#f4b942';
const AMBER_DARK = '#d4952a';
const AMBER_LIGHT = '#fcd980';
const DARK_BG = '#1a1a2e';
const WHITE = '#ffffff';

function drawIcon(size, outputPath, { isAdaptive = false, isSplash = false, isFavicon = false } = {}) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  if (isSplash) {
    // Splash: amber background with centered logo
    ctx.fillStyle = AMBER;
    ctx.fillRect(0, 0, size, size);
    drawLogoMark(ctx, size * 0.25, size * 0.25, size * 0.5);
    const buf = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buf);
    console.log(`  Splash: ${outputPath} (${size}x${size})`);
    return;
  }

  if (isAdaptive) {
    // Adaptive icon: transparent bg, logo centered in safe zone (inner 66%)
    ctx.clearRect(0, 0, size, size);
    const inset = size * 0.17;
    const innerSize = size - inset * 2;

    // Amber circle background
    const cx = size / 2;
    const cy = size / 2;
    const radius = innerSize / 2;
    const grad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
    grad.addColorStop(0, AMBER_LIGHT);
    grad.addColorStop(0.5, AMBER);
    grad.addColorStop(1, AMBER_DARK);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    drawLogoMark(ctx, inset + innerSize * 0.15, inset + innerSize * 0.15, innerSize * 0.7);
    const buf = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buf);
    console.log(`  Adaptive: ${outputPath} (${size}x${size})`);
    return;
  }

  // Standard icon: rounded rect with gradient
  const cornerRadius = size * 0.22;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#f7c94d');
  grad.addColorStop(0.4, AMBER);
  grad.addColorStop(1, AMBER_DARK);
  ctx.fillStyle = grad;
  roundRect(ctx, 0, 0, size, size, cornerRadius);
  ctx.fill();

  // Subtle inner shadow / depth
  const innerGrad = ctx.createLinearGradient(0, 0, 0, size);
  innerGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
  innerGrad.addColorStop(0.5, 'rgba(255,255,255,0)');
  innerGrad.addColorStop(1, 'rgba(0,0,0,0.1)');
  ctx.fillStyle = innerGrad;
  roundRect(ctx, 0, 0, size, size, cornerRadius);
  ctx.fill();

  // Draw the logo mark
  const padding = size * 0.15;
  const markSize = size - padding * 2;
  drawLogoMark(ctx, padding, padding, markSize);

  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buf);
  console.log(`  Icon: ${outputPath} (${size}x${size})`);
}

function drawLogoMark(ctx, x, y, s) {
  // The HUMAID mark: stylized "H" with data-pulse line through the middle
  // Creating a modern, geometric "H" that suggests both humanity and data

  ctx.save();
  ctx.translate(x, y);

  const col = WHITE;
  const lineW = s * 0.12;

  // Left pillar of H — slightly tapered
  ctx.fillStyle = col;
  ctx.beginPath();
  const pillarW = lineW;
  const pillarH = s * 0.8;
  const topY = s * 0.1;

  // Left pillar
  roundRect(ctx, s * 0.12, topY, pillarW, pillarH, pillarW * 0.3);
  ctx.fill();

  // Right pillar
  ctx.beginPath();
  roundRect(ctx, s - s * 0.12 - pillarW, topY, pillarW, pillarH, pillarW * 0.3);
  ctx.fill();

  // Middle crossbar — this is the "data pulse" / heartbeat line
  // Instead of a straight bar, we draw a pulse/wave
  ctx.strokeStyle = col;
  ctx.lineWidth = lineW * 0.7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const midY = s * 0.5;
  const leftX = s * 0.12 + pillarW;
  const rightX = s - s * 0.12 - pillarW;
  const span = rightX - leftX;

  ctx.beginPath();
  ctx.moveTo(leftX, midY);

  // Flat start
  ctx.lineTo(leftX + span * 0.15, midY);

  // First small bump
  ctx.lineTo(leftX + span * 0.22, midY - s * 0.03);
  ctx.lineTo(leftX + span * 0.28, midY);

  // Main spike up (heartbeat peak)
  ctx.lineTo(leftX + span * 0.35, midY);
  ctx.lineTo(leftX + span * 0.42, midY - s * 0.18);

  // Sharp dip down
  ctx.lineTo(leftX + span * 0.50, midY + s * 0.12);

  // Recovery spike
  ctx.lineTo(leftX + span * 0.58, midY - s * 0.10);

  // Return to baseline
  ctx.lineTo(leftX + span * 0.65, midY);

  // Small trailing bump
  ctx.lineTo(leftX + span * 0.72, midY + s * 0.03);
  ctx.lineTo(leftX + span * 0.78, midY);

  // Flat end
  ctx.lineTo(rightX, midY);

  ctx.stroke();

  // Small dot / data point at the peak
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(leftX + span * 0.42, midY - s * 0.18, lineW * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Bottom accent — three small bars representing BAY states data
  const barY = topY + pillarH + s * 0.02;
  const barH = s * 0.05;
  const barGap = s * 0.03;
  const barColors = ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.65)', 'rgba(255,255,255,0.4)'];
  const barWidths = [s * 0.35, s * 0.25, s * 0.15];

  // Only draw if there's room
  if (barY + barH < s) {
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = barColors[i];
      const bx = s * 0.5 - barWidths[i] / 2;
      const by = barY; // stack them horizontally, not vertically
      // Actually, let's put 3 small dots instead for cleanliness
    }

    // Three dots representing B, A, Y states
    const dotR = s * 0.025;
    const dotY2 = topY + pillarH + s * 0.06;
    const dotSpacing = s * 0.08;
    const dotCx = s * 0.5;

    if (dotY2 + dotR < s) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(dotCx - dotSpacing, dotY2, dotR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.beginPath();
      ctx.arc(dotCx, dotY2, dotR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.arc(dotCx + dotSpacing, dotY2, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Generate all required icon sizes
const assetsDir = path.join(__dirname, '..', 'assets', 'images');

console.log('Generating HUMAID brand icons...\n');

// Main app icon (1024x1024 for stores)
drawIcon(1024, path.join(assetsDir, 'icon.png'));

// Adaptive icon for Android
drawIcon(1024, path.join(assetsDir, 'adaptive-icon.png'), { isAdaptive: true });

// Splash icon
drawIcon(512, path.join(assetsDir, 'splash-icon.png'), { isSplash: true });

// Favicon
drawIcon(48, path.join(assetsDir, 'favicon.png'));

console.log('\nDone! All icons generated.');
