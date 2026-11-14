// exporter.js - PNG rendering and saving
//
// Rendering and saving are separate so the PNG can be built ahead of time.
// Mobile share sheets require navigator.share() to run right after the tap,
// so the Save button must not wait on slow work like canvas encoding.

import { STEALIE_GEOMETRY, CROP_SIZE } from './constants.js';

// Scale so the circle in the export matches the crop's full resolution
const EXPORT_SCALE = CROP_SIZE / (STEALIE_GEOMETRY.RADIUS * 2);

const FILE_NAME = 'my-stealie.png';

// Composite the cropped image under the stealie and return a PNG Blob.
// stealieImg is the stealie <img> already on the page.
export async function renderStealiePNG(stealieImg, croppedCanvas) {
  const { DISPLAY_SIZE, CENTER_X, CENTER_Y, RADIUS } = STEALIE_GEOMETRY;

  const size = Math.round(DISPLAY_SIZE * EXPORT_SCALE);
  const centerX = CENTER_X * EXPORT_SCALE;
  const centerY = CENTER_Y * EXPORT_SCALE;
  const radius = RADIUS * EXPORT_SCALE;

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = size;
  exportCanvas.height = size;
  const ctx = exportCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Step 1: Draw the user image clipped to the circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(croppedCanvas, centerX - radius, centerY - radius, radius * 2, radius * 2);
  ctx.restore();

  // Step 2: Draw the stealie with a circular hole punched in its center
  if (!stealieImg.complete) {
    await new Promise((resolve, reject) => {
      stealieImg.addEventListener('load', resolve, { once: true });
      stealieImg.addEventListener('error', reject, { once: true });
    });
  }

  const stealieCanvas = document.createElement('canvas');
  stealieCanvas.width = size;
  stealieCanvas.height = size;
  const stealieCtx = stealieCanvas.getContext('2d');
  stealieCtx.drawImage(stealieImg, 0, 0, size, size);

  stealieCtx.globalCompositeOperation = 'destination-out';
  stealieCtx.beginPath();
  stealieCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  stealieCtx.fill();

  // Step 3: Put the punched stealie on top of the user image
  ctx.drawImage(stealieCanvas, 0, 0);

  return new Promise((resolve, reject) => {
    exportCanvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas could not be encoded as PNG'));
      }
    }, 'image/png');
  });
}

// Share (mobile) or download (desktop) a rendered PNG.
// Call this directly from a click handler so the share sheet is allowed to open.
export async function saveStealiePNG(blob) {
  const file = new File([blob], FILE_NAME, { type: 'image/png' });

  if (canShareFiles(file)) {
    try {
      await navigator.share({
        files: [file],
        title: 'My Stealie',
        text: 'Check out my Stealie!',
      });
      trackSave('share');
      return;
    } catch (err) {
      // User closed the share sheet: don't fall back to a download
      if (err.name === 'AbortError') {
        return;
      }
      // Any other failure falls through to a regular download
      console.warn('Share failed, falling back to download:', err);
      if (window.Sentry) {
        window.Sentry.captureException(err, { level: 'warning', tags: { context: 'share fallback' } });
      }
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = FILE_NAME;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoking immediately can cancel the download in Safari and Firefox
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  trackSave('download');
}

// True on phones that can send a PNG to the share sheet.
// Desktop browsers download instead, even when they support sharing.
export function canShareFiles(file = new File([''], FILE_NAME, { type: 'image/png' })) {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  return Boolean(isMobile && navigator.share && navigator.canShare && navigator.canShare({ files: [file] }));
}

function trackSave(method) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'generate_stealie', {
      event_category: 'engagement',
      event_label: method,
    });
  }
}
