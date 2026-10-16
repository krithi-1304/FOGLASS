import type { D1Database } from "@cloudflare/workers-types";
import { MAX_LETTER_BYTES, parseLetter } from "../src/letters/schema";
import { readLimited } from "../src/letters/storage";
interface Env {
  DB: D1Database;
  ALLOWED_ORIGINS: string;
}
interface Row {
  id: string;
  payload: string;
  delete_hash: string;
  parent_id: string | null;
  root_id: string;
  created_at: number;
  expires_at: number;
}
const idPattern = /^[a-f0-9]{32}$/;
const token = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
const hash = async (value: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin"),
      allowed = env.ALLOWED_ORIGINS.split(",");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      Vary: "Origin",
    };
    if (origin && allowed.includes(origin))
      headers["Access-Control-Allow-Origin"] = origin;
    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), { status, headers });
    if (origin && !allowed.includes(origin))
      return json({ error: "Origin not allowed." }, 403);
    if (request.method === "OPTIONS")
      return new Response(null, {
        status: 204,
        headers: {
          ...headers,
          "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
      });
    const path = new URL(request.url).pathname,
      now = Date.now();
    try {
      if (path === "/health" && request.method === "GET")
        return json({ ok: true });
      if (path === "/letters" && request.method === "POST") {
        if (
          !request.headers.get("Content-Type")?.startsWith("application/json")
        )
          return json({ error: "Use JSON." }, 415);
        if (!request.body) return json({ error: "Missing letter." }, 400);
        let body;
        try {
          body = JSON.parse(
            new TextDecoder().decode(
              await readLimited(request.body, MAX_LETTER_BYTES),
            ),
          );
        } catch {
          return json({ error: "Invalid or oversized letter." }, 400);
        }
        let letter;
        try {
          letter = parseLetter(body.letter);
        } catch {
          return json({ error: "Invalid letter." }, 400);
        }
        if (![1, 7, 30].includes(body.days))
          return json({ error: "Choose 1, 7 or 30 days." }, 400);
        const ipHash = await hash(
          request.headers.get("CF-Connecting-IP") || "local",
        );
        const bucket = ipHash + ":" + Math.floor(now / 86400000);
        const rate = await env.DB.prepare(
          "INSERT INTO rate_limits(bucket,count,expires_at) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count",
        )
          .bind(bucket, now + 86400000)
          .first<{ count: number }>();
        if (!rate || rate.count > 60)
          return json(
            { error: "Daily letter limit reached. Download a letter instead." },
            429,
          );
        let parent: Row | null = null;
        if (body.parentId) {
          if (
            typeof body.parentId !== "string" ||
            !idPattern.test(body.parentId)
          )
            return json({ error: "Invalid reply." }, 400);
          parent = await env.DB.prepare(
            "SELECT * FROM letters WHERE id=? AND expires_at>?",
          )
            .bind(body.parentId, now)
            .first<Row>();
          if (!parent)
            return json(
              { error: "The original letter has expired or was removed." },
              404,
            );
          const total = await env.DB.prepare(
            "SELECT COUNT(*) AS n FROM letters WHERE root_id=?",
          )
            .bind(parent.root_id)
            .first<{ n: number }>();
          if ((total?.n || 0) >= 32)
            return json({ error: "This conversation is full." }, 409);
        }
        const id = token(),
          deleteToken = token(),
          expiresAt = Math.min(
            now + body.days * 86400000,
            parent?.expires_at || Infinity,
          );
        await env.DB.prepare(
          "INSERT INTO letters(id,payload,delete_hash,parent_id,root_id,created_at,expires_at) VALUES(?,?,?,?,?,?,?)",
        )
          .bind(
            id,
            JSON.stringify(letter),
            await hash(deleteToken),
            parent?.id || null,
            parent?.root_id || id,
            now,
            expiresAt,
          )
          .run();
        return json({ id, deleteToken, expiresAt }, 201);
      }
      const match = path.match(/^\/letters\/([a-f0-9]{32})(\/replies)?$/);
      if (!match) return json({ error: "Not found." }, 404);
      const row = await env.DB.prepare(
        "SELECT * FROM letters WHERE id=? AND expires_at>?",
      )
        .bind(match[1], now)
        .first<Row>();
      if (!row)
        return json({ error: "This letter has expired or was removed." }, 404);
      if (request.method === "GET") {
        if (match[2]) {
          const result = await env.DB.prepare(
            "SELECT id,payload,parent_id,created_at,expires_at FROM letters WHERE root_id=? AND expires_at>? ORDER BY created_at LIMIT 32",
          )
            .bind(row.root_id, now)
            .all<Row>();
          return json({
            letters: result.results.map((r) => ({
              id: r.id,
              letter: JSON.parse(r.payload),
              parentId: r.parent_id,
              expiresAt: r.expires_at,
            })),
          });
        }
        return json({
          id: row.id,
          letter: JSON.parse(row.payload),
          parentId: row.parent_id,
          expiresAt: row.expires_at,
        });
      }
      if (request.method === "DELETE" && !match[2]) {
        const supplied =
          request.headers.get("Authorization")?.replace(/^Bearer /, "") || "";
        if (
          !idPattern.test(supplied) ||
          (await hash(supplied)) !== row.delete_hash
        )
          return json({ error: "The owner deletion key is required." }, 403);
        await env.DB.prepare("DELETE FROM letters WHERE id=?")
          .bind(row.id)
          .run();
        return json({ deleted: true });
      }
      return json({ error: "Method not allowed." }, 405);
    } catch {
      return json(
        { error: "Letter storage is unavailable. Your mirror still works." },
        503,
      );
    }
  },
  async scheduled(_event: unknown, env: Env) {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM letters WHERE expires_at<=?").bind(
        Date.now(),
      ),
      env.DB.prepare("DELETE FROM rate_limits WHERE expires_at<=?").bind(
        Date.now(),
      ),
    ]);
  },
};
