# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev            # dev server at localhost:5173
pnpm build          # production build
pnpm test           # vitest watch mode
pnpm test:run       # run tests once
pnpm test:coverage  # coverage report (thresholds: 80% lines/statements/functions, 75% branches)
```

To run a single test file: `pnpm test src/utils/canvas.test.ts`

## Architecture

Single-page React 19 + Vite 6 + TypeScript app. All mutable state lives in `App.tsx` and flows down via props — no context, no external state library.

### Coordinate system

All layer positions (`x`, `y`) and sizes (`w`, `size`) are **normalized floats (0–1)** relative to the image dimensions. This makes layout resolution-independent. The canvas renderer and drag handlers both work in this normalized space and multiply by pixel dimensions only at render time.

### Layer model (`src/types.ts`)

Two layer types: `TextLayerData` and `ImageLayerData`, unified as `Layer`. Both carry `id`, `x`, `y`, `rotation`. Text layers hold typography fields; image layers hold `src`, `w` (width as fraction of canvas), and `aspectRatio`. `LayerPatch` is a flat partial union used for updates.

### Export pipeline (`src/utils/canvas.ts`)

`renderToBlob` draws to an offscreen `<canvas>` at `scale=2` (2× the source image resolution). It iterates layers in order, calling `drawImageLayer` or `drawText` per layer. The canvas is never mounted to the DOM. `triggerDownload` creates a temporary `<a>` element to trigger the browser download.

### GSAP usage

GSAP animates stage transitions (fade/scale on image swap), the side panel open/close (width tween), and the export overlay sequence in `App.tsx`. All GSAP targets are accessed via `useRef` — no string selectors except for the `#gen-overlay` children during the download animation.

### Mobile layout

`useIsMobile` (breakpoint hook) switches the layout between desktop (side panel as a persistent aside) and mobile (bottom sheet driven by `sheetOpen` + `MobileSheetHeader`). The `MobileFab` provides the download button on mobile. Selecting a layer on mobile auto-opens the sheet to the edit tab.

### Key files

- `src/App.tsx` — all state, event wiring, GSAP orchestration
- `src/types.ts` — shared types for layers and image
- `src/utils/canvas.ts` — offscreen canvas rendering and download
- `src/utils/text.ts` — `mkText`/`mkImageLayer` factory functions and sample image exports
- `src/constants.ts` — font definitions and preset color palettes
- `src/hooks/useDrag.ts` — pointer-event drag logic used by `TextLayer` and `ImageLayer`
