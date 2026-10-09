export class Camera {
  readonly video = document.createElement("video");
  private streams: MediaStream[] = [];
  private disposed = false;
  phase = "idle";
  constructor() {
    this.video.muted = true;
    this.video.autoplay = true;
    this.video.playsInline = true;
    this.video.style.display = "none";
    document.body.append(this.video);
  }
  async start(): Promise<string> {
    if (!navigator.mediaDevices?.getUserMedia)
      return "Camera unavailable. The dusk preview is ready.";
    this.phase = "requesting";
    const results = await Promise.allSettled([
      navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }),
      navigator.mediaDevices.getUserMedia({ audio: true, video: false }),
    ]);
    this.phase = "permissions-resolved";
    for (const result of results) {
      if (result.status === "fulfilled") {
        if (this.disposed) result.value.getTracks().forEach((t) => t.stop());
        else this.streams.push(result.value);
      }
    }
    if (this.disposed) return "";
    const camera = results[0];
    // Mic permission is requested here; audio processing begins in M3.
    if (results[1].status === "fulfilled")
      results[1].value.getTracks().forEach((t) => t.stop());
    if (camera.status === "rejected")
      return "Camera unavailable or permission denied. Enjoy the dusk preview.";
    this.video.srcObject = camera.value;
    try {
      this.phase = "playing";
      await this.video.play();
      this.phase = "ready";
    } catch {
      this.stop();
      return "Camera could not play. The dusk preview is ready.";
    }
    return results[1].status === "rejected"
      ? "Mirror ready. Microphone unavailable; breath-key fallback arrives with fog."
      : "Mirror ready. Breath and finger drawing are coming in the next milestones.";
  }
  stop() {
    this.disposed = true;
    this.streams.forEach((s) => s.getTracks().forEach((t) => t.stop()));
    this.streams = [];
    this.video.pause();
    this.video.srcObject = null;
  }
}
