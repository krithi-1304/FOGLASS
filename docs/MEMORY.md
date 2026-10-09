# Project memory (append-only)

## Initial brief — 2026-10-09

- Empty workspace; current scope is M0 and M1, with later milestones documented.
- Use local Vite development; no hosting requested for this partial milestone.
- Browser-only media, raw WebGL2; fallback is a procedural dusk room.
- Status: docs created before source; reference inspection pending.
- Next: scaffold; verify smoke; implement camera/composite.

## M0 — 2026-10-09
- Created required docs, vanilla Vite/TS, lint/format and Chromium configuration; dependencies installed together.
- Network/server/Git required sandbox approval; esbuild build script explicitly allowed; favicon fixed.
- Pinterest blocked all six reference URLs; use supplied visual brief. Self-host fonts via npm assets.
- Validation: build and lint pass; Playwright smoke 1/1 passes. M0 complete.
- Next: WebGL composite; camera lifecycle/fallback; renderer tests and M1 commit.

## M1 — 2026-10-09
- Raw WebGL2 composite mirrors/crops camera, softens samples, adds grain/vignette; procedural dusk fallback and local fonts.
- Start requests devices; denied camera keeps fallback, mic track released until M3; pointer/touch cursor and DPR≤1.5 resize work.
- Validation: build/lint pass; 5/5 Playwright tests pass (4.3s). Fake-media startup transiently stalled; explicit grants and 15s startup allowance retained.
- Test-only state/FPS/pixel API; fog APIs, CV/model, mask, audio, adaptive quality and physical latency validation remain pending. No screenshots viewed at M1.
- Next: M2 float ping-pong mask; breath-key/wipe/regrowth API and tests; first screenshot review.

## M2 / reported failure — 2026-10-09
- User reports app not working: M1 had no fog/drawing, and allSettled gated camera on pending mic permission.
- Added half-float ping-pong fog with reservoir/regrowth, continuous segment wipes, B/C/S, test injection and local samples.
- Start now enters fallback immediately; camera request independent with 12s permission timeout, late tracks stopped; camera-free entry added.
- Build/lint and 8/8 Playwright tests pass; reviewed none/light/heavy/stroke captures. First none capture caught entry transition; capture wait corrected.
- Next: actual microphone breath detection; local MediaPipe hand tracking; live interaction validation.
