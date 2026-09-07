# Design QA — header profile card

## Visual truth

- Reference: `C:\Users\23247\AppData\Local\Temp\codex-clipboard-675d33e8-b4ae-4fbf-9b5f-1dc73cca9e7b.png`
- Reported broken state: `C:\Users\23247\AppData\Local\Temp\codex-clipboard-ff2dbaf4-d52d-4bbe-bb95-c309de3c9290.png`
- Verified implementation: `C:\Users\23247\AppData\Local\Temp\lstarry-profile-card-after.jpg`
- Side-by-side comparison: `C:\Users\23247\AppData\Local\Temp\lstarry-profile-card-comparison.jpg`
- Desktop verification viewport: 1368 × 929 CSS px, light theme, profile card open.
- Mobile verification viewport: 390 × 844 CSS px, light theme, profile card open.

## Comparison history

### Iteration 1

- **P1 — card opened without an intentional avatar interaction:** the avatar trigger also opened on focus, so restored focus could immediately reopen it. Removed focus-to-open and limited pointer opening to the avatar button.
- **P1 — desktop card became a modal at intermediate desktop widths:** the fixed-position layout was selected by width alone. Limited the sheet/scrim behavior to coarse pointers and phone widths.
- **P1 — card was much taller than its component styles specified:** the new popover reused a legacy `.profile-card` selector that added `min-height` and outer padding. Explicitly reset those inherited values.
- **P2 — density differed from the reference:** reduced the card width, inner spacing, avatar, type, controls, fact rows, and activity cells while retaining the blog's own content and visual identity.

### Iteration 2

- **P2 — close icon was hidden in the phone layout when the browser reported a fine pointer:** restored it explicitly in the phone breakpoint and verified its 44 × 44 px hit target.

## Final surface check

- **Typography:** compact hierarchy matches the reference relationship; existing project fonts and brand treatment are preserved.
- **Spacing:** desktop card measures 700 × 381 CSS px and remains attached below the brand/avatar area; phone layout stays within 10 px of the viewport edges and scrolls vertically.
- **Colors:** the site's existing blue-white glass palette is preserved; no colors or assets were copied from the reference site.
- **Imagery:** only the owner's local LStarry avatar and background are used.
- **Copy:** profile details, article count, build date, links, and activity data come from the existing site configuration and posts.

## Interaction and responsive verification

- Initial desktop load: profile dialog count is `0`.
- Keyboard activation opens one profile dialog; `Escape` closes it and it does not reopen from retained focus.
- Outside-pointer handling remains available; the desktop card has no redundant close icon.
- Phone layout exposes a visible close button and closes cleanly.
- Desktop and phone layouts remain within their viewports without horizontal overflow.

The implementation intentionally keeps the real 14-week activity grid and real site facts instead of copying the reference site's biography or countdown data.

final result: passed
