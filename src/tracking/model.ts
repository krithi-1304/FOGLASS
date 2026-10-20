import { HandLandmarker } from "@mediapipe/tasks-vision";

/** Some browsers expose WebGL2 for the mirror but cannot create a worker GPU context. */
export async function createHandModel(
  files: Parameters<typeof HandLandmarker.createFromOptions>[0],
  path: string,
) {
  const create = (delegate: "GPU" | "CPU") =>
    HandLandmarker.createFromOptions(files, {
      baseOptions: { modelAssetPath: path, delegate },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  try {
    return { model: await create("GPU"), delegate: "GPU" as const };
  } catch {
    return { model: await create("CPU"), delegate: "CPU" as const };
  }
}
