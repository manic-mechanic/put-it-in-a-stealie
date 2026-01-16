// app.js - Main orchestration
import { initImageLoader } from './imageLoader.js';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

function handleImageLoad(img) {
  console.log('Image loaded:', img.width, 'x', img.height);
  // TODO: Open crop modal
}

initImageLoader(dropZone, fileInput, handleImageLoad);

console.log('Put it in a Stealie loaded');
