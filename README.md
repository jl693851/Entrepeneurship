# ClearAI Feedback Worker

This repository includes a Cloudflare Worker setup for storing external feedback without requiring a GitHub fine-grained token.

## Setup

1. Create a D1 database in Cloudflare:

   ```bash
   wrangler d1 create clearai-feedback
   ```

2. Copy the generated `database_id` and paste it into `wrangler.toml`.

3. Create the schema:

   ```bash
   wrangler d1 execute clearai-feedback --file=schema.sql
   ```

4. Deploy the Worker:

   ```bash
   wrangler deploy
   ```

5. Optional: set secret keys for protection. In Cloudflare, set:

   ```bash
   wrangler secret put FEEDBACK_KEY
   wrangler secret put TEAM_KEY
   ```

   Then the Worker will accept write requests only when the request contains the matching `X-Feedback-Key` header, and read access only when the `X-Team-Key` header is present.

## Notes

- The public feedback form no longer writes to GitHub.
- It sends the payload to the Cloudflare Worker endpoint.
- Your team can read the data centrally from the D1 database and export it as CSV later.
- To keep the app simple, the default form endpoint is:

  ```text
  https://clearaiproject.clearai-alpha.workers.dev/api/feedback
  ```

## Security recommendation

Do not store sensitive personal data in the feedback text field. Keep it to the structured fields and a short comment only.
