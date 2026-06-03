# WebGL Practice

A Three.js playground built with Vite and TypeScript.

This repository collects a set of WebGL experiments focused on custom shaders, materials, lighting, shadows, decals, procedural surfaces, and scene debugging. The current entry point renders an interactive Three.js scene with a decal demo, performance overlay, and `tweakpane` controls.

## Features

- Vite + TypeScript project setup
- Three.js scenes for experimenting with:
  - custom vertex and fragment shaders
  - PBR materials and decals
  - shadows and environment lighting
  - procedural terrain and grass
  - animated surfaces and shader-driven effects
- `OrbitControls` / `TrackballControls` for scene interaction
- `Tweakpane` debug panel for live parameter tuning
- `three-perf` FPS/performance overlay
- GLSL shader chunks and reusable shader assets

## Tech Stack

- [Three.js](https://threejs.org/)
- [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tweakpane](https://cocopon.github.io/tweakpane/)
- [GSAP](https://gsap.com/)
- [three-custom-shader-material](https://github.com/FarazzShaikh/THREE-CustomShaderMaterial)
- [three-perf](https://github.com/eriksachse/three-perf)

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm

### Install dependencies

```bash
npm install
```

### Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - start the Vite development server on port `3000`
- `npm run build` - type-check and build the project for production
- `npm run preview` - preview the production build locally

## Project Structure

```text
src/
  assets/      textures, HDRs, and 3D models
  shader/      GLSL vertex and fragment shaders
  canvas.ts    current app entry point
  main.ts      additional Three.js experiment
  index.ts     another scene experiment
  style.css    shared styles
public/        static assets served as-is
```

## Notes

- The active entry file is `src/canvas.ts`, which is loaded from `index.html`.
- Shader source files are imported as raw strings with Vite's `?raw` loader.
- Assets in `public/` are referenced by absolute paths such as `/react.png`.
- This project is primarily for experimentation, so the codebase contains multiple scene prototypes rather than a single production-ready app.

## License

No explicit license has been added yet.
