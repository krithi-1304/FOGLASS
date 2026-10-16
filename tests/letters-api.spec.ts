import { test, expect } from "@playwright/test";
import { emptyLetter } from "../src/letters/schema";
test("real Worker and D1 persist replies and enforce owner deletion", async ({
  request,
}) => {
  const base = "http://127.0.0.1:8787",
    headers = {
      Origin: "http://127.0.0.1:5173",
      "CF-Connecting-IP": crypto.randomUUID(),
    };
  const response = await request.post(base + "/letters", {
    headers,
    data: {
      letter: { ...emptyLetter(), title: "Local runtime integration" },
      days: 1,
    },
  });
  expect(response.status()).toBe(201);
  const owner = await response.json();
  const read = await request.get(base + "/letters/" + owner.id, { headers });
  expect(read.headers()["access-control-allow-origin"]).toBe(headers.Origin);
  expect((await read.json()).letter.title).toBe("Local runtime integration");
  const reply = await request.post(base + "/letters", {
    headers,
    data: {
      letter: { ...emptyLetter(), message: "Received with love" },
      days: 7,
      parentId: owner.id,
    },
  });
  expect(reply.status()).toBe(201);
  const child = await reply.json();
  expect(child.expiresAt).toBeLessThanOrEqual(owner.expiresAt);
  expect(
    (await request.delete(base + "/letters/" + owner.id, { headers })).status(),
  ).toBe(403);
  expect(
    (
      await request.get(base + "/letters/" + owner.id, {
        headers: { Origin: "https://other.example" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.delete(base + "/letters/" + owner.id, {
        headers: { ...headers, Authorization: "Bearer " + owner.deleteToken },
      })
    ).ok(),
  ).toBe(true);
  expect(
    (await request.get(base + "/letters/" + child.id, { headers })).status(),
  ).toBe(404);
});
