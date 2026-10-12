export class BreathDetector {
  floor = 0.00025;
  strength = 0;
  active = false;
  calibrated = false;
  thresholdMultiplier = 2.8;
  minEnergy = 0.00012;
  energy = 0;
  threshold = 0.0012;
  flatness = 0;
  noiseLike = false;
  sensitivity = 1;
  private calibration: number[] = [];
  recalibrate() {
    this.started = -1;
    this.calibration = [];
    this.active = false;
    this.calibrated = false;
    this.attack = this.release = 0;
    this.strength = 0;
  }
  private started = -1;
  private attack = 0;
  private release = 0;
  update(
    spectrum: Float32Array,
    sampleRate: number,
    fftSize: number,
    time: number,
  ) {
    if (this.started < 0) this.started = time;
    let sum = 0,
      weights = 0,
      log = 0,
      powerSum = 0,
      count = 0,
      peak = 0;
    const powers: number[] = [];
    for (let i = 1; i < spectrum.length; i++) {
      const f = (i * sampleRate) / fftSize;
      if (f < 70 || f > 2400) continue;
      const power = Math.pow(10, spectrum[i] / 10),
        weight = 1 / (1 + (f / 900) ** 2);
      sum += power * weight;
      weights += weight;
      if (f < 1400) {
        log += Math.log(Math.max(power, 1e-14));
        powerSum += power;
        count++;
        peak = Math.max(peak, power);
        powers.push(power);
      }
    }
    const energy = Math.sqrt(sum / Math.max(1, weights));
    const flatness =
      Math.exp(log / Math.max(1, count)) /
      (powerSum / Math.max(1, count) + 1e-14);
    this.energy = energy;
    this.flatness = flatness;
    if (time - this.started < 800) {
      this.calibration.push(energy);
      const sorted = [...this.calibration].sort((a, b) => a - b);
      this.floor = sorted[Math.floor((sorted.length - 1) * 0.2)];
      this.strength = 0;
      return 0;
    }
    this.calibrated = true;
    const threshold =
      Math.max(this.minEnergy, this.floor * this.thresholdMultiplier) /
      this.sensitivity;
    this.threshold = threshold;
    const spread = powers.filter((power) => power >= peak * 0.01).length;
    const noise =
      flatness > 0.12 ||
      (spread >= 4 && peak / Math.max(powerSum, 1e-14) < 0.8);
    this.noiseLike = noise;
    const above = energy > threshold * (this.active ? 0.58 : 1) && noise;
    if (above) {
      this.release = 0;
      if (!this.attack) this.attack = time;
      if (time - this.attack >= 60) this.active = true;
    } else {
      this.attack = 0;
      if (!this.release) this.release = time;
      if (time - this.release > 180) this.active = false;
    }
    if (!this.active && energy < threshold)
      this.floor +=
        (energy < this.floor ? 0.08 : 0.002) * (energy - this.floor);
    this.strength = this.active
      ? Math.min(
          1,
          Math.max(0.25, Math.log2(Math.max(1, energy / threshold)) / 2),
        )
      : 0;
    return this.strength;
  }
}
export class BreathMonitor {
  readonly detector = new BreathDetector();
  private analyser: AnalyserNode;
  private source: MediaStreamAudioSourceNode;
  private spectrum: Float32Array<ArrayBuffer>;
  private timer: ReturnType<typeof setInterval>;
  constructor(
    private context: AudioContext,
    private stream: MediaStream,
    onBreath: (strength: number) => void,
  ) {
    this.analyser = context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.25;
    this.source = context.createMediaStreamSource(stream);
    this.source.connect(this.analyser);
    this.spectrum = new Float32Array(this.analyser.frequencyBinCount);
    this.timer = setInterval(() => {
      this.analyser.getFloatFrequencyData(this.spectrum);
      const strength = this.detector.update(
        this.spectrum,
        context.sampleRate,
        this.analyser.fftSize,
        performance.now(),
      );
      if (strength > 0) onBreath(strength);
    }, 25);
  }
  stop() {
    clearInterval(this.timer);
    this.source.disconnect();
    this.analyser.disconnect();
    this.stream.getTracks().forEach((t) => t.stop());
    void this.context.close();
  }
}
