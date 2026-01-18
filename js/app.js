// app.js - Main orchestration
import { initImageLoader } from './imageLoader.js';
import { openCropModal, clearCropState } from './cropperModal.js';
import { exportToPNG } from './exporter.js';

import { STEALIE_GEOMETRY } from './constants.js';

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  // Load existing image if any (e.g. returning from recrop)
const userCanvas = document.getElementById('user-image-canvas');
const actionsDiv = document.getElementById('actions');
const stealieImg = document.querySelector('.stealie-frame');

const btnSave = document.getElementById('btn-save');
const btnRecrop = document.getElementById('btn-recrop');
const btnNew = document.getElementById('btn-new');

let currentImage = null;
let currentCroppedCanvas = null; // Store high-res canvas

function handleImageLoad(img) {
  currentImage = img;
  clearCropState(); // New image, fresh crop
  openCropModal(img, handleCropComplete, false);
}

function handleCropComplete(croppedCanvas) {
  // cropCanvas is now 1024x1024 (High Res)
  currentCroppedCanvas = croppedCanvas;
  drawCroppedImage(croppedCanvas);
  dropZone.classList.add('has-image');
  actionsDiv.classList.remove('hidden');
}

function drawCroppedImage(croppedCanvas) {
  const ctx = userCanvas.getContext('2d');
  const { DISPLAY_SIZE, CENTER_X, CENTER_Y, RADIUS } = STEALIE_GEOMETRY;

  userCanvas.width = DISPLAY_SIZE;
  userCanvas.height = DISPLAY_SIZE;

  ctx.clearRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);

  ctx.save();
  ctx.beginPath();
  ctx.arc(CENTER_X, CENTER_Y, RADIUS, 0, Math.PI * 2);
  ctx.clip();

  const imgSize = RADIUS * 2;
  ctx.drawImage(
    croppedCanvas,
    CENTER_X - RADIUS,
    CENTER_Y - RADIUS,
    imgSize,
    imgSize
  );

  ctx.restore();
}

function resetState() {
  const ctx = userCanvas.getContext('2d');
  ctx.clearRect(0, 0, userCanvas.width, userCanvas.height);
  dropZone.classList.remove('has-image');
  actionsDiv.classList.add('hidden');
  currentImage = null;
  currentCroppedCanvas = null;
  fileInput.value = '';
}

// Button handlers
btnSave.addEventListener('click', () => {
  if (currentCroppedCanvas) {
    // Pass the high-res source instead of the low-res userCanvas
    exportToPNG(stealieImg, currentCroppedCanvas);
  } else {
    exportToPNG(stealieImg, userCanvas);
  }
});

btnRecrop.addEventListener('click', () => {
  if (currentImage) {
    openCropModal(currentImage, handleCropComplete, true); // Restore previous crop
  }
});

btnNew.addEventListener('click', () => {
  resetState();
  fileInput.click();
});

// Smart click handler
dropZone.addEventListener('click', () => {
  if (currentImage) {
    // If image exists, open crop modal (restore state)
    openCropModal(currentImage, handleCropComplete, true);
  } else {
    // If no image, open file picker
    fileInput.click();
  }
});

initImageLoader(dropZone, fileInput, handleImageLoad);
