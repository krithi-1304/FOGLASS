import type { Renderer } from "./renderer";
import type { BreathMonitor } from "./breath";
export function installDebug(
  renderer: Renderer,
  breath: () => BreathMonitor | undefined,
) {
  let dispose = () => {};
  let statsFrame = 0;
  const key = async (event: KeyboardEvent) => {
    if (
      event.repeat ||
      (event.target as HTMLElement)?.matches("input,textarea,select")
    )
      return;
    if (event.key.toLowerCase() === "g" && import.meta.env.DEV) {
      const { default: GUI } = await import("lil-gui");
      if (document.querySelector(".lil-gui")) {
        dispose();
        return;
      }
      const gui = new GUI({ title: "Glass studio" });
      gui.add(renderer.fog, "density", 0.1, 1, 0.01);
      gui.add(renderer, "quality", 0.6, 1, 0.05);
      const detector = breath()?.detector;
      if (detector) {
        gui.add(detector, "thresholdMultiplier", 1.2, 6, 0.1);
        gui.add(detector, "minEnergy", 0.0001, 0.01, 0.0001);
      }
      dispose = () => gui.destroy();
    }
    if (event.key.toLowerCase() === "f") {
      const old = document.querySelector("#frame-stats");
      if (old) {
        cancelAnimationFrame(statsFrame);
        old.remove();
        return;
      }
      const { default: Stats } = await import("stats.js");
      const stats = new Stats();
      stats.dom.id = "frame-stats";
      document.body.append(stats.dom);
      const tick = () => {
        stats.update();
        statsFrame = requestAnimationFrame(tick);
      };
      tick();
    }
  };
  addEventListener("keydown", key);
  return () => {
    removeEventListener("keydown", key);
    cancelAnimationFrame(statsFrame);
    dispose();
    document.querySelector("#frame-stats")?.remove();
  };
}
