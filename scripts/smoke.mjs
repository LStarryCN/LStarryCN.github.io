import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = process.cwd();

function loadTypeScript(file) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", code)(require, module, module.exports);
  return module.exports;
}

const { getRelatedPosts } = loadTypeScript("lib/related.ts");
const { getAllSeries, seriesSlug } = loadTypeScript("lib/series.ts");
const { searchEntries } = loadTypeScript("lib/search.tsx");
const a = { slug: "a", date: "2026-09-20", title: "A", category: "算法", subcategory: "字符串",
  tags: ["SAM"], series: "验证专栏", seriesSlug: "check-series", seriesOrder: 2 };
const b = { ...a, slug: "b", date: "2026-09-19", title: "B", seriesOrder: 1 };
const unrelated = { ...a, slug: "c", category: "随笔", subcategory: undefined, tags: [], series: undefined };
assert.deepEqual(getRelatedPosts(a, [a, b, unrelated]).map((post) => post.slug), ["b"]);
assert.deepEqual(getAllSeries([a, b, unrelated])[0].posts.map((post) => post.slug), ["b", "a"]);
assert.equal(seriesSlug(a), "check-series");

const bodyMatch = { slug: "body", title: "Other", description: "", category: "", subcategory: "",
  tags: [], headings: [], plainText: "A link tree appears in the paragraph." };
const titleMatch = { ...bodyMatch, slug: "title", title: "Link tree", plainText: "" };
assert.deepEqual(searchEntries([bodyMatch, titleMatch], "link tree").map(({ entry }) => entry.slug), ["title", "body"]);

const index = JSON.parse(fs.readFileSync(path.join(root, "out", "search-index.json"), "utf8"));
assert(index.some((entry) => entry.plainText.includes("复杂度")));
for (const width of [1440, 1920, 2880]) {
  for (const format of ["avif", "webp"]) {
    assert(fs.existsSync(path.join(root, "out", "images", "backgrounds", `lstarry-bg-${width}.${format}`)));
  }
}
for (const route of ["index.html", "posts/index.html", "posts/about-this-blog/index.html",
  "projects/index.html", "projects/lstarry-blog/index.html", "projects/edge-startpage/index.html",
  "about/index.html", "series/index.html", "topics/algorithm/index.html"]) {
  assert(fs.existsSync(path.join(root, "out", route)), route);
}
const projectsHtml = fs.readFileSync(path.join(root, "out", "projects", "index.html"), "utf8");
assert(projectsHtml.indexOf("LStarry Blog") < projectsHtml.indexOf("LStarry New Tab"));
assert(!projectsHtml.includes("CHALLENGE"));
for (const slug of ["lstarry-blog", "edge-startpage"]) {
  assert(projectsHtml.includes(`/projects/${slug}/`));
  const html = fs.readFileSync(path.join(root, "out", "projects", slug, "index.html"), "utf8");
  assert(html.includes(`https://lstarry.cn/projects/${slug}/`));
  assert(html.includes("FEATURES") && html.includes("IMPLEMENTATION"));
  assert(!html.includes("GALLERY"));
}
const sitemap = fs.readFileSync(path.join(root, "out", "sitemap.xml"), "utf8");
assert(sitemap.includes("/projects/lstarry-blog/") && sitemap.includes("/projects/edge-startpage/"));
const imageManifest = JSON.parse(fs.readFileSync(path.join(root, "public", "image-manifest.json"), "utf8"));
for (const name of ["blog-cover.png", "edge-startpage-cover.png"]) {
  const image = imageManifest[`project:/images/projects/${name}`];
  assert.equal(image.width, 2548);
  assert.equal(image.height, 1271);
  assert(image.blur.startsWith("data:image/webp;base64,"));
  for (const width of image.widths) {
    for (const format of ["avif", "webp"]) {
      const src = `${image.base}/${width}.${format}`;
      assert(projectsHtml.includes(src), src);
      assert(fs.existsSync(path.join(root, "out", src.slice(1))), src);
    }
  }
}
console.log("Smoke checks PASS: search, related, series, project detail routes, sitemap and images");
