// Tiny strain proxy server (Express)
// Usage:
//   1) npm install
//   2) node server.js
//   3) GET http://localhost:3000/strain?name=Blue%20Dream
//
// Features:
// - CORS enabled so your PWA can call it directly
// - Looks up locally from strains.json by default
// - Optional passthrough to an upstream API if you set UPSTREAM_URL (must include {name})
//
// ⚠️ Respect website Terms of Service. Avoid scraping sites that disallow it.
//    Prefer official APIs or your own curated JSON.

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Config:
// - LOCAL_JSON_PATH: path to strains.json
// - UPSTREAM_URL: e.g., "https://your-api.example/lookup?term={name}"
const LOCAL_JSON_PATH = process.env.LOCAL_JSON_PATH || path.join(__dirname, 'strains.json');
const UPSTREAM_URL = process.env.UPSTREAM_URL || '';

app.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.get('/strain', async (req, res) => {
  const name = (req.query.name || '').toString().trim();
  if (!name) return res.status(400).json({ error: 'Missing name' });

  // 1) Try local JSON
  try {
    const raw = await fs.readFile(LOCAL_JSON_PATH, 'utf-8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      const hit = arr.find(x => (x.name || '').toLowerCase() === name.toLowerCase());
      if (hit) return res.json({ source: 'local', ...hit });
    }
  } catch (e) {
    console.warn('Local JSON lookup failed:', e.message);
  }

  // 2) Try upstream, if configured
  if (UPSTREAM_URL) {
    try {
      const url = UPSTREAM_URL.replace('{name}', encodeURIComponent(name));
      const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (r.ok) {
        const data = await r.json();
        return res.json({ source: 'upstream', ...data });
      } else {
        console.warn('Upstream error', r.status);
      }
    } catch (e) {
      console.warn('Upstream fetch failed:', e.message);
    }
  }

  // Not found
  res.status(404).json({ error: 'Strain not found locally; no upstream configured', name });
});

app.listen(PORT, () => {
  console.log(`Strain proxy listening on port ${PORT}`);
  console.log(`Try: http://localhost:${PORT}/strain?name=Blue%20Dream`);
});
