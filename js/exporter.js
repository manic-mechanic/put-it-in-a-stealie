// exporter.js - PNG export via Canvas

export function exportToPNG(stealieImg, userCanvas) {
  return new Promise((resolve) => {
    const size = 360;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = size;
    exportCanvas.height = size;
    const ctx = exportCanvas.getContext('2d');

    // Load stealie
    const stealie = new Image();
    stealie.onload = () => {
      // Step 1: Draw stealie to a temp canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = size;
      tempCanvas.height = size;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(stealie, 0, 0, size, size);

      // Step 2: Make white pixels transparent
      const imageData = tempCtx.getImageData(0, 0, size, size);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // If pixel is white or near-white, make it transparent
        if (r > 250 && g > 250 && b > 250) {
          data[i + 3] = 0; // Set alpha to 0
        }
      }
      tempCtx.putImageData(imageData, 0, 0);

      // Step 3: Draw user image first
      ctx.drawImage(userCanvas, 0, 0);

      // Step 4: Draw stealie (with transparent whites) on top
      ctx.drawImage(tempCanvas, 0, 0);

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
