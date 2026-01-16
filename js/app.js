// app.js - Main orchestration
import { initImageLoader } from './imageLoader.js';
import { openCropModal } from './cropperModal.js';
import { exportToPNG } from './exporter.js';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const userCanvas = document.getElementById('user-image-canvas');
const actionsDiv = document.getElementById('actions');
const stealieImg = document.querySelector('.stealie-frame');

const btnSave = document.getElementById('btn-save');
const btnRecrop = document.getElementById('btn-recrop');
const btnNew = document.getElementById('btn-new');

let currentImage = null;

function handleImageLoad(img) {
  currentImage = img;
  openCropModal(img, handleCropComplete);
}

function handleCropComplete(croppedCanvas) {
  drawCroppedImage(croppedCanvas);
  dropZone.classList.add('has-image');
  actionsDiv.classList.remove('hidden');
}

function drawCroppedImage(croppedCanvas) {
  const ctx = userCanvas.getContext('2d');
  const size = 360;
  userCanvas.width = size;
  userCanvas.height = size;

  ctx.clearRect(0, 0, size, size);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = 127; // Precise Stealie center radius

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.clip();

  const imgSize = radius * 2;
  ctx.drawImage(
    croppedCanvas,
    centerX - radius,
    centerY - radius,
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
  fileInput.value = '';
}

// Button handlers
btnSave.addEventListener('click', () => {
  exportToPNG(stealieImg, userCanvas);
});

btnRecrop.addEventListener('click', () => {
  if (currentImage) {
    openCropModal(currentImage, handleCropComplete);
  }
});

btnNew.addEventListener('click', () => {
  resetState();
  fileInput.click();
});

initImageLoader(dropZone, fileInput, handleImageLoad);
