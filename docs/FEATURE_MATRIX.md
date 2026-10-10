# Feature matrix

Status vocabulary: NOT STARTED / IN PROGRESS / IMPLEMENTED / TESTED /
REGRESSION COVERED / MANUALLY VERIFIED. No physical CV claims from mocks.

| Feature                                     | Status             | Evidence / next                           |
| ------------------------------------------- | ------------------ | ----------------------------------------- |
| Vite/TS/lint/Playwright                     | REGRESSION COVERED | build/lint + 8 browser tests              |
| Mirrored webcam / fallback                  | REGRESSION COVERED | fake camera, denied/pending permission    |
| Persistent fog / pointer strokes / regrowth | REGRESSION COVERED | mask sample tests                         |
| PNG capture / B C S H                       | REGRESSION COVERED | download and controls                     |
| Responsive canvas                           | TESTED             | portrait resize; visual review pending    |
| Local model/WASM                            | IN PROGRESS        | model downloaded; provider not integrated |
| Provider abstraction / mock                 | NOT STARTED        | V1 foundation                             |
| Gesture metrics/stability                   | NOT STARTED        | fixtures + Vitest                         |
| Guided calibration/preferences              | NOT STARTED        | next vision milestone                     |
| Palm wipe / two-hand actions                | NOT STARTED        | gesture milestones                        |
| Finger writing / undo redo                  | NOT STARTED        | gesture milestones                        |
| Modes / Magic Reveal                        | NOT STARTED        | mode milestone                            |
| Optional local microphone                   | NOT STARTED        | explicit toggle + calibrated trigger      |
| Droplets / refraction / streaks             | NOT STARTED        | realism milestone                         |
| Adaptive quality / metrics                  | NOT STARTED        | polish                                    |
| Lab / landmark recording / replay           | NOT STARTED        | diagnostic tooling                        |
| Video recording                             | NOT STARTED        | optional, feature detection               |
| Backend/shared persistence                  | NOT STARTED        | deliberately deferred                     |
| Real-camera accuracy                        | NOT STARTED        | manual matrix, requires people/devices    |
