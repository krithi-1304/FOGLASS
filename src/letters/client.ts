import { parseLetter, type Letter } from "./schema";
export interface RemoteLetter {
  id: string;
  letter: Letter;
  expiresAt: number;
  parentId?: string;
}
export class LetterService {
  constructor(readonly base = import.meta.env.VITE_LETTERS_API || "") {}
  get available() {
    return !!this.base;
  }
  private async request(path: string, options: RequestInit = {}) {
    if (!this.available)
      throw new Error(
        "Online letters are not connected yet. Save or share a portable letter.",
      );
    const response = await fetch(this.base.replace(/\/$/, "") + path, {
      ...options,
      signal: AbortSignal.timeout(10000),
      headers: { "Content-Type": "application/json", ...options.headers },
    });
    const body = await response.json();
    if (!response.ok)
      throw new Error(body.error || "Could not open letter storage.");
    return body;
  }
  async create(
    letter: Letter,
    days: number,
    parentId?: string,
  ): Promise<{ id: string; deleteToken: string; expiresAt: number }> {
    return this.request("/letters", {
      method: "POST",
      body: JSON.stringify({ letter: parseLetter(letter), days, parentId }),
    });
  }
  async get(id: string): Promise<RemoteLetter> {
    if (!/^[a-f0-9]{32}$/.test(id)) throw new Error("Invalid letter link.");
    const value = await this.request("/letters/" + id);
    return { ...value, letter: parseLetter(value.letter) };
  }
  async replies(id: string): Promise<RemoteLetter[]> {
    const value = await this.request("/letters/" + id + "/replies");
    return value.letters.map((v: RemoteLetter) => ({
      ...v,
      letter: parseLetter(v.letter),
    }));
  }
  async remove(id: string, key: string) {
    await this.request("/letters/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + key },
    });
  }
}
