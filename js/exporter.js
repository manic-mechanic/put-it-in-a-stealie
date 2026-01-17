// exporter.js - PNG export with proper compositing

import { STEALIE_GEOMETRY } from './constants.js';

export function exportToPNG(stealieImg, userCanvas, scale = 1.5) {
  return new Promise((resolve) => {
    const { DISPLAY_SIZE, CENTER_X, CENTER_Y, RADIUS } = STEALIE_GEOMETRY;

    // Scale all dimensions
    const size = DISPLAY_SIZE * scale;
    const centerX = CENTER_X * scale;
    const centerY = CENTER_Y * scale;
    const radius = RADIUS * scale;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = size;
    exportCanvas.height = size;
    const ctx = exportCanvas.getContext('2d');

    // Enable high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Step 1: Draw high-res user image clipped to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    // Draw the square crop into the circle
    // The crop is expected to fit exactly into the circle's bounding box
    const imgSize = radius * 2;
    ctx.drawImage(userCanvas, centerX - radius, centerY - radius, imgSize, imgSize);
    ctx.restore();

    // Step 2: Load stealie and composite with hole
    const stealie = new Image();
    stealie.onload = () => {
      // Create temp canvas for stealie with hole
      const stealieCanvas = document.createElement('canvas');
      stealieCanvas.width = size;
      stealieCanvas.height = size;
      const stealieCtx = stealieCanvas.getContext('2d');

      stealieCtx.imageSmoothingEnabled = true;
      stealieCtx.imageSmoothingQuality = 'high';

      // Draw stealie (SVG will scale losslessly if it's an SVG, or scale up key pixel art)
      stealieCtx.drawImage(stealie, 0, 0, size, size);

      // Punch circular hole using destination-out
      stealieCtx.globalCompositeOperation = 'destination-out';
      stealieCtx.beginPath();
      stealieCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      stealieCtx.fill();

      // Reset composite mode
      stealieCtx.globalCompositeOperation = 'source-over';

      // Step 3: Draw punched stealie on top of user image
      ctx.drawImage(stealieCanvas, 0, 0);

      // Trigger download
      const link = document.createElement('a');
      link.download = 'my-stealie.png';
      link.href = exportCanvas.toDataURL('image/png');
      link.click();

      resolve();
    };
    stealie.src = stealieImg.src;
  });
}
