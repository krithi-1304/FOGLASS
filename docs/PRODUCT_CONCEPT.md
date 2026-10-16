# FOGLASS — complete product concept & implementation contract

Extend the established rose/pearl mirror; keep capture and inference entirely local.
A single Letters entry opens a floating editorial sheet. Compose, uncover, reply,
and collect are stages of one experience, not separate dashboards.

## Included
- Bounded stroke memories with replay, ghost reveal on breath, full-hand traces.
- Rain follows drawn paths; closed drawings become clear windows in condensation.
- Rose dusk, moonlight and rainy-day appearances, optional existing room sound.
- Typed notes and handwriting, wipe/breath reveal, local saved collection.
- Portable letter files and share links, with explicit link-holder access copy.
- Worker + D1 persistence: expiring letters, reply chains, owner deletion token.
- Core mirror and portable letters work when the backend is unavailable.

## Boundaries
No camera, raw audio, hand landmarks, photos or recordings are uploaded by letters.
No login, paid service, analytics or public directory. No claim of physical fluid
simulation, reliable depth from one camera, or encrypted server storage.
Optional Cloudflare deployment requires an authenticated account; implementation
and local real-database tests proceed independently. No account was found initially.

## Acceptance
Validated and size-bounded schemas; no unsafe HTML; accessible narrow-screen UI.
Record -> save -> reopen -> uncover -> replay -> reply without backend.
Worker create/read/reply/delete/expiry/CORS/limits tested against local D1.
Water follows strokes without teleporting; persistent windows clear their interior.
Existing 51 unit/35 browser baseline remains green, including performance >45 FPS.

## Core promise
A real-time browser mirror with condensation that responds to blowing, fingertip
writing and full-hand wiping. No headset, paid inference, account or backend is
required for the core mirror. Existing V1 remains the baseline, not a prototype
to replace. Local hand inference uses MediaPipe; WebGL2 owns the persistent fog.

## Experience
Start with a quiet rose/pearl invitation. During use only the glass is visible;
controls reveal at the bottom edge or with keyboard focus. Point to write, lift
to reposition, open a palm to wipe. Microphone is explicit and optional. Mouse,
touch and B remain equivalent conventional inputs.

A letter captures handwriting and an optional typed note, never webcam/audio.
Breath can reveal ghost writing; replay retraces it; droplets follow drawn paths;
a closed shape can become a persistent clear window. Full-hand marks fade with
normal condensation. A recipient uncovers, replies and saves a conversation.
Rose dusk, moonlight and rain are appearances of the same glass, not separate apps.

## Reliability first
Before effects: reproduce air-writing failures at the landmark-to-mask boundary.
Check pen-up, small curves, sharp corners, offscreen points, switching hands,
long gaps, noise, changing aspect ratio, frame age and repeat-use lifecycle.
Add a deliberate pinch writing option for users who cannot comfortably curl
three fingers. Do not bridge gaps or invent missing movement.
Measure rendering and inference separately. Preserve >45 FPS software-GL tests.
Real camera/mouth accuracy requires manual recorded evidence; simulated fixtures
and a still-hand model test do not prove physical accuracy.

## Delivery order
1. Air-writing regression and input continuity fixes.
2. Typed/stroke letter schema, persistence API and local fallback.
3. Letter UI, ghost breath, replay, rain paths and closed windows.
4. Full regression, failure/security checks, desktop/mobile visual review.
5. Publish frontend; connect backend only with authenticated deployment access.

## Later experiments (not promised by this release)
Mouth-positioned fog with optional face inference; image-backed moving windows;
physical droplet merging and arbitrary branching mazes; encrypted online letters;
private audio messages. These need their own performance/privacy validation.
