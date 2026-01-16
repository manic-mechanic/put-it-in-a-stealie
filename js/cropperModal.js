// cropperModal.js - Cropper.js integration

let cropper = null;

export function openCropModal(img, onCropComplete) {
  const modal = document.getElementById('crop-modal');
  const cropImage = document.getElementById('crop-image');
  const cancelBtn = document.getElementById('crop-cancel');
  const doneBtn = document.getElementById('crop-done');

  // Set image source
  cropImage.src = img.src;
  modal.classList.remove('hidden');

  // Initialize Cropper
  cropper = new Cropper(cropImage, {
    aspectRatio: 1,
    viewMode: 1,
    dragMode: 'move',
    cropBoxResizable: true,
    cropBoxMovable: true,
    background: false,
    guides: false,
  });

  // Cancel handler
  const handleCancel = () => {
    closeCropModal();
    cleanup();
  };

  // Done handler
  const handleDone = () => {
    const canvas = cropper.getCroppedCanvas({
      width: 256,
      height: 256,
    });
    closeCropModal();
    cleanup();
    onCropComplete(canvas);
  };

  cancelBtn.addEventListener('click', handleCancel);
  doneBtn.addEventListener('click', handleDone);

  function cleanup() {
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
