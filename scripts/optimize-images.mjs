import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import remarkParse from "remark-parse";
import sharp from "sharp";
import { unified } from "unified";

const root = process.cwd();
const publicDir = path.join(root, "public");
const postsDir = path.join(root, "content", "posts");
const manifest = {};

async function writeVariant(source, target, width, format) {
  if (fs.existsSync(target) && fs.statSync(target).mtimeMs >= fs.statSync(source).mtimeMs) return;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const image = sharp(source).rotate().resize({ width, withoutEnlargement: true });
  await (format === "avif" ? image.avif({ quality: 52, effort: 4 }) : image.webp({ quality: 76, effort: 4 })).toFile(target);
}

const background = path.join(publicDir, "images", "backgrounds", "lstarry-bg.jpg");
for (const width of [1440, 1920, 2880]) {
  for (const format of ["avif", "webp"]) {
    await writeVariant(background, path.join(path.dirname(background), `lstarry-bg-${width}.${format}`), width, format);
  }
}

function imageSources(markdown) {
  const sources = [];
  const walk = (node) => {
    if (node.type === "image" && node.url) sources.push(node.url);
    for (const child of node.children || []) walk(child);
  };
  walk(unified().use(remarkParse).parse(markdown));
  return sources;
}

async function indexImage(slug, src, absolute, original) {
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) return;
  if (!/\.(?:jpe?g|png|webp|avif)$/i.test(absolute)) return;
  const { width, height } = await sharp(absolute).metadata();
  if (!width || !height) return;
  const id = createHash("sha256").update(path.relative(root, absolute)).digest("hex").slice(0, 12);
  const outputDir = path.join(publicDir, "images", "optimized", id);
  const base = `/images/optimized/${id}`;
  const source = original || `${base}/original${path.extname(absolute).toLowerCase()}`;
  if (!original) {
    fs.mkdirSync(outputDir, { recursive: true });
    fs.copyFileSync(absolute, path.join(outputDir, `original${path.extname(absolute).toLowerCase()}`));
  }
  const widths = [...new Set([480, 768, 1024, 1440, width].filter((candidate) => candidate <= width))].sort((a, b) => a - b);
  for (const candidate of widths) {
    for (const format of ["avif", "webp"]) {
      await writeVariant(absolute, path.join(outputDir, `${candidate}.${format}`), candidate, format);
    }
  }
  const tiny = await sharp(absolute).rotate().resize({ width: 24 }).webp({ quality: 32 }).toBuffer();
  manifest[`${slug}:${src}`] = { src: source, width, height, widths, base,
    blur: `data:image/webp;base64,${tiny.toString("base64")}` };
}

for (const fileName of fs.readdirSync(postsDir).filter((name) => /\.mdx?$/.test(name))) {
  const slug = fileName.replace(/\.mdx?$/, "");
  const { data, content } = matter(fs.readFileSync(path.join(postsDir, fileName), "utf8"));
  if (data.draft) continue;
  const sources = new Set([...imageSources(content), ...(data.cover ? [String(data.cover)] : [])]);
  for (const src of sources) {
    if (/^(?:https?:|data:|\/\/)/i.test(src)) continue;
    const decoded = decodeURIComponent(src.split(/[?#]/)[0]);
    const absolute = decoded.startsWith("/")
      ? path.resolve(publicDir, `.${decoded}`)
      : path.resolve(postsDir, path.dirname(fileName), decoded);
    if (!absolute.startsWith(root + path.sep)) continue;
    await indexImage(slug, src, absolute, absolute.startsWith(publicDir + path.sep) ? decoded : undefined);
  }
}

const projectDir = path.join(publicDir, "images", "projects");
if (fs.existsSync(projectDir)) {
  for (const fileName of fs.readdirSync(projectDir).filter((name) => /\.(?:jpe?g|png|webp|avif)$/i.test(name))) {
    await indexImage("project", `/images/projects/${fileName}`, path.join(projectDir, fileName), `/images/projects/${fileName}`);
  }
}

fs.writeFileSync(path.join(publicDir, "image-manifest.json"), JSON.stringify(manifest));
console.log(`Images: background variants ready; ${Object.keys(manifest).length} local images indexed`);
