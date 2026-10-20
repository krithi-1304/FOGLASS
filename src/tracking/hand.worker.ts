import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { createHandModel } from "./model";
let model: HandLandmarker | undefined;
let delegate: "GPU" | "CPU" = "GPU";
let samples: number[] = [];
let gpuMs = 0;
let compared = false;
self.onmessage = async (event: MessageEvent) => {
  const data = event.data;
  try {
    if (data.type === "init") {
      const files = await FilesetResolver.forVisionTasks(
        data.base + "wasm",
        true,
      );
      const initialized = await createHandModel(
        files,
        data.base + "models/hand_landmarker.task",
      );
      model = initialized.model;
      delegate = initialized.delegate;
      compared = delegate === "CPU";
      self.postMessage({ type: "ready" });
    } else if (data.type === "frame" && model) {
      const inferenceDelegate = delegate;
      const start = performance.now();
      const result = model.detectForVideo(data.bitmap, data.timestamp);
      const inferenceMs = performance.now() - start;
      if (!compared) samples.push(inferenceMs);
      if (!compared && samples.length >= 8) {
        const average = samples.slice(-4).reduce((a, b) => a + b, 0) / 4;
        if (delegate === "GPU" && average > 45) {
          gpuMs = average;
          delegate = "CPU";
          samples = [];
          await model.setOptions({ baseOptions: { delegate } });
        } else if (delegate === "CPU") {
          compared = true;
          if (average > gpuMs * 1.1) {
            delegate = "GPU";
            await model.setOptions({ baseOptions: { delegate } });
          }
        } else compared = true;
      }
      self.postMessage({
        type: "frame",
        delegate: inferenceDelegate,
        timestamp: data.timestamp,
        inferenceMs,
        hands: result.landmarks.map((landmarks, i) => ({
          landmarks,
          // Model presence/detection thresholds already accepted this hand.
          // Handedness probability describes left/right, not tracking quality.
          confidence: 1,
          handednessConfidence: result.handedness[i]?.[0]?.score || 0,
          worldLandmarks: result.worldLandmarks[i],
          handedness:
            result.handedness[i]?.[0]?.categoryName === "Left"
              ? "Left"
              : "Right",
        })),
      });
    }
  } catch (error) {
    self.postMessage({
      type: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    data.bitmap?.close();
  }
};
