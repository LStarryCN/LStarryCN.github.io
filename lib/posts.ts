import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { Post, PostMeta, TocItem } from "@/types/content";
import { getImageAsset } from "@/lib/images";

const postsDirectory = path.join(process.cwd(), "content", "posts");

function dateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && value.trim()) return value.trim().slice(0, 10);
  return "1970-01-01";
}

function readingTime(content: string): number {
  const chineseCharacters = content.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const latinWords = content
    .replace(/[\u3400-\u9fff]/g, " ")
    .match(/[\p{L}\p{N}_+-]+/gu)?.length ?? 0;
  return Math.max(1, Math.ceil(chineseCharacters / 300 + latinWords / 200));
}

function readPostMeta(fileName: string): PostMeta {
  const slug = fileName.replace(/\.mdx?$/, "");
  const raw = fs.readFileSync(path.join(postsDirectory, fileName), "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: String(data.title || slug),
    description: String(data.description || ""),
    date: dateString(data.date),
    updated: data.updated ? dateString(data.updated) : undefined,
    category: String(data.category || "未分类"),
    subcategory: data.subcategory ? String(data.subcategory) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    cover: data.cover ? String(data.cover) : undefined,
    featured: Boolean(data.featured),
    draft: Boolean(data.draft),
    readingTime: readingTime(content),
    series: typeof data.series === "string" && data.series.trim() ? data.series.trim() : undefined,
    seriesOrder: Number.isInteger(data.seriesOrder) && data.seriesOrder > 0 ? data.seriesOrder : undefined,
    seriesSlug: typeof data.seriesSlug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.seriesSlug)
      ? data.seriesSlug : undefined,
  };
}

function postFiles(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory).filter((file) => /\.mdx?$/.test(file));
}

export function getAllPosts(): PostMeta[] {
  return postFiles()
    .map(readPostMeta)
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}

function plainHeading(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .trim();
}

function extractToc(html: string): TocItem[] {
  return [...html.matchAll(/<h([1-3]) id="([^"]+)">([\s\S]*?)<\/h\1>/g)].map(
    (match) => ({
      level: Number(match[1]),
      id: match[2],
      text: plainHeading(match[3]),
    }),
  );
}

function responsiveImages(slug: string) {
  return () => (tree: { type: string; tagName?: string; properties?: Record<string, unknown>; children?: unknown[] }) => {
    const walk = (node: typeof tree) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        const image = child as typeof tree;
        if (image.tagName !== "img") { walk(image); return image; }
        const src = String(image.properties?.src || "");
        const asset = getImageAsset(slug, src);
        image.properties = { ...image.properties, loading: "lazy", decoding: "async" };
        if (!asset) return image;
        image.properties = { ...image.properties, src: asset.src, width: asset.width, height: asset.height,
          style: `aspect-ratio:${asset.width}/${asset.height}` };
        return { type: "element", tagName: "picture", properties: {
          className: ["article-picture"],
          style: `background-image:url('${asset.blur}');aspect-ratio:${asset.width}/${asset.height}`,
        }, children: [
          ...(["avif", "webp"] as const).map((format) => ({ type: "element", tagName: "source", properties: {
            type: `image/${format}`,
            srcSet: asset.widths.map((width) => `${asset.base}/${width}.${format} ${width}w`).join(", "),
            sizes: "(max-width: 800px) calc(100vw - 50px), 760px",
          }, children: [] })),
          image,
        ] };
      });
    };
    walk(tree);
  };
}

async function renderMarkdown(content: string, slug: string) {
  return String(
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(rehypeHighlight, { detect: false, ignoreMissing: true })
      .use(rehypeKatex)
      .use(responsiveImages(slug))
      .use(rehypeStringify)
      .process(content),
  );
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const fileName = postFiles().find((file) => file.replace(/\.mdx?$/, "") === slug);
  if (!fileName) return undefined;

  const raw = fs.readFileSync(path.join(postsDirectory, fileName), "utf8");
  const { content } = matter(raw);
  const metadata = readPostMeta(fileName);
  if (metadata.draft) return undefined;
  const contentHtml = await renderMarkdown(content, slug);
  return { ...metadata, content, contentHtml, toc: extractToc(contentHtml) };
}

export function getPostsByCategory(category: string, subcategory?: string) {
  return getAllPosts().filter(
    (post) =>
      post.category === category &&
      (!subcategory || post.subcategory === subcategory),
  );
}

export function getPostsByTag(tag: string) {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}

export function getFeaturedPosts() {
  return getAllPosts().filter((post) => post.featured);
}

export function getPostStats() {
  const posts = getAllPosts();
  return {
    posts: posts.length,
    categories: new Set(posts.map((post) => post.category)).size,
    tags: new Set(posts.flatMap((post) => post.tags)).size,
  };
}
