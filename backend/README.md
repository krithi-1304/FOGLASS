# Letter storage

The Worker stores only validated text/stroke JSON. Camera, audio, landmarks,
photos and recordings are excluded. There is no public list or account system.
Random 128-bit share IDs grant read/reply access; separate hashed owner keys
permit deletion. These are bearer links, not end-to-end encryption.

## Local

`pnpm api:migrate` then `pnpm api:dev` starts real local D1 at 127.0.0.1:8787.
Set `VITE_LETTERS_API=http://127.0.0.1:8787` when starting Vite to test online UI.
Playwright automatically starts the API for its D1 integration test.

## Deploy (requires your Cloudflare account)

Production API: `https://foglass-letters.foglass.workers.dev` (deployed 2026-10-18).
The configured D1 database is provisioned and migrated. GitHub's
`FOGLASS_LETTERS_API` variable points to this API. For updates, use step 4 when
migrations change and step 5 to deploy; database creation is only for a new environment.

1. Run `pnpm exec wrangler login` locally. Never paste tokens into chat.
2. Create D1: `pnpm exec wrangler d1 create foglass-letters --config backend/wrangler.jsonc`.
3. Replace the zero database_id in wrangler.jsonc with the returned ID.
4. Apply schema: `pnpm exec wrangler d1 migrations apply foglass-letters --remote --config backend/wrangler.jsonc`.
5. Run `pnpm api:deploy`; use the resulting HTTPS Worker URL as the GitHub
   repository variable `FOGLASS_LETTERS_API`, then dispatch the Pages workflow.
6. Check allowed frontend origins before adding a domain.

No paid plan is required for the intended small deployment, but quotas apply:
https://developers.cloudflare.com/workers/platform/limits/
https://developers.cloudflare.com/d1/platform/limits/
Verify account plan and quotas before public promotion. Do not enable paid billing
automatically. API errors preserve the standalone mirror and downloadable letters.

## Data lifetime and limits

1/7/30-day expiry, enforced on reads; replies cannot outlive their parent.
Scheduled cleanup removes expired rows daily. Deletion cascades through replies.
Up to 60 create attempts per hashed IP/day; no raw IP is persisted. The API bounds
JSON to 192 KiB, 6000 points and 300 strokes. Share links are not a private inbox;
any recipient can forward or save the content. Removing local copies does not
remove remote copies unless the owner deletion operation succeeds.

Tests cover SQLite constraints, payload validation, owner keys, expiry, CORS,
rate limits, and a live local workerd/D1 create/reply/delete journey.
