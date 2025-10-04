// Minimal IndexedDB wrapper
const DB_NAME = 'grow-tracker-db';
const DB_VERSION = 1;
let db;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('plants')) db.createObjectStore('plants', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('events')) db.createObjectStore('events', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
    };
    req.onsuccess = () => { db = req.result; resolve(db); };
    req.onerror = () => reject(req.error);
  });
}
function tx(store, mode='readonly') { return db.transaction(store, mode).objectStore(store); }
function id() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

async function put(store, value) { return new Promise((res, rej)=>{ const r=tx(store,'readwrite').put(value); r.onsuccess=()=>res(value); r.onerror=()=>rej(r.error); }); }
async function getAll(store) { return new Promise((res, rej)=>{ const r=tx(store).getAll(); r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error); }); }
async function remove(store, key) { return new Promise((res, rej)=>{ const r=tx(store,'readwrite').delete(key); r.onsuccess=()=>res(); r.onerror=()=>rej(r.error); }); }

// UI helpers
const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));

function switchTab(viewId) {
  $$('.tab').forEach(b => b.classList.remove('active'));
  $$('.view').forEach(v => v.classList.remove('visible'));
  const btn = document.getElementById('tab-' + viewId.split('-')[1]);
  if (btn) btn.classList.add('active');
  document.getElementById('view-' + viewId.split('-')[1]).classList.add('visible');
}

// Plants
async function refreshPlants() {
  const plants = await getAll('plants');
  const list = $('#plant-list');
  const sel = $('#event-plant');
  list.innerHTML = '';
  sel.innerHTML = '';
  plants.forEach(p => {
    const li = document.createElement('li');
    li.className = 'card';
    li.innerHTML = `<b>${p.name}</b> — ${p.strain||'—'} · <i>${p.stage}</i> · started ${p.start_date||'—'}<br><small>${p.tags||''}</small><br>${p.notes||''}
      <div style="margin-top:6px;display:flex;gap:6px;">
        <button data-del="${p.id}">Delete</button>
      </div>`;
    list.appendChild(li);

    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    sel.appendChild(opt);
  });
  $('#stat-plants').textContent = plants.length;

  // delete handlers
  list.querySelectorAll('button[data-del]').forEach(btn => {
    btn.addEventListener('click', async () => { await remove('plants', btn.dataset.del); await refreshPlants(); });
  });
}

async function addPlant(form) {
  const data = Object.fromEntries(new FormData(form));
  const plant = {
    id: id(),
    name: data.name.trim(),
    strain: data.strain.trim(),
    stage: data.stage,
    start_date: data.start_date || null,
    tags: data.tags.trim(),
    notes: data.notes.trim(),
    created_at: new Date().toISOString()
  };
  await put('plants', plant);
  form.reset();
  await refreshPlants();
}

// Events
async function refreshEvents() {
  const events = (await getAll('events')).sort((a,b)=> new Date(b.when) - new Date(a.when));
  const ul = $('#event-list');
  ul.innerHTML = '';
  let count30 = 0;
  const now = Date.now();
  const day30 = 30*24*60*60*1000;
  for (const ev of events) {
    if (now - new Date(ev.when).getTime() < day30) count30++;
    const li = document.createElement('li');
    li.className = 'card';
    li.innerHTML = `<b>${ev.type}</b> @ ${new Date(ev.when).toLocaleString()} — ${ev.plant_name||ev.plant_id}<br>
      pH: ${ev.ph||'—'} · PPM/EC: ${ev.ppm||'—'} · Vol: ${ev.volume_ml||'—'} ml<br>${ev.notes||''}
      <div style="margin-top:6px;display:flex;gap:6px;">
        <button data-del-ev="${ev.id}">Delete</button>
      </div>`;
    ul.appendChild(li);
  }
  $('#stat-events').textContent = count30;
  // Simple next feed due: pick next 'feed' event + 2 days
  const feeds = events.filter(e=>e.type==='feed');
  if (feeds.length) {
    const next = new Date(new Date(feeds[0].when).getTime() + 2*24*60*60*1000);
    $('#stat-next-feed').textContent = next.toLocaleString();
  } else {
    $('#stat-next-feed').textContent = '—';
  }

  ul.querySelectorAll('button[data-del-ev]').forEach(btn => {
    btn.addEventListener('click', async () => { await remove('events', btn.dataset.delEv); await refreshEvents(); });
  });
}

async function addEvent(form) {
  const data = Object.fromEntries(new FormData(form));
  const plants = await getAll('plants');
  const plant = plants.find(p => p.id === data.plant_id);
  const ev = {
    id: id(),
    plant_id: data.plant_id,
    plant_name: plant ? plant.name : data.plant_id,
    type: data.type,
    when: data.when || new Date().toISOString(),
    volume_ml: data.volume_ml ? Number(data.volume_ml) : null,
    ph: data.ph ? Number(data.ph) : null,
    ppm: data.ppm ? Number(data.ppm) : null,
    notes: data.notes?.trim() || ''
  };
  await put('events', ev);
  form.reset();
  await refreshEvents();
}

// Export/Import
async function exportJSON() {
  const plants = await getAll('plants');
  const events = await getAll('events');
  const payload = { exported_at: new Date().toISOString(), plants, events };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'grow_tracker_export.json';
  a.click();
}

async function importJSON(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (Array.isArray(data.plants)) {
    for (const p of data.plants) await put('plants', p);
  }
  if (Array.isArray(data.events)) {
    for (const e of data.events) await put('events', e);
  }
  await refreshPlants();
  await refreshEvents();
}

// Notifications
async function requestNotifs(enabled) {
  if (!('Notification' in window)) return alert('Notifications not supported');
  if (enabled && Notification.permission !== 'granted') {
    await Notification.requestPermission();
  }
  localStorage.setItem('notifs_enabled', enabled ? '1' : '0');
}

function notify(title, body) {
  if (Notification.permission === 'granted' && localStorage.getItem('notifs_enabled')==='1') {
    new Notification(title, { body });
  }
}

// Tabs
$('#tab-plants').addEventListener('click', ()=>switchTab('view-plants'));
$('#tab-events').addEventListener('click', ()=>switchTab('view-events'));
$('#tab-stats').addEventListener('click', ()=>switchTab('view-stats'));
$('#tab-settings').addEventListener('click', ()=>switchTab('view-settings'));

// Forms
$('#plant-form').addEventListener('submit', (e)=>{ e.preventDefault(); addPlant(e.target); notify('Plant added','Saved locally'); });
$('#event-form').addEventListener('submit', (e)=>{ e.preventDefault(); addEvent(e.target); notify('Event logged','Saved locally'); });
$('#export-json').addEventListener('click', exportJSON);
$('#import-json').addEventListener('change', (e)=>{ if (e.target.files[0]) importJSON(e.target.files[0]); });
$('#enable-notifs').addEventListener('change', (e)=> requestNotifs(e.target.checked));

// Init
(async function init(){
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
  }
  await openDB();
  await refreshPlants();
  await refreshEvents();
  $('#enable-notifs').checked = localStorage.getItem('notifs_enabled')==='1';
})();
