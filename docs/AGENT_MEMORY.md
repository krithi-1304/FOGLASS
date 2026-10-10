# Current project memory

Read at session start alongside AGENTS.md; historical notes remain in MEMORY.md.

## Current milestone

Updated V1 foundation complete. Prior M0–M2 committed: vanilla Vite/TS, WebGL2 mirror,
half-float ping-pong fog, mouse/touch wiping, regrowth, B/C/S/H, startup fallback.

## Stable architecture

Browser only, no backend, no uploads, local fonts. Existing renderer is tested.
New brief recommends React/Canvas; stack decision asked, existing code preserved.

## Current validation

Build/lint/typecheck pass; 2 Vitest tests and 8 Playwright tests pass (14.8s). Four M2 captures inspected.
A real physical camera/hand/breath session has NOT been validated.

## Known issues

No real hand integration or calibrated mic trigger yet. Provider/mock replay tests pass.
Initial fallback screenshot caught fade transition; capture wait now corrected.
Media permission prompts may remain open, but fallback no longer waits for them.

## Decisions / constraints

New user brief supersedes old open-palm hover: open palm now wipes, two hands allowed.
Keep tested implementation; no paid services, account, media upload, speculative backend.
Six Pinterest links blocked; follow written visual direction without claiming pin inspection.
MASTER_BUILD_PROMPT.md preserves the user-provided local build brief.

## Next 3 actions

1. Integrate MediaPipe provider and pure gesture recognizer using recorded fixtures.
2. Integrate local MediaPipe, gesture features/stability and guided calibration.
3. Connect palm/write gestures to persistent fog and validate failure states.
