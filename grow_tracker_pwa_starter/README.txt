# Grow Tracker (Offline PWA)

**What this is:** a super-simple, offline-first plant/grow tracker you can open on your phone and "Add to Home Screen".
- Works without internet (PWA + service worker).
- Stores data locally in your browser (IndexedDB).
- Lets you export/import JSON backups.
- Tracks Plants and Events (feeds, watering, transplant, flip, harvest, measurements).

## Quick Start (Replit or any static host)
1. Upload these files to Replit (static HTML project) or any static host.
2. Open the URL on your phone, use "Add to Home Screen".
3. Start adding plants and logging events.
4. Export JSON regularly (good practice).

## Data Model (v0.1)
- Plant: { id, name, strain, stage, start_date, tags, notes, created_at }
- Event: { id, plant_id, plant_name, type, when, volume_ml, ph, ppm, notes }

## Roadmap ideas
- Calendar view / reminders
- Photos per plant (file picker -> local URL)
- VPD calculator
- Feed recipes library + templates
- Multi-grow rooms / tents
- Cloud sync (optional; privacy-first)

## Privacy
All data stays **on-device** unless you export JSON yourself.
