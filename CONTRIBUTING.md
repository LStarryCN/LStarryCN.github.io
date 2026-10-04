# Contributing

欢迎提交可复现的 Bug 与小范围改进。先在 Issue 说明问题，尤其是涉及视觉设计、个人信息、文章或部署方式的修改。

## Local development

1. Fork 仓库，再 clone 自己的 fork。
2. 推荐使用 Node.js 24 LTS，与 CI 保持一致，运行 `npm ci`。
3. 从最新 `main` 创建分支，例如 `git switch -c codex/fix-search`。
4. 运行 `npm run dev`，保持现有布局、功能与静态导出架构。
5. 修改有实际使用的逻辑时补充对应回归测试。

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

smoke 与浏览器测试读取 `out/`，必须先构建。修改 UI 时检查桌面与移动视口，并在 PR 附图；不要提交生成文件或私人配置。

## Articles and assets

文章保存在 `content/posts/<slug>.md`。文件名决定 `/posts/<slug>/` 路由。

```yaml
---
title: 文章标题
description: 文章说明
date: 2026-10-04
category: 开发
subcategory: AI
tags:
  - 示例标签
draft: true
---
```

可选字段：`updated`、`cover`、`featured`、`series`、正整数 `seriesOrder`、小写连字符 `seriesSlug`。`draft: true` 的文章不进入页面、搜索索引和订阅源。`.mdx` 后缀兼容 Markdown，但不会执行 JSX。发布前检查同名系列的 slug 一致性、站内链接与数学公式。

只使用真实、经所有者授权的个人资料和项目。保留 `public/images/backgrounds/lstarry-bg.jpg`，不添加未经许可的远程图片。字体与设计参考继续在 `CREDITS.md` 注明来源。

## Commit and pull request

采用 Conventional Commits，例如 `fix: handle unavailable browser storage` 或 `docs: clarify static preview`。

常用类型：`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`ci`、`chore`。不强制安装本地 Git hooks。

PR 说明问题、最终行为和实际验证结果。保持改动范围清晰，不重排无关文件、不夹带文章或个人资料变更、不伪造测试结果。不要提交凭据、环境变量值、`node_modules/`、`.next/`、`out/` 或测试产物。

部署继续使用现有 `pages.yml` 与 `lstarry.cn`。合并 / 推送由仓库所有者决定；提交 PR 本身不代表已部署。
