// exporter.js - PNG export via Canvas

export function exportToPNG(stealieImg, userCanvas) {
  return new Promise((resolve) => {
    const size = 360;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = size;
    exportCanvas.height = size;
    const ctx = exportCanvas.getContext('2d');

    // Draw user image first (already clipped to circle)
    ctx.drawImage(userCanvas, 0, 0);

    // Load and draw Stealie on top
    const stealie = new Image();
    stealie.onload = () => {
      ctx.drawImage(stealie, 0, 0, size, size);

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
