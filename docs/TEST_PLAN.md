# Test plan

Run pnpm test --reporter=line. Chromium fake camera/mic; API replaces hand video.
Only ?test=1 exposes instrumentation; ?seed pins noise; ?speed scales fog time.

| Criterion                                                                           | Playwright test                                | Milestone |
| ----------------------------------------------------------------------------------- | ---------------------------------------------- | --------- |
| AC1                                                                                 | boot: heading/start, no errors                 | M0        |
| Render                                                                              | fallback canvas, WebGL2 frame, resize          | M1        |
| Camera                                                                              | fake camera starts, mirrored cover uniforms    | M1        |
| Permissions                                                                         | denied media yields usable fallback            | M1/M6     |
| AC2                                                                                 | injected breath coverage >0.5 within 3s        | M2        |
| AC3                                                                                 | stroke mask samples vs untouched samples       | M2/M4     |
| AC4                                                                                 | accelerated regrowth and dripping              | M2/M5     |
| AC5                                                                                 | C, S download, H, M                            | M2/M5     |
| AC6                                                                                 | denied media + pointer and B                   | M2/M6     |
| AC7                                                                                 | averaged fps >45 software GL, report           | M7        |
| AC8                                                                                 | resize preserves mask; four screenshot goldens | M2/M7     |
| Real microphone onset and physical pointing latency require hardware manual QA.     |
| Screenshots: none/light/heavy/mid-stroke, inspect only at M2 and M7.                |
| M1 verifies actual rendered pixel variation and camera texture upload via test API. |
