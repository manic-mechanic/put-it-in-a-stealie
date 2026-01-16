// exporter.js - PNG export via Canvas

export function exportToPNG(stealieImg, userCanvas) {
  return new Promise((resolve) => {
    const size = 360;
    const radius = 127;
    const centerX = size / 2;
    const centerY = size / 2;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = size;
    exportCanvas.height = size;
    const ctx = exportCanvas.getContext('2d');

    // Load and draw Stealie first
    const stealie = new Image();
    stealie.onload = () => {
      // Step 1: Draw stealie
      ctx.drawImage(stealie, 0, 0, size, size);

      // Step 2: Punch a circular hole in the center
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Step 3: Draw user image behind (in the hole)
      ctx.globalCompositeOperation = 'destination-over';
      ctx.drawImage(userCanvas, 0, 0);

      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';

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
