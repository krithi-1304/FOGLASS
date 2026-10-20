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
  private async request(constraints: MediaStreamConstraints) {
    let expired = false;
    let timer: ReturnType<typeof setTimeout>;
    const request = navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (expired || this.disposed) {
          stream.getTracks().forEach((t) => t.stop());
          throw new Error("Request ended");
        }
        this.streams = this.streams.filter((s) => s.active);
        this.streams.push(stream);
        return stream;
      });
    try {
      return await Promise.race([
        request,
        new Promise<MediaStream>((_, reject) => {
          timer = setTimeout(() => {
            expired = true;
            reject(new Error("Permission request timed out"));
          }, 12000);
        }),
      ]);
    } finally {
      clearTimeout(timer!);
    }
  }
  async start(): Promise<string> {
    if (this.phase === "ready" && this.video.srcObject)
      return "Camera ready · show your hand.";
    if (!navigator.mediaDevices?.getUserMedia)
      return "Camera unavailable. Hold B to fog; drag to draw.";
    this.phase = "requesting";
    try {
      const stream = await this.request({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      if (this.disposed) return "";
      this.phase = "playing";
      this.video.srcObject = stream;
      await this.video.play();
      this.phase = "ready";
      return "Hold B to fog · drag to draw · C clear · S save";
    } catch {
      this.phase = "fallback";
      return "Camera unavailable or permission denied. Hold B to fog; drag to draw.";
    }
  }
  async microphone(deviceId = "") {
    return this.request({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
      },
      video: false,
    });
  }
  stop() {
    this.disposed = true;
    this.streams.forEach((s) => s.getTracks().forEach((t) => t.stop()));
    this.streams = [];
    this.video.pause();
    this.video.srcObject = null;
  }
}
