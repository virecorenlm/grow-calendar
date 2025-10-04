# Grow Tracker v0.2 (Offline PWA)

**New in v0.2**
- 📷 Photo attachments per plant (stored locally, IndexedDB)
- 📅 Simple Calendar view (filter by start/end date range)
- 🔢 VPD calculator (Tetens equation; shows kPa)
- 🔎 Strain info fetch hooks:
  - Local JSON provider (host your own `strains.json` on Replit/GitHub Pages)
  - Proxy API provider (BYO endpoint; use `{name}` token)
  - Note: Direct calls to third-party sites will usually fail due to CORS. Use a proxy you control.

## Local JSON Format
Host a file like this and paste its URL in Settings → Local JSON URL:
```json
[
  { "name": "Freeze Land", "type": "indica-leaning", "lineage": "M39 x Friesland?", "thc": "18-22%", "terpenes": "myrcene,caryophyllene", "notes": "Personal lineage research." },
  { "name": "Skunk #1", "type": "hybrid", "lineage": "Afghani x Mexican x Colombian", "thc": "15-19%" }
]
```

## Proxy API Idea
Because of CORS and site policies, you’ll likely need your own tiny proxy:
- Example (Node/Express on Replit): `/strain?name=Freeze%20Land` → returns JSON
- Configure its URL in Settings → Proxy API URL (use `{name}` placeholder)

## Quick Start
1. Upload to Replit (static HTML) or any static host.
2. Open on your phone, “Add to Home Screen” (PWA).
3. Add plants, attach photos, log events, calculate VPD.
4. Export JSON backups regularly.

## Notes & Legal
- This app is for **personal logging**. Do not use where cultivation is illegal.
- All data stays on-device unless you export it.
