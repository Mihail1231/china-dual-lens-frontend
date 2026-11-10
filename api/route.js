/**
 * Vercel Serverless Function: api/route.js
 * Endpoint: POST /api/route
 *
 * Proxies frontend requests to the Dify Workflow API:
 *   POST https://api.dify.ai/v1/workflows/run
 * Prevents browser CORS errors and keeps DIFY_API_KEY on the server.
 */
module.exports = async function handler(req, res) {
  // Set CORS headers for web and mobile clients
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  const apiKey = process.env.DIFY_API_KEY || "app-KrhhWYsQx8gunaqa81Mtb2aj";
  const rawUrl = (process.env.DIFY_API_URL || "https://api.dify.ai/v1/workflows/run")
    .trim()
    .replace(/\/+$/, "");
  // Ensure the URL ends with /workflows/run even if DIFY_API_URL was set to https://api.dify.ai/v1
  const difyUrl = rawUrl.endsWith("/workflows/run") ? rawUrl : `${rawUrl}/workflows/run`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000); // 180s timeout

  try {
    const bodyPayload =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const difyRes = await fetch(difyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });

    const text = await difyRes.text();
    return res
      .status(difyRes.status)
      .setHeader("Content-Type", "application/json")
      .send(text);
  } catch (err) {
    const isAbort = err && err.name === "AbortError";
    return res.status(isAbort ? 504 : 500).json({
      error: isAbort
        ? "Gateway Timeout: Dify workflow exceeded 180 seconds."
        : `Proxy Error: ${err.message}`,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};
