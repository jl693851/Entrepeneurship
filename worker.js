const MAX_BODY_BYTES = 8_192;
const MAX_TEXT_LENGTH = 2_000;
const ALLOWED_STAKES = new Set([
  "personal use",
  "internal use",
  "external use",
  "decisions about people / money / health / law"
]);
const ALLOWED_RISK_LEVELS = new Set(["Low", "Moderate", "High", "Critical"]);
const CSV_COLUMNS = [
  "timestamp", "plan", "stakes", "risk_level", "score", "data_score",
  "errors_score", "check_score", "accountability_score", "loss_score",
  "flags_count", "plan_changed", "helpfulness_rating", "comment"
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Team-Key",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (url.pathname === "/healthz" && request.method === "GET") {
      return json({ ok: true, status: "healthy" }, headers);
    }
    if (url.pathname !== "/api/feedback" && url.pathname !== "/api/feedback.csv") {
      return json({ ok: false, error: "Not found" }, headers, 404);
    }

    if (request.method === "GET") {
      if (!env.TEAM_KEY) return json({ ok: false, error: "Team access is not configured." }, headers, 503);
      if (request.headers.get("X-Team-Key") !== env.TEAM_KEY) {
        return json({ ok: false, error: "Unauthorized" }, headers, 401);
      }
      if (!env.DB) return json({ ok: false, error: "Database binding is not configured." }, headers, 503);

      try {
        const result = await env.DB.prepare(`
          SELECT ${CSV_COLUMNS.join(", ")}
          FROM feedback
          ORDER BY created_at DESC
          LIMIT 1000
        `).all();
        const rows = result.results || [];

        if (url.pathname.endsWith(".csv")) {
          const csv = [CSV_COLUMNS.join(","), ...rows.map(row => CSV_COLUMNS.map(column => csvCell(row[column])).join(","))].join("\r\n") + "\r\n";
          return new Response(csv, {
            status: 200,
            headers: {
              ...headers,
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition": 'attachment; filename="clearai-feedback.csv"'
            }
          });
        }
        return json({ ok: true, items: rows }, headers);
      } catch {
        return json({ ok: false, error: "Could not read feedback." }, headers, 500);
      }
    }

    if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, headers, 405);
    if (!env.DB) return json({ ok: false, error: "Database binding is not configured." }, headers, 503);
    if (!request.headers.get("Content-Type")?.toLowerCase().includes("application/json")) {
      return json({ ok: false, error: "Content-Type must be application/json." }, headers, 415);
    }

    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > MAX_BODY_BYTES) return json({ ok: false, error: "Request is too large." }, headers, 413);

    try {
      const raw = await request.text();
      if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
        return json({ ok: false, error: "Request is too large." }, headers, 413);
      }
      const payload = validatePayload(JSON.parse(raw));
      await env.DB.prepare(`
        INSERT INTO feedback (
          timestamp, plan, stakes, risk_level, score, data_score, errors_score,
          check_score, accountability_score, loss_score, flags_count,
          plan_changed, helpfulness_rating, comment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        new Date().toISOString(), payload.plan, payload.stakes, payload.risk_level,
        payload.score, payload.data_score, payload.errors_score, payload.check_score,
        payload.accountability_score, payload.loss_score, payload.flags_count,
        payload.plan_changed, payload.helpfulness_rating, payload.comment
      ).run();

      return json({ ok: true, message: "Feedback stored successfully." }, headers, 201);
    } catch (error) {
      if (error instanceof SyntaxError) return json({ ok: false, error: "Invalid JSON." }, headers, 400);
      if (error instanceof TypeError) return json({ ok: false, error: error.message }, headers, 400);
      return json({ ok: false, error: "Could not store feedback." }, headers, 500);
    }
  }
};

function validatePayload(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("A JSON object is required.");
  const text = (key, max = MAX_TEXT_LENGTH) => {
    const value = input[key] ?? "";
    if (typeof value !== "string") throw new TypeError(`${key} must be text.`);
    if (value.length > max) throw new TypeError(`${key} is too long.`);
    return value.trim();
  };
  const integer = (key, min, max) => {
    const value = input[key];
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    if (!Number.isInteger(number) || number < min || number > max) throw new TypeError(`${key} is out of range.`);
    return number;
  };
  const score = input.score == null || input.score === "" ? null : Number(input.score);
  if (score !== null && (!Number.isFinite(score) || score < 0 || score > 21)) throw new TypeError("score is out of range.");

  const stakes = text("stakes", 80);
  const riskLevel = text("risk_level", 20);
  const planChanged = text("plan_changed", 80);
  if (stakes && !ALLOWED_STAKES.has(stakes)) throw new TypeError("Invalid stakes value.");
  if (riskLevel && !ALLOWED_RISK_LEVELS.has(riskLevel)) throw new TypeError("Invalid risk level.");

  return {
    plan: text("plan"),
    stakes,
    risk_level: riskLevel,
    score,
    data_score: integer("data_score", 0, 3),
    errors_score: integer("errors_score", 0, 3),
    check_score: integer("check_score", 0, 3),
    accountability_score: integer("accountability_score", 0, 3),
    loss_score: integer("loss_score", 0, 3),
    flags_count: integer("flags_count", 0, 20),
    plan_changed: planChanged,
    helpfulness_rating: integer("helpfulness_rating", 1, 5),
    comment: text("comment")
  };
}

function csvCell(value) {
  const safe = String(value ?? "").replace(/[\r\n]+/g, " ");
  // Prefix spreadsheet formula starters to prevent CSV formula injection.
  const formulaSafe = /^[=+@\-]/.test(safe) ? `'${safe}` : safe;
  return `"${formulaSafe.replace(/"/g, '""')}"`;
}

function json(data, headers, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" }
  });
}
