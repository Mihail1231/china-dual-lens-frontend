/**
 * Netlify Serverless Function: /.netlify/functions/route (mapped to /api/route via netlify.toml)
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

  const apiKey = process.env.DIFY_API_KEY || "app-p3VK8BUCxYCOPb7eMcEIm0HU";
  const difyUrl = process.env.DIFY_API_URL || "https://api.dify.ai/v1/workflows/run";

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
