import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("out");
const port = Number(process.argv[2] || 4173);
const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml", ".jpeg": "image/jpeg", ".jpg": "image/jpeg",
  ".png": "image/png", ".avif": "image/avif", ".webp": "image/webp",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ico": "image/x-icon",
};

// Local static preview only: no SPA fallback, so missing Pages routes stay visible.
await stat(path.join(root, "index.html"));
createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  try {
    const url = new URL(request.url, "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    const file = path.resolve(root, `.${pathname}`);
    if (pathname.includes("\\") || !file.startsWith(root + path.sep) && file !== root) {
      response.writeHead(403).end();
      return;
    }
    const info = await stat(file);
    if (info.isDirectory() && !url.pathname.endsWith("/")) {
      response.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end();
      return;
    }
    const target = info.isDirectory() ? path.join(file, "index.html") : file;
    const body = await readFile(target);
    response.writeHead(200, { "Content-Type": types[path.extname(target)] || "application/octet-stream" });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch (error) {
    if (error instanceof URIError) {
      response.writeHead(400).end();
    } else if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      const body = await readFile(path.join(root, "404.html"));
      response.writeHead(404, { "Content-Type": types[".html"] });
      response.end(request.method === "HEAD" ? undefined : body);
    } else {
      console.error(error);
      response.writeHead(500).end();
    }
  }
}).listen(port, "127.0.0.1", () => console.log(`Static preview: http://127.0.0.1:${port}`));
