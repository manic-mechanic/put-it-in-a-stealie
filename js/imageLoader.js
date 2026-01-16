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
