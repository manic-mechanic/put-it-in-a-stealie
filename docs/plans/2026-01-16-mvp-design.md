# Put it in a Stealie — MVP Design

## Overview

A single-page web app that lets users place their own images inside the center of a Stealie (Grateful Dead's "Steal Your Face" logo) and export the result as a transparent PNG.

## Decisions

- **Tech stack:** Vanilla HTML/CSS/JS (planned refactor to React/Vue later)
- **Crop interaction:** Modal dialog using Cropper.js
- **Visual style:** Minimal light (white/light gray, clean typography)

## File Structure

```
put-it-in-a-stealie/
├── index.html          # Single page entry
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── app.js          # Main orchestration
│   ├── imageLoader.js  # Drag-drop & file picker
│   ├── cropper.js      # Cropper.js integration
│   └── exporter.js     # PNG export via Canvas
├── assets/
│   └── (existing SVG/PNG files)
└── vendor/
    └── cropper.min.js  # Cropper.js library
```

Modules are separated by responsibility to ease future refactoring into React/Vue components.

## UI Layout

```
┌─────────────────────────────────────────┐
│            Put it in a Stealie          │
├─────────────────────────────────────────┤
│                                         │
│            ┌───────────────┐            │
│            │   [Stealie]   │            │
│            │     (+)       │            │
│            └───────────────┘            │
│                                         │
│         ┌─────┐  ┌─────┐  ┌─────┐       │
│         │Save │  │Crop │  │New  │       │
│         └─────┘  └─────┘  └─────┘       │
└─────────────────────────────────────────┘
```

- Header: Simple title text
- Stealie display: Centered, ~300-360px, scales on mobile
- Drop zone: Entire Stealie area is clickable/droppable
- Action buttons: Appear after image is placed (Save, Recrop, New Image)
- Responsive: Flexbox centering, buttons stack on narrow screens

## Crop Modal

Full-screen overlay with Cropper.js:

- `aspectRatio: 1` — square/circle crop
- `viewMode: 1` — crop box stays within image
- Circular mask via CSS
- Cancel/Done buttons
- Touch gestures supported natively

## Compositing & Export

1. Hidden 360×360 canvas
2. Draw cropped user image first (clipped to circle)
3. Draw Stealie SVG on top (frame overlays image)
4. Export via `canvas.toDataURL('image/png')`

The Stealie's transparent center allows the user image to show through.

## Test Checklist

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
