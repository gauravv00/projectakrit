const express = require('express');
const router = express.Router();
const db = require('../db');

const ZONES = {
  Dharavi: [19.0430, 72.8530],
  Kurla: [19.0726, 72.8795],
  Andheri: [19.1197, 72.8468],
  'Grant Road': [18.9646, 72.8140],
  'Navi Mumbai': [19.0330, 73.0297],
  Thane: [19.2183, 72.9781],
  Vasai: [19.3919, 72.8397]
};

const ZREC = {
  Dharavi: 'r1',
  Kurla: 'r3',
  Andheri: 'r2',
  'Grant Road': 'r3',
  'Navi Mumbai': 'r2',
  Thane: 'r2',
  Vasai: 'r1'
};

function generateManifestId() {
  const d = new Date();
  const yr = String(d.getFullYear() % 100).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const rand = String(10000 + Math.floor(Math.random() * 89999));
  return `AKR-${yr}${mo}-MH-${rand}`;
}

// GET /api/manifests - List with optional filters
router.get('/', (req, res) => {
  let list = db.get('manifests');
  const { gid, role, status, cat, rid, from, to, q } = req.query;

  if (gid) list = list.filter(m => m.gid === gid);
  if (role) list = list.filter(m => m.role === role);
  if (status) list = list.filter(m => m.status === status);
  if (cat) list = list.filter(m => m.cat === cat);
  if (rid) list = list.filter(m => m.rid === rid);

  if (from) {
    const fromTs = new Date(from).getTime();
    if (!isNaN(fromTs)) list = list.filter(m => m.pickupAt >= fromTs);
  }
  if (to) {
    const toTs = new Date(to).getTime() + 864e5 - 1;
    if (!isNaN(toTs)) list = list.filter(m => m.pickupAt <= toTs);
  }

  if (q) {
    const query = q.toLowerCase();
    list = list.filter(m =>
      (m.id + ' ' + (m.gname || '') + ' ' + (m.gcode || '') + ' ' + (m.zone || '')).toLowerCase().includes(query)
    );
  }

  // Sort descending by pickupAt
  list.sort((a, b) => (b.pickupAt || 0) - (a.pickupAt || 0));

  res.json({ success: true, count: list.length, manifests: list });
});

// GET /api/manifests/:id - Retrieve single manifest
router.get('/:id', (req, res) => {
  const manifest = db.findById('manifests', req.params.id);
  if (!manifest) {
    return res.status(404).json({ error: 'Manifest not found' });
  }
  res.json({ success: true, manifest });
});

// POST /api/manifests - Create new manifest (Generator intake)
router.post('/', (req, res) => {
  const { gid, gname, gcode, role, named, zone, cat, wl, photo, photoSample, when } = req.body;

  if (!cat || !wl || wl <= 0) {
    return res.status(400).json({ error: 'Valid waste category and weight (kg) are required' });
  }

  const userZone = zone || 'Dharavi';
  const coords = ZONES[userZone] || [19.0760, 72.8777];
  const rid = ZREC[userZone] || 'r1';

  const manifestId = generateManifestId();
  const rate = db.CAT_RATES[cat] || 22;

  const manifest = {
    id: manifestId,
    gid: gid || 'anon_' + Math.random().toString(36).slice(2, 6),
    gname: gname || 'Informal Collector',
    gcode: gcode || ('G-' + String(1000 + Math.floor(Math.random() * 8999))),
    role: role || 'kabadi',
    named: named !== false,
    zone: userZone,
    cat,
    wl: Number(wl),
    wv: null,
    expectedAmount: Math.round(Number(wl) * rate),
    paid: null,
    rid,
    pickupAt: when ? Number(when) : Date.now(),
    deliveredAt: null,
    status: 'pending',
    lat: +(coords[0] + (Math.random() - 0.5) * 0.008).toFixed(5),
    lng: +(coords[1] + (Math.random() - 0.5) * 0.008).toFixed(5),
    photo: photo || null,
    photoSample: Boolean(photoSample),
    note: '',
    payoutStatus: 'pending_verification'
  };

  db.insert('manifests', manifest);
  res.status(201).json({ success: true, manifest });
});

// PATCH /api/manifests/:id/verify - Recycler Scale Weighing Verification
router.patch('/:id/verify', (req, res) => {
  const { wv, flagNote, reason } = req.body;
  const manifest = db.findById('manifests', req.params.id);

  if (!manifest) {
    return res.status(404).json({ error: 'Manifest not found' });
  }

  const verifiedWeight = Number(wv);
  if (isNaN(verifiedWeight) || verifiedWeight <= 0) {
    return res.status(400).json({ error: 'Valid verified weight from recycler scale is required' });
  }

  const delta = Math.abs(verifiedWeight - manifest.wl) / manifest.wl;
  const updates = {
    wv: verifiedWeight,
    deliveredAt: Date.now()
  };

  if (flagNote || reason) {
    updates.status = 'flagged';
    updates.note = flagNote || reason || 'Flagged by recycler inspection';
    updates.paid = null;
    updates.payoutStatus = 'blocked';
  } else if (delta > 0.10) {
    updates.status = 'flagged';
    updates.note = `Weight differs by ${Math.round(delta * 100)}% (exceeds 10% threshold)`;
    updates.paid = null;
    updates.payoutStatus = 'blocked';
  } else {
    const rate = db.CAT_RATES[manifest.cat] || 22;
    const payoutAmount = Math.round(verifiedWeight * rate);
    updates.status = 'verified';
    updates.paid = payoutAmount;
    updates.note = '';
    // Simulated instant UPI payout execution
    updates.payoutStatus = 'paid';
    updates.payoutReference = 'UPI-' + Math.random().toString(36).slice(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4);
  }

  const updated = db.update('manifests', req.params.id, updates);
  res.json({ success: true, manifest: updated });
});

// PATCH /api/manifests/:id/flag - Anomaly Flagging
router.patch('/:id/flag', (req, res) => {
  const { reason } = req.body;
  const manifest = db.findById('manifests', req.params.id);

  if (!manifest) {
    return res.status(404).json({ error: 'Manifest not found' });
  }

  const updated = db.update('manifests', req.params.id, {
    status: 'flagged',
    note: reason || 'Weight or category mismatch flagged by recycler',
    payoutStatus: 'blocked'
  });

  res.json({ success: true, manifest: updated });
});

module.exports = router;
