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

## V1 optional breath — 2026-10-10

- Explicit opt-in local microphone, 800ms room calibration, weighted spectral-noise detector, adaptive floor and hysteresis; clean disable/exit.
- Synthetic live Web Audio noise triggers actual fog; denied mic retains B/Add steam. This is an experimental audio cue, not breath recognition.
- Validation: 29 committed unit tests + 19 E2E pass (46.2s), build/lint/types clean. Real-mouth onset and false triggers remain manual.
- Latest user steering: detailed current tracking/condensation research, five new pins/three reels, minimal cute feminine UI, VR clarification asked.
- Next: reference/research report; precision upgrades; realism/UI and remaining capture/lab QA.

## Reference / research findings — 2026-10-10

- Viewed five new Pinterest images via public metadata and all three Instagram covers; full reels unavailable, no inferred tracking-speed claim.
- Added detailed primary-source research: condensation/wetting, One-Euro tuning, browser scheduling, WiLoR tradeoffs and WebXR hardware distinction.
- Identified coarse 192² mask, poorly scaled beta, palm-to-finger filter transition and hand-order risks; registry stable MediaPipe is 1.1.0.
- Current app baseline remains 29 committed unit + 19 E2E green; VR/headset meaning not answered, no hardware claim.
- Next: stable-version validation and precision benchmark; glass physics/minimal feminine UI; remaining capture/lab/QA.

## Precision milestone — 2026-10-11

- Upgraded MediaPipe 1.1.0 plus matching local WASM; increased mask to 512², narrower index brush, eight undo snapshots.
- Tuned normalized One-Euro response, reset palm/tip transitions, preserved hand identity across output reordering.
- Validation: 32 unit tests (one pending capture test), 19 E2E pass in 1.1m; build and lint pass; physical tracking accuracy not measured.
- Next: worker inference; minimal blush UI and wet-glass realism; capture/lab/final QA.

## Worker inference milestone — 2026-10-11

- GPU hand inference now runs in a module worker with transferred ImageBitmap frames and one in-flight frame.
- New-video-frame scheduling avoids duplicate inference; observations older than 180ms release the pen; delivery latency is exposed.
- Validation: production build/lint pass; all three model/mock/failure browser checks pass (10.9s), local assets only.
- Next: simplify landing page; wet-glass rendering and capture; full regression/performance/visual QA.

## Minimal interface / capture milestone — 2026-10-11

- Pearl/rose landing reduces copy and hierarchy; session dock has only Steam/Tools; secondary actions remain accessible inside Tools.
- Added local photo button and bounded 10-second MediaRecorder export with teardown; S remains the PNG shortcut.
- Validation: 32 unit + 20 browser tests, lint and production build pass; visual review reserved for final four-state batch.
- Next: condensation/refraction/drainage; adaptive performance and diagnostics; final visual QA.

## Wet-glass rendering milestone — 2026-10-11

- Fog now blooms centre-outward, retains uneven optical transmission, refracts wipe edges and carries procedural microbeads plus draining stroke water.
- Renderer skips duplicate camera uploads and scales resolution after sustained >20ms frame times; fog state remains fixed-resolution across resize.
- Validation: 20 browser regressions pass (49.6s), lint/build pass. Visual review and measured performance remain final QA tasks.
- Next: diagnostics/replay; actual WebXR entry with device capability checks; final visual and performance QA.

## Headset / diagnostics milestone — 2026-10-11

- Added capability-checked WebXR stereo glass and index-joint contact; no passthrough/reflection claim, physical headset validation pending.
- Added /lab landmark-only record/export/replay, development G tuning, F statistics and optional synthesized sound/M mute.
- Contact mapping unit tests and lab/export/sound/drainage browser checks pass; narrowed writing visual reviewed on desktop and mobile.
- Next: finish fixed-baseline full regression; record final metrics and commit; leave local preview running.

## Final QA / performance report — 2026-10-11

- All 33 unit and 25 Playwright tests pass (1.1m); lint, TypeScript, production build and diff checks pass.
- Reviewed six snapshots: desktop/mobile invitation, no/light/heavy fog and thin heart writing; fixed-baseline comparison passes.
- Software GL: initial 41.2 FPS failure corrected; final 53.1 FPS at 0.60 resolution scale (earlier reruns 54.8–55 at 0.69); no native-resolution/hardware latency claim.
- Physical hand, real-mouth and headset tests remain NOT RUN; public user master prompt preserved; local preview http://127.0.0.1:5174/.
- Next: physical camera/mouth matrix; headset contact/comfort matrix; tune recorded regressions if hardware evidence warrants.

## Input failure repair — 2026-10-12

- Reproduced coloured/low-gain breath rejection; corrected spectral gate and floor, exposed microphone activation, live signal, sensitivity and recalibration.
- Reproduced real hand-photo failure: 2 detections discarded by 180ms cutoff; separated compute/queue delay and added bounded GPU/CPU comparison (sample ~199ms GPU → 32.5ms CPU, 37.3ms delivery).
- Corrected handedness confidence misuse, used world-joint geometry, added short writing hysteresis, capped dead zone and removed forced calibration.
- Validation: 38 unit + 26 browser tests pass (1.2m), lint/build clean; reviewed visible microphone dock/mobile UI. Physical mouth/hand and headset remain unverified.
- Fixed snapshot comparison passes (2 tests, 12s); render throughput 54.0 FPS at 0.79 scale. Next: physical microphone check; live hand recording; headset check.

## Input algorithm audit — 2026-10-12
- Four regressions reproduced sensitivity self-trigger/stuck release, false projected pinch and stroke corner overshoot; all corrected.
- Webcam/microphone need no headset; unsupported optional XR control is hidden. Research with primary sources appended to RESEARCH.md.
- Validation: 42 unit + 26 browser tests pass (1.2m), lint/build/diff checks and unchanged visual baselines pass. Physical input remains unverified.
- Next: verify selected physical microphone; record a live writing sequence locally; tune against that recording rather than assumed hardware behavior.

## Tracking lifecycle refinement — 2026-10-13
- Reproduced frozen hand, gesture hold across a gap, and leaked initialization timer; added freshness watchdog, dwell reset and cleanup.
- Browser regressions rejected the first 3s cold-start timeout; use 20s during first eight results, 3s afterward, independently release stale input.
- Validation: 47 unit + 26 browser tests pass (1.2m); lint/build/diff and existing visual comparisons pass. Physical hand/mic remain unverified.
- Next: record physical writing; compare precision on that replay; verify selected microphone with live breath.

## Full-hand and latency milestone — 2026-10-13
- Full-hand contact now includes five fingers; relaxed palm recognition and faster point onset, with crop-consistent joint filtering.
- Replaced per-point simulation/readback with bounded instanced brush regions and GPU history; 24-point test: 28 calls/1 read → 5 calls/0 reads.
- Validation: 50 unit + 30 browser tests pass (1.4m), lint/build clean; 54.8 FPS active hand, 50.9 FPS idle. Reviewed four fog states and handprint.
- Next: repeat-use soak and accidental command prevention; auto-hiding aesthetic controls; GitHub Pages V1 release requested by user.
