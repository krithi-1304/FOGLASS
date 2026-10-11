# Decisions

## D-001 — 2026-10-10 — Preserve tested renderer while clarifying stack

Reason: existing WebGL2 fog/mirror passes 8 tests; new brief forbids unnecessary rewrites.
Alternatives: React/Canvas replacement requested as new baseline; clarification pending.
Consequences: provider/gesture/test work is independent of UI and rendering framework.
Revisit: user's stack choice or measured rendering failure.

## D-002 — 2026-10-10 — No backend for V1

Reason: all required camera, fog, gestures, local capture and reveal work client-side.
Alternatives: Cloudflare Worker/D1; unnecessary for current persistence needs.
Consequences: no credentials, usage charges, accounts, network dependency or uploads.
Revisit: explicit shared-message/preset service request after standalone quality is proven.

## D-003 — 2026-10-10 — Provider boundary and recorded landmarks

Reason: real webcam inference is nondeterministic; recognizer regression must be reproducible.
Alternatives: mock gesture labels (bypasses logic), fake camera alone (no meaningful hands).
Consequences: both providers deliver validated timestamped landmark frames.
Revisit: provider schema extension; preserve recording schema version.

## D-004 — 2026-10-10 — New gesture language supersedes initial hover behavior

Reason: latest brief explicitly requires moving open palm to wipe, two palms to clear.
Alternatives: initial one-hand point-only system.
Consequences: two-hand inference, stable gesture priority, dwell/cooldown, no single-frame actions.
Revisit: real-camera usability findings.

## D-005 — 2026-10-10 — License and asset provenance

Installed Vite: MIT; TypeScript/Playwright/MediaPipe: Apache-2.0. Fonts: OFL.
Use bundled official model/WASM and original procedural imagery/text, no external paid API.
Retain third-party notices. No claims about free hosting quotas needed: deployment excluded.
Revisit: any new dependency or externally sourced visual asset.

## D-006 — 2026-10-10 — Research-led precision improvements, not a heavy model swap

Reason: current defects include low mask resolution, normalized-unit filter tuning,
hand identity and blocking inference; a new reconstruction model does not fix these.
Alternatives: WiLoR/MANO stack (Python/CUDA/assets), optical flow, native headset tracking.
Consequences: retain browser-local MediaPipe, benchmark filters, improve mask/identity,
test worker execution and new-frame scheduling. WebXR is a separate device-specific path.
Revisit: measured recordings demonstrate a model limitation after pipeline fixes.
Evidence: docs/RESEARCH.md. No guarantee of perfect physical tracking.

## D-007 — 2026-10-10 — Simpler pearl/rose interface

Reason: user explicitly requests minimal, cute, feminine styling and fewer visible options.
Alternatives: prior cool editorial hero and permanently visible multi-action dock.
Consequences: one primary start action, small fallback/privacy, secondary tool panel;
glass stays visually realistic. Preserve all existing functional controls/tests.
Revisit: reviewed desktop/mobile captures and user feedback.

## D008 — Worker inference and genuine headset input (2026-10-11)

Use MediaPipe 1.1.0 GPU in a module worker, one transferred frame in flight; discard stale observations. Keep webcam and headset input separate. WebXR explicitly requests immersive-vr with hand-tracking and uses physical index joint contact against a fixed virtual glass plane. No server inference, webcam-as-VR claim, headset passthrough or unverified precision guarantee. Revisit contact tolerances after physical headset testing.

## D009 — Adaptive software rendering (2026-10-11)

The initial software GL benchmark measured 41.2 FPS. Quality now reacts after one sustained second and reduces pixel resolution multiplicatively, while the 512² fog mask is unchanged. The subsequent measurement was 54.8 FPS at 0.69 quality; this does not establish native 1280×720/60 FPS on real hardware. Deterministic visual fixtures lock output resolution explicitly in test mode.
