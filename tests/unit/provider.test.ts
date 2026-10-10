import { describe, it, expect } from "vitest";
import { MockHandProvider } from "../../src/tracking/mock";
import { parseRecording, type HandFrame } from "../../src/tracking/types";
import recording from "../fixtures/gestures/open-palm-left.json";
describe("recorded hand provider", () => {
  it("replays exact landmark frames in order without a camera", async () => {
    const p = new MockHandProvider(),
      seen: HandFrame[] = [];
    const unsubscribe = p.onFrame((f) => seen.push(f));
    const r = parseRecording(recording);
    await p.replay(r);
    expect(seen).toEqual(r.frames);
    unsubscribe();
    await p.replay(r);
    expect(seen).toHaveLength(r.frames.length);
  });
  it("stops delivery and rejects malformed recordings", async () => {
    const p = new MockHandProvider();
    let count = 0;
    p.onFrame(() => count++);
    await p.start();
    p.stop();
    p.emit({ timestamp: 0, hands: [] });
    expect(count).toBe(0);
    expect(() =>
      parseRecording({
        version: 1,
        name: "bad",
        frames: [{ timestamp: 0, hands: [{}] }],
      }),
    ).toThrow();
    expect(() =>
      parseRecording({
        version: 1,
        name: "bad",
        frames: [
          { timestamp: 1, hands: [] },
          { timestamp: 0, hands: [] },
        ],
      }),
    ).toThrow();
  });
});
