# 🚗 Still Autos — Premium Luxury Automotive Dealership Platform

> **Nigeria's premier luxury automotive dealership platform** — built with pure HTML5, CSS3, Vanilla JS, Node.js and Express.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [VS Code Setup](#vs-code-setup)
- [Features](#features)
- [Admin Dashboard](#admin-dashboard)
- [API Reference](#api-reference)
- [Theme System](#theme-system)
- [WhatsApp Integration](#whatsapp-integration)
- [Customization](#customization)
- [Deployment](#deployment)

---

## Overview

Still Autos is a **production-grade** luxury automotive dealership platform designed for the Nigerian market. The UI draws inspiration from Dubai's elite dealerships and premium UK automotive brands — cinematic, minimal, and conversion-focused.

**Default Admin Credentials:**
- Username: `admin`
- Password: `stillautos2024`

> ⚠️ Change these in `backend/data/settings.json` before deploying.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JS (ES6+) |
| Backend | Node.js + Express.js |
| Database | JSON File-based (no dependencies) |
| Fonts | Cormorant Garamond + Outfit (Google Fonts) |
| Images | Unsplash CDN (replaceable) |
| File Upload | Multer |

---

## Project Structure

```
still-autos/
├── frontend/                 # Public-facing website
│   ├── index.html            # Homepage
│   ├── css/
│   │   ├── variables.css     # Design system + dual theme
│   │   ├── navbar.css        # Navigation component
│   │   ├── vehicles.css      # Cards + inventory grid
│   │   ├── home.css          # Homepage sections
│   │   ├── vehicle-detail.css # VDP layout
│   │   └── finance.css       # Calculator page
│   ├── js/
│   │   ├── app.js            # Core: theme, navbar, API, utilities
│   │   ├── home.js           # Homepage logic
│   │   ├── inventory.js      # Inventory + filtering
│   │   ├── vehicle-detail.js # VDP logic + gallery
│   │   └── finance.js        # Calculator
│   └── pages/
│       ├── inventory.html
│       ├── vehicle-detail.html
│       ├── finance.html
│       ├── about.html
│       ├── contact.html
│       └── 404.html
│
├── admin/                    # Admin dashboard
│   ├── index.html            # Admin SPA
│   ├── css/admin.css
│   └── js/admin.js
│
├── backend/                  # Express server
│   ├── server.js             # Main server
│   ├── routes/
│   │   ├── vehicles.js       # Vehicle CRUD + filtering
│   │   ├── admin.js          # Admin auth + management
│   │   ├── inquiries.js      # Lead capture
│   │   ├── finance.js        # Loan calculator
│   │   └── upload.js         # Image upload
│   └── data/                 # JSON databases
│       ├── vehicles.json     # Vehicle inventory
│       ├── inquiries.json    # Customer leads
│       └── settings.json     # Site config
│
├── uploads/                  # Uploaded vehicle images
├── package.json
├── README.md
├── ROADMAP.md
└── DEPLOYMENT.md
```

---

## Quick Start

### Prerequisites
- Node.js 18+ (`node --version`)
- npm 9+

### Installation

```bash
# 1. Clone or extract the project
cd still-autos

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# Website:  http://localhost:3000
# Admin:    http://localhost:3000/admin-panel
# API:      http://localhost:3000/api/vehicles
```

---

## VS Code Setup

### Recommended Extensions

Install these for the best development experience:

```
Name: Prettier - Code formatter
ID: esbenp.prettier-vscode

Name: ESLint
ID: dbaeumer.vscode-eslint

Name: Live Server
ID: ritwickdey.liveserver

Name: Thunder Client (API testing)
ID: rangav.vscode-thunder-client

Name: Auto Rename Tag
ID: formulahendry.auto-rename-tag

Name: CSS Variables Autocomplete
ID: vunguyentuan.vscode-css-variables
```

### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "emmet.includeLanguages": {
    "javascript": "html"
  },
  "liveServer.settings.port": 3001,
  "files.associations": {
    "*.html": "html"
  }
}
```

### Launch Config

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Start Still Autos Server",
      "program": "${workspaceFolder}/backend/server.js",
      "env": { "PORT": "3000" },
      "console": "integratedTerminal"
    }
  ]
}
```

---

## Features

### 🎨 Frontend
- **Cinematic Homepage** — parallax hero, animated stats, featured vehicles
- **Inventory Grid** — advanced filtering by make, body, condition, price, location
- **Vehicle Detail Pages (VDP)** — multi-image gallery, lightbox, spec cards, features
- **Finance Calculator** — interactive sliders, donut chart, loan breakdown
- **WhatsApp Integration** — one-click vehicle-specific WhatsApp links
- **SEO Optimized** — meta tags, semantic HTML, structured data ready
- **Mobile-First** — fully responsive across all breakpoints
- **Luxury Animations** — GSAP-ready, smooth transitions, scroll reveal

### 🌗 Dual Theme System
- Dark Mode: Cinematic matte black + gold accents
- Light Mode: Editorial cream + refined gold
- Smooth animated transitions
- localStorage persistence
- System preference detection

### ⚙️ Backend
- RESTful API with Express.js
- JSON file-based storage (no database setup required)
- Vehicle CRUD operations
- Advanced filtering + sorting
- Inquiry management
- Finance calculation engine
- Image upload with Multer
- Simple token authentication

### 🔧 Admin Dashboard
- Login screen with authentication
- Stats dashboard (views, inventory value, inquiries)
- Full vehicle management (add, edit, delete, toggle availability)
- Inquiry inbox
- Vehicle photo management via URLs
- Featured vehicle control

---

## Admin Dashboard

Access at: `http://localhost:3000/admin-panel`

**Default login:** `admin` / `stillautos2024`

Change credentials in `backend/data/settings.json`:

```json
{
  "admin": {
    "username": "your-username",
    "password": "your-secure-password",
    "token_secret": "your-unique-secret-string"
  }
}
```

---

## API Reference

### Vehicles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | Get all vehicles (with filters) |
| GET | `/api/vehicles/:id` | Get single vehicle |
| GET | `/api/vehicles/:id/related` | Get related vehicles |

**Query Params:** `make`, `body`, `condition`, `fuel`, `location`, `featured`, `min_price`, `max_price`, `search`, `sort`

### Admin (requires `x-admin-token` header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Authenticate |
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/vehicles` | All vehicles |
| POST | `/api/admin/vehicles` | Create vehicle |
| PUT | `/api/admin/vehicles/:id` | Update vehicle |
| DELETE | `/api/admin/vehicles/:id` | Delete vehicle |
| GET | `/api/admin/inquiries` | All inquiries |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/inquiries` | Submit inquiry |
| POST | `/api/finance/calculate` | Calculate loan |
| POST | `/api/upload/images` | Upload images |

---

## Theme System

The dual theme is controlled by `data-theme` attribute on `<html>`:

```javascript
// Switch theme
document.documentElement.setAttribute('data-theme', 'light'); // or 'dark'

// Via built-in manager
SA.ThemeManager.toggle();
SA.ThemeManager.set('dark');
SA.ThemeManager.get(); // returns 'dark' or 'light'
```

**CSS Custom Properties** update automatically. All components use `var(--bg-primary)`, `var(--text-primary)`, `var(--accent)`, etc.

---

## WhatsApp Integration

Each vehicle page generates a pre-filled WhatsApp message:

```javascript
// Built-in helper
SA.WhatsApp.openVehicle(vehicle);
SA.WhatsApp.openGeneral('Custom message');

// Custom usage
const msg = `Hi Still Autos, I'm interested in the ${year} ${make} ${model}`;
const url = `https://wa.me/2348012345678?text=${encodeURIComponent(msg)}`;
window.open(url, '_blank');
```

Update the WhatsApp number in `frontend/js/app.js`:
```javascript
const CONFIG = {
  WHATSAPP_NUMBER: '2348012345678', // Change this
  ...
};
```

---

## Customization

### Change Dealership Info

Edit `backend/data/settings.json`:
```json
{
  "dealership": {
    "name": "Still Autos",
    "phone": "+234 801 234 5678",
    "whatsapp": "+2348012345678",
    "address": "5 Bourdillon Road, Ikoyi, Lagos"
  }
}
```

### Change Brand Colours

Edit `frontend/css/variables.css`:
```css
[data-theme="dark"] {
  --accent: #c9a84c;        /* Gold accent */
  --accent-light: #e4c97a;  /* Lighter gold */
}
[data-theme="light"] {
  --accent: #9a6f2e;        /* Darker gold for light bg */
}
```

### Add Vehicles

Via Admin Dashboard **or** directly in `backend/data/vehicles.json`.

---

## Deployment

See `DEPLOYMENT.md` for full instructions.

**Quick deploy on Railway:**
1. Push to GitHub
2. Connect Railway to your repo
3. Set `PORT=3000`
4. Deploy

---

## License

MIT © 2025 Still Autos Nigeria Ltd.

---

*Built with precision for Nigeria's luxury market.*
