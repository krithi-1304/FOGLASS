import { downloadBlob } from "./capture";
import { parseRecording, type HandFrame } from "./tracking/types";
import type { HandController } from "./hand";
export function installLab(
  current: () => HandController | undefined,
  replay: (file: unknown) => Promise<void>,
) {
  const panel = document.createElement("aside");
  panel.className = "lab";
  panel.setAttribute("aria-label", "Gesture laboratory");
  panel.innerHTML = `<h2>Gesture laboratory</h2><p>Landmarks only. Nothing is uploaded.</p><pre aria-live="off"></pre><button id="lab-record">Record landmarks</button><label>Replay JSON<input id="lab-file" type="file" accept="application/json,.json"></label><p id="lab-message" role="status"></p>`;
  document.body.append(panel);
  const button = panel.querySelector<HTMLButtonElement>("button")!;
  const message = panel.querySelector<HTMLElement>("#lab-message")!;
  const output = panel.querySelector("pre")!;
  let frames: HandFrame[] | null = null;
  let last = -1,
    start = 0;
  const save = () => {
    if (frames?.length)
      downloadBlob(
        new Blob(
          [
            JSON.stringify({
              version: 1,
              name: "Recorded hand interaction",
              frames,
            }),
          ],
          { type: "application/json" },
        ),
        "foglass-gesture.json",
      );
    else message.textContent = "No hand frames yet. Start the camera first.";
    frames = null;
    button.textContent = "Record landmarks";
  };
  button.onclick = () => {
    if (frames) save();
    else {
      frames = [];
      start = -1;
      last = -1;
      button.textContent = "Save landmarks";
      message.textContent = "Recording up to 60 seconds.";
    }
  };
  const timer = setInterval(() => {
    const hand = current(),
      frame = hand?.lastFrame;
    output.textContent = JSON.stringify(
      {
        ...hand?.metrics(),
        gesture: hand?.state?.gesture,
        speed: hand?.state?.speed,
        pinch: hand?.state?.hand?.pinch,
      },
      null,
      2,
    );
    if (frames && frame && frame.timestamp !== last) {
      if (start < 0) start = frame.timestamp;
      last = frame.timestamp;
      frames.push({
        timestamp: frame.timestamp - start,
        hands: structuredClone(frame.hands),
      });
      if (frame.timestamp - start >= 60000) save();
    }
  }, 33);
  panel.querySelector<HTMLInputElement>("input")!.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      if (file.size > 15_000_000)
        throw new Error("Recording must be under 15 MB.");
      const record = parseRecording(JSON.parse(await file.text()));
      message.textContent = "Replaying recorded landmarks…";
      await replay(record);
      message.textContent = `Replayed ${record.frames.length} frames.`;
    } catch (error) {
      message.textContent = (error as Error).message;
    }
  };
  return () => {
    clearInterval(timer);
    panel.remove();
    frames = null;
  };
}
