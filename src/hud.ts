/** Visibility is explicit; moving across the glass never closes controls. */
export function installHud() {
  const toggle = document.querySelector<HTMLButtonElement>("#controls-toggle")!;
  const show = (visible: boolean) => {
    document.body.classList.toggle("hud-visible", visible);
    toggle.textContent = visible ? "Hide controls" : "Controls";
    toggle.setAttribute("aria-expanded", String(visible));
    for (const id of ["dock", "tools"])
      document.getElementById(id)!.inert = !visible;
  };
  toggle.addEventListener("click", () =>
    show(!document.body.classList.contains("hud-visible")),
  );
  return {
    enter() {
      toggle.hidden = false;
      show(true);
    },
    reveal() {
      if (document.body.classList.contains("started")) show(true);
    },
  };
}
