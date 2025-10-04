GROW CALENDAR – MVP STARTER (Local-first, PWA)
What you get
- React + Vite PWA with routes: Dashboard, Plants, Schedule, Nutrients, Logs, Settings
- LocalStorage persistence (export/import in Settings)
- Editable weekly feed template (veg/flower weeks, ml/L per nutrient)
- Add plants (phase/week), nutrient library, logbook
- Installable PWA (manifest + service worker)

Run
  cd app
  npm i
  npm run dev

Deploy (Vercel)
  - Import repo from GitHub
  - Build: npm run build
  - Output: dist

Play Store (TWA summary)
  - Host on HTTPS (Vercel/Netlify)
  - Generate TWA with Bubblewrap, set up Digital Asset Links
  - Listing: name, descriptions, screenshots, content rating, privacy policy
  - Publish as educational/utility (no medical claims/sales)
