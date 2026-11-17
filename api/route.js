/**
 * Vercel Serverless Function: api/route.js
 * Endpoint: POST /api/route
 *
 * Uses Dify's "streaming" response_mode (Server-Sent Events) when calling
 *   POST https://api.dify.ai/v1/workflows/run
 * so Cloudflare in front of api.dify.ai never drops 100–150s workflow runs
 * with a 504 Gateway Timeout, and closes the stream immediately once
 * workflow_finished is emitted.
 */
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  const apiKey = process.env.DIFY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Server configuration error: DIFY_API_KEY environment variable is not set on Vercel.",
    });
  }

  const rawUrl = (process.env.DIFY_API_URL || "https://api.dify.ai/v1/workflows/run")
    .trim()
    .replace(/\/+$/, "");
  const difyUrl = rawUrl.endsWith("/workflows/run") ? rawUrl : `${rawUrl}/workflows/run`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 240000); // 240s safety timeout
  let heartbeatInterval = null;

  try {
    const bodyPayload =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    // Always use "streaming" with api.dify.ai to avoid Cloudflare 504 timeouts after ~100-120s
    const upstreamPayload = {
      ...bodyPayload,
      response_mode: "streaming",
    };

    const difyRes = await fetch(difyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream, application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(upstreamPayload),
      signal: controller.signal,
    });

    const contentType = difyRes.headers.get("content-type") || "";

    if (!difyRes.ok || !contentType.includes("text/event-stream")) {
      const text = await difyRes.text();
      return res
        .status(difyRes.status)
        .setHeader("Content-Type", contentType || "application/json")
        .send(text);
    }

    // Stream SSE events directly back to the browser (disable buffering)
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": "*",
    });

    // Send periodic SSE comment heartbeat so proxy buffers flush and never idle-timeout
    heartbeatInterval = setInterval(() => {
      try {
        res.write(": keepalive\n\n");
        if (typeof res.flush === "function") res.flush();
      } catch {
        // ignore write errors if closed
      }
    }, 5000);

    const reader = difyRes.body.getReader();
    const decoder = new TextDecoder();
    let lineBuf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkText = decoder.decode(value, { stream: true });
      res.write(chunkText);
      if (typeof res.flush === "function") res.flush();

      // Check if workflow_finished frame was just sent so we can close cleanly
      lineBuf += chunkText;
      const lines = lineBuf.split("\n");
      lineBuf = lines.pop() || "";
      let sawWorkflowFinished = false;
      for (const l of lines) {
        if (l.includes('"workflow_finished"')) {
          sawWorkflowFinished = true;
        }
      }
      if (sawWorkflowFinished) {
        try {
          await reader.cancel();
        } catch {}
        break;
      }
    }

    return res.end();
  } catch (err) {
    const isAbort = err && err.name === "AbortError";
    if (!res.headersSent) {
      return res.status(isAbort ? 504 : 500).json({
        error: isAbort
          ? "Gateway Timeout: Dify workflow exceeded timeout."
          : `Proxy Error: ${err.message}`,
      });
    }
    res.write(
      `data: ${JSON.stringify({
        event: "error",
        message: isAbort
          ? "Gateway Timeout: Dify workflow exceeded timeout."
          : `Proxy Error: ${err.message}`,
      })}\n\n`
    );
    return res.end();
  } finally {
    clearInterval(heartbeatInterval);
    clearTimeout(timeoutId);
  }
};
