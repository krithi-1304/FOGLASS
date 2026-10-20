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
# Quick input check after the 2026-10-20 repair

1. Start the camera with the microphone unchecked. Open Tools; confirm the hand
   feedback changes from no hand to detected. Point to write and open your palm
   to wipe, including in Fog Writing mode. Clear the glass to check camera framing.
2. Choose Test my breath. Check the microphone name, stay quiet for calibration,
   then blow toward that microphone (not necessarily toward the screen). The meter
   should rise and say Breath detected. Try another input if its meter stays flat.
3. Wipe while noise is present: the cleared trail must remain clear. Stop blowing
   briefly, then blow again. Default fog returns only with new breath/Add steam/B;
   select Slowly after wiping only when automatic regrowth is wanted.
4. Keep Tools open while moving the pointer or selecting options. On mobile tap
   Controls to reopen it; no hovering is needed. Test Tab/Space on buttons.

Record device/browser, selected camera/mic, feedback text and failure conditions.
No real camera/mouth result is inferred from automated fixtures.
