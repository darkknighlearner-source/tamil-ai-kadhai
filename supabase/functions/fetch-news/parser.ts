// Pure RSS/Atom parser — no I/O, no Deno globals. Testable.

export interface ParsedItem {
  title: string;
  url: string;
  summary: string;
  published_at: string | null;
}

export function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function clip(s: string, n = 400): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[|\]\]>/g, "");
}

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function safeIsoDate(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

// Extract one <item>/<entry> field. Always returns a string ("" if missing).
function pickField(block: string, tag: string): string {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  return block.match(re)?.[1] ?? "";
}

export function parseRss(xml: string): ParsedItem[] {
  if (typeof xml !== "string" || xml.length === 0) return [];
  const items: ParsedItem[] = [];
  const itemRegex = /<(item|entry)\b[\s\S]*?<\/(item|entry)>/gi;
  const matches = xml.match(itemRegex) ?? [];

  for (const block of matches) {
    const title = stripHtml(stripCdata(pickField(block, "title"))).trim();

    // <link>https://...</link> first; fall back to <link href="..." />
    const linkText = stripCdata(pickField(block, "link")).trim();
    const linkAttr = block.match(/<link\b[^>]*href=["']([^"']+)["']/i)?.[1] ?? "";
    const url = (linkText || linkAttr).trim();

    const descRaw =
      pickField(block, "description") ||
      pickField(block, "summary") ||
      pickField(block, "content");
    const summary = stripHtml(stripCdata(descRaw));

    const pubRaw =
      pickField(block, "pubDate") ||
      pickField(block, "updated") ||
      pickField(block, "published");
    const published_at = safeIsoDate(pubRaw);

    if (title && url) {
      items.push({
        title: clip(title, 250),
        url,
        summary: clip(summary, 600),
        published_at,
      });
    }
  }

  return items;
}
