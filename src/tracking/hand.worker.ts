import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
let model: HandLandmarker | undefined;
self.onmessage = async (event: MessageEvent) => {
  const data = event.data;
  try {
    if (data.type === "init") {
      const files = await FilesetResolver.forVisionTasks(
        data.base + "wasm",
        true,
      );
      model = await HandLandmarker.createFromOptions(files, {
        baseOptions: {
          modelAssetPath: data.base + "models/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });
      self.postMessage({ type: "ready" });
    } else if (data.type === "frame" && model) {
      const start = performance.now();
      const result = model.detectForVideo(data.bitmap, data.timestamp);
      self.postMessage({
        type: "frame",
        timestamp: data.timestamp,
        inferenceMs: performance.now() - start,
        hands: result.landmarks.map((landmarks, i) => ({
          landmarks,
          confidence: result.handedness[i]?.[0]?.score || 0,
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
