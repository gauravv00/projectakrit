const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/recyclers - List MPCB authorized recyclers
router.get('/', (req, res) => {
  const recyclers = db.get('recyclers');
  res.json({ success: true, count: recyclers.length, recyclers });
});

module.exports = router;
