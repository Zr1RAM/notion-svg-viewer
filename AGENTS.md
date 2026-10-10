# AGENTS.md — Notion Diagrams & Docs Hub

## Project Overview
This repository is a zero-build, static hub designed for GitHub Pages and clean Notion `/embed` blocks. It hosts:
1. **Interactive Architecture Diagrams** (`.html` files with pan/zoom SVGs and service metadata).
2. **Interactive Guides & Study Plans** (`.html` files).
3. **Markdown Documents & Assessment Vaults** (`.md` files).

## Architecture & Conventions (Zero Build / Pure Vanilla)
- **Zero build steps:** No Node/Vite/Webpack bundling. All pages use native HTML, CSS, and vanilla JS via CDN.
- **Root Files:**
  - `index.html`: Dynamic Hub directory that groups files into category cards and nested subfolders.
  - `viewer.html`: Markdown reader for `.md` files (renders markdown with `marked`, syntax highlighting via `highlight.js`, and TOC navigation).
  - `diagrams.js`: Offline manifest (`window.DIAGRAM_PATHS = [...]`) allowing `index.html` to work via `file:///` without CORS errors.
  - `diagrams.json`: Array of relative paths used when served over HTTP/HTTPS.
  - `start-local.bat`: One-click local test server launcher for Windows.

## Local Testing vs. Deployed Testing (Separation of Concerns)
1. **Local Testing (`http://localhost:8080` or `file:///`)**:
   - `index.html` automatically detects local mode.
   - It **strictly** reads from local manifests (`diagrams.js` / `diagrams.json`) and **does not** query the remote GitHub API. This prevents unpushed local changes from colliding with stale remote branches.
   - A blue indicator badge displays: `● Local Mode (diagrams.js)`.
   - To start a local test server: run `.\start-local.bat` or `python -m http.server 8080`.
2. **Deployed Testing (GitHub Pages `*.github.io`)**:
   - Queries GitHub's Recursive Tree API (`/git/trees/main?recursive=1`) to automatically discover newly pushed `.html` and `.md` files.
   - A green indicator badge displays: `● GitHub Pages (Live API)`.
   - To preview GitHub API discovery while running locally, visit `http://localhost:8080/?source=github`.

## File Registration Checklist
When adding a new diagram (`.html`) or documentation (`.md`) file:
1. Place the file inside an appropriate subfolder (e.g., `cloud-architecture/`, `Fast Track Plans/`, `Interview Prep/React & Node/`).
2. Add its relative path to both:
   - `diagrams.js` (inside `window.DIAGRAM_PATHS`)
   - `diagrams.json`
3. Folder names automatically become category headers; file names automatically become titles.
4. Markdown files are opened via `viewer.html?file=<relative_path>`. HTML diagrams open directly.
