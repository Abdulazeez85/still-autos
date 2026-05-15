const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const vehicleRoutes = require('./routes/vehicles');
const adminRoutes = require('./routes/admin');
const inquiryRoutes = require('./routes/inquiries');
const financeRoutes = require('./routes/finance');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & middleware
app.use(helmet({
  contentSecurityPolicy: false // allow CDN resources
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/upload', uploadRoutes);

// Page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
app.get('/inventory', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/inventory.html'));
});
app.get('/vehicle/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/vehicle-detail.html'));
});
app.get('/finance', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/finance.html'));
});
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/about.html'));
});
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/contact.html'));
});
app.get('/admin-panel', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../frontend/pages/404.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`\n🚗 Still Autos Server Running`);
  console.log(`📍 Local:   http://localhost:${PORT}`);
  console.log(`🔧 Admin:   http://localhost:${PORT}/admin-panel`);
  console.log(`📡 API:     http://localhost:${PORT}/api`);
  console.log(`\n`);
});

module.exports = app;
