import { MAX_LETTER_BYTES, parseLetter, type Letter } from "./schema";
export interface SavedLetter {
  id: string;
  letter: Letter;
  remoteId?: string;
  deleteToken?: string;
  expiresAt?: number;
}
const KEY = "foglass.letters.v1";
export class LetterCollection {
  constructor(
    private storage: Pick<Storage, "getItem" | "setItem"> = localStorage,
  ) {}
  list(): SavedLetter[] {
    const raw = this.storage.getItem(KEY);
    if (!raw) return [];
    try {
      const entries: SavedLetter[] = JSON.parse(raw);
      return entries
        .slice(0, 24)
        .map((e) => ({ ...e, letter: parseLetter(e.letter) }));
    } catch {
      throw new Error(
        "Saved letters could not be read. Your existing storage has not been changed.",
      );
    }
  }
  save(letter: Letter, existing?: SavedLetter) {
    const entry = {
      ...existing,
      id: existing?.id || crypto.randomUUID(),
      letter: parseLetter(letter),
    };
    const list = this.list().filter((e) => e.id !== entry.id);
    if (list.length >= 24)
      throw new Error(
        "Your collection is full. Export or remove a letter first.",
      );
    try {
      this.storage.setItem(KEY, JSON.stringify([entry, ...list]));
    } catch {
      throw new Error(
        "This browser could not save the letter. Download a copy instead.",
      );
    }
    return entry;
  }
  remove(id: string) {
    this.storage.setItem(
      KEY,
      JSON.stringify(this.list().filter((e) => e.id !== id)),
    );
  }
}
export async function readLimited(
  stream: ReadableStream<Uint8Array>,
  limit = MAX_LETTER_BYTES,
) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const r = await reader.read();
      if (r.done) break;
      length += r.value.length;
      if (length > limit) throw new Error("This letter is too large.");
      chunks.push(r.value);
    }
  } catch (e) {
    await reader.cancel();
    throw e;
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.length;
  }
  return bytes;
}
export async function encodeLetter(letter: Letter) {
  const raw = JSON.stringify(parseLetter(letter));
  if (new TextEncoder().encode(raw).length > MAX_LETTER_BYTES)
    throw new Error("This letter is too large.");
  const compressed = await readLimited(
    new Blob([raw]).stream().pipeThrough(new CompressionStream("deflate")),
  );
  let binary = "";
  for (const byte of compressed) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}
export async function decodeLetter(encoded: string): Promise<Letter> {
  if (encoded.length > MAX_LETTER_BYTES || !/^[A-Za-z0-9_-]+$/.test(encoded))
    throw new Error("This letter link is invalid.");
  const bytes = Uint8Array.from(
    atob(encoded.replaceAll("-", "+").replaceAll("_", "/")),
    (c) => c.charCodeAt(0),
  );
  const raw = await readLimited(
    new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate")),
  );
  return parseLetter(JSON.parse(new TextDecoder().decode(raw)));
}
