# Current project memory

Read at session start alongside AGENTS.md; historical notes remain in MEMORY.md.

## Current milestone

V1 Magic Reveal complete; optional microphone/capture next. Prior M0–M2 committed: vanilla Vite/TS, WebGL2 mirror,
half-float ping-pong fog, mouse/touch wiping, regrowth, B/C/S/H, startup fallback.

## Stable architecture

Browser only, no backend, no uploads, local fonts. Existing renderer is tested.
New brief recommends React/Canvas; stack decision asked, existing code preserved.

## Current validation

Build/lint/typecheck pass; 27 committed unit tests and 17 Playwright tests pass (35.3s); isolated audio/capture tests also pass. Four M2 captures inspected.
A real physical camera/hand/breath session has NOT been validated.

## Known issues

Local GPU MediaPipe infers fake video; mock and real providers share the recognizer.
Actual physical hand/breath behavior still requires manual verification.
Initial fallback screenshot caught fade transition; capture wait now corrected.
Media permission prompts may remain open, but fallback no longer waits for them.

## Decisions / constraints

New user brief supersedes old open-palm hover: open palm now wipes, two hands allowed.
Keep tested implementation; no paid services, account, media upload, speculative backend.
Six Pinterest links blocked; follow written visual direction without claiming pin inspection.
MASTER_BUILD_PROMPT.md preserves the user-provided local build brief.

## Next 3 actions

1. Wire optional calibrated microphone and photo/video controls.
2. Finish realism and adaptive performance.
3. Finish realism/performance, lab/replay and final visual regression.
