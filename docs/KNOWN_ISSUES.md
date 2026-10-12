# Known issues

- Real hand accuracy, camera-to-trail latency, skin tones, occlusion and lighting still need the manual matrix. Synthetic tests cannot establish “100% better” tracking.
- The breath trigger is experimental; real exhale onset and speech/fan rejection are not physically verified.
- Actual WebXR headset testing is pending. The headset must support immersive VR and hand tracking; passthrough and 3D reconstructed reflections are not implemented.
- Five newer Pinterest stills and three Instagram covers were inspected. Full Instagram reels were not accessible; no claim of measuring their tracking performance.
- Devices without WebGL2 plus floating-point render targets receive an explanatory error; a Canvas2D renderer is not implemented.
- Condensation and water drainage are artistic approximations, not a thermodynamic simulation.
- Original user-supplied public/models/MASTER_PROMPT.md is preserved; MASTER_BUILD_PROMPT.md is its documentation copy.

- 2026-10-12: real-hand-photo inference now tested through a canvas camera stream. This validates the model/input path but not live occlusion or physical mouth accuracy.
