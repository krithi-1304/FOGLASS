# Current project memory

Read with AGENTS.md and DECISIONS.md; historical entries are in MEMORY.md.

## State

Implemented: local mirrored camera, half-float fog/writing/regrowth, palm gestures,
undo/redo, guided calibration, Magic Reveal, optional calibrated microphone,
photo/video export, pearl/rose minimal UI, wet-edge optics and draining moisture.
MediaPipe 1.1.0 uses a GPU worker with measured CPU fallback; frame scheduling has one in-flight frame.
512² mask, tuned One-Euro, narrower writing brush and stable hand identity are covered.
Added /lab local landmark recording/replay, G development tuning, F statistics,
optional M sound, and capability-checked WebXR glass with index-joint contact.

## Latest input repair

No headset required; unsupported XR control hidden. Four new failing regressions
fixed floor-relative sensitivity/release, projected false pinches via world-space
distance, and spline corner overshoot. See RESEARCH.md input algorithm audit.

Reproduced coloured/low-gain airflow rejection and fixed both; added visible microphone activation, meter, sensitivity and recalibration.
Corrected handedness-score misuse, 3D extension geometry, gesture flicker and forced calibration.
Real hand-photo diagnostic: 199ms GPU results were discarded; CPU fallback measured 32.5ms inference / 37.3ms delivery with 2 accepted hands.
These are controlled tests, not verification of the user's physical microphone/camera.

## Validation

Input algorithm audit: 42 unit tests + 26 Playwright tests pass (browser suite 1.2m).
Lint, TypeScript, production build and diff checks pass.
Six visual baselines reviewed: desktop/mobile invitation and four glass states.
Latest software-GL measurement: 54.6 FPS at 0.74 resolution scale; hand-photo CPU inference sampled at 32.5ms versus ~199ms GPU.
Physical camera/mouth tests remain NOT RUN. Optional headset tests remain NOT RUN.

## Constraints

Preserve vanilla TS/raw WebGL architecture, no paid APIs, backend or uploads.
Original user public/models/MASTER_PROMPT.md remains untouched/untracked.
Five newer Pinterest stills and three Instagram covers inspected; full reels unavailable.
No promise of perfect tracking, real headset passthrough or reconstructed reflection.

## Next 3 actions

1. Open the running preview at http://127.0.0.1:5174/.
2. Run the manual camera/mouth/headset matrix on actual hardware.
3. Tune only against recorded evidence; preserve the green replay/visual suites.
