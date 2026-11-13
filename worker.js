export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === "/healthz") {
      return jsonResponse({ ok: true, status: "healthy" }, corsHeaders);
    }

    if (url.pathname !== "/api/feedback") {
      return jsonResponse({ ok: false, error: "Not found" }, corsHeaders, 404);
    }

    if (request.method === "GET") {
      const rows = await env.DB.prepare(`
        SELECT *
        FROM feedback
        ORDER BY created_at DESC
        LIMIT 200
      `).all();

      return jsonResponse({ ok: true, items: rows.results }, corsHeaders, 200);
    }

    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "Method not allowed" }, corsHeaders, 405);
    }

    try {
      const body = await request.json();
      const payload = normalizeFeedback(body);

      await env.DB.prepare(`
        INSERT INTO feedback (
          timestamp,
          plan,
          stakes,
          risk_level,
          score,
          data_score,
          errors_score,
          check_score,
          accountability_score,
          loss_score,
          flags_count,
          plan_changed,
          helpfulness_rating,
          comment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        payload.timestamp,
        payload.plan,
        payload.stakes,
        payload.risk_level,
        payload.score,
        payload.data_score,
        payload.errors_score,
        payload.check_score,
        payload.accountability_score,
        payload.loss_score,
        payload.flags_count,
        payload.plan_changed,
        payload.helpfulness_rating,
        payload.comment
      ).run();

      return jsonResponse({ ok: true, message: "Feedback stored successfully." }, corsHeaders, 200);
    } catch (error) {
      return jsonResponse({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, corsHeaders, 400);
    }
  }
};

function normalizeFeedback(body) {
  const record = body || {};

  return {
    timestamp: String(record.timestamp || new Date().toISOString()),
    plan: String(record.plan || ""),
    stakes: String(record.stakes || ""),
    risk_level: String(record.risk_level || ""),
    score: toNullableNumber(record.score),
    data_score: toNullableNumber(record.data_score),
    errors_score: toNullableNumber(record.errors_score),
    check_score: toNullableNumber(record.check_score),
    accountability_score: toNullableNumber(record.accountability_score),
    loss_score: toNullableNumber(record.loss_score),
    flags_count: toNullableNumber(record.flags_count),
    plan_changed: String(record.plan_changed || ""),
    helpfulness_rating: toNullableNumber(record.helpfulness_rating),
    comment: String(record.comment || "")
  };
}

function toNullableNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function jsonResponse(data, headers, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers
    }
  });
}
