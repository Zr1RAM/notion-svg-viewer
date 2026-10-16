/**
 * Transforms GitHub-style alerts (> [!NOTE], > [!TIP], etc.)
 * into styled callout HTML blocks.
 */
export function preprocessCallouts(md: string): string {
  const alertRegex = /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s*([^\n]*))?/gim;
  return md
    .replace(alertRegex, (_match, type, title) => {
      const lowerType = type.toLowerCase();
      const displayTitle = title ? title.trim() : type;
      return `\n<div class="alert-callout ${lowerType}"><div class="alert-title">${displayTitle}</div>\n`;
    })
    .replace(/<\/div>\n\n(?=[^>])/g, "</div>\n");
}
