# Feature matrix

Automated coverage does not imply physical camera/headset verification.

| Feature                                      | Status             | Evidence                                                        |
| -------------------------------------------- | ------------------ | --------------------------------------------------------------- |
| Vanilla Vite / TypeScript / WebGL2           | REGRESSION COVERED | lint, types, build, smoke                                       |
| Mirrored webcam / permission fallback        | REGRESSION COVERED | fake video, denied and pending prompts                          |
| Persistent fog / regrowth / mouse and touch  | REGRESSION COVERED | mask samples and resize                                         |
| Local MediaPipe 1.1.0 worker                 | REGRESSION COVERED | real hand-photo inference, backend comparison, failure recovery |
| Provider / mock / gesture fixtures           | REGRESSION COVERED | unit and browser replay                                         |
| One-Euro / hand identity / fine writing      | REGRESSION COVERED | synthetic lag/noise/order tests                                 |
| Calibration and local preferences            | REGRESSION COVERED | unit profile tests and browser UI                               |
| Palm wipe / point / pinch / fist / two hands | REGRESSION COVERED | deterministic landmark sequences                                |
| Writing undo / redo                          | REGRESSION COVERED | mask restoration                                                |
| Magic Reveal message / photo                 | REGRESSION COVERED | local assets, format rejection, modes                           |
| Optional microphone                          | REGRESSION COVERED | coloured/low-gain airflow, analyser input and denial            |
| Wet edges / beads / draining moisture        | REGRESSION COVERED | reviewed glass states and drainage test                         |
| Adaptive resolution / metrics                | TESTED             | software GL 53–55 FPS with adaptive quality                     |
| PNG / ten-second video                       | REGRESSION COVERED | download tests                                                  |
| Lab recording / replay                       | REGRESSION COVERED | replay and landmark-only JSON export                            |
| WebXR hand-contact mirror                    | IMPLEMENTED        | projection unit tests; headset NOT VERIFIED                     |
| Minimal rose/pearl UI                        | TESTED             | reviewed desktop/mobile and four glass states                   |
| Backend / accounts / sharing                 | NOT STARTED        | intentionally unnecessary for local core                        |
| Future frost/rain/neon modes                 | NOT STARTED        | outside V1                                                      |

Input audit (2026-10-12): floor-relative breath sensitivity/release, world-space
pinch separation and bounded letter corners are regression covered. Webcam mode
requires no headset; unsupported XR control hidden. Physical precision remains
unverified on user hardware.
