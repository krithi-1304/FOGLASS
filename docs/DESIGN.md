# Design — FOGLASS

Experience mode: a quiet glass surface fills the viewport; UI recedes on entry.
Reference vibe: steamy bathroom mirror at dusk, cinematic, soft, nostalgic.

## Tokens

Fog light #cfd8de; fog deep #8fa3b0; shadows #173337; ink #edf0ea.
Amber #ffb36b at 0.10–0.15 opacity; muted text #b4c3c6.
Title Instrument Serif regular; UI Inter regular; both self-hosted WOFF2.
Spacing: 8, 16, 24, 40, 64px. Buttons pill-shaped, fine translucent borders.
Title fluid 80–144px; UI 11–14px. One restrained editorial central composition.

## Rendering targets

Camera cover-cropped and mirrored; base blur 0.7px, fog blur up to 12px.
Fog ramp 1-exp(-t/1.5); breath strength scales center-out deposition.
Wipe radius 0.025 of short side; pinch 0.055; edge feather 0.012.
Regrowth time 11s, local variation ±3s; edges evaporate before center.
Droplet gravity 0.035 UV/s²; terminal speed 0.09 UV/s; wobble 0.002 UV.
Grain amplitude 0.012; vignette 0.22; chromatic offset max 1.4px.

## Motion

Soft 600ms entrances; interface fade 900ms; no abrupt camera transitions.
Honor reduced motion for decorative drift. Pointer cursor fades when idle.

## Milestone truth

M1 implements camera, procedural fallback, base blur/grain, vignette and tint.
Fog, wipe physics and CV are later milestones; UI must not imply they work yet.

## Pearl and rose refinement — 2026-10-11
Landing: pearl #ece5e2, rose #d9b8c6, plum ink #51434b, primary #775569.
One serif title, one invitation, one primary action; camera/privacy stays explicit.
In-session dock contains only Add steam and Tools; other actions are tucked away.
Glass preserves the camera colours, with cold condensation and a restrained warm bloom.
Writing radius .011 viewport height; mask 512²; wet edge offset .014 × mask gradient.
Microbeads use bounded procedural cells; residual stroke water drains downward and fades.
