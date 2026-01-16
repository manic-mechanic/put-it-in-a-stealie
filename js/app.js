// app.js - Main orchestration
import { initImageLoader } from './imageLoader.js';
import { openCropModal } from './cropperModal.js';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const userCanvas = document.getElementById('user-image-canvas');
const actionsDiv = document.getElementById('actions');

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

  // Clear canvas
  ctx.clearRect(0, 0, size, size);

  // Draw circular clipped image in center
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = 115; // Approximate Stealie center radius

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.clip();

  // Draw cropped image centered
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

initImageLoader(dropZone, fileInput, handleImageLoad);

console.log('Put it in a Stealie loaded');
