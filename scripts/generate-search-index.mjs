import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";

const root = process.cwd();
const postsDir = path.join(root, "content", "posts");

function textOf(node) {
  if (["text", "inlineCode", "inlineMath", "math"].includes(node.type)) return node.value || "";
  if (node.type === "code" || node.type === "html" || node.type === "image") return "";
  return (node.children || []).map(textOf).join(" ");
}

function contentOf(markdown) {
  const tree = unified().use(remarkParse).use(remarkGfm).use(remarkMath).parse(markdown);
  const headings = [];
  const paragraphs = [];
  const walk = (node) => {
    if (["heading", "paragraph", "tableCell", "math"].includes(node.type)) {
      const value = textOf(node).replace(/\s+/g, " ").trim();
      if (value) (node.type === "heading" ? headings : paragraphs).push(value);
      return;
    }
    for (const child of node.children || []) walk(child);
  };
  walk(tree);
  return { headings, plainText: paragraphs.join(" \n ") };
}

const index = fs.readdirSync(postsDir)
  .filter((name) => /\.mdx?$/.test(name))
  .map((name) => {
    const { data, content } = matter(fs.readFileSync(path.join(postsDir, name), "utf8"));
    if (data.draft) return null;
    return {
      slug: name.replace(/\.mdx?$/, ""),
      title: String(data.title || name.replace(/\.mdx?$/, "")),
      description: String(data.description || ""),
      category: String(data.category || "未分类"),
      subcategory: data.subcategory ? String(data.subcategory) : "",
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      ...contentOf(content),
    };
  })
  .filter(Boolean);

fs.writeFileSync(path.join(root, "public", "search-index.json"), JSON.stringify(index));
console.log(`Search index: ${index.length} posts, ${fs.statSync(path.join(root, "public", "search-index.json")).size} bytes`);
