import assert from "node:assert/strict";
import { test } from "node:test";
import { formatDate, postHref } from "@/lib/format";
import { dateString, getAllPosts, getPostBySlug, getPostsByCategory, renderMarkdown } from "@/lib/posts";
import { getRelatedPosts } from "@/lib/related";
import { searchEntries, type SearchEntry } from "@/lib/search";
import { getAllSeries, seriesSlug } from "@/lib/series";
import { getTopic, topics } from "@/lib/topics";
import type { PostMeta } from "@/types/content";

const post: PostMeta = {
  slug: "current", title: "Current", description: "", date: "2026-09-20",
  category: "开发", subcategory: "AI", tags: ["Attention"],
  featured: false, draft: false, readingTime: 1,
};
const entry: SearchEntry = {
  slug: "body", title: "Other", description: "", category: "开发", subcategory: "AI",
  tags: [], headings: [], plainText: "A link tree appears in the paragraph.",
};

test("search requires every term, ranks title above body and respects limits", () => {
  const title = { ...entry, slug: "title", title: "Link tree", plainText: "" };
  assert.deepEqual(searchEntries([entry, title], "link tree").map(({ entry }) => entry.slug), ["title", "body"]);
  assert.equal(searchEntries([entry, title], "link absent").length, 0);
  assert.equal(searchEntries([entry, title], "link", 1).length, 1);
  assert.deepEqual(searchEntries([entry], "   "), []);
});

test("search normalizes full-width text and returns a matching body excerpt", () => {
  const chinese = { ...entry, plainText: `${"上下文".repeat(80)} ＡＩ 学习记录` };
  const [result] = searchEntries([chinese], "ai");
  assert.ok(result.snippet.includes("ＡＩ"));
  assert.ok(result.snippet.startsWith("…"));
  assert.equal(searchEntries([entry], "LINK link")[0].score, searchEntries([entry], "link")[0].score);
});

test("related posts exclude self and unrelated posts; ties use newest date", () => {
  const older = { ...post, slug: "older", date: "2026-09-18" };
  const newer = { ...post, slug: "newer", date: "2026-09-19" };
  const unrelated = { ...post, slug: "unrelated", category: "随笔", subcategory: undefined, tags: [] };
  assert.deepEqual(getRelatedPosts(post, [post, older, unrelated, newer]).map((item) => item.slug), ["newer", "older"]);
  assert.equal(getRelatedPosts(post, [older, newer], 1).length, 1);
});

test("series uses explicit order, deterministic fallback and detects slug collisions", () => {
  const first = { ...post, slug: "first", series: "测试专栏", seriesOrder: 1 };
  const second = { ...first, slug: "second", seriesOrder: 2 };
  const unordered = { ...first, slug: "last", seriesOrder: undefined };
  assert.deepEqual(getAllSeries([unordered, second, first, post])[0].posts.map((item) => item.slug), ["first", "second", "last"]);
  assert.equal(seriesSlug(first), seriesSlug(second));
  assert.equal(seriesSlug(post), undefined);
  assert.deepEqual(getAllSeries([]), []);
  assert.throws(() => getAllSeries([
    { ...first, seriesSlug: "same" }, { ...second, seriesSlug: "same", series: "其他专栏" },
  ]), /collision/);
});

test("planned topic routes stay unique and accessible even with no posts", () => {
  assert.equal(new Set(topics.map(({ segments }) => segments.join("/"))).size, topics.length);
  for (const topic of topics) assert.equal(getTopic(topic.segments), topic);
  assert.equal(getTopic(["missing"]), undefined);
  assert.deepEqual(getPostsByCategory("不存在的测试分类"), []);
});

test("date display is fixed to Shanghai and article URLs keep trailing slash", () => {
  assert.equal(dateString(new Date("2026-09-06T00:00:00Z")), "2026-09-06");
  assert.equal(dateString(" 2026-09-07T12:00:00Z "), "2026-09-07");
  assert.equal(dateString(undefined), "1970-01-01");
  assert.equal(formatDate("2026-09-06"), "2026年9月6日");
  assert.equal(postHref("about-this-blog"), "/posts/about-this-blog/");
});

test("real Markdown metadata, math, code and TOC render without altering source", async () => {
  const posts = getAllPosts();
  assert.ok(posts.length > 0);
  assert.ok(posts.every((item) => !item.draft && /^\d{4}-\d{2}-\d{2}$/.test(item.date)));
  const article = await getPostBySlug("about-this-blog");
  assert.ok(article);
  assert.match(article.date, /^\d{4}-\d{2}-\d{2}$/);
  if (article.updated) assert.match(article.updated, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(article.contentHtml.includes('class="katex"'));
  assert.ok(article.contentHtml.includes("hljs"));
  for (const heading of article.toc) assert.ok(article.contentHtml.includes(`id="${heading.id}"`));
  assert.equal(await getPostBySlug("../../package"), undefined);
});

test("Markdown drops raw HTML and rejects executable link and image protocols", async () => {
  const html = await renderMarkdown([
    '<script>alert(1)</script>',
    '[bad](javascript:alert%281%29)',
    '[data](data:text/html;base64,PHNjcmlwdD4=)',
    '[mixed](JaVaScRiPt:alert%281%29)',
    '![bad](javascript:alert%281%29)',
    '[good](https://example.com/) [relative](/posts/) [anchor](#heading) [mail](mailto:test@example.com)',
  ].join("\n\n"), "test");
  assert.doesNotMatch(html, /<script|(?:href|src)="(?:javascript|data):/i);
  assert.ok(html.includes('href="https://example.com/"'));
  assert.ok(html.includes('href="/posts/"'));
  assert.ok(html.includes('href="#heading"'));
  assert.ok(html.includes('href="mailto:test@example.com"'));
});
