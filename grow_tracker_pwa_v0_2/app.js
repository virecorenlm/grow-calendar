// Data layer with photos (Blob storage) and strain info providers
const DB_NAME = 'grow-tracker-db';
const DB_VERSION = 2; // bump for photos store
let db;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('plants')) db.createObjectStore('plants', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('events')) db.createObjectStore('events', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
      if (!db.objectStoreNames.contains('photos')) db.createObjectStore('photos', { keyPath: 'id' }); // {id, plant_id, blobType, blob}
    };
    req.onsuccess = () => { db = req.result; resolve(db); };
    req.onerror = () => reject(req.error);
  });
}
function tx(store, mode='readonly') { return db.transaction(store, mode).objectStore(store); }
function id() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
async function put(store, value) { return new Promise((res, rej)=>{ const r=tx(store,'readwrite').put(value); r.onsuccess=()=>res(value); r.onerror=()=>rej(r.error); }); }
async function get(store, key) { return new Promise((res, rej)=>{ const r=tx(store).get(key); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }
async function getAll(store) { return new Promise((res, rej)=>{ const r=tx(store).getAll(); r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error); }); }
async function remove(store, key) { return new Promise((res, rej)=>{ const r=tx(store,'readwrite').delete(key); r.onsuccess=()=>res(); r.onerror=()=>rej(r.error); }); }

const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));
function switchTab(viewId) {
  $$('.tab').forEach(b => b.classList.remove('active'));
  $$('.view').forEach(v => v.classList.remove('visible'));
  document.getElementById('tab-' + viewId.split('-')[1])?.classList.add('active');
  document.getElementById('view-' + viewId.split('-')[1]).classList.add('visible');
}

// ---------- VPD ----------
function saturationVaporPressureC(Tc) {
  // Tetens equation (kPa)
  return 0.61078 * Math.exp((17.2694 * Tc) / (Tc + 237.3));
}
function vpdKPa(leafC, airC, rh) {
  // Leaf surface SVP - Air VPD approximation
  const svpLeaf = saturationVaporPressureC(leafC);
  const svpAir = saturationVaporPressureC(airC);
  const avp = svpAir * (rh/100); // actual vapor pressure in kPa
  const vpd = Math.max(0, svpLeaf - avp);
  return vpd;
}

// ---------- Plants & Photos ----------
async function blobToObjectURL(blob) {
  return URL.createObjectURL(blob);
}

async function refreshPlants() {
  const plants = await getAll('plants');
  const list = $('#plant-list');
  const sel = $('#event-plant');
  list.innerHTML = '';
  sel.innerHTML = '';

  for (const p of plants) {
    // find photo for plant (first match)
    const photos = await getAll('photos');
    const photo = photos.find(ph => ph.plant_id === p.id);
    const imgURL = photo ? await blobToObjectURL(photo.blob) : null;

    const li = document.createElement('li');
    li.className = 'card';
    li.innerHTML = `
      <div style="display:flex; gap:10px; align-items:center;">
        ${imgURL ? `<img class="img-thumb" src="${imgURL}" alt="${p.name}">` : `<div class="img-thumb" style="display:flex;align-items:center;justify-content:center;color:#88a;">📷</div>`}
        <div>
          <b>${p.name}</b> — ${p.strain||'—'} · <i>${p.stage}</i> · start ${p.start_date||'—'}<br>
          <small>${p.tags||''}</small><br>${p.notes||''}
          <div style="margin-top:6px; display:flex; gap:6px;">
            <button data-del="${p.id}">Delete</button>
            <button data-addphoto="${p.id}">Add Photo</button>
          </div>
        </div>
      </div>`;
    list.appendChild(li);

    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    sel.appendChild(opt);
  }

  list.querySelectorAll('button[data-del]').forEach(btn => {
    btn.addEventListener('click', async () => { await remove('plants', btn.dataset.del); await refreshPlants(); });
  });
  list.querySelectorAll('button[data-addphoto]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files[0];
        if (file) {
          const buf = await file.arrayBuffer();
          await put('photos', { id: id(), plant_id: btn.dataset.addphoto, blobType: file.type, blob: new Blob([buf], {type:file.type}) });
          await refreshPlants();
        }
      };
      input.click();
    });
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

  // optional photo from form
  const photoInput = document.getElementById('plant-photo');
  if (photoInput.files && photoInput.files[0]) {
    const file = photoInput.files[0];
    const buf = await file.arrayBuffer();
    await put('photos', { id: id(), plant_id: plant.id, blobType: file.type, blob: new Blob([buf], {type:file.type}) });
  }

  form.reset();
  document.getElementById('strain-info').textContent = '';
  await refreshPlants();
}

// ---------- Events & Calendar ----------
async function refreshEvents() {
  const events = (await getAll('events')).sort((a,b)=> new Date(b.when) - new Date(a.when));
  const ul = $('#event-list');
  ul.innerHTML = '';
  for (const ev of events) {
    const li = document.createElement('li');
    li.className = 'card';
    li.innerHTML = `<b>${ev.type}</b> @ ${new Date(ev.when).toLocaleString()} — ${ev.plant_name||ev.plant_id}<br>
      pH: ${ev.ph||'—'} · PPM/EC: ${ev.ppm||'—'} · Vol: ${ev.volume_ml||'—'} ml<br>${ev.notes||''}
      <div style="margin-top:6px;display:flex;gap:6px;">
        <button data-del-ev="${ev.id}">Delete</button>
      </div>`;
    ul.appendChild(li);
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

async function refreshCalendar() {
  const start = $('#cal-start').value ? new Date($('#cal-start').value) : new Date(Date.now() - 7*24*60*60*1000);
  const end = $('#cal-end').value ? new Date($('#cal-end').value) : new Date(Date.now() + 7*24*60*60*1000);
  const events = await getAll('events');
  const ul = $('#calendar-list');
  ul.innerHTML = '';
  const filtered = events.filter(e => {
    const t = new Date(e.when).getTime();
    return t >= start.getTime() && t <= end.getTime();
  }).sort((a,b)=> new Date(a.when) - new Date(b.when));

  for (const ev of filtered) {
    const li = document.createElement('li');
    li.className = 'card';
    li.innerHTML = `${new Date(ev.when).toLocaleString()} — <b>${ev.type}</b> — ${ev.plant_name||ev.plant_id} <br><small>${ev.notes||''}</small>`;
    ul.appendChild(li);
  }
}

// ---------- Strain Info Providers ----------
// Strategy:
// 1) Try local JSON URL (CORS-permitting). Expect an array of {name, lineage, type, thc, cbd, notes, ...}
// 2) If not found, try proxy URL with {name} token. Expect JSON back.
// 3) Show best-effort info in #strain-info. User can edit providers in Settings.

async function fetchStrainFromLocalJSON(name, url) {
  if (!url) return null;
  try {
    const res = await fetch(url, {cache:'no-store'});
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;
    const s = data.find(x => (x.name||'').toLowerCase() === name.toLowerCase());
    return s || null;
  } catch (_) { return null; }
}

async function fetchStrainFromProxy(name, url) {
  if (!url) return null;
  try {
    const final = url.replace('{name}', encodeURIComponent(name));
    const res = await fetch(final, {cache:'no-store'});
    if (!res.ok) return null;
    return await res.json();
  } catch (_) { return null; }
}

function renderStrainInfo(info) {
  const box = document.getElementById('strain-info');
  if (!info) { box.textContent = 'No strain info found (yet).'; return; }
  const fields = ['name','type','lineage','thc','cbd','terpenes','effects','aroma','notes'];
  const lines = [];
  for (const f of fields) {
    if (info[f] != null) lines.push(`<b>${f.toUpperCase()}:</b> ${info[f]}`);
  }
  box.innerHTML = lines.length ? lines.join('<br>') : 'No strain info fields available.';
}

// Persist provider URLs in meta store
async function saveProvider(key, val) { return put('meta', {key, val}); }
async function loadProvider(key) { const m = await get('meta', key); return m ? m.val : ''; }

// UI wiring
$('#tab-plants').addEventListener('click', ()=>switchTab('view-plants'));
$('#tab-events').addEventListener('click', ()=>switchTab('view-events'));
$('#tab-calendar').addEventListener('click', ()=>switchTab('view-calendar'));
$('#tab-vpd').addEventListener('click', ()=>switchTab('view-vpd'));
$('#tab-settings').addEventListener('click', ()=>switchTab('view-settings'));

$('#plant-form').addEventListener('submit', (e)=>{ e.preventDefault(); addPlant(e.target); notify('Plant added','Saved locally'); });
$('#event-form').addEventListener('submit', (e)=>{ e.preventDefault(); addEvent(e.target); notify('Event logged','Saved locally'); });
$('#export-json').addEventListener('click', exportJSON);
$('#import-json').addEventListener('change', (e)=>{ if (e.target.files[0]) importJSON(e.target.files[0]); });
$('#cal-refresh').addEventListener('click', refreshCalendar);

$('#fetch-strain').addEventListener('click', async ()=> {
  const name = document.getElementById('strain-input').value.trim();
  if (!name) { alert('Enter a strain name first.'); return; }
  const localURL = document.getElementById('strain-json-url').value.trim() || await loadProvider('strain_json_url');
  const proxyURL = document.getElementById('strain-proxy-url').value.trim() || await loadProvider('strain_proxy_url');
  if (localURL) await saveProvider('strain_json_url', localURL);
  if (proxyURL) await saveProvider('strain_proxy_url', proxyURL);

  let info = await fetchStrainFromLocalJSON(name, localURL);
  if (!info) info = await fetchStrainFromProxy(name, proxyURL);
  renderStrainInfo(info);
});

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
$('#enable-notifs').addEventListener('change', (e)=> requestNotifs(e.target.checked));

// VPD form
$('#vpd-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const leafC = parseFloat(document.getElementById('leafC').value);
  const airC = parseFloat(document.getElementById('airC').value);
  const rh = parseFloat(document.getElementById('rh').value);
  const v = vpdKPa(leafC, airC, rh);
  document.getElementById('vpd-result').innerHTML = `<b>VPD:</b> ${v.toFixed(2)} kPa`;
});

// Export/Import
async function exportJSON() {
  const plants = await getAll('plants');
  const events = await getAll('events');
  const photos = await getAll('photos');
  const payload = { exported_at: new Date().toISOString(), plants, events, photos_meta: photos.map(p=>({id:p.id, plant_id:p.plant_id, blobType:p.blobType})) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'grow_tracker_export.json';
  a.click();
}
async function importJSON(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (Array.isArray(data.plants)) for (const p of data.plants) await put('plants', p);
  if (Array.isArray(data.events)) for (const e of data.events) await put('events', e);
  // Note: photos blobs are not embedded in export (keeps files small). Add again via Add Photo.
  await refreshPlants();
  await refreshEvents();
  await refreshCalendar();
}

// Init
(async function init(){
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
  }
  await openDB();
  await refreshPlants();
  await refreshEvents();
  await refreshCalendar();
  $('#enable-notifs').checked = localStorage.getItem('notifs_enabled')==='1';
  // Load saved provider URLs
  document.getElementById('strain-json-url').value = await loadProvider('strain_json_url') || '';
  document.getElementById('strain-proxy-url').value = await loadProvider('strain_proxy_url') || '';
})();
