import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

// Fail closed: only application assets belong in a distributable build.
const root = 'dist';
const required = new Set([
  'index.html', 'lab/index.html', 'models/hand_landmarker.task',
  'licenses/Instrument-Serif-OFL.txt', 'licenses/Inter-OFL.txt',
  'licenses/MediaPipe-Apache-2.0.txt',
  ...['internal', 'module_internal', 'nosimd_internal'].flatMap(name =>
    ['js', 'wasm'].map(ext => `wasm/vision_wasm_${name}.${ext}`)),
]);
let assets = 0;
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    const name = relative(root, path).split('\\').join('/');
    if (entry.isSymbolicLink()) throw new Error(`Release symlink: ${name}`);
    if (entry.isDirectory()) {
      if (!['assets', 'lab', 'models', 'licenses', 'wasm'].includes(name))
        throw new Error(`Unexpected release directory: ${name}`);
      await inspect(path);
    } else {
      const asset = /^assets\/[\w.-]+\.(js|css|woff2?)$/.test(name);
      if (!required.has(name) && !asset)
        throw new Error(`Unexpected release file: ${name}`);
      if (!(await stat(path)).size) throw new Error(`Empty release file: ${name}`);
      required.delete(name);
      if (asset) assets++;
    }
  }
}
await inspect(root);
if (required.size) throw new Error(`Missing release files: ${[...required].join(', ')}`);
if (!assets) throw new Error('Missing compiled application assets');
console.log('Release files verified: application assets only; required models, runtimes and licenses present.');
