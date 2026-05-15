# 🗺️ Still Autos — Development Roadmap

> A step-by-step guide to building, extending, and scaling the platform.

---

## ✅ Phase 0: Foundation (COMPLETE — Included in This Release)

| Task | Status |
|------|--------|
| Project architecture & folder structure | ✅ Done |
| Express.js backend + routing | ✅ Done |
| JSON database system | ✅ Done |
| Dual-theme CSS design system | ✅ Done |
| Luxury homepage with parallax hero | ✅ Done |
| Vehicle inventory grid + filters | ✅ Done |
| Vehicle detail pages (VDP) | ✅ Done |
| Image gallery with lightbox | ✅ Done |
| Finance calculator with chart | ✅ Done |
| WhatsApp integration | ✅ Done |
| Admin dashboard (CRUD) | ✅ Done |
| Inquiry capture system | ✅ Done |
| Image upload via Multer | ✅ Done |
| About & Contact pages | ✅ Done |
| 404 page | ✅ Done |
| README documentation | ✅ Done |
| Mobile-first responsive design | ✅ Done |
| Dark/Light theme toggle | ✅ Done |

---

## 🚀 Phase 1: Polish & Enhancement (Week 1–2)

### 1.1 Frontend Polish
- [ ] Add GSAP animations to homepage hero sections
- [ ] Integrate Swiper.js for mobile vehicle card carousel
- [ ] Add animated number counters with Intersection Observer
- [ ] Implement skeleton loading states for all API calls
- [ ] Add smooth page transitions between routes
- [ ] Create a floating WhatsApp button on all pages
- [ ] Add "Back to Top" button

**How to add GSAP:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
```

```javascript
// In home.js
gsap.registerPlugin(ScrollTrigger);

gsap.from('.hero-title', {
  y: 60, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.3
});

gsap.from('.why-card', {
  y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out',
  scrollTrigger: { trigger: '.why-grid', start: 'top 80%' }
});
```

### 1.2 Swiper.js Integration
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"/>
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
```

```javascript
const swiper = new Swiper('.vehicles-swiper', {
  slidesPerView: 1.2,
  spaceBetween: 16,
  breakpoints: {
    640: { slidesPerView: 2, spaceBetween: 20 },
    1024: { slidesPerView: 3, spaceBetween: 24 }
  },
  pagination: { el: '.swiper-pagination', clickable: true }
});
```

### 1.3 Performance
- [ ] Add `loading="lazy"` to all non-hero images (already done)
- [ ] Implement image WebP conversion on upload using Sharp
- [ ] Add service worker for offline support
- [ ] Minify CSS and JS for production
- [ ] Add `<link rel="preconnect">` for Google Fonts

---

## 🛠️ Phase 2: Feature Expansion (Week 3–4)

### 2.1 Vehicle Comparison Tool
Create `frontend/pages/compare.html`:
```javascript
// Store up to 3 vehicles in localStorage
const comparison = JSON.parse(localStorage.getItem('sa-compare') || '[]');

function addToCompare(vehicleId) {
  if (comparison.length >= 3) {
    Toast.show('Maximum 3 vehicles for comparison', 'warning');
    return;
  }
  comparison.push(vehicleId);
  localStorage.setItem('sa-compare', JSON.stringify(comparison));
}
```

### 2.2 Wishlist / Saved Vehicles
```javascript
const wishlist = JSON.parse(localStorage.getItem('sa-wishlist') || '[]');

function toggleWishlist(vehicleId) {
  const idx = wishlist.indexOf(vehicleId);
  if (idx > -1) wishlist.splice(idx, 1);
  else wishlist.push(vehicleId);
  localStorage.setItem('sa-wishlist', JSON.stringify(wishlist));
  updateWishlistUI();
}
```

### 2.3 Advanced Search Page
- Full-text search across all vehicle fields
- Price range slider
- Sort by relevance
- Save searches to localStorage

### 2.4 Vehicle Enquiry Email Notifications

Install nodemailer:
```bash
npm install nodemailer
```

Add to `backend/routes/inquiries.js`:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

async function sendNotification(inquiry) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'info@stillautos.ng',
    subject: `New Inquiry from ${inquiry.name}`,
    html: `<h2>New Vehicle Inquiry</h2>
           <p><strong>Name:</strong> ${inquiry.name}</p>
           <p><strong>Phone:</strong> ${inquiry.phone}</p>
           <p><strong>Message:</strong> ${inquiry.message}</p>`
  });
}
```

### 2.5 Admin Image Upload
Add drag-and-drop to admin vehicle form:
```javascript
const dropzone = document.getElementById('image-dropzone');
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
dropzone.addEventListener('drop', async (e) => {
  e.preventDefault();
  const files = [...e.dataTransfer.files];
  const fd = new FormData();
  files.forEach(f => fd.append('images', f));
  const res = await fetch('/api/upload/images', { method: 'POST', body: fd });
  const data = await res.json();
  // Add URLs to form
  data.urls.forEach(url => addImageUrlToForm(url));
});
```

---

## 🔗 Phase 3: Integrations (Week 5–6)

### 3.1 Google Analytics 4
```html
<!-- Add to <head> of all pages -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Track vehicle views:
```javascript
// In vehicle-detail.js after vehicle loads
gtag('event', 'vehicle_view', {
  vehicle_id: v.id,
  vehicle_name: `${v.year} ${v.make} ${v.model}`,
  vehicle_price: v.price
});
```

### 3.2 Facebook Pixel
```html
<script>
!function(f,b,e,v,n,t,s){...} // Facebook Pixel base code
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
```

Track WhatsApp clicks:
```javascript
// In app.js WhatsApp helper
fbq('track', 'Contact', { content_name: 'WhatsApp Inquiry' });
```

### 3.3 Instagram Feed
Embed latest Instagram posts using Instagram Basic Display API:
```javascript
async function loadInstagramFeed() {
  const res = await fetch(`https://graph.instagram.com/me/media?fields=id,media_url,permalink&access_token=${TOKEN}`);
  const data = await res.json();
  // Render in grid
}
```

### 3.4 Google My Business
- Verify business listing
- Add showroom photos
- Enable Google Reviews display

---

## 💾 Phase 4: Database Migration (Week 7–8)

Migrate from JSON to a real database for production scale.

### Option A: SQLite (Easiest — still file-based)
```bash
npm install better-sqlite3
```

```javascript
const Database = require('better-sqlite3');
const db = new Database('./backend/data/stillautos.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    make TEXT, model TEXT, year INTEGER,
    price INTEGER, condition TEXT, available INTEGER DEFAULT 1,
    images TEXT, features TEXT, created_at TEXT
  )
`);
```

### Option B: MongoDB Atlas (Free tier)
```bash
npm install mongoose
```

```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

const vehicleSchema = new mongoose.Schema({
  make: String, model: String, year: Number,
  price: Number, images: [String], features: [String],
  available: { type: Boolean, default: true }
}, { timestamps: true });
```

### Option C: Supabase (PostgreSQL + Auth)
```bash
npm install @supabase/supabase-js
```

```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const { data } = await supabase.from('vehicles').select('*').eq('available', true);
```

---

## 🚀 Phase 5: Production Scaling (Month 2+)

### 5.1 Authentication Upgrade
Replace simple token auth with JWT:
```bash
npm install jsonwebtoken bcrypt
```

### 5.2 Multi-Location Support
- Extend vehicle schema with `branch` field
- Add branch filter to inventory
- Branch-specific landing pages

### 5.3 Test Drive Booking System
- Calendar integration
- Time slot management
- SMS confirmation via Termii API

### 5.4 Vehicle 360° View
Integrate `three.js` or embed Spline.design for 3D vehicle views.

### 5.5 Progressive Web App (PWA)
Add `manifest.json`:
```json
{
  "name": "Still Autos",
  "short_name": "Still Autos",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#c9a84c",
  "icons": [{ "src": "/assets/icon-192.png", "sizes": "192x192" }]
}
```

Add Service Worker for offline support.

---

## 📈 Phase 6: Marketing Features (Month 3+)

### 6.1 Blog / Content Section
- Luxury automotive articles
- SEO traffic from Nigerian car enthusiasts
- New arrivals announcements

### 6.2 Referral Program
Track referrals with unique URLs:
```
stillautos.ng/ref/REFERRER_CODE
```

### 6.3 Newsletter / SMS Campaigns
Integrate with Termii (Nigerian SMS) or Mailchimp for:
- New arrival alerts
- Price drop notifications
- Finance rate updates

### 6.4 Video Integration
- YouTube embed for vehicle walkaround videos
- Auto-play muted hero video option

---

## 🔒 Security Checklist (Before Launch)

- [ ] Change default admin credentials
- [ ] Generate strong `token_secret` in settings.json
- [ ] Add rate limiting: `npm install express-rate-limit`
- [ ] Add CORS whitelist for production domain
- [ ] Enable HTTPS (auto via Railway/Render)
- [ ] Add input sanitization: `npm install express-validator`
- [ ] Set up regular JSON database backups
- [ ] Configure proper CSP headers
- [ ] Add robots.txt (block `/admin-panel`, `/api/admin`)

---

## 📊 KPIs to Track

| Metric | Target |
|--------|--------|
| Vehicle page views | 1000+/month |
| WhatsApp click rate | >5% of visitors |
| Inquiry conversion | >2% of visitors |
| Mobile traffic | >60% |
| Page load time | <3 seconds |
| Admin response time | <1 hour |

---

*The roadmap above represents a comprehensive evolution from MVP to enterprise-grade platform. Tackle each phase sequentially for best results.*
