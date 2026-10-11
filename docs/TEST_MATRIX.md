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
