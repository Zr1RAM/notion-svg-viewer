# Notion SVG Diagrams Hub

A lightweight, self-contained hub for hosting and viewing interactive, pan-and-zoom-capable SVG diagrams via GitHub Pages, designed for clean embedding into Notion.

## Features

- **Zero External Dependencies:** Built with pure, vanilla JavaScript and native browser DOM APIs. No external library overhead or CDN tracking blocks.
- **Interactive Canvas:** Smooth click-and-drag panning and mouse-wheel zooming built right in.
- **Dynamic Directory Hub:** Automatically queries the GitHub REST API to scan the repository and build a clean, clickable index of all available diagrams without manual maintenance.
- **Notion-Optimized:** Designed to fit full-width or inside `/embed` blocks with zero restrictive third-party UI bars or unwanted code sidebars.

## File Structure

```text
├── index.html        # Dynamic hub landing page (auto-discovers other .html files)
├── aws.html          # AWS architecture diagram
├── azure.html        # Azure architecture diagram (add as needed)
└── gcp.html          # GCP architecture diagram (add as needed)
```

## Setup & Deployment
1. Create a new Public repository on GitHub (e.g., cloud-diagrams).
2. Upload the index.html hub script (make sure to update USERNAME and REPO constants inside the script with your own details).
3. Upload your individual diagram files (e.g., aws.html) to the root of the repository.
4. Enable GitHub Pages:
   * Go to your repository **Settings > Pages**.
   * Set the branch to **main** (or **master**) and folder to **/ (root)**.
   * Click **Save**.

## Embedding in Notion
1. Copy your main repository GitHub Pages link (e.g., https://your-username.github.io/cloud-diagrams/) or a direct diagram link (https://your-username.github.io/cloud-diagrams/aws.html).
2. Open your Notion page and type /embed on an empty line.
3. Paste the URL and click Embed link.
4. Adjust the block height and page width for an optimal viewing workspace.
