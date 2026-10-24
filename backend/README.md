# Optional Letters API

A Cloudflare Worker with D1 storage for shared text/drawings and replies. The
standalone mirror does not require this service.

## Local development

```sh
pnpm api:migrate
pnpm api:dev
```

Start the frontend with `VITE_LETTERS_API=http://127.0.0.1:8787`.

## Deployment

Authenticate Wrangler with your Cloudflare account, create a D1 database, and
update `backend/wrangler.jsonc` with your database binding and allowed origins.
Then apply the migrations and deploy:

```sh
pnpm exec wrangler d1 migrations apply foglass-letters --remote --config backend/wrangler.jsonc
pnpm api:deploy
```

Set `VITE_LETTERS_API` to your Worker URL when building the frontend. This
repository's Pages workflow reads it from the `FOGLASS_LETTERS_API` repository
variable. Keep credentials out of source control.

## Data and access

Letters expire after 1, 7 or 30 days; replies cannot outlive their parent.
Scheduled cleanup removes expired rows. A separate owner key permits deletion.
Anyone with a share link can read and reply; storage is not end-to-end encrypted.
Camera, audio and hand-tracking data are not uploaded. Payload and rate limits
are enforced by the API.
