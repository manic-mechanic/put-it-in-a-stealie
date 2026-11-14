// cropperModal.js - Cropper.js integration

import { CROP_SIZE } from './constants.js';

let cropper = null;
let cropperReady = false; // Guard against pre-ready interactions
let isSliderDriven = false; // Prevent feedback loop
let savedCropData = null; // Store crop state for recrop
let savedCanvasData = null;

// Opens the crop modal for img.
// onCropComplete(canvas) is called with a CROP_SIZE x CROP_SIZE canvas when the user presses Done.
// onCancel() is called if the user cancels instead.
// restoreState: reopen with the position/zoom from the last completed crop.
export function openCropModal(img, onCropComplete, onCancel, restoreState = false) {
  const modal = document.getElementById('crop-modal');
  const cropImage = document.getElementById('crop-image');
  const cancelBtn = document.getElementById('crop-cancel');
  const doneBtn = document.getElementById('crop-done');
  const zoomSlider = document.getElementById('zoom-slider');
  const zoomOutBtn = document.getElementById('zoom-out');
  const zoomInBtn = document.getElementById('zoom-in');

  // Remember what had focus so we can return to it on close
  const previouslyFocused = document.activeElement;

  cropImage.src = img.src;
  modal.classList.remove('hidden');
  doneBtn.focus();

  cropperReady = false;

  const sliderMin = () => parseFloat(zoomSlider.min);
  const sliderMax = () => parseFloat(zoomSlider.max);
  const clampZoom = (ratio) => Math.max(sliderMin(), Math.min(sliderMax(), ratio));

  // Current zoom ratio (displayed size / natural size)
  const currentZoom = () => {
    const imageData = cropper.getImageData();
    return imageData.width / imageData.naturalWidth;
  };

  cropper = new Cropper(cropImage, {
    aspectRatio: 1,
    viewMode: 3, // Fill the container with the image
    dragMode: 'move', // Allow moving the image canvas
    cropBoxResizable: false, // Lock box size
    cropBoxMovable: false, // Lock box position
    toggleDragModeOnDblclick: false,
    autoCropArea: 1, // Start with max crop box
    background: false,
    guides: false,
    ready() {
      // Read the "fit" zoom BEFORE restoring a previous crop, so the slider
      // range is always based on the fully zoomed-out image.
      // Scaling the range to the image fixes large phone photos (4000px+),
      // where the fit ratio is tiny (~0.05) and a fixed 0-1 range zooms far too fast.
      const fitZoom = currentZoom();
      const minZoom = fitZoom;       // viewMode 3 can't zoom out past the fit anyway
      const maxZoom = fitZoom * 3;   // 3x zoom is a reasonable max
      zoomSlider.min = minZoom;
      zoomSlider.max = maxZoom;
      zoomSlider.step = (maxZoom - minZoom) / 100; // 100 smooth steps

      if (restoreState && savedCanvasData && savedCropData) {
        cropper.setCanvasData(savedCanvasData);
        cropper.setData(savedCropData);
      }

      zoomSlider.value = clampZoom(currentZoom());
      cropperReady = true;
    },
    zoom(e) {
      // Sync slider when zooming via pinch/scroll/buttons (not the slider itself)
      if (!isSliderDriven) {
        zoomSlider.value = clampZoom(e.detail.ratio);
      }
    },
  });

  const handleZoom = (e) => {
    if (cropper && cropperReady) {
      isSliderDriven = true;
      cropper.zoomTo(parseFloat(e.target.value));
      isSliderDriven = false;
    }
  };

  // +/- buttons move 10% of the slider range per click
  const zoomBy = (direction) => {
    if (cropper && cropperReady) {
      const step = (sliderMax() - sliderMin()) / 10;
      cropper.zoomTo(clampZoom(currentZoom() + direction * step));
    }
  };
  const handleZoomIn = () => zoomBy(1);
  const handleZoomOut = () => zoomBy(-1);

  const handleCancel = () => {
    close();
    onCancel();
  };

  const handleDone = () => {
    if (!cropperReady) {
      return;
    }

    // Save crop state for potential recrop
    savedCropData = cropper.getData();
    savedCanvasData = cropper.getCanvasData();

    const canvas = cropper.getCroppedCanvas({
      width: CROP_SIZE,
      height: CROP_SIZE,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });

    // Track creation event (user finished cropping)
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'stealie_created', {
        event_category: 'engagement',
        event_label: 'crop_completed',
      });
    }

    close();
    onCropComplete(canvas);
  };

  // Escape cancels; Tab stays inside the modal
  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
      return;
    }
    if (e.key === 'Tab') {
      const focusable = [zoomOutBtn, zoomSlider, zoomInBtn, cancelBtn, doneBtn];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (!modal.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  zoomSlider.addEventListener('input', handleZoom);
  zoomInBtn.addEventListener('click', handleZoomIn);
  zoomOutBtn.addEventListener('click', handleZoomOut);
  cancelBtn.addEventListener('click', handleCancel);
  doneBtn.addEventListener('click', handleDone);
  document.addEventListener('keydown', handleKeydown);

  function close() {
    zoomSlider.removeEventListener('input', handleZoom);
    zoomInBtn.removeEventListener('click', handleZoomIn);
    zoomOutBtn.removeEventListener('click', handleZoomOut);
    cancelBtn.removeEventListener('click', handleCancel);
    doneBtn.removeEventListener('click', handleDone);
    document.removeEventListener('keydown', handleKeydown);

    modal.classList.add('hidden');
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    cropperReady = false;

    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }
  }
}
