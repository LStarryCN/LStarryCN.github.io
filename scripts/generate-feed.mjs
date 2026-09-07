import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const source = path.join(root, "content", "posts");
const target = path.join(root, "out", "atom.xml");
const siteUrl = "https://lstarry.cn";

const escapeXml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const posts = fs.existsSync(source)
  ? fs
      .readdirSync(source)
      .filter((file) => /\.mdx?$/.test(file))
      .map((file) => {
        const { data } = matter(fs.readFileSync(path.join(source, file), "utf8"));
        return {
          slug: file.replace(/\.mdx?$/, ""),
          title: String(data.title || file),
          description: String(data.description || ""),
          date: new Date(data.date || "1970-01-01"),
          draft: Boolean(data.draft),
        };
      })
      .filter((post) => !post.draft)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  : [];

const updated = posts[0]?.date.toISOString() || new Date().toISOString();
const entries = posts
  .map((post) => {
    const url = `${siteUrl}/posts/${post.slug}/`;
    return `  <entry>\n    <title>${escapeXml(post.title)}</title>\n    <id>${url}</id>\n    <link href="${url}" />\n    <updated>${post.date.toISOString()}</updated>\n    <summary>${escapeXml(post.description)}</summary>\n  </entry>`;
  })
  .join("\n");

const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>LStarry</title>
  <subtitle>Code · Notes · Life</subtitle>
  <id>${siteUrl}/</id>
  <link href="${siteUrl}/" />
  <link href="${siteUrl}/atom.xml" rel="self" />
  <updated>${updated}</updated>
${entries}
</feed>
`;

fs.writeFileSync(target, feed, "utf8");
console.log(`Generated ${path.relative(root, target)}`);
