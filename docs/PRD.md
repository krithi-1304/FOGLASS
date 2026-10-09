# FOGLASS

## Goal

An intimate browser mirror: breath condenses glass; an airborne finger wipes it.
Reference: steamy bathroom mirror at dusk, cinematic, soft, nostalgic.

## Non-goals

Accounts, uploads, speech recognition, backend processing, heavy render engines.

## Stories

- I start the mirror with one action and understand device access.
- I exhale to fog the mirror, then point to draw through it.
- I can use mouse/touch and B when devices are unavailable.
- I can save a private PNG of the moment.

## Functional requirements

FR1 Minimal onboarding with Start, device explanation and denied-access fallback.
FR2 Strength/duration-dependent center-out fog, 1.5s ramp, slow uneven decay.
FR3 Landmark 8 draws when pointing; open palm hovers; optional pinch wipe.
FR4 Heavy wipes create droplets which merge, wobble and leave thin trails.
FR5 Composite blur, edge refraction, grain, vignette, chromatic shift, warm bloom.
FR6 C clear; S snapshot; H hints; M optional ambient/squeak, initially off.
FR7 Mouse/touch drag and held B fallback; test-only window API.
FR8 Decoupled 30Hz CV; 60Hz rendering; adaptive resolution; capped DPR.
FR9 Portrait/desktop resize preserves fog state.

## Performance budgets

1280×720 midrange laptop: about 60fps, finger-to-trail <80ms.
Breath onset visible within 500ms. Drop resolution when frame time exceeds 20ms.
Headless software GL average >45fps is final QA target, hardware results separate.

## Edge cases

Permission denial, missing devices, busy camera, insecure origin, unsupported WebGL2,
background tabs, orientation changes, slow CV, lost tracking, context loss.
All media stays in browser. Stop tracks when page is discarded.

## Acceptance criteria

AC1 Boot without console errors, accessible start screen.
AC2 Breath reaches >0.5 coverage within 3s; actual mic onset <500ms.
AC3 Pointing yields smooth continuous trails; local mask decreases vs untouched.
AC4 Trails regrow within 8–15s; droplets remain alive while idle.
AC5 C clears; S downloads; H and M operate.
AC6 Permission denial retains mouse and breath-key interaction.
AC7 Average headless fps >45; desktop approximately 60; no console errors.
AC8 Responsive composition, preserved mask, deterministic visual snapshots.

## Delivery

M0 scaffold; M1 camera/render; M2 fog; M3 audio; M4 CV;
M5 realism; M6 polish; M7 final QA. This session delivers M0–M1 only.
