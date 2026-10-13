import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MediaPipeHandProvider } from "../../src/tracking/mediapipe";
import type { HandFrame } from "../../src/tracking/types";
import recording from "../fixtures/gestures/index-draw-line.json";
class WorkerStub {
  static current: WorkerStub;
  onmessage?: (event: { data: object }) => void;
  postMessage = vi.fn();
  terminate = vi.fn();
  constructor() {
    WorkerStub.current = this;
  }
  send(data: object) {
    this.onmessage?.({ data });
  }
}
beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
      "performance",
    ],
  });
  vi.stubGlobal("Worker", WorkerStub);
  vi.stubGlobal("document", { hidden: false });
  vi.stubGlobal("location", { href: "http://localhost/" });
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn().mockResolvedValue({ close: vi.fn() }),
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it("releases a stale hand when camera callbacks stop and accepts fresh recovery", async () => {
  const provider = new MediaPipeHandProvider();
  const frames: HandFrame[] = [];
  provider.onFrame((f) => frames.push(f));
  const ready = provider.initialize();
  WorkerStub.current.send({ type: "ready" });
  await ready;
  await provider.start({
    readyState: 2,
    currentTime: 1,
    requestVideoFrameCallback: () => 1,
    cancelVideoFrameCallback() {},
  } as unknown as HTMLVideoElement);
  const send = () =>
    WorkerStub.current.send({
      type: "frame",
      timestamp: performance.now(),
      inferenceMs: 15,
      delegate: "CPU",
      hands: recording.frames[0].hands,
    });
  send();
  expect(frames.at(-1)?.hands).toHaveLength(1);
  await vi.advanceTimersByTimeAsync(550);
  expect(frames.at(-1)?.hands).toHaveLength(0);
  send();
  expect(frames.at(-1)?.hands).toHaveLength(1);
  provider.stop();
  expect(vi.getTimerCount()).toBe(0);
});
it("stopping during initialization cancels the timeout and settles initialization", async () => {
  const provider = new MediaPipeHandProvider();
  const rejected = expect(provider.initialize()).rejects.toThrow(
    "Tracking stopped",
  );
  provider.stop();
  await rejected;
  expect(vi.getTimerCount()).toBe(0);
});

it("terminates a hung inference worker instead of remaining busy forever", async () => {
  const provider = new MediaPipeHandProvider();
  const ready = provider.initialize();
  WorkerStub.current.send({ type: "ready" });
  await ready;
  await provider.start({
    readyState: 2,
    currentTime: 1,
    requestVideoFrameCallback: () => 1,
    cancelVideoFrameCallback() {},
  } as unknown as HTMLVideoElement);
  await vi.advanceTimersByTimeAsync(3100);
  expect(provider.error).toBe("");
  await vi.advanceTimersByTimeAsync(17000);
  expect(provider.error).toContain("stalled");
  expect(WorkerStub.current.terminate).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
  provider.stop();
});

it("uses the shorter stall budget after warmup completes", async () => {
  const provider = new MediaPipeHandProvider();
  const ready = provider.initialize();
  WorkerStub.current.send({ type: "ready" });
  await ready;
  for (let i = 0; i < 8; i++)
    WorkerStub.current.send({
      type: "frame",
      timestamp: performance.now(),
      inferenceMs: 15,
      delegate: "CPU",
      hands: [],
    });
  await provider.start({
    readyState: 2,
    currentTime: 1,
    requestVideoFrameCallback: () => 1,
    cancelVideoFrameCallback() {},
  } as unknown as HTMLVideoElement);
  await vi.advanceTimersByTimeAsync(3100);
  expect(provider.error).toContain("stalled");
  expect(vi.getTimerCount()).toBe(0);
  provider.stop();
});

it("starts inference on the newest available video frame immediately after a result", async () => {
  const provider = new MediaPipeHandProvider();
  const ready = provider.initialize();
  WorkerStub.current.send({ type: "ready" });
  await ready;
  const video = {
    readyState: 2,
    currentTime: 1,
    requestVideoFrameCallback: () => 1,
    cancelVideoFrameCallback() {},
  };
  await provider.start(video as unknown as HTMLVideoElement);
  await vi.advanceTimersByTimeAsync(40);
  video.currentTime = 1.033;
  WorkerStub.current.send({
    type: "frame",
    timestamp: 0,
    inferenceMs: 35,
    delegate: "CPU",
    hands: [],
  });
  await Promise.resolve();
  expect(
    WorkerStub.current.postMessage.mock.calls.filter(
      ([m]) => m.type === "frame",
    ),
  ).toHaveLength(2);
  provider.stop();
});
