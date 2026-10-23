# ================================================================

# MASTER BUILD PROMPT

# DIGITAL FOG MIRROR — AI + COMPUTER VISION EXPERIENCE

# ================================================================

You are the principal engineer and autonomous implementation agent
for this project.

You must think and operate simultaneously as:

- Senior Full-Stack Engineer
- Computer Vision Engineer
- Frontend Engineer
- Interaction Designer
- UI/UX Designer
- Canvas/WebGL Graphics Engineer
- QA Automation Engineer
- Performance Engineer
- Security Engineer
- Accessibility Engineer
- DevOps Engineer
- Product Architect
- Technical Product Owner

Your job is NOT merely to generate code.

Your job is to build, test, validate, document, refactor and maintain
a production-quality interactive web application from beginning to end.

The application must be visually impressive enough for a portfolio,
technically strong enough to demonstrate real engineering skill,
and reliable enough that the core experience does not feel like
a fragile AI-generated prototype.

Do not rush.

Do not fake features.

Do not mark something as complete just because code exists.

Every important feature must be tested.

Every architectural decision must be documented.

Every meaningful completed change must be committed cleanly.

# ================================================================

# 1. PROJECT NAME

# ================================================================

Working title:

MIST MIRROR

Alternative internal names may include:

Digital Fog Mirror
FogGlass
Mist
Steam Mirror

Do NOT spend significant development time on branding.

The product experience matters more than the name.

# ================================================================

# 2. PRODUCT VISION

# ================================================================

Build an interactive digital mirror where the user's webcam becomes
a realistic mirror covered with steam / bathroom condensation.

The user should feel as though they are standing in front of a
real fogged bathroom mirror.

Their physical hand movements in front of the webcam should allow
them to interact with the condensation without touching the screen.

The primary magical interaction is:

USER MOVES HAND
↓
CAMERA DETECTS HAND
↓
COMPUTER VISION TRACKS LANDMARKS
↓
GESTURE ENGINE INTERPRETS MOTION
↓
FOG PHYSICS ENGINE RESPONDS
↓
CONDENSATION IS PHYSICALLY WIPED AWAY

The experience must NOT look like:

"MediaPipe demo with a webcam and circles."

It should look and feel like:

"a cinematic, living digital mirror."

# ================================================================

# 3. VISUAL REFERENCES

# ================================================================

When internet access is available, study these references for
visual mood, mirror aesthetics, condensation, dreamy effects,
hidden messages and interaction inspiration:

https://in.pinterest.com/pin/22658804371209790/
https://in.pinterest.com/pin/9288742975516184/
https://in.pinterest.com/pin/1144406955340717250/
https://in.pinterest.com/pin/890023945079568229/
https://in.pinterest.com/pin/631770654011504711/
https://in.pinterest.com/pin/1138355243343934039/

These are inspiration references only.

Do NOT directly clone proprietary artwork, layouts or assets.

If Pinterest blocks access:

DO NOT STOP.

Continue using this specification.

# ================================================================

# 4. CORE PRODUCT PRINCIPLE

# ================================================================

The mirror must be the hero.

Do NOT build a dashboard with a small webcam box.

The camera/mirror should occupy nearly the entire experience.

Controls should be minimal, elegant and temporary.

When controls are not being used, they should fade away.

The interface should feel:

- cinematic
- dreamy
- premium
- minimal
- immersive
- tactile
- magical
- believable

Avoid:

- generic SaaS dashboard design
- excessive cards
- giant sidebars
- clutter
- neon gamer UI
- unnecessary statistics
- visible computer-vision skeletons during normal use

# ================================================================

# 5. CRITICAL COST CONSTRAINT

# ================================================================

THIS PROJECT MUST BE POSSIBLE TO RUN FOR FREE.

Do NOT introduce any paid dependency without explicit approval.

Core functionality must NOT require:

- OpenAI API
- Anthropic API
- Gemini API
- paid vision models
- paid database
- paid authentication service
- paid image hosting
- paid analytics
- paid video processing
- paid storage

Prefer:

- open source libraries
- browser APIs
- local computation
- localStorage / IndexedDB
- free hosting tiers
- free CI/CD
- free static hosting

The application should still provide the complete core Fog Mirror
experience without ANY backend.

# ================================================================

# 6. PRIVACY PRINCIPLE

# ================================================================

Computer vision must run LOCALLY.

Webcam frames must NOT leave the device.

Do NOT send:

- camera frames
- screenshots
- hand landmarks
- biometric information
- microphone audio

to a backend unless a future explicit feature requires it and the
user clearly opts in.

Before enabling the camera display:

"Your camera is processed locally in your browser.
Video is not uploaded."

Camera permissions must only be requested following a clear
user interaction.

When the mirror closes:

- stop MediaStream tracks
- stop hand inference
- remove event listeners
- release timers
- release temporary camera buffers

# ================================================================

# 7. RECOMMENDED STACK

# ================================================================

Use:

Frontend
-------

React
TypeScript
Vite

Styling
-------

CSS Modules / scoped CSS / clean CSS architecture

Rendering
---------

Canvas 2D initially

Computer Vision
---------------

MediaPipe Tasks Vision
Hand Landmarker

Testing
-------

Vitest
Playwright

Formatting / Quality
--------------------

ESLint
Prettier
TypeScript strict mode

Storage
-------

localStorage / IndexedDB initially

Backend
-------

NO BACKEND for initial milestones.

Only introduce one when a feature genuinely requires shared data.

Optional future backend:

Cloudflare Workers
Cloudflare D1

provided the selected usage remains within free-tier constraints.

Do NOT use Firebase/Supabase/etc. merely because they are convenient.

Avoid unnecessary infrastructure.

# ================================================================

# 8. ARCHITECTURAL PRINCIPLE

# ================================================================

DO NOT scatter computer-vision code across React components.

Keep strong boundaries between systems.

Architecture:

src/
app/

camera/
CameraController.ts
CameraPermissions.ts
CameraTypes.ts

vision/
HandTrackingProvider.ts
MediaPipeHandProvider.ts
MockHandProvider.ts
HandLandmarks.ts

gestures/
GestureEngine.ts
GestureStateMachine.ts
GestureTypes.ts
GestureSmoothing.ts
GestureCalibration.ts

mirror/
MirrorEngine.ts
MirrorRenderer.ts

fog/
FogEngine.ts
FogMask.ts
FogBrush.ts
FogRegeneration.ts
DropletEngine.ts
FogNoise.ts

interactions/
WipeInteraction.ts
DrawInteraction.ts
PinchInteraction.ts
InteractionController.ts

modes/
RealMirrorMode.ts
FogWritingMode.ts
MagicRevealMode.ts

capture/
CapturePhoto.ts
CaptureVideo.ts

audio/
BreathDetector.ts

debug/
DebugOverlay.ts

storage/
PreferencesStore.ts

components/

pages/

styles/

tests/
fixtures/
unit/
integration/
visual/
e2e/

# ================================================================

# 9. HAND TRACKING ABSTRACTION

# ================================================================

Create an interface similar to:

interface HandTrackingProvider {
initialize(): Promise<void>;

    start(video: HTMLVideoElement): Promise<void>;

    stop(): void;

    subscribe(
        callback: (frame: HandTrackingFrame) => void
    ): () => void;

}

Create at least:

MediaPipeHandProvider

and:

MockHandProvider

# ================================================================

# 10. WHY MOCK HAND TRACKING IS MANDATORY

# ================================================================

Automated testing cannot rely on somebody physically standing in
front of a webcam.

MockHandProvider must allow tests to feed pre-recorded landmark
sequences into the real gesture engine.

Example:

recorded landmarks
↓
MockHandProvider
↓
GestureEngine
↓
OPEN_PALM detected
↓
WipeInteraction
↓
Fog mask changes

This architecture is NON-NEGOTIABLE.

Without this abstraction, meaningful regression testing of the
interaction system becomes extremely difficult.

# ================================================================

# 11. MIRROR EXPERIENCE

# ================================================================

The live camera feed must be horizontally mirrored.

When I raise my RIGHT hand, the mirror should behave naturally,
like a physical mirror.

Do NOT accidentally double-flip coordinate systems.

Create one coordinate transformation layer and document it.

Camera/video coordinates
↓
normalized coordinates
↓
mirror coordinates
↓
canvas coordinates

Do not duplicate conversion logic.

# ================================================================

# 12. REALISTIC FOG ENGINE

# ================================================================

The fog must not be implemented as:

rgba(255,255,255,0.5)

over the video.

Build a layered procedural condensation effect.

Visual layers may include:

Layer 1
Very subtle camera softening.

Layer 2
Uneven condensation opacity.

Layer 3
Procedural noise/cloud patterns.

Layer 4
Small moisture droplets.

Layer 5
Occasional larger droplets.

Layer 6
Slightly denser edge condensation.

Layer 7
Wipe mask.

Layer 8
Residual moisture/streaking.

Layer 9
Slow re-condensation.

Fog density must vary naturally.

Avoid obvious tiled noise patterns.

# ================================================================

# 13. FOG MASK MODEL

# ================================================================

Maintain a persistent fog mask.

Conceptually:

1 = completely fogged
0 = completely clear

The user wiping the mirror modifies this mask.

Example:

initial mask:

111111111
111111111
111111111

after wiping:

111000111
110000011
111000111

Do not merely draw transparent visual shapes over the current frame.

Maintain actual persistent interaction state.

# ================================================================

# 14. RE-FOGGING

# ================================================================

Cleared areas should slowly accumulate condensation again.

Provide configurable parameters:

fogGenerationRate
maxFogDensity
edgeFogBias
wipeResidual
condensationSpeed

Re-fogging should be gradual.

It should create the feeling that steam is still present in the room.

# ================================================================

# 15. HAND FEATURES

# ================================================================

From hand landmarks calculate:

- palm centre
- palm width
- palm orientation
- index fingertip
- thumb tip
- middle fingertip
- ring fingertip
- pinky fingertip
- wrist
- handedness
- movement velocity
- movement direction
- acceleration if useful
- tracking confidence
- finger extension state
- pinch distance

Normalize values where possible.

# ================================================================

# 16. GESTURE STABILITY

# ================================================================

Do NOT trigger gestures based on a single frame.

Use:

- confidence thresholds
- temporal smoothing
- gesture dwell
- hysteresis
- cooldowns
- dead zones
- state machine transitions

Example:

OPEN_PALM

must remain valid for approximately a configurable minimum duration
before becoming active.

Do not hardcode timings everywhere.

Keep them in a gesture configuration.

# ================================================================

# 17. INITIAL GESTURE LANGUAGE

# ================================================================

OPEN PALM + MOVEMENT
--------------------

Wipe mirror.

INDEX FINGER ONLY
-----------------

Write/draw into condensation.

PINCH
-----

Select / grab / interact with optional floating controls.

FIST HELD
---------

Temporarily pause mirror interactions.

INDEX + MIDDLE FINGER
---------------------

Open a minimal gesture menu.

TWO OPEN PALMS
--------------

Clear the whole mirror.

LONG OPEN-PALM HOLD
-------------------

Re-fog/reset mirror.

Gesture mappings should be configurable.

# ================================================================

# 18. GESTURE PRIORITY

# ================================================================

Prevent gesture collisions.

For example:

TWO_HAND_CLEAR
should override
OPEN_PALM_WIPE.

PINCH
should not accidentally trigger
INDEX_DRAW.

Design a deterministic gesture state machine.

Document gesture priorities.

# ================================================================

# 19. PALM WIPE PHYSICS

# ================================================================

Do NOT wipe fog using a fixed circular eraser.

Use:

previous palm position +
current palm position +
palm width +
movement velocity +
direction

Create continuous capsule-shaped strokes between frames.

Fast wipe:

- slightly wider
- imperfect edges
- visible streaking

Slow wipe:

- more controlled clearing
- slightly stronger local clearing

Palm radius should scale with perceived hand size.

A hand close to the camera should naturally create a larger wipe.

# ================================================================

# 20. FINGER WRITING

# ================================================================

When INDEX-ONLY gesture activates:

Use the index fingertip as a fog-writing tool.

Requirements:

- smooth trajectory
- interpolate gaps
- remove jitter
- maintain continuity
- narrow clearing path
- pressure-like effect may be approximated from velocity
- preserve written strokes
- support undo
- support redo

The user should be able to write something like:

KRITHI ♡

using only their finger in the air.

# ================================================================

# 21. MODES

# ================================================================

Required modes:

MODE 1
REAL MIRROR

Pure interactive fog mirror.

MODE 2
FOG WRITING

Optimized for drawing/writing.

MODE 3
MAGIC REVEAL

Something meaningful exists behind the condensation.

The user reveals it by wiping.

# ================================================================

# 22. MAGIC REVEAL

# ================================================================

Magic Reveal may reveal:

- hidden message
- photograph
- quote
- artwork
- stars
- flowers
- romantic message
- birthday message

Use only local or user-provided content.

The reveal must happen spatially according to the exact areas wiped.

Do not reveal the entire image merely because a gesture occurred.

# ================================================================

# 23. FUTURE MODE ARCHITECTURE

# ================================================================

Architect so future modes can be added without rewriting the
entire rendering engine.

Future possibilities:

Secret Mirror

Frost Glass

Rain Window

Neon Condensation

Dream Mirror

Snow/Frost writing

Memory Mirror

Birthday Reveal

Valentine Reveal

Photo Reveal

Do NOT implement all of them immediately.

Architecture first.

# ================================================================

# 24. OPTIONAL BREATH-TO-FOG

# ================================================================

Treat this as an experimental feature.

When explicitly enabled:

microphone
↓
local audio analyser
↓
detect sustained blow-like energy
↓
increase condensation

No audio leaves the browser.

Do not describe this as biometric breath recognition.

Allow the feature to be disabled entirely.

Do not allow this experimental feature to delay the main project.

# ================================================================

# 25. CALIBRATION

# ================================================================

Before first use, provide a beautiful short calibration experience.

Example:

Step 1

"Show me your hand."

🖐

Step 2

"Move slowly to the left."

Step 3

"Now to the right."

Step 4

"Point."

☝

Step 5

"Pinch."

🤏

Step 6

"You're ready."

Calibration may estimate:

- user's comfortable interaction range
- palm size
- jitter level
- pinch threshold
- hand preference
- tracking stability

Make calibration skippable.

Provide "Recalibrate" in settings.

# ================================================================

# 26. FIRST-VISIT EXPERIENCE

# ================================================================

Landing page should be extremely minimal.

Possible hero:

MIST

Your screen becomes a living mirror.

Move your hand.
Wipe the steam.
Leave something behind.

[ Enter the Mirror ]

Secondary:

No uploads.
No account.
Camera processing stays on your device.

Do not overwhelm the landing page with explanations.

# ================================================================

# 27. CAMERA PERMISSION EXPERIENCE

# ================================================================

After pressing Enter Mirror:

show a deliberate transition.

Explain:

"We need your camera to create your mirror.

Your video stays on this device."

[ Enable Camera ]

Only request permission after this button is pressed.

If permission denied:

show a friendly recovery screen.

Provide:

Try Again

How to Enable Camera

Explore Demo Mode

Demo Mode should work using simulated visuals if possible.

# ================================================================

# 28. MAIN MIRROR UI

# ================================================================

The mirror fills the viewport.

Minimal controls can appear along bottom center.

Example:

○ Fog
✎ Write
✦ Reveal
◎ Capture
•••

Use tasteful iconography.

No huge labels.

Controls fade when idle.

Moving mouse/touch/hand near controls should reveal them again.

# ================================================================

# 29. GESTURE FEEDBACK

# ================================================================

The user needs subtle feedback that a gesture has been recognized.

Examples:

OPEN PALM
small soft ring near palm

DRAW
tiny fingertip glow

PINCH
small contraction animation

TWO HAND CLEAR
brief ripple

Do NOT permanently display:

21-point landmark skeleton
bounding boxes
debug values

unless Debug Mode is enabled.

# ================================================================

# 30. DEBUG / GESTURE LAB

# ================================================================

Build a developer route:

/lab

This is extremely important.

Gesture Lab should display:

- camera preview
- landmarks
- detected gesture
- candidate gesture
- confidence
- palm centre
- palm width
- velocity
- pinch distance
- FPS
- inference FPS
- inference latency
- smoothing state

Provide:

[ Record Gesture ]

When pressed:

record hand landmark frames over time.

Export/save as JSON.

Example:

tests/fixtures/gestures/custom-swipe.json

This creates our own gesture dataset.

# ================================================================

# 31. INTERACTION REPLAY SYSTEM

# ================================================================

Build a way to replay stored landmark sequences through the
actual application logic.

Example:

record real gesture
↓
JSON fixture
↓
MockHandProvider
↓
GestureEngine
↓
InteractionEngine
↓
FogEngine

Provide a developer tool:

Replay Fixture

This should allow regression testing when gesture algorithms change.

# ================================================================

# 32. TEST FIXTURES

# ================================================================

Create:

tests/fixtures/gestures/

open-palm-left.json
open-palm-right.json
open-palm-fast.json
open-palm-slow.json
index-draw-line.json
index-draw-heart.json
pinch.json
fist.json
two-hand-clear.json
hand-lost.json
jitter.json
low-confidence.json
false-pinch.json
gesture-transition.json

Each contains timestamped simulated landmark frames.

# ================================================================

# 33. CAPTURE

# ================================================================

Provide:

Take Photo

Export Mirror

Optional:
Record short mirror session

Captured output must show the final composite visual, not just
raw webcam footage.

Prefer browser APIs.

Do not send captures to a server automatically.

# ================================================================

# 34. SECRET MIRROR — FUTURE FEATURE

# ================================================================

Architect for this even if not immediately implemented.

Flow:

Creator enters:

"I have something for you..."

Adds:

message
photo
visual

Generates shareable mirror.

Recipient opens page.

They initially see:

fogged mirror

They move their hand.

Fog disappears.

Secret content slowly appears.

This could eventually become one of the most shareable features
of the product.

# ================================================================

# 35. PERFORMANCE TARGETS

# ================================================================

Target desktop experience:

60 FPS rendering where practical.

Hand inference can run independently at approximately:

20–30 FPS depending on hardware.

Do not run expensive hand inference unnecessarily at render FPS.

Measure:

render FPS
vision inference FPS
vision latency
frame drops
fog render time

Provide adaptive quality levels:

HIGH
MEDIUM
LOW

LOW may reduce:

camera resolution
droplet count
noise complexity
inference frequency

but must preserve usability.

# ================================================================

# 36. PERFORMANCE ARCHITECTURE

# ================================================================

Separate loops:

Camera capture

Vision inference

Rendering

Fog simulation

Do not block everything through one giant React render cycle.

Avoid storing per-frame hand coordinates in React component state.

Use refs / dedicated engine state where appropriate.

React handles interface state.

Rendering engine handles high-frequency visual state.

# ================================================================

# 37. OFFSCREEN WORK

# ================================================================

Do NOT prematurely optimize.

First measure.

Only if needed investigate:

OffscreenCanvas

Web Workers

WebGL shaders

GPU-based fog

Do not turn V1 into a graphics-engine research project unnecessarily.

# ================================================================

# 38. MOBILE SUPPORT

# ================================================================

Desktop/laptop is primary because webcam gesture interaction
works naturally there.

However, the interface must not completely break on mobile.

Support:

mobile front camera
touch fallback
portrait layout
permission flows

Gesture interaction can have reduced capabilities on small screens
if necessary.

Document limitations.

# ================================================================

# 39. ACCESSIBILITY

# ================================================================

Gesture control must NOT be the only interaction method.

Provide reasonable fallbacks:

mouse
touch
keyboard

For example:

mouse drag = wipe

single-pointer drawing = write

button = full clear

This also helps testing.

# ================================================================

# 40. ERROR STATES

# ================================================================

Gracefully handle:

Camera permission denied

No camera

Camera already in use

MediaPipe model failure

Network unavailable while downloading model

WebAssembly unavailable

WebGL unavailable

Slow device

Hand disappears

Multiple hands unexpectedly detected

Microphone permission denied

Capture unsupported

Recording unsupported

Storage unavailable

Never display a blank screen.

# ================================================================

# 41. FREE / OFFLINE RESILIENCE

# ================================================================

Once application assets/models are available, architect toward
maximum client-side functionality.

Do not require a database merely to remember:

fog preferences
calibration
theme
quality level

Use local persistence.

# ================================================================

# 42. TESTING PHILOSOPHY

# ================================================================

Every feature must have a test strategy BEFORE it is considered done.

Testing layers:

UNIT TESTS

INTEGRATION TESTS

GESTURE REGRESSION TESTS

E2E TESTS

VISUAL REGRESSION TESTS

MANUAL REAL-CAMERA TESTS

No feature is "done" merely because it looked correct once.

# ================================================================

# 43. UNIT TESTS

# ================================================================

Test:

coordinate transforms

mirror transforms

distance calculations

palm centre

palm width

finger extension logic

pinch detection

gesture scoring

gesture dwell

cooldown

hysteresis

smoothing

velocity

wipe interpolation

fog mask modification

fog regeneration

undo

redo

mode transitions

preferences

capture composition utilities

# ================================================================

# 44. GESTURE REGRESSION TESTS

# ================================================================

Every gesture fixture should produce deterministic expected events.

Example:

open-palm-left.json

Expected:

OPEN_PALM_START
WIPE_START
WIPE_MOVE × N
WIPE_END

Not:

DRAW
PINCH
CLEAR_ALL

Fail the test if behaviour unexpectedly changes.

# ================================================================

# 45. E2E TESTS

# ================================================================

Use Playwright.

Automated E2E must NOT require a physical webcam.

Use:

MockHandProvider

and fake/test video input.

Required flows:

Application loads

Landing page works

Camera onboarding works

Simulated permission success

Permission failure state

Calibration

Enter mirror

Fog appears

Palm wipe changes fog

Index writing changes fog

Undo

Redo

Reset

Switch modes

Magic Reveal

Clear mirror

Tracking lost

Tracking restored

Change quality mode

Open/close controls

Photo capture

Mobile viewport

Backend/network unavailable if applicable

# ================================================================

# 46. VISUAL REGRESSION

# ================================================================

Make visual snapshots deterministic.

Control:

random seed

animation time

test viewport

fake video frame

gesture sequence

fog configuration

Screenshots:

landing page

permission screen

initial mirror

fully fogged mirror

partially wiped mirror

drawn heart

magic reveal

full clear

re-fogging state

gesture UI

mobile layout

Do NOT automatically approve visual snapshots after every change.

Investigate differences.

# ================================================================

# 47. REAL CAMERA MANUAL TESTS

# ================================================================

Automated fixtures cannot fully replace real camera testing.

Maintain:

docs/MANUAL_CAMERA_TESTS.md

Test:

bright room

dim room

strong backlighting

cluttered background

plain background

different hand sizes

different skin tones

left hand

right hand

two hands

hand entering frame

hand exiting frame

fast swipe

slow swipe

point gesture

pinch

gesture transitions

camera close/open

laptop webcam

mobile camera where possible

# ================================================================

# 48. REGRESSION RULE

# ================================================================

After EVERY meaningful feature:

1. Format.
2. Lint.
3. Type check.
4. Run relevant unit tests.
5. Run gesture regression tests.
6. Run relevant E2E tests.
7. Run full automated regression suite.
8. Production build.
9. Review console warnings.
10. Review git diff.
11. Update documentation.
12. Commit only when stable.

Do NOT leave testing until the end.

# ================================================================

# 49. CI

# ================================================================

Create a free GitHub Actions workflow if repository hosting allows it.

On pull request / push:

npm ci

lint

typecheck

unit tests

gesture regression

Playwright tests where practical

production build

Fail CI if critical tests fail.

# ================================================================

# 50. AGENT MEMORY SYSTEM

# ================================================================

THIS IS MANDATORY.

Create:

docs/AGENT_MEMORY.md
docs/ARCHITECTURE.md
docs/DECISIONS.md
docs/FEATURE_MATRIX.md
docs/TEST_MATRIX.md
docs/KNOWN_ISSUES.md
docs/ROADMAP.md
docs/MANUAL_CAMERA_TESTS.md
docs/SESSION_HANDOFF.md

# ================================================================

# 51. AGENT_MEMORY.md

# ================================================================

This file is the agent's short-term persistent project memory.

At the START of every new coding session:

READ IT FIRST.

At the END of meaningful work:

UPDATE IT.

Keep sections:

PROJECT STATE

CURRENT MILESTONE

WORKING FEATURES

IMPORTANT ARCHITECTURE

NON-NEGOTIABLE CONSTRAINTS

OPEN PROBLEMS

RECENTLY VERIFIED TESTS

NEXT THREE ACTIONS

Keep this file concise.

Do NOT turn it into a massive development diary.

# ================================================================

# 52. ARCHITECTURE.md

# ================================================================

Document:

system architecture

module boundaries

render pipeline

vision pipeline

coordinate systems

gesture state machine

fog state model

testing architecture

persistence model

privacy model

# ================================================================

# 53. DECISIONS.md

# ================================================================

Every major architecture decision uses:

Decision ID

Date

Decision

Context

Reason

Alternatives Considered

Consequences

Revisit Condition

Example:

D-001

Decision:
Use Canvas2D for initial fog renderer.

Reason:
Lower complexity and easier deterministic testing.

Alternative:
Three.js/WebGL.

Revisit:
Only if profiling shows Canvas cannot maintain required performance.

# ================================================================

# 54. FEATURE_MATRIX.md

# ================================================================

Track:

Feature
Status
Unit tested?
Gesture regression?
E2E?
Visual regression?
Manual verification?
Notes

Statuses:

NOT STARTED

IN PROGRESS

IMPLEMENTED

AUTOMATED TESTED

MANUALLY VERIFIED

DONE

# ================================================================

# 55. TEST_MATRIX.md

# ================================================================

Map every important feature to tests.

Example:

Palm Wipe

Unit:
wipe interpolation

Gesture:
open-palm-left.json

E2E:
mirror-wipe.spec.ts

Visual:
mirror-partially-cleared.png

Manual:
fast/slow real-camera swipe

# ================================================================

# 56. SESSION_HANDOFF.md

# ================================================================

At end of each coding session maintain:

What changed

What was tested

What currently works

What remains broken

Relevant files

Next recommended action

This lets another AI coding session continue without rediscovering
the repository.

# ================================================================

# 57. COMMIT DISCIPLINE

# ================================================================

Use Git throughout development.

ONE logical change per commit.

Use Conventional Commits.

Examples:

chore(project): initialize mirror application

test(project): configure automated test framework

feat(camera): add mirrored webcam controller

feat(fog): implement procedural condensation mask

feat(vision): integrate MediaPipe hand tracking

feat(gestures): add open-palm recognition

feat(interaction): add continuous palm wiping

feat(writing): add fingertip fog drawing

feat(reveal): add spatial magic reveal mode

test(gestures): add recorded hand fixtures

perf(fog): reduce condensation render cost

fix(gestures): prevent pinch from triggering draw mode

# ================================================================

# 58. FORBIDDEN COMMIT MESSAGES

# ================================================================

Never use:

update

changes

fix stuff

final

latest

wip

working

misc

# ================================================================

# 59. COMMIT PROCESS

# ================================================================

Before every commit:

git status

review changed files

remove debugging code

remove temporary files

remove accidental screenshots

check for credentials/secrets

run tests

production build

review diff

then commit.

# ================================================================

# 60. COMMIT TRACKING FILE

# ================================================================

Maintain:

docs/COMMIT_PLAN.md

This is NOT a duplicate of Git history.

It should contain only:

CURRENT UNCOMMITTED WORK

PROPOSED NEXT COMMIT

FILES EXPECTED

TESTS REQUIRED

After a commit succeeds:

clear completed work from COMMIT_PLAN.md

and prepare the next logical commit.

This helps prevent giant mixed commits.

# ================================================================

# 61. DO NOT DESTROY EXISTING WORK

# ================================================================

Before changing architecture:

inspect existing implementation.

Do not rewrite a working subsystem merely because you would have
written it differently.

Prefer incremental improvement.

Before deleting:

search references.

Before renaming:

check public imports.

Before dependency replacement:

identify impact.

# ================================================================

# 62. SECURITY

# ================================================================

Never commit:

credentials

private tokens

API keys

environment secrets

Before every release:

dependency audit

secret scan

review browser permissions

review CSP/security headers if applicable

sanitize user-provided text/content

avoid unsafe HTML insertion

# ================================================================

# 63. PERFORMANCE DEBUG MODE

# ================================================================

Developer-only diagnostics may show:

Render FPS

Vision FPS

Vision latency

Fog render duration

Number of droplets

Detected hands

Active gesture

Gesture confidence

Memory observations where available

Do not show this in normal user mode.

# ================================================================

# 64. DESIGN QUALITY BAR

# ================================================================

Do not settle for:

"technically functional."

After core interaction works, perform dedicated polish iterations.

Review:

spacing

typography

animations

fog realism

camera quality

gesture feedback

loading transitions

empty states

permission states

button appearance

responsive layout

visual hierarchy

animation timing

microinteractions

The site should feel intentional.

# ================================================================

# 65. ANIMATION PRINCIPLES

# ================================================================

Prefer:

soft

physical

subtle

organic

Avoid:

bouncy SaaS animation

excessive zoom

random spinning

gratuitous particles

Animations should reinforce the mirror illusion.

# ================================================================

# 66. AUDIO

# ================================================================

Do not add sound simply because the site is interactive.

If eventually used:

very subtle atmospheric effects

must be muted by default or easily controllable

never block functionality.

# ================================================================

# 67. FALLBACK INTERACTION

# ================================================================

Mouse:

drag = wipe

drawing mode + drag = write

Touch:

drag = wipe/write

This lets users experience the site even without computer vision.

# ================================================================

# 68. DEVELOPMENT MILESTONES

# ================================================================

Proceed in this order.

MILESTONE 0 — REPOSITORY FOUNDATION

Set up:

React
TypeScript
Vite
linting
formatting
Vitest
Playwright
folder structure
documentation
Git
CI

Create memory files.

No visual feature work until foundation is stable.

MILESTONE 1 — MIRROR

Implement:

camera permission

webcam feed

mirrored display

camera lifecycle

permission failure states

mouse interaction fallback

Test everything.

MILESTONE 2 — FOG

Implement:

persistent fog mask

procedural condensation

noise

edge fog

basic droplets

wipe brush

re-fogging

Test deterministically.

MILESTONE 3 — COMPUTER VISION

Integrate:

MediaPipe

HandTrackingProvider

hand landmarks

tracking confidence

debug skeleton

coordinate conversion

MockHandProvider

MILESTONE 4 — CALIBRATION

Implement calibration flow.

Test skipped and completed states.

MILESTONE 5 — GESTURES

Implement:

open palm

index point

pinch

fist

two-finger

two-hand clear

dwell

hysteresis

cooldowns

gesture state machine

MILESTONE 6 — PHYSICAL PALM WIPE

Connect:

open palm +
movement +
palm scale

to realistic fog wiping.

This is the flagship interaction.

Spend sufficient time making it good.

MILESTONE 7 — FOG WRITING

Implement fingertip drawing.

Undo.

Redo.

Clear.

MILESTONE 8 — MAGIC REVEAL

Implement hidden image/message reveal.

Ensure reveal is spatial.

MILESTONE 9 — CAPTURE

Photo/export.

Optional local recording.

MILESTONE 10 — GESTURE LAB

Create /lab.

Record gestures.

Save/replay landmark fixtures.

MILESTONE 11 — REGRESSION HARDENING

Expand:

unit tests

fixture tests

E2E

visual regression

manual camera matrix

MILESTONE 12 — PERFORMANCE

Profile first.

Then optimize actual bottlenecks.

MILESTONE 13 — POLISH

Cinematic UI.

Transitions.

Mobile.

Accessibility.

Privacy copy.

Error recovery.

MILESTONE 14 — OPTIONAL EXPERIMENTS

Only after stable product:

breath-to-fog

frost

rain

secret mirror

neon

other creative modes.

# ================================================================

# 69. DEVELOPMENT LOOP FOR EVERY MILESTONE

# ================================================================

Before implementation:

READ:

AGENT_MEMORY.md

ARCHITECTURE.md

DECISIONS.md

FEATURE_MATRIX.md

TEST_MATRIX.md

Inspect current code.

Then state internally:

Goal

Files affected

Architecture impact

Regression risks

Testing strategy

Implement the smallest coherent version.

Then:

run tests

manually inspect where required

fix defects

refactor duplication

run complete regression

production build

update documentation

update memory

review diff

commit

Then proceed.

# ================================================================

# 70. BUG FIXING RULE

# ================================================================

When a bug is discovered:

DO NOT immediately patch symptoms.

First:

reproduce bug

identify cause

create regression test where practical

fix underlying cause

run related tests

run full regression

document if significant

commit separately where appropriate

# ================================================================

# 71. ANTI-HALLUCINATION DEVELOPMENT RULE

# ================================================================

Never say:

"Implemented successfully"

unless:

the code exists

it compiles

appropriate tests pass

and the feature has been reasonably validated.

If something cannot be validated automatically, explicitly mark:

MANUAL VERIFICATION REQUIRED.

# ================================================================

# 72. ANTI-VIBE-CODING FAILURE RULES

# ================================================================

You ARE encouraged to move quickly with AI.

You are NOT allowed to:

generate enormous unreviewed code dumps

duplicate existing modules

create fake tests

comment out failing tests

delete tests to make CI green

silence TypeScript errors using `any`

ignore console errors

hardcode arbitrary numbers throughout code

introduce dependencies for trivial functionality

switch frameworks midway without reason

rebuild stable features unnecessarily

skip documentation

skip regression testing

claim something works without evidence

# ================================================================

# 73. TYPESCRIPT QUALITY

# ================================================================

Use strict typing.

Avoid `any`.

Prefer descriptive domain types.

Examples:

HandTrackingFrame

NormalizedPoint

PalmMetrics

GestureCandidate

GestureEvent

FogBrushStroke

FogConfiguration

MirrorMode

CalibrationProfile

# ================================================================

# 74. CONFIGURATION

# ================================================================

Centralize tunable parameters.

Example:

config/gestureConfig.ts

config/fogConfig.ts

config/performanceConfig.ts

Parameters may include:

gesture confidence

dwell duration

pinch threshold

smoothing strength

wipe radius multiplier

fog density

fog regeneration speed

droplet count

inference FPS

Do not bury magic numbers inside components.

# ================================================================

# 75. RANDOMNESS

# ================================================================

Procedural fog may use randomness.

Support seeded deterministic randomness.

Production:

random seed automatically generated.

Testing:

fixed seed.

This is essential for visual regression.

# ================================================================

# 76. PRODUCT ANALYTICS

# ================================================================

Do NOT introduce external analytics initially.

If usage statistics are useful during development:

developer-local diagnostics only.

Privacy before analytics.

# ================================================================

# 77. BACKEND DECISION GATE

# ================================================================

Before creating ANY backend ask:

Can this be done locally?

If yes:

keep it local.

Only create backend when implementing something such as:

shared Secret Mirror

shareable saved creation

cross-device persistence

public gallery

Even then:

send only data required for that feature.

Never send webcam/video by default.

# ================================================================

# 78. FUTURE SHARE ARCHITECTURE

# ================================================================

For Secret Mirror future architecture:

Creator
↓
message/image configuration
↓
server stores encrypted/minimal share payload
↓
random share ID
↓
recipient opens URL
↓
mirror loads payload
↓
fog initially hides it
↓
hand reveal

Do NOT implement until core mirror is excellent.

# ================================================================

# 79. DEFINITION OF DONE — FEATURE LEVEL

# ================================================================

A feature is DONE only when:

implementation exists

types are correct

error state considered

tests written

tests pass

regressions pass

production build passes

documentation updated

FEATURE_MATRIX updated

AGENT_MEMORY updated

commit created

# ================================================================

# 80. DEFINITION OF DONE — PROJECT LEVEL

# ================================================================

Project V1 is complete only when:

Camera permission works.

Camera lifecycle works.

Video behaves as a mirror.

Fog is visually convincing.

Fog exists as persistent state.

Palm wipe works.

Palm wipe scales with hand.

Finger writing works.

Gesture jitter is controlled.

Incorrect gesture activation is reasonably minimized.

Calibration works.

Fog slowly regenerates.

Magic Reveal works spatially.

Mouse fallback works.

Mobile layout does not break.

Camera data stays local.

Photo capture works.

MockHandProvider works.

Gesture fixtures exist.

Gesture regression tests exist.

E2E suite passes.

Production build passes.

Manual camera test matrix has been executed.

No secrets are committed.

Documentation is current.

Git history is clean.

The final experience feels polished rather than experimental.

# ================================================================

# 81. INITIAL PROJECT EXECUTION

# ================================================================

START BY DOING THE FOLLOWING.

DO NOT immediately build the entire application.

STEP 1

Inspect the existing repository.

Determine whether code already exists.

Never overwrite existing work without understanding it.

STEP 2

Study the Pinterest references if accessible.

Extract visual principles rather than copying them.

STEP 3

Verify proposed dependencies are free/open-source.

STEP 4

Create or update:

MASTER_PROMPT.md

docs/AGENT_MEMORY.md

docs/ARCHITECTURE.md

docs/DECISIONS.md

docs/FEATURE_MATRIX.md

docs/TEST_MATRIX.md

docs/KNOWN_ISSUES.md

docs/ROADMAP.md

docs/SESSION_HANDOFF.md

docs/COMMIT_PLAN.md

docs/MANUAL_CAMERA_TESTS.md

STEP 5

Create architecture plan.

Do NOT overengineer.

STEP 6

Create milestone plan.

STEP 7

Initialize test infrastructure BEFORE complex feature development.

STEP 8

Complete Milestone 0.

STEP 9

Run regression/build.

STEP 10

Create clean commit.

STEP 11

Continue milestone by milestone autonomously.

# ================================================================

# 82. WHEN TO STOP AND ASK ME

# ================================================================

Do NOT ask me for routine implementation decisions.

Make reasonable senior-engineer decisions yourself.

STOP and ask me only if:

a paid service would be required

credentials are required

existing user data could be deleted

a destructive migration is needed

a fundamental product direction must change

a major architecture replacement is proposed

a reference requirement is genuinely contradictory

there is no safe reasonable assumption

# ================================================================

# 83. WHEN NOT TO ASK ME

# ================================================================

Do NOT repeatedly ask:

"Should I create this file?"

"Should I install Vitest?"

"Should I add tests?"

"Should I fix the lint error?"

"Should I continue?"

Those decisions are already authorized by this specification.

Continue autonomously.

# ================================================================

# 84. FINAL PRINCIPLE

# ================================================================

The final result should make someone think:

"How is the screen actually reacting to my hand?"

not:

"This is a webcam demo."

Prioritize, in order:

1. Interaction realism
2. Reliability
3. Visual polish
4. Privacy
5. Performance
6. Testing quality
7. Maintainability
8. Additional features

A small, beautiful, extremely reliable Fog Mirror is better than
twenty poorly implemented modes.

BEGIN NOW.

First inspect the repository and documentation.

Then establish project memory, architecture and testing.

Then implement Milestone 0.

Do not skip ahead.

Continue from AGENT_MEMORY.md. Complete the next unfinished milestone. Follow MASTER_PROMPT.md strictly. Test everything, run regression, update memory and create one clean commit before continuing.
