export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function savePhoto(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob)
    throw new Error(
      "Photo could not be created. Try again after the mirror loads.",
    );
  downloadBlob(blob, "foglass.png");
}
export function recordingMime(supported: (type: string) => boolean) {
  return (
    [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/mp4",
    ].find(supported) || ""
  );
}
export class MirrorRecorder {
  private recorder: MediaRecorder | undefined;
  private stream: MediaStream | undefined;
  private chunks: Blob[] = [];
  private timer: ReturnType<typeof setTimeout> | undefined;
  private save = true;
  get active() {
    return this.recorder?.state === "recording";
  }
  get supported() {
    return (
      typeof MediaRecorder !== "undefined" &&
      typeof HTMLCanvasElement.prototype.captureStream === "function" &&
      !!recordingMime((t) => MediaRecorder.isTypeSupported(t))
    );
  }
  start(canvas: HTMLCanvasElement, onDone: () => void) {
    if (this.active) return;
    if (!this.supported)
      throw new Error(
        "Video recording is unavailable here. Save a photo instead.",
      );
    const mimeType = recordingMime((t) => MediaRecorder.isTypeSupported(t));
    this.chunks = [];
    this.save = true;
    this.stream = canvas.captureStream(30);
    try {
      this.recorder = new MediaRecorder(this.stream, {
        mimeType,
        videoBitsPerSecond: 3500000,
      });
    } catch (e) {
      this.stream.getTracks().forEach((t) => t.stop());
      throw e;
    }
    this.recorder.ondataavailable = (e) => {
      if (e.data.size) this.chunks.push(e.data);
    };
    this.recorder.onstop = () => {
      clearTimeout(this.timer);
      this.stream?.getTracks().forEach((t) => t.stop());
      if (this.save && this.chunks.length)
        downloadBlob(
          new Blob(this.chunks, { type: mimeType }),
          mimeType.includes("mp4") ? "foglass.mp4" : "foglass.webm",
        );
      this.chunks = [];
      onDone();
    };
    this.recorder.start(250);
    this.timer = setTimeout(() => this.stop(), 10000);
  }
  stop() {
    if (this.recorder?.state === "recording") this.recorder.stop();
  }
  dispose() {
    this.save = false;
    clearTimeout(this.timer);
    this.stop();
    this.stream?.getTracks().forEach((t) => t.stop());
  }
}
