# Real fog glass and precise air writing

Research date: 2026-10-10. This is an engineering recommendation, not a claim of
perfect tracking or a measured physical-camera accuracy improvement.

## Reference inspection: what was actually visible

Public page metadata and image URLs were accessible by direct HTTP even when the
browsing tool failed. These reference images were downloaded temporarily and viewed;
none is bundled as an app asset.

| Reference                                                                 | Observed quality                                                                                    |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [442267625931671994](https://www.pinterest.com/pin/442267625931671994/)   | Warm bathroom light, translucent grey fog, irregular dark wet handprint, tiny beads and long drips. |
| [802766702349608873](https://www.pinterest.com/pin/802766702349608873/)   | Nonuniform fog, different wet handprints, surviving streaks; not uniform digital erasure.           |
| [398568635786919997](https://www.pinterest.com/pin/398568635786919997/)   | Textured/frosted glass and a hand behind it; this is not identical to removable condensation.       |
| [1053490537808449907](https://www.pinterest.com/pin/1053490537808449907/) | Narrow smooth finger-cleared curve; surrounding reflection blurred; cleared curve has a wet edge.   |
| [991214199229074027](https://www.pinterest.com/pin/991214199229074027/)   | Thin connected heart strokes, crisp local reflection, bright light blooming in fog.                 |

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

| Method                                               | Strength                                                 | Constraint here                                                                     | Decision                                         |
| ---------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------ |
| MediaPipe Tasks HandLandmarker                       | Official browser API, local GPU/WASM, temporal ROI reuse | Monocular ambiguity, occlusion, no per-joint certainty exposed                      | Retain, improve entire input pipeline            |
| WiLoR (CVPR 2025; repo fast mode updated March 2026) | Strong 3D hand localization/reconstruction               | Official path uses PyTorch/CUDA and separately licensed MANO data                   | Not a drop-in browser writing upgrade            |
| Headset WebXR articulated hands                      | Device-native 3D joint positions in XR space             | Requires compatible physical headset/browser and different scene/camera permissions | Separate provider if actual headset VR is wanted |
| Optical-flow-only fingertip tracker                  | Can interpolate local image motion                       | Drifts, loses finger identity and fails on occlusion                                | Not primary; reconsider only after measured need |

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

## Precision implementation — 2026-10-11

The stable 1.1.0 package now uses its matching self-hosted WASM files.
Normalized-coordinate One-Euro parameters are 2.4 Hz minimum cutoff and beta 18.
A deterministic 30 Hz ramp regression requires less than half the old filter's
accumulated lag; a stationary sinusoidal-jitter regression requires less than
40% of input noise energy. These are synthetic filter tests, not measured human
writing accuracy or camera-to-screen latency.
The fog mask is now 512² (previously 192²), with eight bounded undo snapshots.
The index brush radius is halved. Filtering follows the raw fingertip during
gesture dwell and resets when switching between palm and fingertip coordinates.
Primary hand selection preserves proximity/handedness when detection order changes.

## Browser VR implementation and limits

The optional WebXR path now requests `immersive-vr` with the `hand-tracking`
feature, renders a fixed stereo glass plane, and maps `index-finger-tip` poses
into it. Entry/exit depth hysteresis avoids rapid contact toggling. This follows
the [W3C Hand Input specification](https://www.w3.org/TR/webxr-hand-input-1/).
The existing webcam/reveal texture is displayed; no headset passthrough or
3D reconstructed self-reflection is claimed. Contact projection is unit tested;
physical headset placement, latency and comfort still require manual verification.

## Input failure audit — 2026-10-12

Confirmed defects: hidden microphone activation; mandatory calibration before writing;
handedness probability misused as hand presence confidence; brittle 2D extension tests;
140ms reacquisition after brief gesture flicker; rejection of coloured airflow spectra.
A new low-frequency synthetic spectrum reproduced the breath rejection before repair.
Browser testing now sends low-pass noise through the actual Web Audio analyser.
These tests do not identify the user's microphone waveform or prove live-mouth accuracy.

Real-glass qualities to preserve:

- Local condensation begins where warm humid air meets cooler glass.
- Microscopic droplets scatter light; density and blur vary over the surface.
- Droplets grow and coalesce; accumulated water drains with gravity.
- Wiping redistributes moisture, leaving a clearer centre and a wet edge.
- Duration and airflow affect deposition; evaporation clears the glass gradually.
  These are qualitative targets, not measured temperature/humidity simulation.
  Sources: [condensation observations](https://www.nature.com/articles/srep06300),
  [droplet growth research](https://www.nature.com/articles/s41467-022-32873-1).

[Google's API guide](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js)
distinguishes handedness from presence/tracking thresholds and provides 3D world joints.
We now use those joints for finger extension and retain image coordinates for screen mapping.
Stable package remains 1.1.0; nightly is not an accuracy guarantee. Full Instagram reels
remain inaccessible; previous covers cannot establish their latency or accuracy.

The real-hand-photo diagnostic found a further confirmed failure: 2 hands were
returned by the model, but ~199 ms GPU inference exceeded the fixed 180 ms
cutoff, so the application accepted zero hands. The worker now compares CPU
when sustained GPU inference exceeds 90 ms; it keeps the faster measured path.
Queue/suspension delays are separated from inference cost, with an absolute
400 ms safety bound. In the same diagnostic, CPU reported 32.5 ms inference,
37.3 ms delivery and 2 accepted hands. These are individual software-GL samples,
not a hardware-independent benchmark or measured physical writing latency.

## Sensitivity and writing algorithm audit — 2026-10-12

The webcam mirror requires no headset. Immersive WebXR is an optional capability;
its control is now hidden when unsupported. Webcam drawing and microphone input
are tested without an XR session.

### Evidence and corrective decisions

1. **Sensitivity was mathematically unsafe.** The old threshold was
   `max(minEnergy, roomFloor * 2.8) / sensitivity`. At sensitivity 4, a normal
   room could exceed the trigger; release at 58% of that value also stayed below
   the room. Two failing tests reproduced continuous activation. The new trigger
   is `max(minEnergy / sensitivity, roomFloor * (1 + 1.8 / sensitivity))`.
   Release reduces only the excess above the floor. Sensitivity now lowers the
   required *increase* without treating the background itself as a breath.
2. **Pinch used projected distance despite available 3D joints.** Thumb and index
   can overlap on screen while remaining separated in depth. A failing world-joint
   regression reproduced interrupted pointing. Pinch now uses world-space
   thumb/index distance normalized by world palm width, with image fallback when
   world joints are absent. [Google's guide](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js)
   documents separate image and world landmark outputs. These are estimated
   coordinates, not a depth-camera measurement.
3. **Uniform Catmull–Rom invented hooks at corners.** With an 0.8-unit preceding
   movement and a 0.01-unit vertical segment, interpolation incorrectly moved x
   from 0.8 to 0.8324 at t=0.1. Bound each interpolated axis to its segment endpoints
   so irregular frame spacing cannot add a stroke outside the observed segment.
   This favors faithful corner geometry over overshooting decorative curves;
   it is not a claim that the resulting curve is globally C1 continuous.
4. **Do not blindly add more smoothing.** The [One-Euro authors](https://gery.casiez.net/1euro/)
   distinguish stationary jitter (minimum cutoff) from fast-motion lag (beta).
   Existing speed-adaptive filtering remains; its jitter/lag tests pass. A fixed
   heavy low-pass filter or extrapolating unseen finger positions would hide
   jitter at the expense of lag or false strokes.

### Breath capture and real condensation

[MDN's capture settings reference](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getSettings)
explains that actual device settings must be distinguished from requested
constraints. We request noise suppression, gain control and echo cancellation
**off**; this cannot override every OS microphone mode or repair a wrong input
selected in browser settings. [Analyser smoothing](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/smoothingTimeConstant)
adds temporal averaging; the existing 0.25 value and 60ms attack remain to balance
onset against impulse rejection. Tests now exercise the visible sensitivity and
recalibration controls through an actual Web Audio analyser, including returning
to audible background noise after the burst.

Real fog is condensation of humid breath on a cooler surface, followed by droplet
nucleation, growth and coalescence; humidity, temperature, surface properties and
airflow affect it. [Primary glass-condensation study](https://www.nature.com/articles/srep06300).
For this simulation the relevant qualities are a localized soft bloom, increasing
coverage during exhalation, irregular scattering, persistent wet wipe edges,
coalescing/draining drops and slow clearing/regrowth. A microphone measures sound,
not humidity: a silent exhale far from the microphone is not reliably observable,
and broad environmental noise can resemble blowing. Neither perfect breath
classification nor exact physical writing precision is established by fixtures.

### Validation boundary

Four regressions failed before the changes and pass afterward. The full browser
suite additionally exercises the real model on a public hand photograph, mock
moving landmarks and generated audio. Physical camera/microphone verification
remains necessary; no user recording or live hardware measurement was available.
