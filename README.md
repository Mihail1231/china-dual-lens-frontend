# China Dual-Lens (双镜中国) — Frontend & Serverless Proxy Package (Group 2)

A multi-agent travel itinerary web application that compares an **International Standard Route** against a **Local Hidden Gem Route** using grounded Chinese transit data and Dify Workflow orchestration (`integrated-v2`).

## Files Included
- `index.html` — Full-bleed responsive header banner, 5-field trip parameter form, Quick Presets bar, **⚡ Fair Demo Fallback** instant selector, prominent red validation banner (`valid = 0`), 180s multi-stage progress loader, side-by-side comparison cards, and footer (`Estimates only, no booking`).
- `styles.css` — Royal red/gold aesthetic, traditional Chinese lattice (`窗棂`) SVG background pattern, Flexbox equal-height columns, sticky `Estimated Total Cost` header, and validation error banner styles.
- `app.js` — Complete Dify Workflow API integration (`POST /api/route` serverless proxy -> `https://api.dify.ai/v1/workflows/run`) with 180s timeout, explicit `Mode | Price | Duration` rendering for every transport leg, `valid = 0` plain-word error formatting, and 3+1 hardcoded fallback profiles (`DEV-GX-01`, `DEV-YN-01`, `DEV-SC-01`, and `DEV-YN-LOW`).
- `api/route.js` & `vercel.json` — Ready-to-deploy **Vercel Serverless Function** proxy (`POST /api/route`, `maxDuration: 180`).
- `netlify/functions/route.js` & `netlify.toml` — Ready-to-deploy **Netlify Serverless Function** proxy (`POST /api/route`).
- `proxy.js` — Ready-to-deploy **Cloudflare Worker** proxy script.
- `banner.jpg` — High-resolution cinematic widescreen hero banner.
- `frontend_sample_response.json` — Verified `DEV-GX-01` sample response from `integrated-v2`.

## 1-Minute Deployment (Vercel or Netlify)
1. Push or drag-and-drop this folder into **Vercel** or **Netlify**.
2. In your project's **Environment Variables** settings, add:
   - `DIFY_API_KEY` = `<your-dify-app-key>`
3. Deploy! Your mobile and desktop browsers will call `/api/route` on the same domain (zero CORS issues, API key hidden on the server).

## Testing Checklist
- **Live Route (`DEV-GX-01`)**: Click **Shenzhen → Guangxi (3 Days)** and click **Generate Routes** (or choose `DEV-GX-01` from **⚡ Fair Demo Fallback** for instant results).
- **Low-Budget Error Banner (`valid = 0`)**: Click **⚠️ Test Low Budget (`valid = 0` Banner)** to trigger the prominent red error banner (`"budget too low, estimated minimum 1,150 CNY"`) while still rendering both routes below.
