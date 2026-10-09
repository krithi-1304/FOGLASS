# FOGLASS

A browser-local fog mirror in progress. Current delivery: M0 scaffold, M1 mirror renderer.

Use Node 22+ and pnpm. Run `pnpm install`, then `pnpm dev`.
`pnpm build` checks TypeScript and bundles; `pnpm lint` checks source.
`pnpm exec playwright install chromium` installs the browser.
Run `pnpm test --reporter=line` for automated checks.

Start requests camera and microphone. Camera access needs localhost or HTTPS.
No media is uploaded. Without permission, a procedural dusk scene remains available.
Fog, breath detection, hand tracking and sound are planned for M2–M5.
See docs/PRD.md, docs/DESIGN.md and docs/TEST_PLAN.md for scope and budgets.
