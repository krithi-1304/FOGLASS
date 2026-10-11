# Real fog glass and precise air writing
Research date: 2026-10-10. This is an engineering recommendation, not a claim of
perfect tracking or a measured physical-camera accuracy improvement.

## Reference inspection: what was actually visible
Public page metadata and image URLs were accessible by direct HTTP even when the
browsing tool failed. These reference images were downloaded temporarily and viewed;
none is bundled as an app asset.

| Reference | Observed quality |
|---|---|
| [442267625931671994](https://www.pinterest.com/pin/442267625931671994/) | Warm bathroom light, translucent grey fog, irregular dark wet handprint, tiny beads and long drips. |
| [802766702349608873](https://www.pinterest.com/pin/802766702349608873/) | Nonuniform fog, different wet handprints, surviving streaks; not uniform digital erasure. |
| [398568635786919997](https://www.pinterest.com/pin/398568635786919997/) | Textured/frosted glass and a hand behind it; this is not identical to removable condensation. |
| [1053490537808449907](https://www.pinterest.com/pin/1053490537808449907/) | Narrow smooth finger-cleared curve; surrounding reflection blurred; cleared curve has a wet edge. |
| [991214199229074027](https://www.pinterest.com/pin/991214199229074027/) | Thin connected heart strokes, crisp local reflection, bright light blooming in fog. |

Instagram public cover images/captions were inspected, but full video playback was
not available. Therefore no FPS, lag or accuracy claim is inferred from those reels:
[DaILsRlgirJ](https://www.instagram.com/reel/DaILsRlgirJ/),
[DaFyq0Vg9U9](https://www.instagram.com/reel/DaFyq0Vg9U9/),
[Dd6aPpIxjWM](https://www.instagram.com/reel/Dd6aPpIxjWM/).
The covers show a nearly full-screen reflection, a small amount of UI and visible
air-written strokes. Their visual simplicity, rather than their unmeasured tracking
performance, is the relevant interface reference.

## What real exhalation does to a cold mirror
Warm humid breath raises the water-vapor supply near cooler glass. When conditions
permit condensation, liquid forms on the surface. Water vapor itself is invisible;
the visible fog comes from condensed droplets. Surface temperature, room humidity
and surface properties affect the result. A microphone cannot measure these.
[NOAA condensation demonstration](https://www.noaa.gov/education/multimedia/video/cooking-up-storm-atmospheric-science-in-your-kitchen)

Tiny droplets scatter light, reducing image contrast and creating a milky appearance.
Surface wetting changes whether water forms droplets or a smoother film. Research
on breath-condensed patterned glass demonstrates the optical distinction between
scattering droplets and water-film regions. Wiping should therefore reveal a clearer
but still wet reflection, rather than paint an opaque dark line.
[Breathing-induced condensation study](https://www.nature.com/articles/srep06300)

Droplets grow and merge; surface adhesion competes with gravity. A study of engineered
nanocones illustrates that tiny drops need not fall under gravity alone. Its exact
microscopic constants should NOT be transplanted into ordinary bathroom glass.
For this app, small beads stay pinned and only accumulated larger drops slide.
[Nature Communications study](https://www.nature.com/articles/s41467-021-23708-6)

## Required visual qualities and implementation
These are design/engineering approximations, not a fluid-dynamics solver.
1. **Local breath bloom:** a soft center plume expands while breath is sustained.
2. **Uneven deposition:** low-frequency density variation plus fine droplet texture.
3. **Real reflection retained:** fog lowers contrast and increases blur; no flat white sheet.
4. **Sharp writing:** narrow connected transparent trails with subpixel-feathered edges.
5. **Residual water:** thin film, broken wet rims and refracted highlights in cleared paths.
6. **Palm distinct from finger:** broad motion-dependent streaks versus narrow writing.
7. **Stationary beads:** many tiny irregular highlights, fewer large mobile drops.
8. **Drip history:** moving drops clear narrow descending paths and leave moisture.
9. **Gradual return:** local wiped areas regrow over roughly 8–15 seconds.
10. **Lighting response:** highlights bloom through fog; trails reveal sharper light.
11. **Restrained motion:** seeded slow evolution, not glitter or particles over the face.
12. **Personal reflection:** camera cover mapping, mirroring and fingertip mapping must agree.

## Tracking method comparison
| Method | Strength | Constraint here | Decision |
|---|---|---|---|
| MediaPipe Tasks HandLandmarker | Official browser API, local GPU/WASM, temporal ROI reuse | Monocular ambiguity, occlusion, no per-joint certainty exposed | Retain, improve entire input pipeline |
| WiLoR (CVPR 2025; repo fast mode updated March 2026) | Strong 3D hand localization/reconstruction | Official path uses PyTorch/CUDA and separately licensed MANO data | Not a drop-in browser writing upgrade |
| Headset WebXR articulated hands | Device-native 3D joint positions in XR space | Requires compatible physical headset/browser and different scene/camera permissions | Separate provider if actual headset VR is wanted |
| Optical-flow-only fingertip tracker | Can interpolate local image motion | Drifts, loses finger identity and fails on occlusion | Not primary; reconsider only after measured need |

MediaPipe's official guide describes internal hand-presence/tracking thresholds and
warns that synchronous detection blocks the UI thread. Google's 2026 sample includes
a hand-landmarker worker. This supports testing worker inference without changing
the model or uploading camera data.
[Official browser guide](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js),
[Official worker example](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/workers/hand-landmarker.worker.ts)

WiLoR reports strong reconstruction results, but its official installation uses
PyTorch/CUDA and requires separately obtained MANO assets. This is not evidence that
it improves this browser's fingertip-to-pixel latency or handwriting.
[CVPR paper](https://openaccess.thecvf.com/content/CVPR2025/html/Potamias_WiLoR_End-to-end_3D_Hand_Localization_and_Reconstruction_in-the-wild_CVPR_2025_paper.html),
[Official implementation](https://github.com/rolpotamias/WiLoR)

A June 2026 preprint compares MediaPipe, WiLoR, HaMeR, WildHands and HoloLens tracking
under impairments/occlusions. It is relevant to evaluation coverage, not a guarantee
that one model is universally best for all people, hands and environments.
[Study/preprint](https://arxiv.org/abs/2606.17427)

## Concrete precision defects in the current implementation
- The fog mask was 192×192: at 1280px width, one horizontal texel spans ~6.7px.
  Fine lines need a higher-resolution mask, not merely smoother landmarks.
- One-Euro beta=0.12 with normalized coordinates barely raises cutoff during motion.
  The tuning must match the data units. Increase speed response and compare lag/jitter.
- Filtering changed from palm center to fingertip only after dwell. That can create a
  curved start from the palm. Prewarm/reset the correct coordinate stream on raw gesture.
- Choosing hand array index 0 risks swapping hands when provider ordering changes.
  Keep primary identity with handedness/proximity and lift on discontinuity.
- Current loop can block rendering during synchronous inference. Move inference into a
  worker when supported and allow at most one frame in flight (no stale-frame queue).
- Schedule inference from new video frames, not repeated timer polling of old images.
- Distinguish inference timing from end-to-end physical camera latency.
- Handedness category score is NOT per-joint tracking confidence. Use internal
  thresholds, geometry sanity and temporal continuity; document the limitation.

## Filtering, interpolation and stroke policy
The One-Euro authors recommend tuning stationary jitter first, then increasing beta
to reduce motion lag; beta depends on measurement units. Our tuning is based on
normalized coordinates and a deterministic ramp/noise benchmark, then requires
physical-hand confirmation.
[Author's tuning instructions](https://gery.casiez.net/1euro/)

Use low stationary jitter, stronger speed response, a subpixel dead zone, stable
hand identity, and bounded interpolation. Catmull-Rom should connect real observed
points; never bridge missing tracking or a discontinuous jump. Avoid aggressive
prediction during writing: overshoot at heart corners is worse than small delay.
Use a thin default brush and a higher-resolution persistent mask. Keep handwriting
stabilization optional/tunable rather than snapping every mark to a recognized shape.

Video-frame callbacks identify newly presented frames and expose display timing;
they are a scheduling aid, not proof of camera-to-photon latency.
[Browser API documentation](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback)

## Breath trigger design
Microphone stays off until explicitly enabled. Calibrate room noise, then use weighted
spectral noise energy, a sustained onset and release hysteresis. Reject tonal hum and
single-frame impulses. A detected burst feeds the visual moisture source; duration
and strength determine growth. This remains an experimental local audio trigger:
speech, wind or fans can confuse it. B/Add steam remain alternatives.

## VR clarification
A webcam virtual mirror is an interactive screen experience, not headset VR.
Actual WebXR requires an XR session and the hand-tracking feature on supported
hardware. Its joint poses are 3D and should be projected onto a mirror plane, with
distance-to-plane gating for contact. Headset passthrough should not be assumed
available to ordinary webcam APIs. User's intended device is currently unresolved.
[W3C hand-input specification](https://www.w3.org/TR/webxr-hand-input-1/)

## Minimal feminine direction
Warm pearl and dusty rose, soft serif lettering, one short invitation and one Start
button. A small camera-free link and one privacy sentence are enough. Once inside,
the reflection dominates; only a small steam action and Tools need to remain visible.
Modes, calibration, microphone and recording live in the secondary tools panel.
No giant title repeated in the header, no technical status dashboard, no skeleton.

## Evaluation gates
- Synthetic stationary jitter: RMS and peak-to-peak pixels at a fixed viewport.
- Synthetic moving line: lag/error vs previous settings; label it synthetic.
- No unwanted connector across hand loss, identity switch or discontinuity.
- Gesture-to-mask tests: lines/hearts, palm sweeps, undo/redo, low confidence, pause.
- Real local model loads and produces frames without external requests.
- Real hand: bright/dim light, both hands, skin tones, occlusion, fast/slow writing.
- Measure render/inference FPS and latency separately; report hardware and method.
- Never translate a visual reel, a unit-test pass or a model's benchmark into
  “100% accurate” or “100% better” tracking for this app.

## Version check
The npm registry was queried directly on 2026-10-10:
latest = 1.1.0; nightly = 1.1.1-rc.20261010.
Installed baseline was 0.10.35. Evaluate stable 1.1.0 with the local model and bundled
matching WASM; do not use the nightly or claim improvement from version number alone.
