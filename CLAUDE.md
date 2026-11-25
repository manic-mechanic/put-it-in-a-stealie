# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Put it in a Stealie" (https://putitinastealie.org) is a static web app that lets users place their own image inside the center of a Stealie (the Grateful Dead's "Steal Your Face" logo). Users drag-and-drop or pick an image, position it in a circular crop, and save the result as a transparent PNG (Web Share sheet on mobile, download on desktop). Images are processed entirely in the browser.

## Key Assets

- `assets/stealie-bg-none-border-false-bolt-false-color-false.svg` - The template used by the app (empty center, transparent background, 360x360 viewBox)
- `assets/favicon.svg`, `assets/apple-touch-icon.png`, `assets/social-preview.png` - Icons and Open Graph image
- Other `assets/stealie-*` files are unused variations kept for reference; `docs/svg-sources.md` records where the vectors came from

The hollow center is a circle at (184, 133) with radius 118 in SVG coordinates (`js/constants.js`). The drag overlay in `css/styles.css` uses the same circle expressed as percentages.

## File Overview

- `index.html` - Page markup, SEO/OG tags, Google Analytics and Sentry loader
- `js/app.js` - Orchestration and state (current image, pre-rendered PNG)
- `js/imageLoader.js` - Drag-drop and file picker handling (object URLs, error reporting)
- `js/cropperModal.js` - Crop modal built on Cropper.js (zoom slider/buttons, recrop state, keyboard handling)
- `js/exporter.js` - `renderStealiePNG` (canvas compositing) and `saveStealiePNG` (share/download)
- `js/constants.js` - Stealie geometry and crop output size
- `vendor/cropper.min.{js,css}` - Vendored Cropper.js v1.6.1 (loaded as a global script)

## Notes

- The PNG is rendered as soon as a crop completes, so the Save click can call `navigator.share()` immediately. Mobile browsers reject share calls that happen too long after the tap.
- Analytics events: `stealie_created` (crop completed) and `generate_stealie` (saved; label is `share` or `download`).

## Development

No build step. Serve the folder locally (ES modules need http, not file://):

```bash
python3 -m http.server 8000
# Then open http://localhost:8000
```

Deployed on Cloudflare Workers (static assets) via Workers Builds: pushes to `main` deploy to production, other branches get preview URLs. `wrangler.jsonc` serves the repo root; anything not meant to be public (docs, config, notes) must be listed in `.assetsignore`.

## Testing

Manual testing only. See `docs/plans/2026-01-16-mvp-design.md` for the test checklist.

## Development Approach

Use popular, well-maintained libraries. Prioritize clarity and simplicity over cleverness; the code should be readable for early-to-mid stage developers.
