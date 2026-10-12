# Architecture

Existing implementation: Vite + strict TypeScript + vanilla DOM, raw WebGL2.
Retain until stack clarification: migrating working code would be a major departure.
No heavy engine, backend, account, remote runtime model/CDN, or paid inference.

## Boundaries

- camera.ts: permission requests, streams, video lifecycle; UI never invokes MediaPipe.
- hand.ts / tracking/: interchangeable HandTrackingProvider, MediaPipe and Mock implementations.
- gestures.ts: pure landmark features, confidence, dwell, hysteresis and priority.
- calibration.ts: guided samples, normalized scale/range/pinch/jitter preferences.
- filters.ts: One-Euro filtering, dead zones, spline interpolation.
- fogSim.ts: persistent half-float fog/reservoir masks; brush commands, history.
- renderer.ts + shaders: camera compositing, glass, droplets, reveal, render metrics.
- interaction.ts: gesture actions and application state, independent of provider.
- ui.ts/main.ts: orchestration and minimal UI; conventional controls for gestures.
- capture.ts: local PNG/optional recording; user-triggered downloads only.
- preferences.ts: versioned, validated, non-sensitive localStorage.
- lab.ts: explicit opt-in landmark recording and deterministic JSON replay.

## Data flow

camera → provider → landmark frame → features → stable gesture → action → fog mask.
Render loop samples fog, camera and optional local reveal. CV has separate cadence.
Mock frames pass through exactly the same recognizer and interaction state machine.

## Privacy

No frames, audio or landmarks transmitted. Recording exports landmarks only on request.
On exit stop tracks/inference/audio/timers; revoke object URLs and release GL resources.

## Quality

Unit logic tests + landmark fixture regressions + Playwright journeys + seeded snapshots.
Physical accuracy is recorded separately in MANUAL_CAMERA_TESTS.md.

## Implemented runtime refinements

MediaPipe 1.1.0 runs inside tracking/hand.worker.ts with matching module WASM.
The provider schedules decoded video frames, transfers one ImageBitmap at a time,
and distinguishes inference cost from delivery stalls (400 ms absolute / 150 ms queue bound). Slow GPU processing triggers a bounded CPU comparison. Gesture state remains on the UI thread.
The 512² RGBA16F mask stores fog, moisture reservoir and advected stroke water.
Resolution adapts independently; undo keeps eight bounded mask snapshots.
XRGlass uses a separate compatible GL context for stereo presentation and transfers
the composed glass texture. A headset index joint touches a fixed plane with depth
hysteresis; headset frames drive the renderer while its normal RAF is suspended.
Lab and debug tools consume existing controllers, rather than duplicating vision.
