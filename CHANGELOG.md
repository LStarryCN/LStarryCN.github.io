# Changelog

仅记录本次维护起的实际改动；不补造历史 Release。

## Unreleased

### Added

- 独立 CI、ESLint、Node.js 单元测试和桌面 / 移动 Chromium E2E。
- 静态预览命令、README、贡献指南、Issue Forms 与 PR 模板。

### Changed

- Next.js 更新到 16.3.8 补丁版本。
- 类型检查先生成 Next.js 路由类型；Dependabot 改为每周、最多 3 个 PR。
- CI 与 Pages 统一使用 Node 24；Pages 复用完整 CI 检查并发布同一次已验证的产物。
- 导航测试检查请求错误与意外整页重载，静态检查根据构建元数据校验全部预期片段。
- 忽略本地环境配置与测试产物，继续保留已有静态部署流程。

### Fixed

- Markdown 渲染拒绝可执行 URL 协议，保留常规站内和外部链接。
- 浏览器存储被禁用时主题仍能切换；搜索索引重试成功后清除错误状态。
- 主题值可读取但写入失败时仍可连续切换，多标签页同步同时更新页面与按钮。
- 日期测试使用固定输入，真实文章更新日期不再被硬编码。
- Windows 静态导出中的 Next.js 预取片段文件名补齐为客户端请求路径。
