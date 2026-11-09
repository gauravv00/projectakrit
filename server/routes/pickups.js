const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/pickups - List pickups with optional shop filter
router.get('/', (req, res) => {
  let list = db.get('pickups');
  const { shopId } = req.query;
  if (shopId) {
    list = list.filter(p => p.shop === shopId);
  }
  list.sort((a, b) => (b.date || 0) - (a.date || 0));
  res.json({ success: true, count: list.length, pickups: list });
});

// POST /api/pickups - Schedule a tempo pickup
router.post('/', (req, res) => {
  const { shopId, cat, kg, date, window, rid, vehicle, notes } = req.body;

  if (!shopId || !cat || !kg || !date) {
    return res.status(400).json({ error: 'Shop ID, category, estimated weight, and date are required' });
  }

  const pickupId = 'PK-' + Math.random().toString(36).slice(2, 6).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  const pickupDate = Number(date);

  const pickup = {
    id: pickupId,
    shop: shopId,
    cat,
    kg: Number(kg),
    date: pickupDate,
    window: window || '10:00–12:00',
    rid: rid || 'r2',
    vehicle: vehicle || (Number(kg) > 40 ? 'Mahindra Bolero' : 'Tata Ace (Tempo)'),
    notes: (notes || '').trim(),
    status: 'scheduled',
    createdAt: Date.now()
  };

  db.insert('pickups', pickup);
  res.status(201).json({ success: true, pickup });
});

module.exports = router;
