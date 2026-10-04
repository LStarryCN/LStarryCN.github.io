# LStarry Blog

LStarry 的个人技术博客，用于整理算法、开发、AI 学习与日常记录。Next.js 在构建时生成完整静态站点，通过 GitHub Pages 发布。

## Preview

- 正式站点：[https://lstarry.cn](https://lstarry.cn)
- 仓库：[LStarryCN/LStarryCN.github.io](https://github.com/LStarryCN/LStarryCN.github.io)

## Features

- 本地 Markdown 文章、分类、标签、归档与 Series 系列阅读
- 构建时生成全文搜索索引，支持 Ctrl / Cmd + K、键盘选择与归档筛选
- 相关文章、文章目录、代码复制、语法高亮与 KaTeX 数学公式
- 项目列表与项目详情、关于页面、浅色 / 深色主题、响应式导航
- 本地字体、AVIF / WebP 响应式图片与模糊占位
- SEO metadata、canonical、sitemap、robots 与 Atom 订阅源

文章以 `.md` 或 `.mdx` 后缀读取，但使用 Markdown 管线；不执行 MDX 中的 JSX。

## Tech Stack

Next.js 16、React 19、TypeScript 5、Tailwind CSS 4、Lucide React；gray-matter 读取元数据，unified / remark / rehype 渲染 Markdown，Sharp 在构建时处理图片。使用 npm 与 `package-lock.json`。

## Getting Started

推荐使用 Node.js 24 LTS；CI 与 Pages 统一使用 Node 24。`package.json` engines 表示技术兼容范围，已结束支持的 Node 20 不再作为推荐开发或 CI 版本。

```sh
npm ci
npm run dev
```

开发环境会先生成搜索索引与图片变体。文章修改后页面由 Next.js 更新；搜索索引与图片清单需重启开发环境或重新构建才能更新。

```sh
npm run build
npm run preview
```

构建产物在 `out/`，预览地址为 `http://127.0.0.1:4173`，可用 `npm run preview -- 3000` 修改端口。预览直接提供静态文件，缺失路径返回 404，不使用 SPA 回退。

构建脚本还会补齐 Windows 导出的 Next.js 预取片段文件名；Linux 上无需补齐。这样本地预览与 Pages 的客户端导航都使用实际存在的静态路径。

## Project Structure

| 目录 / 文件 | 用途 |
| --- | --- |
| `app/` | 页面、SEO metadata、全局样式与静态路由 |
| `components/` | 导航、搜索、文章与项目展示组件 |
| `lib/` | 文章解析、分类、搜索、关联推荐、系列与图片清单读取 |
| `content/posts/` | Markdown 文章与 front matter |
| `data/projects.ts` | 真实项目展示数据 |
| `public/` | 所有者提供的本地素材与 `CNAME` |
| `scripts/` | 构建资源生成、静态预览与导出检查 |
| `tests/` | 单元测试与桌面 / 移动浏览器测试 |
| `siteConfig.ts` | 站点信息、导航与正式域名 |
| `.github/` | CI、Pages 发布、Dependabot 与贡献模板 |

## Development

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run smoke
npx playwright install chromium
npm run test:e2e
git diff --check
```

- `typecheck` 先运行 `next typegen`，因此首次安装后不需要先构建。
- 单元测试使用 Node.js 自带的 test runner，由 tsx 加载 TypeScript；无需先生成 `out/`。
- smoke 根据 `.next/` 构建元数据校验 `out/` 中预期的页面和全部静态片段，Playwright 使用同一次构建的产物。修改代码后应重新构建，再运行这两项检查。
- Playwright 仅安装 Chromium，以桌面与 390 × 844 移动视口覆盖关键路径。CI 使用 `npx playwright install --with-deps chromium`；失败截图和 trace 保存到 `test-results/`。
- ESLint 保留 Next.js、React Hooks 与 TypeScript 检查。静态图片使用构建时 picture/srcset；同步主题、日期、URL 和弹窗状态的 effect 保持原有行为。
- 不做全仓格式化；沿用相邻文件风格，不引入 Prettier、Husky 或 Commitlint。

内容格式与提交规则见 [CONTRIBUTING.md](CONTRIBUTING.md)。设计参考与字体许可见 [CREDITS.md](CREDITS.md)。

## Deployment

`next.config.ts` 保持 `output: "export"`、`trailingSlash: true` 和 `images.unoptimized: true`。动态文章、项目和分类路径在构建时列举；没有后端、运行时 API 或图片服务器。

`.github/workflows/pages.yml` 在 `main` push 或手动触发时调用同一提交中的 `ci.yml`。lint、类型检查、单元测试、构建、smoke、生产依赖安全检查与 E2E 全部成功后，上传这一次已验证的 `out/`；部署作业依赖完整检查并直接发布该产物，不重新构建。正式域名仍为 `lstarry.cn`，由现有 Pages 设置与 `public/CNAME` 维持。

`ci.yml` 在非 `main` 分支 push、pull request 或手动触发时执行相同检查。`main` push 由 Pages 调用检查，避免同时重复构建。PR 的 CI 不上传 Pages 产物；若需要阻止未通过检查的改动合并，应由仓库所有者在 GitHub 配置分支保护。

不要提交 `node_modules/`、`.next/`、`out/`、测试报告、搜索 / 图片清单或生成的图片变体。

## Environment and Security

网站不使用业务环境变量或 API 密钥，所以没有 `.env.example`。`CI` 仅由测试配置读取，是 CI 平台提供的标志。`.env*` 已忽略，同时允许未来提交仅含空值的 `.env.example`。

文章是仓库中经维护者审核的本地内容，不是用户提交的实时 HTML。原始 HTML 不渲染，链接和图片仅允许安全协议；主题初始化脚本是固定源码。外部新窗口链接使用 `noreferrer`（同时隐含 `noopener`）或显式 `noopener noreferrer`。

运行 `npm audit` 检查完整依赖树，`npm audit --omit=dev` 单独检查生产依赖。不要使用 `npm audit fix --force`；需结合调用场景与补丁兼容性处理告警。

2026-10-04 检查时，ESLint 开发依赖链中的 `braces@3.0.3` 存在深层 glob 栈溢出告警，上游尚无补丁。该工具链不进入浏览器产物；保留为已知项，依赖更新时重新评估。[安全公告](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)

## License

仓库尚未声明项目 LICENSE，本次维护未擅自选择许可证。字体和其他素材各自的许可与来源见 `CREDITS.md`；公开仓库不代表所有内容和素材可任意复用。
