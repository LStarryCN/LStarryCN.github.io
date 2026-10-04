import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

test("core pages render without browser errors or horizontal overflow", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  for (const route of ["/", "/posts/", "/projects/", "/projects/lstarry-blog/", "/about/", "/series/", "/topics/algorithm/", "/posts/about-this-blog/"]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), route).toBe(true);
    if (route === "/" || route === "/projects/") {
      await page.evaluate(async () => {
        await Promise.all(Array.from(document.images, (image) => {
          image.loading = "eager";
          return image.decode();
        }));
      });
      await page.screenshot({ path: testInfo.outputPath(`${route === "/" ? "home" : "projects"}.png`), fullPage: true, animations: "disabled" });
    }
  }
  expect(errors).toEqual([]);
});

test("core navigation, article archive and project details open", async ({ page }, testInfo) => {
  await page.goto("/");
  const failedRequests: string[] = [];
  const documentRequests: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`);
  });
  page.on("requestfailed", (request) => {
    if (request.failure()?.errorText !== "net::ERR_ABORTED") failedRequests.push(request.url());
  });
  page.on("request", (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documentRequests.push(request.url());
  });
  if (testInfo.project.name === "mobile") await page.getByRole("button", { name: "打开导航菜单", exact: true }).click();
  const nav = page.getByRole("navigation", { name: testInfo.project.name === "mobile" ? "移动端导航" : "主导航", exact: true });
  await nav.getByRole("link", { name: "文章", exact: true }).click();
  await expect(page).toHaveURL(/\/posts\/$/);
  await page.locator(".post-card h2 a").first().click();
  await expect(page.locator(".article-content")).toBeVisible();
  await expect(page).toHaveURL(/\/posts\/[^/]+\/$/);
  if (testInfo.project.name === "mobile") await page.getByRole("button", { name: "打开导航菜单", exact: true }).click();
  await nav.getByRole("link", { name: "项目", exact: true }).click();
  await expect(page.getByRole("heading", { name: "项目实践", exact: true })).toBeVisible();
  expect(documentRequests, "Next Link navigation must keep the current document").toEqual([]);
  await page.locator(".portfolio-summary h2 a").first().click();
  await expect(page.getByRole("heading", { name: "LStarry Blog", exact: true })).toBeVisible();
  // Project summaries intentionally use native anchors, which load a new document.
  expect(failedRequests).toEqual([]);
});

test("full-text search, keyboard selection and archive filters work", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "找到想读的记录" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("combobox").fill("RAG");
  await expect(dialog.getByRole("option").first()).toContainText("RAG");
  await dialog.getByRole("combobox").press("Enter");
  await expect(page.locator(".article-content")).toBeVisible();
  await page.goto("/posts/?q=RAG");
  await expect(page.getByRole("textbox", { name: "搜索文章" })).toHaveValue("RAG");
  await expect(page.locator('.post-card h2 a[href="/posts/rag-retrieval-pipeline/"]')).toBeVisible();
  await expect(page.locator('.post-card h2 a[href="/posts/about-this-blog/"]')).toHaveCount(0);
  await page.getByRole("button", { name: "列表视图", exact: true }).click();
  await expect(page.locator(".posts-grid")).toHaveClass(/posts-list/);
  await page.getByRole("button", { name: "重置筛选", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "搜索文章" })).toHaveValue("");
  await expect(page).toHaveURL(/\/posts\/$/);
  await expect(page.locator(".post-card").first()).toBeVisible();
});

test("theme persists across reloads", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "切换到深色模式", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.getByRole("button", { name: "切换到浅色模式", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("theme remains usable when browser storage is denied", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Storage denied", "SecurityError"); } });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "切换到深色模式", exact: true }).click();
  await expect(page.getByRole("button", { name: "切换到浅色模式", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(errors).toEqual([]);
});

test("theme switches twice when stored values are readable but writes fail", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("lstarry-theme", "dark");
    Storage.prototype.setItem = () => { throw new DOMException("Storage full", "QuotaExceededError"); };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "切换到浅色模式", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "切换到深色模式", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "切换到深色模式", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => localStorage.getItem("lstarry-theme"))).toBe("dark");
});

test("theme synchronizes document and buttons across tabs", async ({ page }) => {
  await page.goto("/");
  const other = await page.context().newPage();
  await other.goto("/");
  await other.evaluate(() => localStorage.setItem("lstarry-theme", "dark"));
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "切换到浅色模式", exact: true })).toBeVisible();
  await other.evaluate(() => localStorage.removeItem("lstarry-theme"));
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "切换到深色模式", exact: true })).toBeVisible();
  await other.close();
});

test("search recovers after an index failure without leaving a stale error", async ({ page }) => {
  let requests = 0;
  await page.route("**/search-index.json", async (route) => {
    requests += 1;
    if (requests === 1) await route.fulfill({ status: 503, body: "Temporarily unavailable" });
    else await route.continue();
  });
  await page.goto("/posts/");
  const input = page.getByRole("textbox", { name: "搜索文章" });
  await input.fill("RAG");
  await expect(page.getByRole("heading", { name: "搜索索引加载失败" })).toBeVisible();
  await input.fill("");
  await expect(page.locator(".post-card").first()).toBeVisible();
  await input.fill("RAG");
  await expect(page.locator('.post-card h2 a[href="/posts/rag-retrieval-pipeline/"]')).toBeVisible();
  await input.fill("no-such-article-unique-query");
  await expect(page.getByRole("heading", { name: "没有找到匹配的文章" })).toBeVisible();
});

test("search closes with Escape and restores focus", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "打开站内搜索", exact: true }).filter({ visible: true });
  await trigger.click();
  await expect(page.getByRole("combobox")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "找到想读的记录" })).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("all exported HTML routes and local href/src targets resolve on the static server", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The export is shared by both viewport projects.");
  const root = path.resolve("out");
  const files = fs.readdirSync(root, { recursive: true }).map(String).filter((name) => name.endsWith(".html"));
  const targets = new Set<string>(["/atom.xml", "/sitemap.xml", "/robots.txt", "/CNAME"]);
  for (const file of files) {
    const route = `/${file.replaceAll(path.sep, "/").replace(/index\.html$/, "")}`;
    targets.add(route);
    const html = fs.readFileSync(path.join(root, file), "utf8");
    for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = new URL(value.replaceAll("&amp;", "&"), `http://127.0.0.1:4173${route}`);
      if (url.origin === "http://127.0.0.1:4173") targets.add(url.pathname);
    }
  }
  for (const target of targets) {
    const response = await request.get(target);
    expect(response.status(), target).toBe(200);
  }
  expect((await request.get("/not-a-real-page/")).status()).toBe(404);
  expect((await request.get("/posts/%2e%2e%2f%2e%2e%2fpackage.json")).status()).toBe(403);
  expect((await request.get("/bad%ZZ")).status()).toBe(400);
  expect((await request.post("/")).status()).toBe(405);
  expect((await request.get("/CNAME")).headers()["content-type"]).toBe("application/octet-stream");
});
