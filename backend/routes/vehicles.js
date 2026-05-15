const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../data/vehicles.json');

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// GET all vehicles with filtering
router.get('/', (req, res) => {
  try {
    const db = readDB();
    let vehicles = db.vehicles.filter(v => v.available);

    const { make, body, condition, min_price, max_price, fuel, location, featured, search, sort } = req.query;

    if (make) vehicles = vehicles.filter(v => v.make.toLowerCase().includes(make.toLowerCase()));
    if (body) vehicles = vehicles.filter(v => v.body.toLowerCase() === body.toLowerCase());
    if (condition) vehicles = vehicles.filter(v => v.condition === condition);
    if (fuel) vehicles = vehicles.filter(v => v.fuel.toLowerCase() === fuel.toLowerCase());
    if (location) vehicles = vehicles.filter(v => v.location.toLowerCase() === location.toLowerCase());
    if (featured) vehicles = vehicles.filter(v => v.featured === true);
    if (min_price) vehicles = vehicles.filter(v => v.price >= parseInt(min_price));
    if (max_price) vehicles = vehicles.filter(v => v.price <= parseInt(max_price));
    if (search) {
      const s = search.toLowerCase();
      vehicles = vehicles.filter(v =>
        v.make.toLowerCase().includes(s) ||
        v.model.toLowerCase().includes(s) ||
        v.description.toLowerCase().includes(s)
      );
    }

    // Sorting
    if (sort === 'price_asc') vehicles.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') vehicles.sort((a, b) => b.price - a.price);
    else if (sort === 'newest') vehicles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sort === 'popular') vehicles.sort((a, b) => b.views - a.views);
    else vehicles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single vehicle by ID or slug
router.get('/:identifier', (req, res) => {
  try {
    const db = readDB();
    const { identifier } = req.params;
    const vehicle = db.vehicles.find(v => v.id === identifier || v.slug === identifier);

    if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });

    // Increment views
    vehicle.views = (vehicle.views || 0) + 1;
    writeDB(db);

    res.json({ success: true, data: vehicle });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET related vehicles
router.get('/:id/related', (req, res) => {
  try {
    const db = readDB();
    const vehicle = db.vehicles.find(v => v.id === req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, error: 'Not found' });

    const related = db.vehicles
      .filter(v => v.id !== vehicle.id && v.available && (v.make === vehicle.make || v.body === vehicle.body))
      .slice(0, 3);

    res.json({ success: true, data: related });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
