const express = require('express');
const router = express.Router();
const db = require('../db');

// Send OTP (Mock / Demo / SMS integration hook)
router.post('/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ error: 'Valid 10-digit Indian mobile number required' });
  }

  // Demo standard OTP is 123456; in production connect Twilio / Fast2SMS / MSG91
  const otp = '123456';
  db.update('otps', phone, { phone, otp, expiresAt: Date.now() + 5 * 60 * 1000 }) ||
    db.insert('otps', { id: phone, phone, otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  res.json({
    success: true,
    message: `OTP sent successfully to +91 ${phone}`,
    hint: 'Use 123456 for demo environment'
  });
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { phone, otp, email } = req.body;
  
  // Compliance officers verify via corporate email
  if (email) {
    if (otp !== '123456') {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    const user = db.findById('users', email) || { id: email, email, role: 'compliance', verified: true };
    return res.json({ success: true, user });
  }

  // Phone OTP verification
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  const record = db.findById('otps', phone);
  if (!record || record.otp !== otp) {
    return res.status(400).json({ error: 'Invalid or expired OTP. Try 123456 in demo mode.' });
  }

  // Find or initialize user
  let user = db.get('users').find(u => u.phone === phone);
  if (!user) {
    user = {
      id: 'u_' + Math.random().toString(36).slice(2, 10),
      phone,
      verified: true,
      createdAt: Date.now()
    };
    db.insert('users', user);
  }

  res.json({ success: true, user });
});

// Save / Update User Profile
router.post('/profile', (req, res) => {
  const profile = req.body;
  if (!profile || !profile.role) {
    return res.status(400).json({ error: 'Role and profile details are required' });
  }

  let id = profile.id;
  if (!id) {
    id = 'u_' + Math.random().toString(36).slice(2, 10);
    profile.id = id;
  }

  const existing = db.findById('users', id);
  if (existing) {
    db.update('users', id, profile);
  } else {
    db.insert('users', profile);
  }

  res.json({ success: true, profile });
});

// Get User Profile
router.get('/profile/:id', (req, res) => {
  const user = db.findById('users', req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ success: true, user });
});

module.exports = router;
