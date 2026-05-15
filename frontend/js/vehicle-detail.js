/* ============================================
   STILL AUTOS — VEHICLE DETAIL PAGE JS
   ============================================ */

"use strict";

let currentVehicle = null;
let currentImageIndex = 0;

document.addEventListener("DOMContentLoaded", async () => {
  const id = getVehicleId();
  if (!id) {
    window.location.href = "/inventory";
    return;
  }

  await loadVehicle(id);
  initMiniCalc();
  initInquiryForm();
});

// ===== GET ID FROM URL =====
function getVehicleId() {
  const path = window.location.pathname;
  const parts = path.split("/");
  return parts[parts.length - 1];
}

// ===== LOAD VEHICLE =====
async function loadVehicle(id) {
  try {
    const res = await SA.API.get(`/vehicles/${id}`);
    if (!res.success) throw new Error("Not found");
    currentVehicle = res.data;
    renderVehicle(currentVehicle);
    loadRelated(id);
  } catch (err) {
    document.getElementById("vdp-container").innerHTML = `
      <div class="empty-state" style="min-height:50vh;display:flex;align-items:center;justify-content:center;flex-direction:column">
        <div class="empty-state-icon">🚗</div>
        <h3>Vehicle not found</h3>
        <p class="text-muted">This vehicle may no longer be available.</p>
        <a href="/inventory" class="btn btn-primary" style="margin-top:1.5rem">Browse Inventory</a>
      </div>`;
  }
}

// ===== RENDER VEHICLE =====
function renderVehicle(v) {
  document.title = `${v.year} ${v.make} ${v.model} — Still Autos`;

  const price = SA.Currency.format(v.price);
  const priceM = SA.Currency.formatMillion(v.price);
  const mileageDisplay =
    v.mileage === 0 ? "Brand New" : `${v.mileage.toLocaleString()} km`;

  // Gallery
  renderGallery(v.images);

  // Breadcrumb
  safeSet("vdp-breadcrumb-model", `${v.year} ${v.make} ${v.model}`);

  // Header
  safeSet("vdp-make", v.make);
  safeSet("vdp-title", `${v.model}`);

  // Meta
  safeSet("vdp-year", v.year);
  safeSet("vdp-location", v.location);
  safeSet("vdp-views", `${v.views || 0} views`);
  safeSet("vdp-condition", v.condition === "new" ? "Brand New" : "Pre-Owned");

  // Spec cards
  safeSet("spec-engine", v.engine);
  safeSet("spec-hp", `${v.horsepower}hp`);
  safeSet("spec-accel", v.acceleration);
  safeSet("spec-trans", v.transmission);
  safeSet("spec-drive", v.drive);
  safeSet("spec-fuel", v.fuel);
  safeSet("spec-seats", `${v.seats} Seats`);
  safeSet("spec-mileage", mileageDisplay);

  // Description
  safeSet("vdp-description", v.description);

  // Features
  const featuresGrid = document.getElementById("vdp-features-grid");
  if (featuresGrid && v.features) {
    featuresGrid.innerHTML = v.features
      .map(
        (f) => `
      <div class="vdp-feature-item">
        <div class="vdp-feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        ${f}
      </div>`,
      )
      .join("");
  }

  // Specs table
  const specsTable = document.getElementById("vdp-specs-table");
  if (specsTable) {
    const specs = [
      ["Make", v.make],
      ["Model", v.model],
      ["Year", v.year],
      ["Body Type", v.body],
      ["Condition", v.condition === "new" ? "Brand New" : "Pre-Owned"],
      ["Engine", v.engine],
      ["Horsepower", `${v.horsepower} hp`],
      ["Torque", v.torque],
      ["0-100 km/h", v.acceleration],
      ["Transmission", v.transmission],
      ["Drive", v.drive],
      ["Fuel Type", v.fuel],
      ["Colour (Ext.)", v.color_ext],
      ["Colour (Int.)", v.color_int],
      ["Seats", v.seats],
      ["Mileage", mileageDisplay],
      ["Location", v.location],
      ["VIN", v.vin],
    ];
    specsTable.innerHTML = specs
      .map(
        ([k, val]) => `
      <div class="vdp-specs-row">
        <div class="vdp-specs-key">${k}</div>
        <div class="vdp-specs-val">${val}</div>
      </div>`,
      )
      .join("");
  }

  // Pricing sidebar
  safeSet("vdp-price-main", priceM);
  safeSet("vdp-price-full", price);
  safeSet("mini-calc-vehicle-price", v.price);

  // WhatsApp buttons
  const waMsg = encodeURIComponent(
    `Hi Still Autos, I'm interested in the *${v.year} ${v.make} ${v.model}* listed at *${priceM}*. Please send more details and arrange a viewing.`,
  );
  const waUrl = `https://wa.me/2347025007590?text=${waMsg}`;

  document.querySelectorAll(".wa-vehicle-btn").forEach((btn) => {
    btn.href = waUrl;
    btn.target = "_blank";
  });

  // Badges
  const badgesEl = document.getElementById("vdp-badges");
  if (badgesEl) {
    badgesEl.innerHTML = `
      ${v.featured ? '<span class="badge badge-featured">Featured</span>' : ""}
      <span class="badge ${v.condition === "new" ? "badge-new" : "badge-used"}">${v.condition === "new" ? "Brand New" : "Pre-Owned"}</span>
      <span class="badge badge-accent">${v.category?.replace("-", " ")}</span>
    `;
  }

  // Update page meta
  updateSEOMeta(v);
}

// ===== GALLERY =====
function renderGallery(images) {
  const mainImg = document.getElementById("gallery-main-img");
  const thumbs = document.getElementById("gallery-thumbs");
  if (!mainImg || !images?.length) return;

  mainImg.src = images[0];
  mainImg.alt = `${currentVehicle?.make} ${currentVehicle?.model}`;

  if (thumbs) {
    thumbs.innerHTML = images
      .map(
        (img, i) => `
      <div class="gallery-thumb ${i === 0 ? "active" : ""}" onclick="setImage(${i})">
        <img src="${img}" alt="View ${i + 1}" loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&q=80'" />
      </div>`,
      )
      .join("");
  }

  // Click main image to open lightbox
  document
    .getElementById("gallery-main")
    ?.addEventListener("click", () => openLightbox(currentImageIndex));
}

function setImage(index) {
  const images = currentVehicle?.images;
  if (!images || index < 0 || index >= images.length) return;
  currentImageIndex = index;

  const mainImg = document.getElementById("gallery-main-img");
  if (mainImg) {
    mainImg.style.opacity = "0";
    setTimeout(() => {
      mainImg.src = images[index];
      mainImg.style.opacity = "1";
    }, 150);
  }

  document.querySelectorAll(".gallery-thumb").forEach((t, i) => {
    t.classList.toggle("active", i === index);
  });
}
window.setImage = setImage;

function prevImage() {
  setImage(
    (currentImageIndex - 1 + (currentVehicle?.images?.length || 1)) %
      (currentVehicle?.images?.length || 1),
  );
}
function nextImage() {
  setImage((currentImageIndex + 1) % (currentVehicle?.images?.length || 1));
}
window.prevImage = prevImage;
window.nextImage = nextImage;

// ===== LIGHTBOX =====
function openLightbox(index) {
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  if (!lb || !lbImg || !currentVehicle?.images) return;
  lbImg.src = currentVehicle.images[index];
  lb.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  document.getElementById("lightbox")?.classList.remove("open");
  document.body.style.overflow = "";
}
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;

// ===== MINI FINANCE CALCULATOR =====
function initMiniCalc() {
  const inputs = ["mini-deposit", "mini-rate", "mini-tenor"];
  inputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateMiniCalc);
  });
  setTimeout(updateMiniCalc, 500);
}

async function updateMiniCalc() {
  const price = parseFloat(
    document.getElementById("mini-calc-vehicle-price")?.value || 0,
  );
  const deposit = parseFloat(
    document.getElementById("mini-deposit")?.value || 20,
  );
  const rate = parseFloat(document.getElementById("mini-rate")?.value || 22);
  const tenor = parseInt(document.getElementById("mini-tenor")?.value || 36);

  if (!price) return;

  try {
    const res = await SA.API.post("/finance/calculate", {
      vehicle_price: price,
      deposit_percent: deposit,
      interest_rate: rate,
      tenor_months: tenor,
    });
    if (res.success) {
      const el = document.getElementById("mini-calc-monthly");
      if (el)
        el.textContent = SA.Currency.formatMillion(res.data.monthly_payment);
      const depositEl = document.getElementById("mini-calc-deposit");
      if (depositEl)
        depositEl.textContent = SA.Currency.formatMillion(
          res.data.deposit_amount,
        );
    }
  } catch (e) {}
}

// ===== INQUIRY FORM =====
function initInquiryForm() {
  const form = document.getElementById("inquiry-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML =
      '<span class="loading-spinner" style="width:16px;height:16px;border-width:2px"></span> Sending...';
    btn.disabled = true;

    try {
      const data = {
        vehicle_id: currentVehicle?.id,
        name: form.querySelector('[name="name"]')?.value,
        email: form.querySelector('[name="email"]')?.value,
        phone: form.querySelector('[name="phone"]')?.value,
        message: form.querySelector('[name="message"]')?.value,
        type: "vehicle_inquiry",
      };

      await SA.API.post("/inquiries", data);
      SA.Toast.show(
        "Your enquiry has been sent! We'll contact you shortly.",
        "success",
      );
      form.reset();
    } catch (err) {
      SA.Toast.show(
        "Failed to send enquiry. Please try WhatsApp instead.",
        "error",
      );
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
}

// ===== LOAD RELATED =====
async function loadRelated(id) {
  const grid = document.getElementById("related-grid");
  if (!grid) return;
  try {
    const res = await SA.API.get(`/vehicles/${id}/related`);
    if (res.data?.length) {
      grid.innerHTML = res.data.map((v) => SA.VehicleCard.render(v)).join("");
    } else {
      document.getElementById("related-section")?.remove();
    }
  } catch (e) {
    document.getElementById("related-section")?.remove();
  }
}

// ===== UTILS =====
function safeSet(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function updateSEOMeta(v) {
  const price = SA.Currency.formatMillion(v.price);
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute(
      "content",
      `${v.year} ${v.make} ${v.model} for sale in ${v.location} — ${price}. ${v.engine}, ${v.horsepower}hp. Premium luxury vehicle at Still Autos Nigeria.`,
    );
}

// Keyboard navigation for lightbox
document.addEventListener("keydown", (e) => {
  if (!document.getElementById("lightbox")?.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") prevImage();
  if (e.key === "ArrowRight") nextImage();
});
