import { beforeEach, afterEach, expect, it } from "vitest";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import type { D1Database } from "@cloudflare/workers-types";
import worker from "../../backend/index";
import { emptyLetter } from "../../src/letters/schema";
let db: DatabaseSync;
beforeEach(() => {
  db = new DatabaseSync(":memory:");
  db.exec(
    "PRAGMA foreign_keys=ON;" +
      fs.readFileSync(
        new URL("../../backend/migrations/0001_letters.sql", import.meta.url),
        "utf8",
      ),
  );
});
afterEach(() => db.close());
const env = () => ({
  ALLOWED_ORIGINS: "https://mirror.example",
  DB: {
    prepare(sql: string) {
      let values: unknown[] = [];
      return {
        bind(...args: unknown[]) {
          values = args;
          return this;
        },
        async first() {
          return (
            db.prepare(sql).get(...(values as (string | number)[])) || null
          );
        },
        async all() {
          return {
            results: db.prepare(sql).all(...(values as (string | number)[])),
          };
        },
        async run() {
          db.prepare(sql).run(...(values as (string | number)[]));
          return { success: true };
        },
      };
    },
  } as unknown as D1Database,
});
const request = (
  path: string,
  method = "GET",
  data?: unknown,
  key?: string,
  origin = "https://mirror.example",
) =>
  worker.fetch(
    new Request("https://api.example" + path, {
      method,
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        ...(key ? { Authorization: "Bearer " + key } : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
    }),
    env(),
  );
const create = async (parentId?: string) => {
  const r = await request("/letters", "POST", {
    letter: emptyLetter(),
    days: 7,
    parentId,
  });
  expect(r.status).toBe(201);
  return r.json() as Promise<{
    id: string;
    deleteToken: string;
    expiresAt: number;
  }>;
};
it("persists letters and replies, never exposes owner keys and cascades authorised deletion", async () => {
  const a = await create(),
    b = await create(a.id);
  const read = await (await request("/letters/" + a.id)).json();
  expect(read.letter.version).toBe(1);
  expect(read).not.toHaveProperty("deleteToken");
  expect(read).not.toHaveProperty("delete_hash");
  expect(
    (await (await request("/letters/" + a.id + "/replies")).json()).letters,
  ).toHaveLength(2);
  expect((await request("/letters/" + a.id, "DELETE")).status).toBe(403);
  expect(
    (await request("/letters/" + a.id, "DELETE", undefined, b.deleteToken))
      .status,
  ).toBe(403);
  expect(
    (await request("/letters/" + a.id, "DELETE", undefined, a.deleteToken))
      .status,
  ).toBe(200);
  expect((await request("/letters/" + b.id)).status).toBe(404);
});
it("enforces expiry, origin and input bounds", async () => {
  const a = await create();
  db.prepare("UPDATE letters SET expires_at=0 WHERE id=?").run(a.id);
  expect((await request("/letters/" + a.id)).status).toBe(404);
  expect(
    (
      await request("/letters", "POST", {
        letter: emptyLetter(),
        days: 7,
        parentId: a.id,
      })
    ).status,
  ).toBe(404);
  expect(
    (
      await request(
        "/letters",
        "POST",
        { letter: emptyLetter(), days: 7 },
        undefined,
        "https://bad.example",
      )
    ).status,
  ).toBe(403);
  expect(
    (
      await request("/letters", "POST", {
        letter: { ...emptyLetter(), message: "x".repeat(300) },
        days: 7,
      })
    ).status,
  ).toBe(400);
  expect(
    (await request("/letters", "POST", { letter: emptyLetter(), days: 999 }))
      .status,
  ).toBe(400);
});
it("limits writes without storing raw IP addresses", async () => {
  for (let i = 0; i < 60; i++) await create();
  expect(
    (await request("/letters", "POST", { letter: emptyLetter(), days: 7 }))
      .status,
  ).toBe(429);
  expect(
    String(db.prepare("SELECT bucket FROM rate_limits").get()?.bucket),
  ).not.toContain("local");
});
