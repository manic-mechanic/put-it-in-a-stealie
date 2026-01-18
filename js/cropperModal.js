// cropperModal.js - Cropper.js integration

let cropper = null;
let isSliderDriven = false; // Prevent feedback loop
let savedCropData = null; // Store crop state for recrop
let savedCanvasData = null;

export function openCropModal(img, onCropComplete, restoreState = false) {
  const modal = document.getElementById('crop-modal');
  const cropImage = document.getElementById('crop-image');
  const cancelBtn = document.getElementById('crop-cancel');
  const doneBtn = document.getElementById('crop-done');
  const zoomSlider = document.getElementById('zoom-slider');

  // Set image source
  cropImage.src = img.src;
  modal.classList.remove('hidden');

  // Initialize Cropper
  cropper = new Cropper(cropImage, {
    aspectRatio: 1,
    viewMode: 1,
    dragMode: 'move', // Allow moving the image canvas
    cropBoxResizable: false, // Lock box size
    cropBoxMovable: false, // Lock box position
    toggleDragModeOnDblclick: false, // specific to this interaction
    autoCropArea: 1, // Start with max crop box
    background: false,
    guides: false,
    ready() {
      // Restore previous crop state if recropping
      if (restoreState && savedCanvasData && savedCropData) {
        cropper.setCanvasData(savedCanvasData);
        cropper.setData(savedCropData);
      }
      // Set slider to match zoom level
      const imageData = cropper.getImageData();
      const initialRatio = imageData.width / imageData.naturalWidth;
      zoomSlider.value = initialRatio;
    },
    zoom(e) {
      // Sync slider when zooming via pinch/scroll (not slider)
      if (!isSliderDriven) {
        zoomSlider.value = e.detail.ratio;
      }
    },
  });

  // Zoom slider handler
  const handleZoom = (e) => {
    if (cropper) {
      isSliderDriven = true;
      cropper.zoomTo(parseFloat(e.target.value));
      isSliderDriven = false;
    }
  };

  // Cancel handler
  const handleCancel = () => {
    closeCropModal();
    cleanup();
  };

  // Done handler
  const handleDone = () => {
    // Save crop state for potential recrop
    savedCropData = cropper.getData();
    savedCanvasData = cropper.getCanvasData();

    // Get high-res crop for quality
    const canvas = cropper.getCroppedCanvas({
      width: 1024,
      height: 1024,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });
    closeCropModal();
    cleanup();
    onCropComplete(canvas);
  };

  zoomSlider.addEventListener('input', handleZoom);
  cancelBtn.addEventListener('click', handleCancel);
  doneBtn.addEventListener('click', handleDone);

  function cleanup() {
    zoomSlider.removeEventListener('input', handleZoom);
    cancelBtn.removeEventListener('click', handleCancel);
    doneBtn.removeEventListener('click', handleDone);
  }
}

function closeCropModal() {
  const modal = document.getElementById('crop-modal');
  modal.classList.add('hidden');
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

// Clear saved state for new image
export function clearCropState() {
  savedCropData = null;
  savedCanvasData = null;
}
