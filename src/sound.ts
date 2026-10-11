/** Optional synthesized room tone; no microphone or downloaded audio. */
export class RoomSound {
  private context: AudioContext | undefined;
  private tone: GainNode | undefined;
  private squeak: GainNode | undefined;
  enabled = false;
  async toggle() {
    if (!this.context) {
      const context = new AudioContext();
      this.context = context;
      const buffer = context.createBuffer(
        1,
        context.sampleRate * 2,
        context.sampleRate,
      );
      const values = buffer.getChannelData(0);
      let previous = 0;
      for (let i = 0; i < values.length; i++) {
        previous = 0.985 * previous + (Math.random() - 0.5) * 0.015;
        values[i] = previous;
      }
      const noise = context.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      this.tone = context.createGain();
      this.tone.gain.value = 0;
      noise.connect(this.tone).connect(context.destination);
      noise.start();
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = 720;
      this.squeak = context.createGain();
      this.squeak.gain.value = 0;
      oscillator.connect(this.squeak).connect(context.destination);
      oscillator.start();
    }
    await this.context.resume();
    this.enabled = !this.enabled;
    this.tone!.gain.setTargetAtTime(
      this.enabled ? 0.11 : 0,
      this.context.currentTime,
      0.2,
    );
    if (!this.enabled)
      this.squeak!.gain.setTargetAtTime(0, this.context.currentTime, 0.025);
    return this.enabled;
  }
  stroke() {
    if (!this.enabled || !this.context || !this.squeak) return;
    const now = this.context.currentTime;
    this.squeak.gain.cancelScheduledValues(now);
    this.squeak.gain.setTargetAtTime(0.003, now, 0.025);
    this.squeak.gain.setTargetAtTime(0, now + 0.045, 0.04);
  }
  dispose() {
    if (this.context?.state !== "closed") void this.context?.close();
    this.enabled = false;
  }
}
