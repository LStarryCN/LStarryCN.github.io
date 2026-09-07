# LStarry visual QA

## Evidence

- Source visual truth path: `E:\Blog\LStarryBlog\public\images\backgrounds\lstarry-bg.jpg`
- Source pixels: 3840×2160, 16:9, inspected at original resolution.
- Rendered implementation: `http://localhost:3000/` served from the static `out/` export.
- Implementation screenshot path: Codex in-app Browser captures attached to this task (the browser tool does not expose a repository file path).
- Primary comparison: 1440×900 CSS px at device pixel ratio 1; implementation capture is 1440×900 pixels. The full source was normalized to 1440×810 inside the same 1440×900 browser viewport, then compared in one combined visual pass.
- Additional responsive captures: 1920×1080, 768×1024, 430×932, and 375×812 CSS px; light theme unless a dark state is named below.
- States: home light/dark, posts archive, empty C++ topic, article light/dark, mobile navigation open, mobile article TOC open.

## Full-view comparison evidence

- The desktop implementation keeps the source composition readable: the character remains on the left, the pink-purple light remains near the visual center, and the giant remains dominant on the right.
- Content is layered over the image with translucent cool-white glass instead of a global dark-purple cover. The lower haze supports footer/content legibility without hiding the artwork.
- The home hierarchy is intentionally adapted rather than cloned: compact search, 7/5 profile and status cards, one information strip, then asymmetric latest/project/learning/theme cards.
- On tablet the crop moves to 30% and on phones to 25%, prioritizing the character and light source while retaining part of the giant silhouette. This is an expected crop for the narrow aspect ratio, not a stretched image.

## Focused comparison evidence

- The navigation, search, profile statistics, status rows, latest-post heading, and project/learning/theme controls were inspected in the native-size captures. Separate zoom crops were not needed because their typography, icons, borders, and tap targets remained legible at the requested CSS sizes.
- The article surface was checked independently in both themes; its higher-opacity reading surface preserves body, table, formula, code, and TOC contrast while the background remains visible at the sides.

## Required fidelity surfaces

- Typography: natural Chinese labels replace repeated uppercase template kickers; display weights are limited to identity and article headings, and auxiliary text retains readable sizing and line height.
- Spacing and layout: no oversized home hero remains. The first fold reaches personal content immediately and reveals the latest-content section at 430, 768, 1440, and 1920 widths. Card radii and 16px grid gaps are consistent.
- Colors and tokens: light mode uses fog blue, cool white, blue-grey, restrained lavender/pink accents, and 71% glass surfaces. Dark mode uses translucent blue-grey instead of black and keeps the illustration visible.
- Image quality: the supplied 3840×2160 JPEG is used directly with `cover`, no stretching, no additional particles/stars, and no copied or generated replacement artwork.
- Copy and content: profile facts, counts, the one real post, and the empty project/topic states remain truthful. No resume history, project, or progress data was invented.

## Comparison history

1. First pass findings:
   - P2: latest/archive result headings lost contrast where they sat directly on the artwork.
   - P2: the first light-glass token was slightly too transparent over the brightest source region.
   - P1: the completed route animation retained a transform, creating a containing block that prevented the mobile article TOC control from staying fixed to the viewport.
2. Fixes:
   - Added a high-contrast cool-white treatment and restrained shadow to headings placed directly on the artwork.
   - Increased the standard light surface from 66% to 71% opacity while keeping the background readable.
   - Removed transform from the route transition and kept a short opacity-only fade; simplified the TOC button to the shared blue accent.
3. Post-fix evidence:
   - Re-captured the home at 1440×900, 768×1024, 430×932, and 375×812.
   - Re-captured the mobile archive and article at 375×812; the TOC control is visibly fixed at the viewport edge and its drawer opens correctly.
   - Confirmed no page-level horizontal overflow at all five requested viewport widths and no browser console warnings/errors.

## Findings

- No actionable P0, P1, or P2 visual findings remain.
- Accepted constraint: a 16:9 scene cannot show the full left character and full right giant simultaneously in a portrait viewport. The phone crop deliberately protects the character's upper body and central light source instead of stretching the asset.

## Follow-up polish

- P3: when real article and project cover art is supplied, replace the restrained shared gradient placeholder without changing the current card proportions.

final result: passed
