# Put it in a Stealie — MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a working web app where users can upload an image, crop it to a circle, composite it into a Stealie, and export as PNG.

**Architecture:** Single HTML page with modular vanilla JS. Image upload via drag-drop or file picker. Cropper.js handles the crop modal. Canvas API composites the final image and exports PNG.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript (ES6 modules), Cropper.js, Canvas API

---

## Task 1: Project Scaffolding

**Files:**
- Create: `index.html`
- Create: `css/styles.css`
- Create: `js/app.js`

**Step 1: Create index.html with basic structure**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Put it in a Stealie</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <main class="container">
    <h1>Put it in a Stealie</h1>
    <div id="stealie-container">
      <!-- Stealie and drop zone will go here -->
    </div>
    <div id="actions" class="actions hidden">
      <!-- Buttons will go here -->
    </div>
  </main>
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

**Step 2: Create minimal CSS reset and layout**

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 2rem;
}

.hidden {
  display: none;
}
```

**Step 3: Create app.js entry point**

```javascript
// app.js - Main orchestration
console.log('Put it in a Stealie loaded');
```

**Step 4: Verify by opening in browser**

Open `index.html` in browser. Should see:
- Gray background
- Centered "Put it in a Stealie" heading
- Console log message

**Step 5: Commit**

```bash
git add index.html css/styles.css js/app.js
git commit -m "feat: add project scaffolding"
```

---

## Task 2: Display Stealie with Drop Zone

**Files:**
- Modify: `index.html`
- Modify: `css/styles.css`

**Step 1: Add Stealie container markup**

In `index.html`, replace the `#stealie-container` div:

```html
<div id="stealie-container" class="stealie-container">
  <div id="drop-zone" class="drop-zone">
    <img src="assets/stealie-bg-none-border-false-bolt-false-color-false.svg"
         alt="Stealie"
         class="stealie-frame">
    <div class="drop-indicator">+</div>
    <canvas id="user-image-canvas" class="user-image-canvas"></canvas>
  </div>
</div>
```

**Step 2: Add Stealie and drop zone styles**

Append to `css/styles.css`:

```css
.stealie-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.drop-zone {
  position: relative;
  width: 360px;
  height: 360px;
  cursor: pointer;
}

.stealie-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.user-image-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.drop-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 4rem;
  color: #ccc;
  z-index: 0;
  user-select: none;
}

.drop-zone.drag-over {
  outline: 3px dashed #666;
  outline-offset: -10px;
}

.drop-zone.has-image .drop-indicator {
  display: none;
}

@media (max-width: 400px) {
  .drop-zone {
    width: 300px;
    height: 300px;
  }
}
```

**Step 3: Verify in browser**

Open `index.html`. Should see:
- Stealie SVG centered on page
- Large "+" symbol in the center
- Cursor changes to pointer on hover

**Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: display Stealie with drop zone indicator"
```

---

## Task 3: Image Loader Module (File Picker)

**Files:**
- Create: `js/imageLoader.js`
- Modify: `js/app.js`
- Modify: `index.html`

**Step 1: Create hidden file input in HTML**

In `index.html`, add inside `<main>` before the closing `</main>`:

```html
<input type="file" id="file-input" accept="image/*" class="hidden">
```

**Step 2: Create imageLoader.js module**

```javascript
// imageLoader.js - Handles file selection and drag-drop

export function initImageLoader(dropZone, fileInput, onImageLoad) {
  // Click to open file picker
  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  // File selected via picker
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      loadImageFile(file, onImageLoad);
    }
  });

  // Drag and drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      loadImageFile(file, onImageLoad);
    }
  });
}

function loadImageFile(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => callback(img);
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
```

**Step 3: Wire up in app.js**

```javascript
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
```

**Step 4: Verify in browser**

1. Click on Stealie → file picker opens
2. Select an image → console logs dimensions
3. Drag image onto Stealie → dashed outline appears
4. Drop image → console logs dimensions

**Step 5: Commit**

```bash
git add js/imageLoader.js js/app.js index.html
git commit -m "feat: add image loading via click and drag-drop"
```

---

## Task 4: Add Cropper.js and Modal Structure

**Files:**
- Create: `vendor/cropper.min.js`
- Create: `vendor/cropper.min.css`
- Create: `js/cropperModal.js`
- Modify: `index.html`
- Modify: `css/styles.css`

**Step 1: Download Cropper.js**

```bash
mkdir -p vendor
curl -o vendor/cropper.min.js https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js
curl -o vendor/cropper.min.css https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css
```

**Step 2: Add modal markup to index.html**

Add Cropper CSS in `<head>`:

```html
<link rel="stylesheet" href="vendor/cropper.min.css">
```

Add modal before closing `</body>`:

```html
<div id="crop-modal" class="modal hidden">
  <div class="modal-content">
    <div class="crop-container">
      <img id="crop-image" src="" alt="Crop preview">
    </div>
    <div class="modal-actions">
      <button id="crop-cancel" class="btn btn-secondary">Cancel</button>
      <button id="crop-done" class="btn btn-primary">Done</button>
    </div>
  </div>
</div>
<script src="vendor/cropper.min.js"></script>
```

**Step 3: Add modal styles**

Append to `css/styles.css`:

```css
/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.crop-container {
  width: 320px;
  height: 320px;
  overflow: hidden;
}

.crop-container img {
  max-width: 100%;
  display: block;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.btn-primary {
  background: #333;
  color: #fff;
}

.btn-primary:hover {
  background: #555;
}

.btn-secondary {
  background: #ddd;
  color: #333;
}

.btn-secondary:hover {
  background: #ccc;
}

/* Circular crop preview */
.cropper-view-box,
.cropper-face {
  border-radius: 50%;
}
```

**Step 4: Create cropperModal.js**

```javascript
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
```

**Step 5: Verify modal exists in browser**

Open `index.html`. Modal should be hidden. Check that:
- No console errors about missing Cropper.js
- Modal HTML is present in DOM (inspect elements)

**Step 6: Commit**

```bash
git add vendor/ js/cropperModal.js index.html css/styles.css
git commit -m "feat: add Cropper.js and modal structure"
```

---

## Task 5: Wire Up Crop Flow

**Files:**
- Modify: `js/app.js`

**Step 1: Connect image load to crop modal**

```javascript
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
```

**Step 2: Verify full crop flow**

1. Click Stealie → file picker
2. Select image → crop modal opens
3. Adjust crop area
4. Click Done → image appears in Stealie center
5. "+" indicator disappears

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: wire up complete crop flow"
```

---

## Task 6: Action Buttons (Save, Recrop, New)

**Files:**
- Modify: `index.html`
- Modify: `css/styles.css`
- Create: `js/exporter.js`
- Modify: `js/app.js`

**Step 1: Add button markup**

In `index.html`, replace the `#actions` div:

```html
<div id="actions" class="actions hidden">
  <button id="btn-save" class="btn btn-primary">Save PNG</button>
  <button id="btn-recrop" class="btn btn-secondary">Recrop</button>
  <button id="btn-new" class="btn btn-secondary">New Image</button>
</div>
```

**Step 2: Add button container styles**

Append to `css/styles.css`:

```css
.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 400px) {
  .actions {
    flex-direction: column;
    align-items: center;
  }

  .actions .btn {
    width: 200px;
  }
}
```

**Step 3: Create exporter.js**

```javascript
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
```

**Step 4: Wire up buttons in app.js**

Replace `js/app.js` with:

```javascript
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
  const radius = 115;

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
```

**Step 5: Verify all buttons**

1. Load an image and crop it
2. Click "Save PNG" → downloads `my-stealie.png`
3. Click "Recrop" → crop modal reopens with same image
4. Click "New Image" → file picker opens, old image cleared

**Step 6: Commit**

```bash
git add index.html css/styles.css js/exporter.js js/app.js
git commit -m "feat: add Save, Recrop, and New Image buttons"
```

---

## Task 7: Fine-tune Stealie Center Radius

**Files:**
- Modify: `js/app.js`

**Step 1: Measure SVG and adjust radius**

The Stealie SVG inner circle needs precise measurement. Looking at the path data, the center circle is approximately radius 127 at 360px scale. Adjust `drawCroppedImage`:

```javascript
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
```

**Step 2: Visual verification**

Load an image and verify the cropped area fits perfectly inside the Stealie ring. Adjust radius if needed (try values 120-130).

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "fix: adjust center radius for precise Stealie fit"
```

---

## Task 8: Final Polish and Testing

**Files:**
- Modify: `css/styles.css`
- Modify: `docs/plans/2026-01-16-mvp-design.md` (update checklist)

**Step 1: Add hover states and transitions**

Append to `css/styles.css`:

```css
/* Polish */
.drop-zone {
  transition: transform 0.2s ease;
}

.drop-zone:hover {
  transform: scale(1.02);
}

.drop-indicator {
  transition: color 0.2s ease;
}

.drop-zone:hover .drop-indicator {
  color: #999;
}

/* Ensure modal is scrollable on small screens */
@media (max-height: 500px) {
  .modal-content {
    max-height: 95vh;
    overflow-y: auto;
  }

  .crop-container {
    width: 250px;
    height: 250px;
  }
}
```

**Step 2: Run through test checklist**

Open `docs/plans/2026-01-16-mvp-design.md` and verify each item:

- [ ] Page loads with Stealie and "+" indicator
- [ ] Click on Stealie opens file picker
- [ ] Drag-and-drop triggers crop modal
- [ ] Crop modal: pan, zoom, resize work
- [ ] Cancel closes modal without changes
- [ ] Done composites image correctly
- [ ] Save downloads transparent PNG
- [ ] Recrop reopens modal with current image
- [ ] New Image replaces the image
- [ ] Mobile: touch gestures and responsive layout
- [ ] Cross-browser: Chrome, Firefox, Safari

**Step 3: Commit**

```bash
git add css/styles.css
git commit -m "feat: add polish and hover states"
```

---

## Task 9: Update CLAUDE.md with Commands

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Add development instructions**

Update `CLAUDE.md` to include:

```markdown
## Development

No build step required. Open `index.html` directly in a browser.

**Local server (optional, for ES modules in some browsers):**
```bash
python3 -m http.server 8000
# Then open http://localhost:8000
```

## Testing

Manual testing only for MVP. See `docs/plans/2026-01-16-mvp-design.md` for test checklist.

## File Overview

- `js/app.js` - Main orchestration and state management
- `js/imageLoader.js` - Drag-drop and file picker handling
- `js/cropperModal.js` - Cropper.js integration
- `js/exporter.js` - PNG export via Canvas API
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with dev instructions"
```

---

## Summary

After completing all tasks, you will have:
- Working image upload (click + drag-drop)
- Cropper.js modal for circular cropping
- Live preview in Stealie
- PNG export functionality
- Recrop and replace image features
- Responsive design for mobile
- Clean, documented codebase ready for React/Vue refactor
