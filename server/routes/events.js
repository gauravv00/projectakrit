const express = require('express');
const router = express.Router();
const db = require('../db');

// Clients array
let clients = [];

// Broadcast helper
function broadcast(data) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(client => {
    try {
      client.res.write(message);
    } catch (err) {
      // client disconnected
    }
  });
}

// Listen to db changes
db.events.on('change', event => {
  broadcast({
    type: event.type,
    collection: event.collection,
    item: event.item,
    id: event.id,
    timestamp: Date.now()
  });
});

// GET /api/events - Server-Sent Events stream
router.get('/', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const clientId = Date.now() + Math.random().toString(36).slice(2, 6);
  const newClient = { id: clientId, res };
  clients.push(newClient);

  // Send initial connection heartbeat
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

  // Keep-alive heartbeat every 25 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch (e) {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clients = clients.filter(c => c.id !== clientId);
  });
});

module.exports = router;
