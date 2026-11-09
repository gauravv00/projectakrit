const express = require('express');
const router = express.Router();
const db = require('../db');

function quarterOf(ts) {
  const d = new Date(ts), m = d.getMonth(), y = d.getFullYear();
  const fy = m >= 3 ? y : y - 1;
  const q = m >= 3 && m <= 5 ? 1 : m >= 6 && m <= 8 ? 2 : m >= 9 && m <= 11 ? 3 : 4;
  const sm = [3, 6, 9, 0][q - 1], sy = q === 4 ? fy + 1 : fy;
  const start = new Date(sy, sm, 1).getTime();
  const end = new Date(sy, sm + 3, 1).getTime() - 1;
  return { q, fy, start, end, label: `Q${q} FY${String(fy).slice(2)}-${String(fy + 1).slice(2)}` };
}

// GET /api/compliance/summary - EPR Portfolio Overview
router.get('/summary', (req, res) => {
  const target = Number(req.query.target) || 1200;
  const kgPerCredit = Number(req.query.kgPerCredit) || 1;
  const Q = quarterOf(Date.now());

  const all = db.get('manifests');
  const qm = all.filter(m => m.pickupAt >= Q.start && m.pickupAt <= Q.end);
  const ver = qm.filter(m => m.status === 'verified');
  const totalVerifiedKg = ver.reduce((acc, m) => acc + (m.wv || 0), 0);

  const gens = new Map();
  qm.forEach(m => gens.set(m.gid, m.role));
  const kabadiCount = [...gens.values()].filter(r => r === 'kabadi').length;
  const shopCount = [...gens.values()].filter(r => r === 'shop').length;

  // Breakdown by zone
  const zones = {};
  ver.forEach(m => {
    if (!zones[m.zone]) zones[m.zone] = { kg: 0, count: 0 };
    zones[m.zone].kg += (m.wv || 0);
    zones[m.zone].count++;
  });

  // Breakdown by category
  const categories = {};
  ver.forEach(m => {
    if (!categories[m.cat]) categories[m.cat] = { kg: 0, count: 0 };
    categories[m.cat].kg += (m.wv || 0);
    categories[m.cat].count++;
  });

  res.json({
    success: true,
    quarter: Q,
    targetKg: target,
    verifiedKg: totalVerifiedKg,
    compliancePercentage: +(totalVerifiedKg / target * 100).toFixed(1),
    claimableCredits: Math.floor(totalVerifiedKg / kgPerCredit),
    activeGenerators: gens.size,
    generatorsBreakdown: { kabadi: kabadiCount, shops: shopCount },
    zonesBreakdown: zones,
    categoriesBreakdown: categories
  });
});

// GET /api/compliance/reports - List archived reports
router.get('/reports', (req, res) => {
  const reports = db.get('reports');
  res.json({ success: true, count: reports.length, reports });
});

// POST /api/compliance/reports - Record new audit report
router.post('/reports', (req, res) => {
  const { ref, from, to, kg, count, filters } = req.body;
  const report = {
    id: 'RPT-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    ref: ref || ('RPT-' + Date.now().toString().slice(-6)),
    from: from || '',
    to: to || '',
    kg: Number(kg) || 0,
    count: Number(count) || 0,
    filters: filters || {},
    createdAt: Date.now()
  };
  db.insert('reports', report);
  res.status(201).json({ success: true, report });
});

module.exports = router;
