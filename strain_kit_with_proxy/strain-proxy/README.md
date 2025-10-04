# Strain Kit (Starter)

This kit gives you:
- `strains.json` — your curated local strain dataset
- `server.js` — a tiny Node/Express proxy that your Grow Tracker PWA can call
- `package.json` — deps and start script

## Why a proxy?
Most public sites block direct browser calls (CORS). Your PWA can call **this** proxy,
and **it** can return clean JSON. Prefer your own JSON or official APIs; respect ToS.

## Quick Start (Local)
```bash
cd strain-proxy
npm install
npm start
# open http://localhost:3000/health
# try  http://localhost:3000/strain?name=Blue%20Dream
```

## Environment variables (optional)
- `PORT` — default 3000
- `LOCAL_JSON_PATH` — path to your local JSON file (default: ./strains.json)
- `UPSTREAM_URL` — e.g. "https://your-api.example/strain?name={name}"

## Deploy to Replit
1. Create a Node.js repl.
2. Upload the `strain-proxy/` folder (server.js, package.json, strains.json).
3. Set **Run** command to `npm start` (Replit auto-installs deps).
4. Copy the public URL (e.g., `https://strain-proxy.your-repl.repl.co`).

## Point the PWA to your proxy
In the Grow Tracker v0.2 app:
- Go to **Settings → Strain Info Providers**
- Paste your Replit URL into **Proxy API URL**, using `{name}` placeholder:
  `https://strain-proxy.your-repl.repl.co/strain?name={name}`

Now when you press **Fetch Strain Info**, the app will call your proxy.

## Updating your dataset
Edit `strains.json` anytime (new strains, fields). No schema police here—
just keep `"name"` consistent so lookups match by exact name (case-insensitive).

— Built for Ryan + Vire, 2025-08-20
