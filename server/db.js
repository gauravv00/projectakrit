const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const events = new EventEmitter();

// Seed initial recyclers
const INITIAL_RECYCLERS = [
  { id: 'r1', name: 'Eco-Recycling Ltd (Ecoreco)', lic: 'MPCB/RO(HQ)/E-Waste/2024-R0072', base: 'Vasai East (7,200 MT)', vehicle: 'Tempo (Tata Ace)' },
  { id: 'r2', name: 'Evergreen Recyclekaro India', lic: 'MPCB/RO(HQ)/E-Waste/2023-R0147', base: 'Wada, Palghar (R2 & ISO)', vehicle: 'Tempo (Tata Ace)' },
  { id: 'r3', name: 'Justdispose Recycling Pvt Ltd', lic: 'MPCB/RO(HQ)/E-Waste/2024-R0120', base: 'Vasai East (1,200 MT)', vehicle: 'Pickup van (Mahindra Bolero)' },
  { id: 'r4', name: 'E-Incarnation Recycling', lic: 'MPCB/RO(HQ)/E-Waste/2024-R0095', base: 'Tarapur, Palghar (950 MT)', vehicle: 'Heavy Tempo' }
];

const CAT_RATES = {
  phone: 40,
  laptop: 32,
  wire: 22,
  battery: 28,
  board: 85,
  mixed: 18
};

function mulberry(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function buildSeedManifests() {
  const R = mulberry(11), now = Date.now(), DAY = 864e5;
  const kz = ['Dharavi','Dharavi','Dharavi','Kurla','Kurla','Andheri','Vasai','Vasai','Navi Mumbai','Navi Mumbai','Thane','Dharavi','Kurla'];
  const named = ['Imran Shaikh','Dattu Pawar','Sunita Kamble'];
  const gens = kz.map((z,i) => ({ id: 'sk'+i, role: 'kabadi', zone: z, name: i<3?named[i]:'Collector', named: i<3, code: 'G-'+(4100+i*37) }));
  const shops = [
    ['Lamington Mobile Care','Grant Road'],['Shree Ganesh Repairs','Andheri'],['Kurla Circuit House','Kurla'],
    ['Andheri Phone Clinic','Andheri'],['Navi Tech Services','Navi Mumbai'],['Thane Laptop Works','Thane'],
    ['Vasai Digital Fix','Vasai'],['Grant Road Electronics','Grant Road'],['Sai Gadget Repair','Dharavi']
  ];
  shops.forEach((s,i) => gens.push({ id: 'ss'+i, role: 'shop', zone: s[1], name: s[0], named: i%3!==2, code: 'G-'+(5200+i*41) }));
  const ZONES = { Dharavi:[19.0430,72.8530], Kurla:[19.0726,72.8795], Andheri:[19.1197,72.8468], 'Grant Road':[18.9646,72.8140], 'Navi Mumbai':[19.0330,73.0297], Thane:[19.2183,72.9781], Vasai:[19.3919,72.8397] };
  const ZREC = { Dharavi:'r1', Kurla:'r3', Andheri:'r2', 'Grant Road':'r3', 'Navi Mumbai':'r2', Thane:'r2', Vasai:'r1' };
  const wk = { kabadi: ['phone','wire','mixed','battery','phone','laptop','board'], shop: ['board','phone','laptop','board','battery','mixed'] };
  const rng = { phone:[6,30], laptop:[10,40], wire:[8,45], battery:[5,25], board:[3,14], mixed:[12,50] };

  const out = [];
  let base = 0;
  for (let i = 0; i < 46; i++) {
    const g = gens[Math.floor(R() * gens.length)];
    const cs = wk[g.role];
    const cat = cs[Math.floor(R() * cs.length)];
    const [lo, hi] = rng[cat];
    const wl = Math.round((lo + R() * (hi - lo)) * 10) / 10;
    const da = Math.floor(R() * 30);
    const h = 8 + Math.floor(R() * 10);
    const m = Math.floor(R() * 60);
    const pickupAt = (now - da * DAY) + h * 36e5 + m * 6e4;
    let status = 'verified';
    const r = R();
    if (da <= 1 && r < 0.6) status = 'pending';
    else if (r > 0.93) status = 'flagged';
    const rid = ZREC[g.zone] || 'r1';
    const z = ZONES[g.zone];
    let wv = null, deliveredAt = null, paid = null, note = '';
    if (status !== 'pending') {
      const f = status === 'flagged' ? 0.74 + R() * 0.1 : 0.94 + R() * 0.07;
      wv = Math.round(wl * f * 10) / 10;
      deliveredAt = pickupAt + (90 + Math.floor(R() * 240)) * 6e4;
      if (status === 'verified') base += wv;
      else note = 'Weight differs by more than 10%';
    }
    const d = new Date(pickupAt);
    const id = `AKR-${String(d.getFullYear() % 100)}${String(d.getMonth() + 1).padStart(2, '0')}-MH-${String(10000 + Math.floor(R() * 89999))}`;
    out.push({
      id, gid: g.id, gname: g.name, gcode: g.code, role: g.role, named: g.named,
      zone: g.zone, cat, wl, wv, paid, rid, pickupAt, deliveredAt, status,
      lat: +(z[0] + (R() - 0.5) * 0.02).toFixed(5),
      lng: +(z[1] + (R() - 0.5) * 0.02).toFixed(5),
      photo: null, photoSample: false, note, u: pickupAt, isSeed: true
    });
  }
  const factor = (1200 * 0.68) / Math.max(base, 1);
  out.forEach(m => {
    m.wl = Math.round(m.wl * factor * 10) / 10;
    if (m.wv != null) {
      m.wv = Math.round(m.wv * factor * 10) / 10;
      m.paid = m.status === 'verified' ? Math.round(m.wv * CAT_RATES[m.cat]) : null;
    }
  });
  return out;
}

function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    const seedData = {
      users: {},
      manifests: {},
      pickups: {},
      reports: [],
      recyclers: INITIAL_RECYCLERS,
      otps: {}
    };
    const seedManifests = buildSeedManifests();
    seedManifests.forEach(m => { seedData.manifests[m.id] = m; });
    saveDb(seedData);
    return seedData;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error loading db.json, returning empty', err);
    return { users: {}, manifests: {}, pickups: {}, reports: [], recyclers: INITIAL_RECYCLERS, otps: {} };
  }
}

function saveDb(data) {
  const tempFile = DB_FILE + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

const db = {
  events,
  CAT_RATES,
  
  get(collection) {
    const data = loadDb();
    const col = data[collection] || {};
    return Array.isArray(col) ? col : Object.values(col);
  },

  getMap(collection) {
    const data = loadDb();
    return data[collection] || {};
  },

  findById(collection, id) {
    const data = loadDb();
    const col = data[collection] || {};
    return Array.isArray(col) ? col.find(x => x.id === id) : col[id] || null;
  },

  insert(collection, item) {
    const data = loadDb();
    item.createdAt = item.createdAt || Date.now();
    item.u = Date.now();
    if (Array.isArray(data[collection])) {
      data[collection].unshift(item);
    } else {
      data[collection] = data[collection] || {};
      data[collection][item.id] = item;
    }
    saveDb(data);
    events.emit('change', { type: 'insert', collection, item });
    return item;
  },

  update(collection, id, updates) {
    const data = loadDb();
    let updatedItem = null;
    if (Array.isArray(data[collection])) {
      const idx = data[collection].findIndex(x => x.id === id);
      if (idx !== -1) {
        data[collection][idx] = { ...data[collection][idx], ...updates, u: Date.now() };
        updatedItem = data[collection][idx];
      }
    } else {
      if (data[collection] && data[collection][id]) {
        data[collection][id] = { ...data[collection][id], ...updates, u: Date.now() };
        updatedItem = data[collection][id];
      }
    }
    if (updatedItem) {
      saveDb(data);
      events.emit('change', { type: 'update', collection, item: updatedItem });
    }
    return updatedItem;
  },

  delete(collection, id) {
    const data = loadDb();
    let deleted = false;
    if (Array.isArray(data[collection])) {
      const idx = data[collection].findIndex(x => x.id === id);
      if (idx !== -1) {
        data[collection].splice(idx, 1);
        deleted = true;
      }
    } else {
      if (data[collection] && data[collection][id]) {
        delete data[collection][id];
        deleted = true;
      }
    }
    if (deleted) {
      saveDb(data);
      events.emit('change', { type: 'delete', collection, id });
    }
    return deleted;
  }
};

module.exports = db;
