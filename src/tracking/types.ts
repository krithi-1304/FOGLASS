export interface Point {
  x: number;
  y: number;
  z: number;
}
export interface TrackedHand {
  landmarks: Point[];
  worldLandmarks?: Point[];
  handednessConfidence?: number;
  confidence: number;
  handedness: "Left" | "Right";
}
export interface HandFrame {
  timestamp: number;
  hands: TrackedHand[];
}
export interface HandTrackingProvider {
  initialize(): Promise<void>;
  start(video: HTMLVideoElement): Promise<void>;
  stop(): void;
  onFrame(callback: (frame: HandFrame) => void): () => void;
}
export interface GestureRecording {
  version: 1;
  name: string;
  frames: HandFrame[];
}
export function parseRecording(value: unknown): GestureRecording {
  if (!value || typeof value !== "object")
    throw new Error("Expected a gesture recording");
  const r = value as GestureRecording;
  if (
    r.version !== 1 ||
    typeof r.name !== "string" ||
    r.name.length > 100 ||
    !Array.isArray(r.frames) ||
    !r.frames.length ||
    r.frames.length > 18000
  )
    throw new Error("Invalid recording header or frame count");
  let last = -1;
  for (const f of r.frames) {
    if (
      !Number.isFinite(f.timestamp) ||
      f.timestamp < 0 ||
      f.timestamp <= last ||
      !Array.isArray(f.hands) ||
      f.hands.length > 2
    )
      throw new Error("Invalid frame");
    last = f.timestamp;
    for (const h of f.hands) {
      if (
        !Number.isFinite(h.confidence) ||
        h.confidence < 0 ||
        h.confidence > 1 ||
        !["Left", "Right"].includes(h.handedness) ||
        !Array.isArray(h.landmarks) ||
        h.landmarks.length !== 21
      )
        throw new Error("Invalid hand");
      if (
        h.worldLandmarks &&
        (!Array.isArray(h.worldLandmarks) || h.worldLandmarks.length !== 21)
      )
        throw new Error("Invalid world landmarks");
      for (const p of [...h.landmarks, ...(h.worldLandmarks || [])])
        if (
          !p ||
          ![p.x, p.y, p.z].every(Number.isFinite) ||
          Math.abs(p.x) > 3 ||
          Math.abs(p.y) > 3 ||
          Math.abs(p.z) > 3
        )
          throw new Error("Invalid landmark");
    }
  }
  return structuredClone(r);
}
