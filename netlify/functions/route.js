/**
 * Netlify Serverless Function: /.netlify/functions/route (mapped to /api/route via netlify.toml)
 * Reads process.env.DIFY_API_KEY and forwards requests to https://api.dify.ai/v1/workflows/run
 */
exports.handler = async function (event) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method Not Allowed. Use POST." }),
    };
  }

  const apiKey = process.env.DIFY_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Server configuration error: DIFY_API_KEY environment variable is not set.",
      }),
    };
  }

  const rawUrl = (process.env.DIFY_API_URL || "https://api.dify.ai/v1/workflows/run")
    .trim()
    .replace(/\/+$/, "");
  const difyUrl = rawUrl.endsWith("/workflows/run") ? rawUrl : `${rawUrl}/workflows/run`;

  try {
    const response = await fetch(difyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: event.body,
    });

    const text = await response.text();
    return {
      statusCode: response.status,
      headers: corsHeaders,
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: corsHeaders,
      body: JSON.stringify({ error: `Netlify Proxy Error: ${err.message}` }),
    };
  }
};
