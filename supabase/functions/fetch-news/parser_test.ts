// Deno tests — run with: deno test supabase/functions/fetch-news/
import { assert, assertEquals } from "https://deno.land/std@0.220.0/assert/mod.ts";
import { clip, parseRss, sha256, stripHtml } from "./parser.ts";

Deno.test("stripHtml removes tags and collapses whitespace", () => {
  assertEquals(stripHtml("<p>hello   <b>world</b></p>"), "hello world");
});

Deno.test("clip truncates with ellipsis", () => {
  assertEquals(clip("abcdef", 4), "abc…");
  assertEquals(clip("hi", 10), "hi");
});

Deno.test("parseRss handles empty / non-string input", () => {
  assertEquals(parseRss(""), []);
  // @ts-expect-error testing runtime guard
  assertEquals(parseRss(null), []);
  assertEquals(parseRss("<rss></rss>"), []);
});

Deno.test("parseRss extracts standard RSS 2.0 items", () => {
  const xml = `<?xml version="1.0"?><rss><channel>
    <item>
      <title>Chennai metro update</title>
      <link>https://example.com/metro</link>
      <description>Phase 2 work begins next week.</description>
      <pubDate>Wed, 23 Apr 2025 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Salem weather alert</title>
      <link>https://example.com/weather</link>
      <description><![CDATA[<p>Rain expected <b>Friday</b>.</p>]]></description>
      <pubDate>2025-04-22T12:00:00Z</pubDate>
    </item>
  </channel></rss>`;
  const items = parseRss(xml);
  assertEquals(items.length, 2);
  assertEquals(items[0].title, "Chennai metro update");
  assertEquals(items[0].url, "https://example.com/metro");
  assertEquals(items[0].published_at, "2025-04-23T10:00:00.000Z");
  // CDATA + HTML stripped
  assertEquals(items[1].summary, "Rain expected Friday .");
});

Deno.test("parseRss handles Atom <entry> with <link href>", () => {
  const xml = `<feed>
    <entry>
      <title>Atom story</title>
      <link href="https://example.com/atom" rel="alternate"/>
      <summary>An atom summary</summary>
      <updated>2025-04-20T08:00:00Z</updated>
    </entry>
  </feed>`;
  const items = parseRss(xml);
  assertEquals(items.length, 1);
  assertEquals(items[0].url, "https://example.com/atom");
  assertEquals(items[0].summary, "An atom summary");
  assertEquals(items[0].published_at, "2025-04-20T08:00:00.000Z");
});

Deno.test("parseRss skips items missing title or link (no nullish blowups)", () => {
  const xml = `<rss><channel>
    <item><title>No link here</title></item>
    <item><link>https://example.com/no-title</link></item>
    <item><title>Good</title><link>https://example.com/good</link></item>
  </channel></rss>`;
  const items = parseRss(xml);
  assertEquals(items.length, 1);
  assertEquals(items[0].title, "Good");
});

Deno.test("parseRss tolerates malformed dates", () => {
  const xml = `<rss><channel>
    <item>
      <title>Bad date</title>
      <link>https://example.com/x</link>
      <pubDate>not-a-date</pubDate>
    </item>
  </channel></rss>`;
  const items = parseRss(xml);
  assertEquals(items.length, 1);
  assertEquals(items[0].published_at, null);
});

Deno.test("parseRss tolerates CDATA in title and link", () => {
  const xml = `<rss><channel>
    <item>
      <title><![CDATA[Hello & welcome]]></title>
      <link><![CDATA[https://example.com/cdata]]></link>
      <description><![CDATA[Body]]></description>
    </item>
  </channel></rss>`;
  const items = parseRss(xml);
  assertEquals(items.length, 1);
  assertEquals(items[0].title, "Hello & welcome");
  assertEquals(items[0].url, "https://example.com/cdata");
});

Deno.test("parseRss falls back through description -> summary -> content", () => {
  const xml = `<feed>
    <entry>
      <title>Content fallback</title>
      <link href="https://example.com/c"/>
      <content>Content body text</content>
    </entry>
  </feed>`;
  const items = parseRss(xml);
  assertEquals(items[0].summary, "Content body text");
});

Deno.test("sha256 produces deterministic hex digest", async () => {
  const a = await sha256("hello|https://x.com");
  const b = await sha256("hello|https://x.com");
  assertEquals(a, b);
  assert(/^[0-9a-f]{64}$/.test(a));
});
