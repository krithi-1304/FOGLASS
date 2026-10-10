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

## V1 foundation — 2026-10-10
- Preserved user master brief; created current memory, architecture/decisions/feature/test/manual matrices and roadmap.
- Added provider interface, validated recording schema, mock replay, 13 original synthetic fixtures, Vitest and CI.
- Existing renderer retained provisionally; stack clarification asked. No backend/paid service introduced.
- Validation: lint/typecheck/build pass; 2 unit tests and 8 E2E pass; diff whitespace check clean.
- Next: local MediaPipe; stable gestures/calibration; palm/writing integration.

## V1 vision/calibration — 2026-10-10
- Local GPU MediaPipe provider (2 hands) and mock share frame schema; One-Euro, cover mapping and stable gesture engine added.
- Guided palm/range/point/pinch calibration, validated local preferences, cursor and explicit tracking-failure fallback.
- Fixed Vite first-dynamic-import reload by pre-optimizing MediaPipe; retained bundled licenses and fonts.
- Validation: 24 unit tests + 11 E2E pass, local model inference and failure included; build/lint/types green. Physical camera accuracy remains unverified.
- Next: palm/point → fog; undo/redo and gesture conflict journeys; reveal modes.

## V1 physical wiping / writing — 2026-10-10
- Stable gestures drive variable palm capsules/residual streaks and Catmull-Rom fingertip paths; no draw when lost/low-confidence/calibrating.
- Added pause/palette/clear/reset, pinch density adjustment, conventional controls and bounded mask snapshot undo/redo.
- Accelerated regrowth affected UI-driven history tests; explicit test-only clock freeze now isolates mask identity while separate regrowth test remains live.
- Validation: 26 unit + 14 E2E pass (56.8s); lint/types/build and diff checks pass. Physical feel remains manual.
- Next: three V1 modes/reveal; optional microphone/capture; realism and final QA.

## V1 Magic Reveal — 2026-10-10
- Added Real Mirror/Fog Writing/Magic Reveal; message or validated local photo uses same persistent fog mask.
- Entry now condenses automatically; conventional steam strength control, local font/text rendering, original procedural stars.
- Fixed mode accessible label and prevented keyboard shortcuts inside fields; tests check typed C/S cannot clear/download.
- Validation: 27 committed unit tests + 17 E2E pass (35.3s); lint/types/build/diff pass. No backend/off-origin requests.
- Next: optional audio/capture; realism/performance; lab/replay and final visual baselines.
