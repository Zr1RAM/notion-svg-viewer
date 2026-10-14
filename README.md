# Notion SVG Diagrams & Docs Hub (Next.js)

A high-performance, interactive Next.js (App Router) web application for hosting and viewing interactive, pan-and-zoom cloud architecture diagrams and technical engineering vaults, designed for seamless embedding into Notion pages.

---

## Features

- **Interactive Architecture Canvas:** High-fidelity pan, zoom, pinch-to-zoom, and click-to-inspect drawers for AWS, Azure, and GCP architecture maps.
- **In-Diagram Search & Highlight:** Real-time search across service names, categories, and tags with dynamic SVG glowing pulse and background dimming.
- **Dynamic Content Indexing:** Build-time scanning of local diagrams (`content/diagrams/`) and Markdown assessments (`content/docs/`), with zero external API rate limits.
- **Interactive Markdown Assessment Vault:** Built-in code syntax highlighting (`highlight.js`), interactive checkboxes that persist status in `localStorage`, reading time estimation, and a sticky Table of Contents.
- **Notion-Optimized (`?embed=true`):** Clean, borderless mode that strips navigation bars and extra padding, making it ideal for full-width `/embed` blocks in Notion.
- **Zero-Cost Static Export:** Configured with `output: 'export'` for automated deployment to GitHub Pages via GitHub Actions.

---

## File Structure

```text
├── content/
│   ├── diagrams/                  # Diagram SVGs & service node metadata
│   │   ├── aws/
│   │   │   ├── diagram.svg
│   │   │   ├── nodes.json
│   │   │   └── metadata.json
│   │   ├── azure/
│   │   └── gcp/
│   ├── docs/                      # Markdown documentation & study vaults
│   │   └── interview-prep/
│   └── guides/                    # Fast-track master guides
├── src/
│   ├── app/                       # Next.js 15 App Router routes
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Dynamic Hub landing directory
│   │   ├── diagrams/[...slug]/    # Interactive SVG diagram viewer
│   │   ├── docs/[...slug]/        # Markdown doc viewer
│   │   └── guides/[...slug]/      # Interactive study guides
│   ├── components/                # Reusable UI components
│   │   ├── diagram/               # DiagramCanvas, NodeDrawer, Controls
│   │   ├── docs/                  # DocViewer, MarkdownRenderer
│   │   ├── hub/                   # HubView directory cards & search
│   │   └── layout/                # Navbar & breadcrumbs
│   ├── lib/                       # Types and build-time content scanner
│   └── styles/                    # Global dark theme CSS
├── _legacy/                       # Archived original static HTML files
└── .github/workflows/deploy.yml   # GitHub Actions static deployment to Pages
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local dev server
npm run dev
# Open http://localhost:3000

# 3. Build static export for production
npm run build
# Exported static files will be in ./out
```

---

## Embedding in Notion

1. Copy your GitHub Pages diagram or doc URL (e.g., `https://your-username.github.io/notion-svg-viewer/diagrams/cloud-architecture/aws/?embed=true`).
2. Open your Notion page and type `/embed` on an empty line.
3. Paste the URL and click **Embed link**.
4. Adjust the block height and set the Notion page width to Full Width for an optimal viewing experience.
