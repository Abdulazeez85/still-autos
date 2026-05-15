const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '../data/inquiries.json');
const VEHICLES_DB = path.join(__dirname, '../data/vehicles.json');

function readDB() { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
function writeDB(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

router.post('/', (req, res) => {
  try {
    const db = readDB();
    const { vehicle_id, name, email, phone, message, type } = req.body;

    if (!name || !phone) return res.status(400).json({ success: false, error: 'Name and phone required' });

    const inquiry = {
      id: uuidv4(),
      vehicle_id,
      name,
      email: email || '',
      phone,
      message: message || '',
      type: type || 'general',
      status: 'new',
      created_at: new Date().toISOString()
    };

    db.inquiries.push(inquiry);
    writeDB(db);

    // Increment vehicle inquiry count
    if (vehicle_id) {
      const vDb = JSON.parse(fs.readFileSync(VEHICLES_DB, 'utf8'));
      const v = vDb.vehicles.find(v => v.id === vehicle_id);
      if (v) {
        v.inquiries = (v.inquiries || 0) + 1;
        fs.writeFileSync(VEHICLES_DB, JSON.stringify(vDb, null, 2));
      }
    }

    res.status(201).json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
