# AGENTS.md — Notion Diagrams & Docs Hub

## Project Overview
This repository is a modern, statically-exported **Next.js 15 (App Router)** documentation and diagram hub designed for high-performance browsing, dark-mode aesthetics, and clean Notion `/embed` blocks.

It serves three core content types:
1. **Interactive Architecture Diagrams**: Self-contained pan/zoom SVG visualizers with service metadata drawers (`public/cloud-architecture/*.html`).
2. **Interactive Guides & Study Plans**: Dynamic guides and roadmap documents (`/guides/[...slug]`).
3. **Markdown Documentation & Assessment Vaults**: Deep interview prep and documentation vaults rendered with dynamic table of contents, collapsibles, and scoped search (`/docs/[...slug]`).

---

## Tech Stack & Core Libraries
- **Framework**: Next.js 15 (App Router) with static HTML export (`output: 'export'`)
- **Language**: TypeScript (`strict: true`)
- **Styling**: Tailwind CSS + scoped modular stylesheets
- **Icons**: `lucide-react`
- **Markdown & Code Highlighting**: `marked` + `highlight.js` (Atom One Dark theme)
- **Deployment Target**: GitHub Pages or static host (served from `out/`)

---

## Repository Structure

```
├── public/
│   └── cloud-architecture/      # Self-contained legacy diagram visualizers (aws.html, azure.html, gcp.html)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (Inter font, dark background, ambient glow)
│   │   ├── page.tsx             # Home Hub route
│   │   ├── docs/[...slug]/      # Dynamic SSG markdown document routes
│   │   ├── guides/[...slug]/    # Dynamic SSG guide routes
│   │   └── diagrams/[...slug]/  # Legacy diagram redirect routes
│   ├── components/
│   │   ├── hub/
│   │   │   └── HubView.tsx      # Main directory cards with animated accordion subfolders
│   │   ├── docs/
│   │   │   ├── DocViewer.tsx    # Doc reader, sticky TOC, copy actions, Notion embed mode
│   │   │   └── SpotlightModal.tsx # In-memory scoped fuzzy line search (Ctrl+P / Ctrl+K)
│   │   └── layout/
│   │       └── Navbar.tsx       # Global navigation bar
│   ├── lib/
│   │   ├── content.ts           # Build-time filesystem scanner & markdown parser
│   │   └── types.ts             # Core TypeScript interfaces
│   └── styles/
│       ├── globals.css          # Foundation tokens, reset, ambient glow, hub accordion animations
│       ├── markdown.css         # Typography, callouts, collapsibles, search pulse animations
│       └── highlight.css        # Atom One Dark syntax highlighting theme
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── AGENTS.md                    # Agent guidelines & instructions (this file)
```

---

## Content Discovery & Routing

Content discovery is **automated at build time** via [`src/lib/content.ts`](file:///F:/Projects/Unclassified/notion-svg-viewer/src/lib/content.ts). There is no manual manifest or JSON file to maintain:
- Markdown files placed in content directories are automatically cataloged, parsed, and assigned routes (`/docs/[...slug]`).
- Directory hierarchy automatically generates category names, subfolder groupings, reading time, word count, and hierarchical Table of Contents (TOC).
- Cloud architecture diagrams (`aws`, `azure`, `gcp`) live in `public/cloud-architecture/*.html` and are linked directly from the Hub with floating `← Hub` back navigation that automatically hides when `?embed=true`.

---

## CSS & Styling Architecture (Professional Hybrid)

To maintain minimal bundle size, maximum caching, and route-level code splitting:

1. **`src/styles/globals.css` (Base Foundation ~120 lines)**:
   - Tailwind directives (`@tailwind base/components/utilities`).
   - Design tokens (`:root` variables: `#0f1117`, `#00ff88`, `#38bdf8`, `#a855f7`).
   - Reset, custom dark webkit scrollbars, and `.ambient-glow`.
   - Hub category card hardware-accelerated CSS Grid accordion rules (`.hub-folder-submenu.open`).
2. **`src/styles/markdown.css` & `src/styles/highlight.css` (Scoped Content Styles)**:
   - Imported exclusively inside [`DocViewer.tsx`](file:///F:/Projects/Unclassified/notion-svg-viewer/src/components/docs/DocViewer.tsx).
   - Next.js code-splits these styles so visitors on the home hub **never download markdown or syntax highlighting rules**.
3. **Pure Tailwind in JSX for UI Components**:
   - Navigation bars, cards, buttons, badges, and modals ([`SpotlightModal.tsx`](file:///F:/Projects/Unclassified/notion-svg-viewer/src/components/docs/SpotlightModal.tsx)) use atomic Tailwind classes directly in JSX for deduplication.

---

## Key User Interaction Patterns

- **Hub Accordion**: Clicking any category card or subfolder smoothly slides open using CSS Grid row interpolation (`grid-template-rows: 0fr -> 1fr`) with chevron rotation and neon folder illumination.
- **Spotlight Search**: Pressing **`Ctrl + P`** (or `Ctrl + K` / `⌘P`) opens an in-memory scoped search modal.
  - Suppresses the browser's native Print dialog.
  - Searches through lines of all documents within the current category/subfolder.
  - Selecting a match scrolls directly to the target line and activates a persistent glowing green pulse highlight.
  - Has an opaque solid background (`bg-black/85 backdrop-blur-md` and `bg-[#161b22]`) to eliminate text bleed-through.
- **Notion Embed Support**: Appending `?embed=true` to any doc or diagram route strips headers, navigation bars, and margins for a seamless fit inside Notion iframe embed blocks.

---

## Development & Verification Commands

```bash
# Run local dev server (http://localhost:3000)
npm run dev

# Run TypeScript type validation (zero emit)
npx tsc --noEmit

# Build production static export (outputs to out/)
npm run build
```

---

## Crucial Agent Rules & Constraints

1. **NEVER run `git commit` or `git push`**:
   - The user strictly manages all git commits, branch names, and remote pushes themselves.
   - Agents may inspect `git status` or `git diff`, but must NEVER stage, commit, or push code.
2. **Untracked Build Artifacts**:
   - `.next/` and `out/` are strictly build artifacts and must remain untracked.
3. **Preserve Legacy Fallback**:
   - The pre-migration vanilla HTML version is archived on the remote branch `legacy-backup`. The current `main` branch is dedicated solely to the clean Next.js application.
