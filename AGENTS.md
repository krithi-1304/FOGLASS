# FOGLASS working rules

- Read this file and the tail of docs/MEMORY.md at session start.
- Build an aesthetic, analog fog mirror with local webcam and microphone processing.
- Stack: Vite, TypeScript, vanilla, pnpm; raw WebGL2, ping-pong float fog masks.
- CV: MediaPipe HandLandmarker GPU VIDEO, one hand; self-host model and WASM.
- Audio: analyser noise energy, adaptive floor, threshold and hysteresis; no speech recognition.
- Smooth landmark 8 with One-Euro; continuous Catmull-Rom strokes.
- Point draws, palm hovers; optional pinch thickens brush.
- Breath ramps fog in 1.5s; onset <500ms; cleared trails regrow in 8–15s.
- Heavy strokes spawn wobbling drips with thin trails.
- Composite camera blur, refraction, droplets, grain, vignette and warm bloom.
- Self-host Instrument Serif or Fraunces and Inter. Tiny, quiet UI.
- Start requests camera/mic; denied devices retain mouse/touch and B fallback.
- C clears, S saves PNG, H toggles hints, M toggles sound (off initially).
- Cap DPR at 1.5; adaptive resolution above 20ms; CV 30Hz, render 60Hz.
- Preserve fog across resize/orientation. Target finger latency <80ms.
- Test API only with ?test=1; deterministic ?seed and time-scaled ?speed.
- Playwright Chromium fake media; API permitted instead of test video.
- Tests cover boot, breath, local wipe, regrowth, controls, fallback, fps, visuals.
- Run tests with --reporter=line; print only failing test output on failure.
- lil-gui g toggle development only; stats.js f toggle.
- Milestones M0 scaffold, M1 render, M2 fog, M3 audio, M4 hands,
  M5 realism, M6 polish, M7 final QA. Current authorization: M0 and M1.
- Stop at each milestone to test, append memory, and commit a short message.
- Memory entries max 5 lines: decisions, gotchas, status, next 3 tasks.
- Plan under 15 lines; status 1–3 lines; no large logs or unnecessary rereads.
- Batch independent commands and install dependencies together.
- Screenshots viewed only at M2 and M7; M7 none/light/heavy/mid-stroke.
- Maximum three visual iterations. Do not delegate without explicit request.
