# Current project memory

Read with AGENTS.md and DECISIONS.md; historical entries are in MEMORY.md.

## State

Implemented: local mirrored camera, half-float fog/writing/regrowth, palm gestures,
undo/redo, guided calibration, Magic Reveal, optional calibrated microphone,
photo/video export, pearl/rose minimal UI, wet-edge optics and draining moisture.
MediaPipe 1.1.0 GPU now runs in a worker; frame scheduling has one in-flight frame.
512² mask, tuned One-Euro, narrower writing brush and stable hand identity are covered.
Added /lab local landmark recording/replay, G development tuning, F statistics,
optional M sound, and capability-checked WebXR glass with index-joint contact.

## Validation

Final: 33 unit tests + 25 Playwright tests pass (browser suite 1.1m).
Lint, TypeScript, production build and diff checks pass.
Six visual baselines reviewed: desktop/mobile invitation and four glass states.
Final software-GL measurement: 53.1 FPS at 0.60 resolution scale; previous runs 54.8–55 FPS at 0.69.
Physical camera/mouth and headset tests remain NOT RUN.

## Constraints

Preserve vanilla TS/raw WebGL architecture, no paid APIs, backend or uploads.
Original user public/models/MASTER_PROMPT.md remains untouched/untracked.
Five newer Pinterest stills and three Instagram covers inspected; full reels unavailable.
No promise of perfect tracking, real headset passthrough or reconstructed reflection.

## Next 3 actions

1. Open the running preview at http://127.0.0.1:5174/.
2. Run the manual camera/mouth/headset matrix on actual hardware.
3. Tune only against recorded evidence; preserve the green replay/visual suites.
