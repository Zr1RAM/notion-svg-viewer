const ACRONYMS = new Set([
  "AWS",
  "GCP",
  "AZURE",
  "API",
  "DB",
  "K8S",
  "CI",
  "CD",
  "DNS",
  "CDN",
  "IAM",
  "VPC",
  "DSA",
  "SQL",
  "MERN",
  "PERN",
  "REST",
]);

export function formatTitle(name: string): string {
  let base = name.replace(/\.(html|md|svg|json)$/i, "");
  if (base.toLowerCase() === "readme") return "Overview & Index";
  return base
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/Interiview/gi, "Interview")
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (word === "&") return "&";
      const upper = word.toUpperCase();
      if (ACRONYMS.has(upper)) return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function formatFolderName(slug: string): string {
  if (!slug || slug === "root" || slug === "general") return "General Diagrams";
  return slug
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (word === "&") return "&";
      const upper = word.toUpperCase();
      if (ACRONYMS.has(upper)) return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
