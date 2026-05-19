# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # start dev server
pnpm build        # production build → dist/
pnpm test         # vitest watch mode
pnpm test:run     # vitest single run (CI)
pnpm preview      # preview built dist/
```

Run a single test file:
```bash
pnpm vitest run src/utils/canvas.test.js
```

## Architecture

React 19 + Vite SPA. No router. Single page.

**State lives entirely in `App.jsx`**: `image` (src + dimensions), `texts[]` (text layer objects), `selectedId`. All mutations flow down as callbacks.

**Text layer model** — each layer is a plain object created by `mkText()` (`src/utils/text.js`). Fields: `id`, `text`, `x/y` (0–1 normalized to image dimensions), `size` (0–1 normalized), `rotation` (degrees), `font`, `weight`, `color`, `stroke`, `strokeColor`, `uppercase`, `shadow`. Canvas export in `src/utils/canvas.js` replicates the same rendering logic at 2× scale.

**Component tree**:
- `Stage` — displays the image + draggable `TextLayer` overlays. Uses `ResizeObserver` to keep a pixel `box` in sync with the container, then scales all normalized coordinates to pixels.
- `TextLayer` — handles drag (pointer events) and inline editing (double-click → `contentEditable`). Updates via `onUpdate(patch)`.
- `SidePanel` → `TextEditor` — all style controls for the selected layer.
- `GenOverlay` — GSAP-animated download overlay (`#gen-overlay`).

**Download flow**: `handleDownload` in `App.jsx` deselects all, plays the GSAP animation, then calls `renderToBlob` which draws the image + all text layers onto an offscreen canvas and triggers a PNG download.

**Mobile**: `useIsMobile` hook gates a bottom sheet (`MobileSheetHeader` + `MobileFab`). `SidePanel` reads `mobileTab` to show only the active tab's content.

**Theme**: `data-theme` attribute on `<html>`, persisted to `localStorage` under `mf-theme`.

## Testing

Vitest + happy-dom + `@testing-library/react`. Setup in `src/test-setup.js`. Tests colocated with source (`*.test.js` / `*.test.jsx`).
