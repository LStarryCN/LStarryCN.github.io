# LStarry Blog Repository Rules

## Project identity

- This repository contains the LStarry personal technical blog.
- Production domain: `https://lstarry.cn`
- GitHub repository: `LStarryCN/LStarryCN.github.io`
- Hosting target: GitHub Pages.

## Architecture and deployment

- The final site must support a pure Next.js static export to `out/`.
- Do not introduce SSR, ISR, middleware, Server Actions, runtime API routes, databases, or a separately hosted backend.
- Preserve trailing-slash routes and verify that direct static paths work on GitHub Pages.
- Keep the existing Pages workflow stable; make only the minimum changes required for the verified static export.
- Do not change the repository URL, custom domain, DNS, or HTTPS configuration.

## Content and design integrity

- Do not invent LStarry's education, employer, awards, research, competitions, work history, or projects.
- Do not fabricate posts merely to populate empty categories.
- Do not copy the reference site's personal biography, posts, photos, avatars, backgrounds, covers, statistics, or third-party image URLs.
- Keep reference attribution accurate when its design ideas or licensed code materially influence the project.
- Prefer local, licensed assets. The owner-supplied background is `public/images/backgrounds/lstarry-bg.jpg`; do not replace it or introduce remote artwork without instruction.

## Security and repository hygiene

- Never commit secrets, passwords, tokens, cookies, credentials, or private environment values.
- Never commit `node_modules/`, `.next/`, `out/`, logs, or other build artifacts.
- Do not alter Git credentials.
- Do not push `main` or any other branch without the owner's explicit instruction.
- Do not force-push, run `git reset --hard`, or run destructive cleanup commands.
- Preserve unrelated user changes in a dirty working tree.

## Working practice

- Inspect the actual repository state before modifying it; continue existing work instead of recreating the app.
- Keep content parsing and taxonomy logic centralized under `lib/`.
- Keep planned topic routes accessible even when they contain zero posts.
- Validate changes with `npm ci`, typechecking, `npm run build`, static-server route checks, responsive checks, and `git diff --check` before handoff.
- The legacy Hexo fallback was removed only after the Next.js static build and output were proven successful; do not reintroduce it without a documented migration need.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
