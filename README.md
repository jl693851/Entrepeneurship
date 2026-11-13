# ClearAI Feedback Worker

This repository now contains a Cloudflare Worker setup for storing external feedback without requiring a fine-grained GitHub token.

## What this does

- The frontend sends feedback to a Cloudflare API endpoint.
- The Cloudflare Worker validates the payload.
- The Worker writes to a Cloudflare D1 database.
- Your team can export the rows later as CSV or open them in a spreadsheet.

## Files

- `worker.js` — Cloudflare Worker logic
- `wrangler.toml` — Cloudflare deployment config
- `schema.sql` — D1 database schema
- `index.html` — updated form logic to post to the Cloudflare endpoint

## Cloudflare setup

1. Create a D1 database:
   
   ```bash
   wrangler d1 create clearai-feedback
   ```

2. Copy the database ID into `wrangler.toml`.

3. Apply the schema:
   
   ```bash
   wrangler d1 execute clearai-feedback --file=schema.sql
   ```

4. Deploy the worker:
   
   ```bash
   wrangler deploy
   ```

5. Confirm the endpoint is reachable:
   
   ```bash
   curl https://clearaiproject.clearai-alpha.workers.dev/healthz
   ```

6. Update the form endpoint if needed:
   
   In `index.html`, the worker endpoint defaults to:
   
   ```js
   const FEEDBACK_ENDPOINT = "https://clearaiproject.clearai-alpha.workers.dev/api/feedback";
   ```

## Security note

The frontend no longer requires a GitHub personal access token. External users only submit feedback to the worker endpoint. The Cloudflare Worker owns the database access.
