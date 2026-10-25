import { fitPoint } from "./memory";
import {
  emptyLetter,
  MAX_LETTER_BYTES,
  parseLetter,
  type Letter,
} from "./schema";
import {
  decodeLetter,
  encodeLetter,
  LetterCollection,
  type SavedLetter,
} from "./storage";
import { LetterService } from "./client";
import type { LetterEffects } from "./effects";
export function installLetters(
  effects: LetterEffects,
  enter: () => void,
  onWriting: () => void,
  apiBase?: string,
  onCamera?: () => void,
  onClose?: () => void,
  onOpen?: () => void,
) {
  const service = new LetterService(apiBase),
    collection = new LetterCollection();
  const button = document.createElement("button");
  button.id = "letters-toggle";
  button.textContent = "Letters";
  document.querySelector("#dock")!.append(button);
  const dialog = document.createElement("dialog");
  dialog.id = "letter-sheet";
  dialog.setAttribute("aria-labelledby", "letter-heading");
  dialog.innerHTML = `<div class="letter-top"><h2 id="letter-heading">Leave a little mist.</h2><button type="button" id="letter-close" aria-label="Close letters">Close</button></div>
 <p class="letter-intro">A thought, a drawing, a small thing worth finding.</p>
 <div class="letter-tabs"><button id="letter-compose">Write a letter</button><button id="letter-collection">Your collection</button><label class="letter-file">Open a letter<input id="letter-file" type="file" accept=".foglass,.json,application/json"></label></div>
 <section id="letter-envelope" hidden aria-label="Sealed letter"><h3 id="letter-envelope-title"></h3><p id="letter-envelope-from"></p><p id="letter-envelope-hint"></p><div class="letter-buttons"><button id="letter-uncover" class="letter-primary">Uncover the letter</button><button id="letter-camera">Use camera &amp; hand tracking</button></div><p class="letter-note">Camera stays on your device. Microphone is optional.</p></section>
 <form id="letter-form">
 <label>Title<input id="letter-title" maxlength="60" required></label>
 <label>A note beneath the mist<textarea id="letter-message" maxlength="280" rows="3" placeholder="Something you’d like someone to find…"></textarea></label>
 <details id="letter-options"><summary>Atmosphere &amp; little details</summary><label><span>From (optional)</span><input id="letter-from" maxlength="40" autocomplete="nickname"></label>
 <div class="letter-fields"><label>Atmosphere<select id="letter-theme"><option value="rose">Rose dusk</option><option value="moon">Moonlight</option><option value="rain">Rainy morning</option></select></label>
 <label>Uncover with<select id="letter-reveal"><option value="breath">A breath</option><option value="wipe">A wipe</option></select></label>
 <label>A little magic<select id="letter-effect"><option value="memory">Remembered handwriting</option><option value="rain">Rain follows your lines</option><option value="window">Closed shapes become windows</option></select></label></div></details>
 <p id="letter-drawing-note" class="letter-note"></p>
 <div class="letter-buttons"><button type="button" id="letter-draw">Draw on the glass</button><button type="submit" class="letter-primary">Try this letter</button></div>
 </form>
 <section id="letter-saved" hidden aria-label="Saved letters"><div id="letter-list"></div></section>
 <section class="letter-actions" aria-label="Letter actions">
 <div class="letter-buttons"><button id="letter-save">Keep on this device</button><button id="letter-download">Download letter</button><button id="letter-share">Copy share link</button></div>
 <label id="letter-expiry-label" hidden>Link expires<select id="letter-days"><option value="1">Tomorrow</option><option value="7" selected>In a week</option><option value="30">In a month</option></select></label>
 <p id="letter-privacy" class="letter-note"></p><textarea id="letter-link" rows="2" readonly hidden aria-label="Letter share link"></textarea>
 </section>
 <div id="letter-viewer" hidden class="letter-buttons"><button id="letter-replay">Replay handwriting</button><button id="letter-reply">Leave a reply</button><button id="letter-replies" hidden>Read replies</button><button id="letter-leave">Back to mirror</button></div>
 <p id="letter-status" role="status" aria-live="polite"></p>`;
  document.querySelector("#app")!.append(dialog);
  const el = <T extends HTMLElement>(id: string) =>
    dialog.querySelector<T>("#" + id)!;
  const form = el<HTMLFormElement>("letter-form"),
    saved = el<HTMLElement>("letter-saved"),
    status = el<HTMLElement>("letter-status");
  let draft = emptyLetter(),
    entry: SavedLetter | undefined,
    parentId: string | undefined,
    remoteId: string | undefined,
    busy = false;
  let prepared: { key: string; url: string; expiresAt: number } | undefined;
  function invalidateLink() {
    prepared = undefined;
    el<HTMLTextAreaElement>("letter-link").value = "";
    el("letter-link").hidden = true;
  }
  form.addEventListener("input", invalidateLink);
  el("letter-days").addEventListener("change", invalidateLink);
  async function copyLink(url: string) {
    const output = el<HTMLTextAreaElement>("letter-link");
    output.value = url;
    output.hidden = false;
    try {
      await navigator.clipboard.writeText(url);
      notify("Link copied. Anyone with this link can uncover the letter.");
    } catch {
      output.focus();
      output.select();
      output.setSelectionRange(0, output.value.length);
      notify(
        "Link ready. Tap Copy share link again, or copy the selected text.",
      );
    }
    output.scrollIntoView({ block: "nearest" });
  }
  const notify = (message: string) => {
    status.textContent = message;
  };
  const guard = async (action: () => Promise<void> | void) => {
    if (busy) return;
    busy = true;
    dialog.setAttribute("aria-busy", "true");
    try {
      await action();
    } catch (e) {
      notify(
        e instanceof Error ? e.message : "This letter could not be opened.",
      );
    } finally {
      busy = false;
      dialog.removeAttribute("aria-busy");
    }
  };
  function fill(letter: Letter) {
    invalidateLink();
    draft = structuredClone(letter);
    el<HTMLInputElement>("letter-title").value = letter.title;
    el<HTMLTextAreaElement>("letter-message").value = letter.message;
    el<HTMLInputElement>("letter-from").value = letter.from;
    el<HTMLSelectElement>("letter-theme").value = letter.theme;
    el<HTMLSelectElement>("letter-reveal").value = letter.reveal;
    el<HTMLSelectElement>("letter-effect").value = letter.effect;
  }
  function read() {
    return parseLetter({
      ...draft,
      title: el<HTMLInputElement>("letter-title").value,
      message: el<HTMLTextAreaElement>("letter-message").value,
      from: el<HTMLInputElement>("letter-from").value,
      theme: el<HTMLSelectElement>("letter-theme").value,
      reveal: el<HTMLSelectElement>("letter-reveal").value,
      effect: el<HTMLSelectElement>("letter-effect").value,
      strokes: effects.memory.strokes,
    });
  }
  function show() {
    if (!dialog.open) dialog.showModal();
    el("letter-drawing-note").textContent = effects.memory.full
      ? "This letter is full. Save it before starting another."
      : `${effects.memory.strokes.length} drawn marks included. Draw on the glass, then return here.`;
    el("letter-viewer").hidden = !effects.letter;
    el("letter-replies").hidden = !remoteId || !service.available;
  }
  function compose() {
    el("letter-envelope").hidden = true;
    form.hidden = false;
    saved.hidden = true;
    dialog.querySelector<HTMLElement>(".letter-actions")!.hidden = false;
  }
  function seal() {
    form.hidden = true;
    saved.hidden = true;
    el("letter-envelope").hidden = false;
    el("letter-envelope-title").textContent =
      draft.title || "A little mist for you";
    el("letter-envelope-from").textContent = draft.from
      ? "From " + draft.from
      : "Someone left a little of themselves here.";
    el("letter-envelope-hint").textContent =
      draft.reveal === "breath"
        ? "Uncover, then enable breath at the bottom and blow gently. Or hold B."
        : "Wipe with your hand, mouse or finger to find what’s underneath.";
    el("letter-compose").textContent = "Edit a copy";
    dialog.querySelector<HTMLElement>(".letter-actions")!.hidden = false;
  }
  el("letter-uncover").onclick = () => dialog.close();
  el("letter-camera").hidden = !onCamera;
  el("letter-camera").onclick = () => {
    dialog.close();
    onCamera?.();
  };
  async function open(letter: Letter, id?: string) {
    if (!document.body.classList.contains("started")) enter();
    onOpen?.();
    remoteId = id;
    await effects.open(letter);
    fill(letter);
    seal();
    show();
    notify(
      letter.reveal === "breath"
        ? "Close this sheet, then blow or hold B to remember the letter."
        : "Close this sheet and wipe the mist to find the letter.",
    );
  }
  const download = (letter: Letter) => {
    const blob = new Blob([JSON.stringify(parseLetter(letter))], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "a-little-mist.foglass";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  function list() {
    const list = el("letter-list");
    list.replaceChildren();
    const entries = collection.list();
    if (!entries.length) {
      const p = document.createElement("p");
      p.textContent = "Your first little memory belongs here.";
      list.append(p);
    }
    for (const value of entries) {
      const row = document.createElement("div");
      row.className = "letter-row";
      const openButton = document.createElement("button");
      openButton.textContent = value.letter.title || "An untitled letter";
      openButton.onclick = () =>
        void guard(async () => {
          entry = value;
          parentId = undefined;
          await open(value.letter, value.remoteId);
        });
      const remove = document.createElement("button");
      remove.textContent = value.remoteId ? "Delete online & here" : "Remove";
      remove.setAttribute(
        "aria-label",
        "Remove " + (value.letter.title || "untitled letter"),
      );
      remove.onclick = () =>
        void guard(async () => {
          if (value.remoteId && value.deleteToken) {
            try {
              await service.remove(value.remoteId, value.deleteToken);
            } catch (e) {
              notify(
                "Online deletion did not complete. " + (e as Error).message,
              );
              return;
            }
          }
          collection.remove(value.id);
          list.replaceChildren();
          listEntries();
          notify("Letter removed.");
        });
      row.append(openButton, remove);
      list.append(row);
    }
  }
  const listEntries = () => list();
  button.onclick = () => {
    if (effects.letter) seal();
    else compose();
    show();
  };
  el("letter-close").onclick = () => dialog.close();
  dialog.addEventListener("close", () => {
    button.focus();
    onClose?.();
  });
  el("letter-compose").onclick = () => {
    if (effects.letter) {
      entry = undefined;
      remoteId = undefined;
      parentId = undefined;
    }
    compose();
    show();
  };
  el("letter-collection").onclick = () =>
    void guard(() => {
      list();
      form.hidden = true;
      el("letter-envelope").hidden = true;
      saved.hidden = false;
      dialog.querySelector<HTMLElement>(".letter-actions")!.hidden = true;
    });
  el("letter-draw").onclick = () => {
    invalidateLink();
    draft = read();
    if (effects.letter) {
      const aspect = Math.max(0.25, Math.min(4, innerWidth / innerHeight));
      effects.memory.replace(
        draft.strokes.map((stroke) => ({
          ...stroke,
          points: stroke.points.map((p) => fitPoint(p, draft.aspect, aspect)),
        })),
      );
      draft.aspect = aspect;
      effects.close();
    }
    onWriting();
    dialog.close();
  };
  form.onsubmit = (e) => {
    e.preventDefault();
    void guard(async () => {
      draft = read();
      await open(draft, remoteId);
      dialog.close();
    });
  };
  el("letter-save").onclick = () =>
    void guard(() => {
      entry = collection.save(read(), entry);
      notify(
        "Kept on this device. Download a copy to keep it outside this browser.",
      );
    });
  el("letter-download").onclick = () =>
    void guard(() => {
      download(read());
      notify("Letter downloaded. It contains no camera image or audio.");
    });
  el("letter-share").onclick = () =>
    void guard(async () => {
      const letter = read(),
        url = new URL(import.meta.env.BASE_URL, location.origin);
      const days = Number(el<HTMLSelectElement>("letter-days").value);
      const key = JSON.stringify([letter, days, parentId]);
      // A second click must copy synchronously within the new user activation,
      // not create another online letter or wait for compression/network again.
      if (prepared?.key === key && prepared.expiresAt > Date.now()) {
        await copyLink(prepared.url);
        return;
      }
      invalidateLink();
      notify("Preparing your share link…");
      status.scrollIntoView({ block: "nearest" });
      let expiresAt = Infinity;
      url.search = "";
      url.hash = "";
      if (service.available) {
        entry = collection.save(letter, entry?.remoteId ? undefined : entry);
        const remote = await service.create(letter, days, parentId);
        entry = {
          ...entry,
          remoteId: remote.id,
          deleteToken: remote.deleteToken,
          expiresAt: remote.expiresAt,
        };
        remoteId = remote.id;
        expiresAt = remote.expiresAt;
        try {
          collection.save(letter, entry);
        } catch {
          await service.remove(remote.id, remote.deleteToken);
          throw new Error(
            "Your deletion key could not be saved, so the online letter was removed. Download a copy instead.",
          );
        }
        url.hash = "letter=" + remote.id;
      } else {
        const data = await encodeLetter(letter);
        if (data.length > 12000)
          throw new Error(
            "This drawing is too detailed for a portable link. Download the letter instead.",
          );
        url.hash = "mist=" + data;
      }
      prepared = { key, url: url.href, expiresAt };
      await copyLink(url.href);
    });
  el("letter-replay").onclick = () => {
    effects.replay();
    dialog.close();
  };
  el("letter-reply").onclick = () => {
    parentId = remoteId;
    remoteId = undefined;
    entry = undefined;
    const original = draft;
    effects.close();
    effects.memory.replace([]);
    fill({
      ...emptyLetter(),
      title: ("Re: " + original.title).slice(0, 60),
      theme: original.theme,
    });
    compose();
    notify("Your reply is a new letter. The original is unchanged.");
  };
  el("letter-leave").onclick = () => {
    effects.close();
    remoteId = undefined;
    parentId = undefined;
    entry = undefined;
    effects.memory.replace([]);
    fill(emptyLetter());
    dialog.close();
  };
  el("letter-replies").onclick = () =>
    void guard(async () => {
      if (!remoteId) return;
      const values = await service.replies(remoteId);
      form.hidden = true;
      el("letter-envelope").hidden = true;
      saved.hidden = false;
      dialog.querySelector<HTMLElement>(".letter-actions")!.hidden = true;
      const list = el("letter-list");
      list.replaceChildren();
      for (const value of values) {
        const b = document.createElement("button");
        b.className = "letter-reply-row";
        b.textContent =
          (value.letter.from ? value.letter.from + " — " : "") +
          value.letter.title;
        b.onclick = () =>
          void guard(async () => {
            entry = undefined;
            await open(value.letter, value.id);
          });
        list.append(b);
      }
      notify(`${values.length} letters in this conversation.`);
    });
  el<HTMLInputElement>("letter-file").onchange = () =>
    void guard(async () => {
      const input = el<HTMLInputElement>("letter-file"),
        file = input.files?.[0];
      if (!file) return;
      if (file.size > MAX_LETTER_BYTES)
        throw new Error("This letter file is too large.");
      const letter = parseLetter(JSON.parse(await file.text()));
      entry = undefined;
      parentId = undefined;
      await open(letter);
      input.value = "";
    });
  el("letter-expiry-label").hidden = !service.available;
  el("letter-privacy").textContent = service.available
    ? "Only text and drawings are stored online. Anyone with the link can read and reply. Delete your online letters from Your collection."
    : "Portable links contain the letter and do not expire. Anyone with the link can read it. Camera and audio are never included.";
  fill(draft);
  const load = () =>
    void guard(async () => {
      const hash = new URLSearchParams(location.hash.slice(1));
      if (hash.has("mist")) {
        entry = undefined;
        parentId = undefined;
        await open(await decodeLetter(hash.get("mist")!));
      } else if (hash.has("letter")) {
        entry = undefined;
        parentId = undefined;
        const remote = await service.get(hash.get("letter")!);
        await open(remote.letter, remote.id);
      }
    });
  if (location.hash) {
    show();
    notify("Opening your letter…");
    load();
  }
  addEventListener("hashchange", load);
  return {
    show,
    read,
    loadLetter: open,
    get state() {
      return {
        active: !!effects.letter,
        strokes: effects.memory.strokes.length,
        playing: effects.playing,
        droplets: effects.droplets,
        online: service.available,
      };
    },
  };
}
