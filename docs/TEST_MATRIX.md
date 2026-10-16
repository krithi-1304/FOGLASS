# Test matrix

| Feature                                                            | Unit / fixture                  | E2E                                | Visual           | Manual                    |
| ------------------------------------------------------------------ | ------------------------------- | ---------------------------------- | ---------------- | ------------------------- |
| Boot/start/errors                                                  | camera lifecycle                | smoke/render                       | controls/mobile  | denied/busy               |
| Mirror/resize                                                      | cover mapping                   | render.spec                        | clear mirror     | left/right orientation    |
| Fog/persistent strokes                                             | interpolation                   | fog.spec mask samples              | fog/wipe/regrow  | tactile quality           |
| Provider                                                           | mock playback/unsubscribe       | local model load/failure           | debug only       | real hand detection       |
| Palm wiping                                                        | palm-left/right/slow            | mock → mask                        | palm streak      | slow/fast/dim             |
| Writing                                                            | index-line/heart                | mock → mask; undo/redo             | writing          | physical jitter           |
| Stability                                                          | jitter/low-confidence/lost      | lost/reacquire                     | cursor           | clutter/occlusion         |
| Gesture commands                                                   | fist/pinch/two-palm             | pause/palette/clear                | dock             | conflicts                 |
| Calibration                                                        | valid/range/pinch serialization | guided journey                     | calibration      | comfort/handedness        |
| Reveal                                                             | mode state                      | switch/text/image                  | revealed message | legibility                |
| Breath                                                             | synthetic spectrum/calibration  | mic denied/off                     | fog bloom        | real exhale/ambient noise |
| Capture                                                            | file lifecycle                  | PNG download                       | final image      | recording support         |
| Privacy                                                            | preferences validation          | no off-origin requests; exit stops | visible state    | permission UX             |
| Performance                                                        | quality state                   | FPS/latency log                    | adaptive sizes   | midrange laptop/mobile    |
| Tests never substitute synthetic pass for human/device validation. |

## Latest precision / final QA additions

| Requirement                              | Automated evidence                             | Hardware limit                         |
| ---------------------------------------- | ---------------------------------------------- | -------------------------------------- |
| Lower writing lag / stable hand identity | precision.test.ts synthetic ramp/noise/order   | real camera latency unmeasured         |
| Background GPU inference                 | vision.spec.ts local worker/model/failure      | actual hands need manual matrix        |
| Photo/video local export                 | capture.spec.ts and capture.test.ts            | codecs vary by browser                 |
| WebXR contact depth/hysteresis           | xr.test.ts; unsupported browser in lab.spec.ts | headset NOT RUN                        |
| Landmark laboratory/replay               | lab.spec.ts through production recognizer      | live recorded dataset needs user hands |
| Minimal UI/four fog states               | final-qa.spec.ts reviewed snapshots            | platform rasterization tolerance       |
| >45 FPS software GL                      | final-qa.spec.ts wall-clock throughput         | desktop/headset target not inferred    |

Input repair: breath.test.ts now includes coloured/low-gain spectra and noisy-startup recalibration; breath.spec.ts sends actual low-pass Web Audio noise through the analyser. Gesture tests cover foreshortened world geometry and brief classification flicker. vision.spec.ts feeds Google's sample hand photograph through the normal camera/worker path and verifies usable hand output without mandatory calibration. Physical input remains a separate manual stage.

Input audit: breath unit regressions cover maximum sensitivity/background-only and
release into room noise; gesture regressions cover projected thumb overlap with
separate 3D joints and interpolation corner overshoot. `breath.spec.ts` exercises
slider/recalibration/release through real Web Audio; `lab.spec.ts` verifies the
unsupported headset control stays hidden. Physical microphone/hand checks remain manual.

Tracking lifecycle: `tracking-lifecycle.test.ts` covers frozen camera release,
fresh-result recovery, pending initialization cancellation and hung-worker cleanup.
`gestures.test.ts` verifies that a long observation gap cannot trigger a fist hold
or resume an active writing gesture. Existing vision E2E covers model startup,
real-photo detection, replay and failure fallback.

Full-hand quality: `hand-quality.spec.ts` checks all five fingertips and inter-finger
gaps, portrait cover-crop alignment, active-hand render throughput and zero CPU
readback during writing. `tracking-lifecycle.test.ts` checks result-driven fresh
frame scheduling. `gestures.test.ts` covers a curled outer finger and two-frame
point activation. The existing suite retains undo/redo, droplets, breath, real
hand-photo inference, fallback controls and the four visual states.

V1: `release.spec.ts` covers 32 strokes, bounded undo history, repeated pause/resume, hidden HUD and actual WebGL context loss. `breath.spec.ts` covers six microphone restarts, audio suspension/resume and closed resources.

Letters: `letters.test.ts` validates schema, compressed links, bounds and storage
failures; `letter-effects.test.ts` covers stroke memory, rain paths and fitting.
`letters-api.test.ts` uses SQLite for access, expiry, rate limits and cascades;
`letters-api.spec.ts` exercises the real local Worker/D1. `letters.spec.ts` covers
portable/online journeys, malformed files, mobile dismissal, ghost/window pixels
and preserving saved originals when editing a copy. Desktop/mobile sheets reviewed.
`air-writing.test.ts` and `air-writing.spec.ts` cover gesture-to-mask continuity.
Production Cloudflare and physical camera/mouth/headset checks remain pending.
