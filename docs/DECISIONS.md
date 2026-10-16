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

## D010 — Evidence-driven input repair (2026-10-12)

A real hand-image camera test detected two hands but the 180ms age cutoff discarded them all under slow software GPU inference. Separate queue stalls from compute latency and compare CPU after sustained GPU slowness; preserve the faster measured backend. Stop treating handedness certainty as hand presence. Use world joints for extension and 75ms exit hysteresis while the index remains extended; missing hands still release immediately. Breath regressions now cover coloured and low-gain airflow, not just loud white noise. Surface activation and signal feedback before asking users to tune.

## D011 — Floor-relative sensitivity and geometric writing fixes (2026-10-12)

Keep webcam input independent of WebXR; hide unsupported optional headset control.
Use floor-relative onset/release thresholds, world-space normalized pinch, and
bounded stroke interpolation after four failing regressions demonstrated defects.
Retain tested One-Euro parameters rather than blindly increasing smoothing.
Revisit using physical hand/audio recordings; automated inputs do not establish
perfect recognition or the cause of every user's hardware failure.

## D012 — Observation freshness before gesture inference (2026-10-12)

A gesture hold must be supported by continuing observations. Reset gesture dwell
and velocity after >400ms input gaps or non-increasing timestamps. An independent
100ms watchdog releases stale input after 400ms without a result, even if camera
callbacks stop; a 20s warmup / 3s steady-state in-flight timeout terminates hung processing with fallback UI.
Cancel initialization, scheduling and watchdog timers on failure/stop. These
bounds protect continuity; they are not a promised end-to-end latency. Revisit
against real slow-device recordings, retaining the existing CPU/GPU comparison.

## D013 — Full-hand contact and measured rendering work (2026-10-13)

Replace the palm-centroid circle with joint-driven palm pads, five finger chains
and swept joints. Stationary open-hand contact also wipes. Relax palm recognition
to three extended fingers, but retain strict two-hand clear and action dwell.
Use instanced bounded brush regions and GPU undo snapshots; reject the initial
full-pane segment-loop candidate after performance tests. Begin fresh inference
on result arrival without another camera callback, preserving one in-flight frame.
Compare CPU above 45ms GPU latency; bound backend samples. Revisit using physical
writing recordings, not synthetic speed claims. See RESEARCH.md for measurements.

## D-014 — V1 interaction safety (2026-10-14)
Extra gesture commands are opt-in: normal hand transitions must not pause writing. Controls reveal at the bottom edge, touch or keyboard focus. Microphone ownership includes failure cleanup and suspended-context recovery; WebGL loss offers a restart. GitHub Pages serves the static app with local model assets; no backend.

## D-015 — Slow software-GPU recovery (2026-10-14)
Linux CI exposed a 16 FPS ceiling at the old 0.6 quality floor. Adapt composite resolution down to 0.25 using measured frame cost and resample fog to 256² below 0.6. Preserve all current/history textures with GPU blits. Visual review mode retains full resolution; performance assertions stay above 45 FPS. Resize tests compare against actual adaptive pixel size.

## D-016 — Optional mirror letters (2026-10-16)
The expanded PRODUCT_CONCEPT adds bounded text/stroke letters, local collections,
portable links and an optional Worker/D1 service. This extends D-002 for letters
only; the core mirror remains local and independent. Never include camera/audio
or landmarks in letter payloads. Online access uses bearer links, owner deletion
keys and expiry, without an encryption claim. Deploy storage only with an
authenticated Cloudflare account. Editing a saved letter as a copy preserves its
original local identity and separates reply/remote metadata.
