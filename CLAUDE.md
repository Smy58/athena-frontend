# Athena — player frontend

Vue 3 player-facing app for the Athena RPG club platform. Talks to
`../athena-backend` over HTTP (`VITE_API_URL`, defaults to
`http://localhost:3000/api`). Sibling repo `../athena-admin` is the staff-facing
admin panel built from the same backend.

## Deployment

- Deployed on **Vercel**. `vercel.json` rewrites all routes to `index.html` for
  SPA client-side routing — required, don't remove it.
- Auth: logs into `/api/auth` (separate system from the admin panel's
  `/api/admin-auth`), token stored as `athena_token` in localStorage.

## Images

Displayed via a plain `imageUrl` string field on the relevant model (e.g.
`Game.imageUrl`, `Post.imageUrl` for news) — just `<img :src="...">`, no upload
logic lives here. Uploading is admin-only and happens in `athena-admin`; see that
repo's CLAUDE.md for the upload pattern (backend stores image bytes in Postgres,
not an external service).

## Workflow conventions

- Commit messages: conventional style, `type: short description`
  (e.g. `feat: show game cover image in schedule`, `fix: correct date formatting`).
- Claude is authorized to commit and push directly to `main` for routine work in
  this repo without asking each time. Still confirm before force-push, history
  rewrites, or branch deletion.
