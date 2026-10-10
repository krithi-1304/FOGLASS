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
