import { expect, it } from "vitest";
import { emptyLetter, parseLetter } from "../../src/letters/schema";
import {
  encodeLetter,
  decodeLetter,
  LetterCollection,
} from "../../src/letters/storage";
it("round-trips unicode messages and handwriting without media", async () => {
  const letter = {
    ...emptyLetter(),
    message: "A little ప్రేమ ♡",
    strokes: [
      {
        radius: 0.01,
        points: [
          [0.2, 0.3, 0],
          [0.5, 0.7, 40],
        ] as [number, number, number][],
      },
    ],
  };
  expect(await decodeLetter(await encodeLetter(letter))).toEqual(letter);
  expect(
    parseLetter({ ...letter, video: "private", audio: "private" }),
  ).not.toHaveProperty("video");
});
it("rejects invalid points, nonfinite values, oversized input and decompression bombs", async () => {
  for (const point of [
    [NaN, 0.5, 0],
    [1.5, 0.5, 0],
    [0.5, 0.5, -1],
  ])
    expect(() =>
      parseLetter({
        ...emptyLetter(),
        strokes: [{ radius: 0.01, points: [point] }],
      }),
    ).toThrow();
  expect(() =>
    parseLetter({ ...emptyLetter(), message: "x".repeat(281) }),
  ).toThrow();
  const bytes = await new Response(
    new Blob(["x".repeat(210000)])
      .stream()
      .pipeThrough(new CompressionStream("deflate")),
  ).arrayBuffer();
  const encoded = Buffer.from(bytes).toString("base64url");
  await expect(decodeLetter(encoded)).rejects.toThrow("large");
});
it("keeps independent saved letters and surfaces storage errors without overwriting data", () => {
  const map = new Map<string, string>();
  const storage = {
    getItem: (k: string) => map.get(k) || null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  };
  const collection = new LetterCollection(storage);
  const a = collection.save(emptyLetter()),
    b = collection.save({ ...emptyLetter(), title: "Second" });
  expect(collection.list()).toHaveLength(2);
  collection.remove(a.id);
  expect(collection.list()[0].id).toBe(b.id);
  map.set("foglass.letters.v1", "broken");
  expect(() => collection.save(emptyLetter())).toThrow();
  expect(map.get("foglass.letters.v1")).toBe("broken");
});
