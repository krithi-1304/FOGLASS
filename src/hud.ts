/** Controls live at the bottom edge; the mirror stays empty while drawing. */
export function installHud() {
  let keyboard = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const show = (visible: boolean) =>
    document.body.classList.toggle("hud-visible", visible);
  const inside = (target: EventTarget | null) =>
    target instanceof Element && !!target.closest("#dock,#tools");
  document.addEventListener("pointermove", (event) => {
    if (!document.body.classList.contains("started")) return;
    keyboard = false;
    clearTimeout(timer);
    show(
      !event.buttons &&
        (inside(event.target) || event.clientY > innerHeight - 105),
    );
  });
  document.addEventListener("pointerdown", (event) => {
    if (!document.body.classList.contains("started")) return;
    keyboard = false;
    if (event.pointerType === "touch" && event.clientY > innerHeight - 105) {
      show(true);
      clearTimeout(timer);
      timer = setTimeout(() => show(false), 5000);
    } else if (!inside(event.target)) show(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      keyboard = true;
      show(true);
    }
    if (event.key === "Escape") {
      keyboard = false;
      show(false);
    }
  });
  document.addEventListener("focusin", (event) => {
    if (keyboard && inside(event.target)) show(true);
  });
  return {
    enter() {
      show(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!keyboard) show(false);
      }, 4500);
    },
    reveal() {
      show(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!keyboard) show(false);
      }, 4500);
    },
  };
}
