# Manual camera matrix

Status: NOT RUN. Automation does not prove real-hand quality or <80ms physical latency.
Record device/browser/date, light, result and observed limitation for each row.

- Bright daylight / dim dusk / cluttered room.
- Different skin tones; left/right hands; one/two hands.
- Hand enters/exits, occlusion, low confidence and reacquisition without connecting strokes.
- Fast palm swipe, slow wipe, point writing, tremor/jitter.
- Pinch/point transition, fist dwell, two-finger palette, two-palm clear, stationary reset.
- Calibration comfortable range, pinch size, wrong gesture recovery and skip.
- Camera denied/busy/unplugged; microphone denied; ignored permissions.
- Laptop webcam and mobile front camera portrait/landscape.
- Actual exhale versus speech, music, fan and room noise.
- Breath onset <500ms, finger-to-trail <80ms using slow-motion recording.
- Sustained 1280×720 performance and resource cleanup after exit.
- Optional capture support; no off-device requests or unexpected uploads.

## WebXR — NOT RUN

- Supported headset browser over HTTPS; hand-tracking permission accepted/denied.
- Panel placement, correct stereo depth, index touching versus hovering, tracking loss.
- Steam/clear/exit strip, system exit, re-entry, camera mode restoration.
- No webcam passthrough assumption; verify both procedural and reveal backgrounds.
- Measure frame rate and comfort on actual headset; test both hands and occlusion.
