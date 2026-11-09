const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const authRoutes = require('./routes/auth');
const manifestRoutes = require('./routes/manifests');
const pickupRoutes = require('./routes/pickups');
const complianceRoutes = require('./routes/compliance');
const recyclerRoutes = require('./routes/recyclers');
const eventRoutes = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage for uploaded waste and signboard photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'photo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Middlewares
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static file hosting
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, '..')));

// Photo upload endpoint
app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl, filename: req.file.filename });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/manifests', manifestRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/recyclers', recyclerRoutes);
app.use('/api/events', eventRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Project Akrit Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Fallback to index.html for SPA client navigation
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    return res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
  next();
});

// Start server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🌿 Project Akrit Backend & Web App Running`);
  console.log(`📍 Local URL: http://localhost:${PORT}`);
  console.log(`📡 API Base:  http://localhost:${PORT}/api`);
  console.log(`⚡ Real-time SSE: http://localhost:${PORT}/api/events`);
  console.log(`===============================================`);
});
