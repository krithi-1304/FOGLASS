# FOGLASS 1.0.0

## Standard V1 scope

- Local webcam mirror with GPU fog, water trails, finger drawing and palm wiping.
- Explicit microphone opt-in, microphone selection, breath calibration and a
  Test my breath flow. Mouse, touch and keyboard controls remain available.
- Persistent controls, undo/redo, deliberate steam and optional natural regrowth.
- Local image/message reveal, PNG capture and short video export.
- Local/portable Letters and optional hosted sharing, replies and owner deletion.
- Diagnostic landmark replay and an experimental compatible-headset WebXR mode.

Camera and microphone processing stay on-device. Hosted Letters store their
validated text/stroke content, not camera or microphone recordings. Share links
grant access to anyone who has the link; this is not end-to-end encrypted storage.

## Release validation — 2026-10-23

- Lint, frontend/backend type checks and 72 unit tests pass.
- All 46 Chromium browser tests pass, including real model initialization,
  fake-media input, Letters/D1 integration, visual comparisons and performance.
- Production build and Pages packaging pass. The release-file guard rejects
  accidental environment files and missing/renamed model assets.
- Self-hosted WASM files match the installed MediaPipe package byte-for-byte.
- Dependency audit reports zero known advisories at audit time.

## Repository and exposure audit

- Fetched GitHub's master history; Gitleaks 8.30.1 found no secrets in all 31
  reachable commits before release preparation. Scanner checksum verified
  against its official release checksums; report values were redacted.
- GitHub secret-scanning alerts returned an empty list. No pull requests or
  existing releases were present at audit time.
- Historical path review found no tracked environment credentials, private keys,
  local database files, dependency directories or test-output directories.
  `.env.example` is an empty configuration template.
- Public Worker URLs and the D1 database identifier are configuration, not
  authentication credentials. Original build briefs are intentionally preserved
  documentation; local user notes remain ignored and excluded from builds.
- Retained CI failure artifacts contain automated test screenshots and error
  contexts. Scan results and publication verification are recorded in MEMORY.md.

These checks are evidence of no detected exposure, not a guarantee that every
possible secret or vulnerability has been ruled out. Remote unreachable/deleted
objects, third-party copies and external account settings are outside this audit.

## Before announcing general availability

Run [the manual input checklist](MANUAL_CAMERA_TESTS.md) on the intended release
devices. Physical hand accuracy, lighting/occlusion, actual blowing and headset
compatibility remain unverified. Breath may respond to speech or fans; WebXR is
experimental. Do not advertise universal hardware support or perfect detection.

Full-duration hosted expiry and scheduled cleanup have not been observed over
their complete waiting periods. Automated expiry/authorization checks pass.
See [known issues](KNOWN_ISSUES.md) for the remaining limitations.

The GitHub V1 release is prepared as a draft so the maintainer can complete these
device checks before publishing the version announcement. Master continues to
deploy the checked website through CI.
