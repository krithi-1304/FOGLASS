import { it, expect } from "vitest";
import { recordingMime } from "../../src/capture";
it("selects a supported recording format with a clean unavailable result", () => {
  expect(recordingMime((t) => t === "video/mp4")).toBe("video/mp4");
  expect(recordingMime(() => true)).toBe("video/webm;codecs=vp9");
  expect(recordingMime(() => false)).toBe("");
});
