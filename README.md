# FOGLASS

A private, browser-based fog mirror. Blow to bloom condensation, point to write,
or move your palm to wipe. Cleared marks gradually steam over again.

## Run

Node 22+ and pnpm:

```sh
pnpm install
pnpm dev
```

Open the localhost address shown by Vite. Camera, microphone and WebXR require
localhost or HTTPS. All models, WASM and fonts are served locally; no API key,
account, backend or media upload is involved.

## Use

Start enables the front camera and tracking immediately. Optional hand calibration is in Tools.
Point with only your index finger extended to write; move an open palm to wipe.
Hold a fist to pause; two palms clear; two fingers open Tools. Tracking needs a
well-lit, visible hand and cannot guarantee accuracy through occlusion.

The mirror dock contains **Enable breath**. Stay quiet during calibration, then
blow gently towards the microphone. This is an experimental local noise detector,
not speech recognition. A live meter confirms the microphone is receiving input. Tools contains sensitivity and quiet-room recalibration. Disable it anytime. A laptop mic may respond to fans or
speech, and hardware testing is still required.

**Try without camera** supports mouse/touch drawing. Hold **B** to add steam,
**C** to clear, **S** to save PNG, **H** to toggle hints, **Space** to pause, **M** to toggle optional synthesized sound (off by default).
Undo/redo use Ctrl/Cmd+Z and Shift+Ctrl/Cmd+Z. Tools also contains Real Mirror,
Fog Writing, Magic Reveal, local photo/message reveal and ten-second video export.

## VR

Tools enables **Enter VR** only when the browser reports immersive VR support.
The session requires headset hand tracking. A glass panel is anchored in front
of your initial head position; touch it with your index fingertip to write.
The bottom strip offers steam, clear and exit. Headset system controls can also exit.
This is an experimental WebXR path, not a claim that a webcam supplies VR poses.
It displays the existing mirror/reveal texture; it does not provide headset
passthrough or a reconstructed reflection. Physical headset validation is pending.

## Tune and diagnose

Press **G** in development for the tuning panel (enable breath first for mic sliders).
Press **F** for render statistics. `/lab` displays tracking metrics and records
landmark JSON locally. Upload a recording there to replay it through the same
recognizer and fog engine; video is never included in a gesture recording.

Core tuning lives in `src/filters.ts`, `src/gestures.ts`, `src/breath.ts`, and
`src/shaders/`. Hand inference runs in a worker with one frame in flight. Slow GPU inference triggers a measured CPU comparison; stale queued results are dropped. Resolution adapts while the 512² fog state is preserved.

## Verify

```sh
pnpm exec playwright install chromium
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test --reporter=line
pnpm build
```

Playwright uses fake media and deterministic landmark fixtures. `?test=1` exposes
`window.__foglass` for breath/finger injection, mask sampling, replay and metrics.
`?seed=7` freezes visual noise; `?speed=4` accelerates fog time. Tests also cover
real local model initialization, microphone analyser input, denied devices,
export, visual baselines and software-GL performance. Inspect screenshots before
intentionally updating them with `--update-snapshots`.

Research, limitations and manual hardware checks live in `docs/RESEARCH.md`,
`docs/KNOWN_ISSUES.md`, and `docs/MANUAL_CAMERA_TESTS.md`. Automated passing tests
are not proof of physical hand accuracy, real-mouth onset or headset compatibility.
