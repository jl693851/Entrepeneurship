# ClearAI Feedback: Cloudflare setup (no local terminal required)

The `cloudflare-feedback-worker` branch contains the Worker, D1 schema, and form integration. It accepts public form submissions without a GitHub token. The feedback list and CSV export require a team secret.

## Deploy using the Cloudflare dashboard

1. In GitHub, push/merge this branch only when you are ready for Cloudflare to use it. The current website on `main` still has the old GitHub-token form; the updated form is on this branch.
2. In Cloudflare, open **Workers & Pages** and create a Worker using **Connect to Git** (select this repository and `cloudflare-feedback-worker`). If you already manage `clearaiproject` there, open that Worker and connect/configure its Git deployment instead. Use the repository root as the project root and `worker.js` as the entry point; follow Cloudflare's deployment workflow for the checked-in `wrangler.toml`.
3. In the Cloudflare dashboard, create a D1 database named `clearai-feedback`.
4. Open the D1 database and run the contents of `schema.sql` in its SQL console.
5. Bind the D1 database to the Worker as `DB`. Set the binding name exactly to `DB`.
6. In the Worker settings, add a **secret** named `TEAM_KEY` with a long, unique random value. Do not put this value in GitHub, `index.html`, or a public browser page. Without this secret, reads fail closed.
7. Set up a Cloudflare rate-limiting rule for `POST /api/feedback` (and consider Turnstile before wider public launch). The POST endpoint must remain public for external feedback, so do not put a shared secret in the frontend.
8. Deploy the Worker. Confirm `https://clearaiproject.clearai-alpha.workers.dev/healthz` returns `{"ok":true,"status":"healthy"}`.

### D1 binding and schema

The checked-in `wrangler.toml` has a placeholder database ID because only your Cloudflare account can create the database and supply its ID. In dashboard-based deployments, bind D1 through the Worker's settings as described above. If your deployment workflow requires a database ID in the config, replace the placeholder with the ID shown in your Cloudflare D1 database details before deploying. Never guess or commit a made-up ID.

## Team CSV export

The Worker returns JSON at `GET /api/feedback` and a spreadsheet-compatible CSV at `GET /api/feedback.csv`; both require the team secret in an `X-Team-Key` request header. Do not make a public webpage that embeds this secret.

A team member can download the CSV from a trusted terminal using:

```bash
curl -H "X-Team-Key: YOUR_TEAM_KEY" \
  https://clearaiproject.clearai-alpha.workers.dev/api/feedback.csv \
  -o clearai-feedback.csv
```

Alternatively, team members can query/export the D1 data from the authenticated Cloudflare dashboard. Share access through Cloudflare account permissions rather than sharing the secret broadly.

## Privacy and security notes

- External users do not need a GitHub account or fine-grained token.
- The Worker validates payload sizes and values, uses parameterized SQL, and does not expose feedback reads unless `TEAM_KEY` is configured and supplied.
- The public POST endpoint can still receive spam; configure Cloudflare rate limiting and Turnstile for production.
- Feedback text may contain sensitive information. Ask users not to include personal, confidential, or customer data and collect only what the team needs.
- The old `feedback.csv` remains in the repository history and the repository is public. Do not use it as the ongoing private feedback store; removing the current file alone does not erase old commits.
