const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const VEHICLES_DB = path.join(__dirname, '../data/vehicles.json');
const INQUIRIES_DB = path.join(__dirname, '../data/inquiries.json');
const SETTINGS_DB = path.join(__dirname, '../data/settings.json');

function readVehicles() { return JSON.parse(fs.readFileSync(VEHICLES_DB, 'utf8')); }
function writeVehicles(data) { fs.writeFileSync(VEHICLES_DB, JSON.stringify(data, null, 2)); }
function readInquiries() { return JSON.parse(fs.readFileSync(INQUIRIES_DB, 'utf8')); }
function readSettings() { return JSON.parse(fs.readFileSync(SETTINGS_DB, 'utf8')); }

// Simple token auth middleware
function auth(req, res, next) {
  const token = req.headers['x-admin-token'];
  const settings = readSettings();
  if (token !== settings.admin.token_secret) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
}

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const settings = readSettings();
  if (username === settings.admin.username && password === settings.admin.password) {
    res.json({ success: true, token: settings.admin.token_secret });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// Dashboard stats
router.get('/stats', auth, (req, res) => {
  try {
    const vDb = readVehicles();
    const iDb = readInquiries();
    const vehicles = vDb.vehicles;

    res.json({
      success: true,
      data: {
        total_vehicles: vehicles.length,
        available: vehicles.filter(v => v.available).length,
        featured: vehicles.filter(v => v.featured).length,
        new_vehicles: vehicles.filter(v => v.condition === 'new').length,
        used_vehicles: vehicles.filter(v => v.condition === 'used').length,
        total_inquiries: iDb.inquiries.length,
        total_views: vehicles.reduce((sum, v) => sum + (v.views || 0), 0),
        inventory_value: vehicles.filter(v => v.available).reduce((sum, v) => sum + v.price, 0),
        recent_inquiries: iDb.inquiries.slice(-5).reverse()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all vehicles (admin)
router.get('/vehicles', auth, (req, res) => {
  const db = readVehicles();
  res.json({ success: true, data: db.vehicles });
});

// Create vehicle
router.post('/vehicles', auth, (req, res) => {
  try {
    const db = readVehicles();
    const id = 'sa-' + Date.now();
    const slug = `${req.body.year}-${req.body.make}-${req.body.model}`
      .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const vehicle = {
      id,
      slug,
      ...req.body,
      views: 0,
      inquiries: 0,
      available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.vehicles.unshift(vehicle);
    writeVehicles(db);
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update vehicle
router.put('/vehicles/:id', auth, (req, res) => {
  try {
    const db = readVehicles();
    const idx = db.vehicles.findIndex(v => v.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });

    db.vehicles[idx] = { ...db.vehicles[idx], ...req.body, updated_at: new Date().toISOString() };
    writeVehicles(db);
    res.json({ success: true, data: db.vehicles[idx] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete vehicle
router.delete('/vehicles/:id', auth, (req, res) => {
  try {
    const db = readVehicles();
    const idx = db.vehicles.findIndex(v => v.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
    db.vehicles.splice(idx, 1);
    writeVehicles(db);
    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get inquiries
router.get('/inquiries', auth, (req, res) => {
  const db = readInquiries();
  res.json({ success: true, data: db.inquiries.reverse() });
});

module.exports = router;
