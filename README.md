# FOGLASS

A browser-based fog mirror. Point to draw, open your palm to wipe, and blow to
bring back the steam.

[Try FOGLASS](https://krithi-1304.github.io/FOGLASS/)

## Use

- Start with your camera, or choose **Try without camera** for mouse/touch input.
- Point your index finger to draw; open your palm to wipe.
- Enable the optional microphone for breath input. **Tools → Test my breath**
  helps select and calibrate your microphone.
- Wiped areas stay clear by default. Add steam with fresh breath or hold **B**.
- **C** clears the glass, **S** saves a PNG, and **Space** pauses.
- Letters lets you save and share text and drawings.

## Privacy and compatibility

Camera and microphone processing happen on your device. Optional online Letters
store text and drawings; anyone with a share link can read and reply.

Use a modern browser with WebGL2 over HTTPS or localhost. Tracking depends on
lighting and camera quality. Breath detection is experimental and may respond to
speech or fans. Optional headset support is experimental.

## Run locally

Requires Node.js 22+ and pnpm.

```sh
pnpm install
pnpm dev
```

Built with TypeScript, Vite, WebGL2 and MediaPipe. Models, runtimes and fonts are
served locally. The mirror works without a backend; see [backend setup](backend/README.md)
for optional online Letters.

## Build and test

```sh
pnpm exec playwright install chromium
pnpm check
```

`pnpm build` creates the checked static site in `dist/`. For GitHub Pages, set
`VITE_BASE_PATH=/FOGLASS/`. Automated tests use simulated inputs and do not replace
real camera/microphone testing.

Third-party licenses are in [public/licenses](public/licenses/).
