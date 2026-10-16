import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local first (Next.js convention), then fallback to .env
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

// Check if running in CI environment (e.g. GitHub Actions)
const isCI = process.env.CI === "true" || !!process.env.GITHUB_ACTIONS;

// Load environment variables (supports service_role, anon, and Supabase publishable keys)
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const bucketName =
  process.env.SUPABASE_BUCKET ||
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET ||
  "interview-prep";

const CACHE_DOCS_DIR = path.join(process.cwd(), ".cache", "docs");

interface RemoteFile {
  remotePath: string;
  relativePath: string;
}

async function main() {
  console.log("--------------------------------------------------");
  console.log("  Syncing Docs from Supabase Storage");
  console.log(`  Bucket: ${bucketName}`);
  console.log(`  Target: .cache/docs`);
  console.log(`  Environment: ${isCI ? "CI (GitHub Actions)" : "Local Development"}`);
  console.log("--------------------------------------------------");

  // Validate credentials
  if (!supabaseUrl || !supabaseKey) {
    if (isCI) {
      console.error(
        "\n[sync-docs] FATAL: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in GitHub Actions environment."
      );
      console.error(
        "Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in GitHub Repository Settings -> Secrets and variables -> Actions.\n"
      );
      process.exit(1);
    }

    console.warn(
      "[sync-docs] No SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY provided in .env.local."
    );
    if (fs.existsSync(CACHE_DOCS_DIR) && fs.readdirSync(CACHE_DOCS_DIR).length > 0) {
      console.log(
        "[sync-docs] Reusing existing cached documents from .cache/docs for offline development."
      );
      return;
    } else {
      console.warn(
        "[sync-docs] Warning: .cache/docs is empty. Provide credentials in .env.local to download docs."
      );
      return;
    }
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  try {
    const remoteFiles: RemoteFile[] = [];

    // Recursively list all files in the bucket
    async function listFolder(folderPath: string) {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(folderPath, {
          limit: 200,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        });

      if (error) {
        throw new Error(
          `Failed to list files in folder "${folderPath}": ${error.message}`
        );
      }

      if (!data) return;

      for (const item of data) {
        if (!item.name || item.name === ".emptyFolderPlaceholder") continue;

        const itemRemotePath = folderPath
          ? `${folderPath}/${item.name}`
          : item.name;

        // In Supabase storage, folders typically have id === null or metadata === null
        const isFolder = item.id === null || !item.metadata;

        if (isFolder) {
          await listFolder(itemRemotePath);
        } else if (item.name.endsWith(".md")) {
          // Normalize relative path: if bucket path starts with "docs/", strip it so
          // .cache/docs ends up with the category folder (e.g. interview-prep/...)
          let relPath = itemRemotePath;
          if (relPath.startsWith("docs/")) {
            relPath = relPath.substring(5);
          }

          remoteFiles.push({
            remotePath: itemRemotePath,
            relativePath: relPath,
          });
        }
      }
    }

    console.log(`[sync-docs] Querying bucket "${bucketName}"...`);
    await listFolder("");

    console.log(`[sync-docs] Discovered ${remoteFiles.length} markdown file(s).`);

    if (remoteFiles.length === 0) {
      if (isCI) {
        console.error(
          `\n[sync-docs] FATAL: Zero markdown (.md) files found in bucket "${bucketName}". Aborting build to prevent deploying empty site.\n`
        );
        process.exit(1);
      }
      console.warn(
        `[sync-docs] No .md files found in bucket "${bucketName}". Checking local cache.`
      );
      return;
    }

    // Ensure cache target folder exists
    if (!fs.existsSync(CACHE_DOCS_DIR)) {
      fs.mkdirSync(CACHE_DOCS_DIR, { recursive: true });
    }

    const downloadedRelativePaths = new Set<string>();

    for (const file of remoteFiles) {
      const localFilePath = path.join(CACHE_DOCS_DIR, file.relativePath);
      const localDir = path.dirname(localFilePath);

      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }

      // Download file content
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(file.remotePath);

      if (error || !data) {
        console.error(
          `[sync-docs] Failed to download "${file.remotePath}": ${error?.message}`
        );
        if (isCI) {
          process.exit(1);
        }
        continue;
      }

      const text = await data.text();
      fs.writeFileSync(localFilePath, text, "utf-8");
      downloadedRelativePaths.add(file.relativePath.replace(/\\/g, "/"));
      console.log(`  ✓ Synced: ${file.relativePath}`);
    }

    // Clean up local cache files that no longer exist in Supabase
    function cleanStaleFiles(dir: string, baseDir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        const rel = path.relative(baseDir, full).replace(/\\/g, "/");
        if (entry.isDirectory()) {
          cleanStaleFiles(full, baseDir);
          if (fs.readdirSync(full).length === 0) {
            fs.rmdirSync(full);
          }
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          if (!downloadedRelativePaths.has(rel)) {
            fs.unlinkSync(full);
            console.log(`  ✗ Removed deleted remote doc from cache: ${rel}`);
          }
        }
      }
    }

    cleanStaleFiles(CACHE_DOCS_DIR, CACHE_DOCS_DIR);

    console.log(`[sync-docs] Documentation sync completed successfully.`);
  } catch (err: any) {
    console.error("[sync-docs] Error during sync:", err?.message || err);
    if (isCI) {
      process.exit(1);
    }
    if (fs.existsSync(CACHE_DOCS_DIR) && fs.readdirSync(CACHE_DOCS_DIR).length > 0) {
      console.log("[sync-docs] Proceeding with existing local cache.");
    }
  }
}

main();
