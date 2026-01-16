# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Put it in a Stealie" is a web application that allows users to place their own images inside the center of a Stealie (the Grateful Dead's "Steal Your Face" logo). Users can drag-and-drop or select an image, crop it to a circle, and export the completed composition as a transparent PNG.

## Key Assets

- `/assets/stealie-bg-none-border-false-bolt-false-color-false.svg` - Primary SVG template (empty center, transparent background)
- `/assets/stealie-bg-false-border-false-bolt-false-color-false-alt.png` - PNG version for reference

The SVG uses a 360x360 viewBox with the hollow center where user images are composited.

## Architecture Notes

This is a greenfield project. The concept.md specifies:
- Single-page web app (desktop + mobile)
- Image upload via drag-and-drop or file picker
- Circular crop interface for the center area
- Export to transparent PNG
- Simple, clean UI aimed at early-to-mid stage developer readability

## Development Approach

Per concept.md, use popular, well-maintained libraries. The codebase should prioritize clarity and simplicity over cleverness.
