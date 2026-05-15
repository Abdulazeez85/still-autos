/* ============================================
   STILL AUTOS — ADMIN DASHBOARD JS
   ============================================ */

'use strict';

const ADMIN_API = '/api/admin';
let adminToken = sessionStorage.getItem('sa_admin_token') || '';
let vehicles = [];
let inquiries = [];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  if (adminToken) {
    showDashboard();
    loadStats();
    loadVehicles();
    loadInquiries();
  } else {
    showLogin();
  }
  initSidebar();
});

// ===== AUTH =====
function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-layout').style.display = 'none';
}

function showDashboard() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-layout').style.display = 'flex';
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = e.target.querySelector('[type="submit"]');
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');

  btn.textContent = 'Authenticating...';
  btn.disabled = true;
  errorEl.style.display = 'none';

  try {
    const res = await fetch(`${ADMIN_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success) {
      adminToken = data.token;
      sessionStorage.setItem('sa_admin_token', adminToken);
      showDashboard();
      await Promise.all([loadStats(), loadVehicles(), loadInquiries()]);
    } else {
      errorEl.textContent = 'Invalid credentials. Please try again.';
      errorEl.style.display = 'block';
    }
  } catch (err) {
    errorEl.textContent = 'Connection error. Is the server running?';
    errorEl.style.display = 'block';
  } finally {
    btn.textContent = 'Login';
    btn.disabled = false;
  }
}

function logout() {
  adminToken = '';
  sessionStorage.removeItem('sa_admin_token');
  showLogin();
}

// ===== API HELPER =====
async function adminAPI(method, endpoint, body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': adminToken
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${ADMIN_API}${endpoint}`, opts);
  if (res.status === 401) { logout(); throw new Error('Unauthorized'); }
  return res.json();
}

// ===== STATS =====
async function loadStats() {
  try {
    const res = await adminAPI('GET', '/stats');
    if (!res.success) return;
    const d = res.data;

    safeSet('stat-total', d.total_vehicles);
    safeSet('stat-available', d.available);
    safeSet('stat-inquiries', d.total_inquiries);
    safeSet('stat-views', d.total_views.toLocaleString());
    safeSet('stat-value', '₦' + (d.inventory_value / 1_000_000_000).toFixed(1) + 'B');
    safeSet('stat-featured', d.featured);

    // Recent inquiries in dashboard
    const container = document.getElementById('recent-inquiries');
    if (container && d.recent_inquiries?.length) {
      container.innerHTML = d.recent_inquiries.map(i => `
        <tr>
          <td><strong>${escHtml(i.name)}</strong></td>
          <td>${escHtml(i.phone)}</td>
          <td><span class="badge ${i.type === 'finance_application' ? 'badge-blue' : 'badge-gold'}">${i.type.replace('_', ' ')}</span></td>
          <td>${new Date(i.created_at).toLocaleDateString('en-NG')}</td>
        </tr>`).join('');
    }
  } catch (err) {
    console.error('Stats error:', err);
  }
}

// ===== VEHICLES =====
async function loadVehicles() {
  try {
    const res = await adminAPI('GET', '/vehicles');
    vehicles = res.data || [];
    renderVehiclesTable(vehicles);
  } catch (err) {
    console.error('Vehicles error:', err);
  }
}

function renderVehiclesTable(list) {
  const tbody = document.getElementById('vehicles-tbody');
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:2rem">No vehicles found</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(v => `
    <tr>
      <td>
        <img src="${v.images?.[0] || ''}" class="vehicle-thumb"
          onerror="this.src='https://images.unsplash.com/photo-1563720223185-11003d516935?w=120&q=60'"
          alt="${v.make} ${v.model}"/>
      </td>
      <td>
        <strong>${escHtml(v.year)} ${escHtml(v.make)}</strong><br/>
        <span style="font-size:0.8rem;color:var(--text-muted)">${escHtml(v.model)}</span>
      </td>
      <td>₦${(v.price / 1_000_000).toFixed(0)}M</td>
      <td>
        <span class="badge ${v.condition === 'new' ? 'badge-green' : 'badge-blue'}">
          ${v.condition === 'new' ? 'New' : 'Used'}
        </span>
      </td>
      <td>
        <span class="status-dot ${v.available ? 'status-available' : 'status-sold'}">
          ${v.available ? 'Available' : 'Sold'}
        </span>
      </td>
      <td>${(v.views || 0).toLocaleString()}</td>
      <td>${(v.inquiries || 0)}</td>
      <td>
        <div style="display:flex;gap:0.5rem">
          <button class="btn btn-ghost btn-sm" onclick="openEditModal('${v.id}')" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteVehicle('${v.id}', '${escHtml(v.make)} ${escHtml(v.model)}')" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm" onclick="toggleAvailability('${v.id}', ${v.available})" title="${v.available ? 'Mark Sold' : 'Mark Available'}">
            ${v.available ? '🔴' : '🟢'}
          </button>
        </div>
      </td>
    </tr>`).join('');
}

// ===== VEHICLE SEARCH =====
function searchVehicles() {
  const q = document.getElementById('vehicles-search')?.value?.toLowerCase()?.trim();
  if (!q) return renderVehiclesTable(vehicles);
  const filtered = vehicles.filter(v =>
    `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(q) ||
    v.condition.includes(q) || (v.location || '').toLowerCase().includes(q));
  renderVehiclesTable(filtered);
}
window.searchVehicles = searchVehicles;

// ===== ADD / EDIT MODAL =====
function openAddModal() {
  resetVehicleForm();
  document.getElementById('modal-title').textContent = 'Add New Vehicle';
  document.getElementById('vehicle-form-id').value = '';
  openModal('vehicle-modal');
}
window.openAddModal = openAddModal;

function openEditModal(id) {
  const v = vehicles.find(v => v.id === id);
  if (!v) return;

  document.getElementById('modal-title').textContent = 'Edit Vehicle';
  document.getElementById('vehicle-form-id').value = v.id;

  // Populate fields
  const fields = ['make', 'model', 'year', 'price', 'category', 'body', 'condition',
    'fuel', 'transmission', 'engine', 'horsepower', 'torque', 'acceleration',
    'color_ext', 'color_int', 'seats', 'doors', 'drive', 'vin', 'location', 'mileage', 'description'];
  fields.forEach(f => {
    const el = document.getElementById(`vf-${f}`);
    if (el) el.value = v[f] || '';
  });

  document.getElementById('vf-featured').checked = v.featured;
  document.getElementById('vf-available').checked = v.available !== false;

  // Images
  const imgList = document.getElementById('image-url-list');
  if (imgList) {
    imgList.innerHTML = (v.images || []).map((url, i) => imageRow(url, i)).join('');
  }

  // Features
  const feats = document.getElementById('vf-features');
  if (feats) feats.value = (v.features || []).join('\n');

  openModal('vehicle-modal');
}
window.openEditModal = openEditModal;

function resetVehicleForm() {
  document.getElementById('vehicle-form').reset();
  document.getElementById('image-url-list').innerHTML = imageRow('', 0);
  document.getElementById('vf-available').checked = true;
}

function imageRow(url, idx) {
  return `<div class="image-url-row">
    <input type="text" class="form-control img-url-input" value="${escHtml(url)}" placeholder="https://images.unsplash.com/..."/>
    <button type="button" class="btn btn-danger btn-sm btn-icon" onclick="this.parentElement.remove()" title="Remove">✕</button>
  </div>`;
}

function addImageUrl() {
  const list = document.getElementById('image-url-list');
  const row = document.createElement('div');
  row.innerHTML = imageRow('', Date.now());
  list.appendChild(row.firstElementChild);
}
window.addImageUrl = addImageUrl;

async function saveVehicle(e) {
  e.preventDefault();
  const btn = document.getElementById('save-vehicle-btn');
  const id = document.getElementById('vehicle-form-id').value;
  btn.textContent = 'Saving...';
  btn.disabled = true;

  try {
    // Collect image URLs
    const images = [...document.querySelectorAll('.img-url-input')]
      .map(i => i.value.trim()).filter(Boolean);

    // Collect features
    const features = (document.getElementById('vf-features')?.value || '')
      .split('\n').map(f => f.trim()).filter(Boolean);

    const data = {
      make: document.getElementById('vf-make')?.value,
      model: document.getElementById('vf-model')?.value,
      year: parseInt(document.getElementById('vf-year')?.value),
      price: parseInt(document.getElementById('vf-price')?.value),
      category: document.getElementById('vf-category')?.value,
      body: document.getElementById('vf-body')?.value,
      condition: document.getElementById('vf-condition')?.value,
      fuel: document.getElementById('vf-fuel')?.value,
      transmission: document.getElementById('vf-transmission')?.value,
      engine: document.getElementById('vf-engine')?.value,
      horsepower: parseInt(document.getElementById('vf-horsepower')?.value) || 0,
      torque: document.getElementById('vf-torque')?.value,
      acceleration: document.getElementById('vf-acceleration')?.value,
      color_ext: document.getElementById('vf-color_ext')?.value,
      color_int: document.getElementById('vf-color_int')?.value,
      seats: parseInt(document.getElementById('vf-seats')?.value) || 5,
      doors: parseInt(document.getElementById('vf-doors')?.value) || 4,
      drive: document.getElementById('vf-drive')?.value,
      vin: document.getElementById('vf-vin')?.value,
      location: document.getElementById('vf-location')?.value,
      mileage: parseInt(document.getElementById('vf-mileage')?.value) || 0,
      description: document.getElementById('vf-description')?.value,
      featured: document.getElementById('vf-featured')?.checked,
      available: document.getElementById('vf-available')?.checked,
      whatsapp: '+2348012345678',
      images,
      features
    };

    let res;
    if (id) {
      res = await adminAPI('PUT', `/vehicles/${id}`, data);
    } else {
      res = await adminAPI('POST', '/vehicles', data);
    }

    if (res.success) {
      showToast(id ? 'Vehicle updated successfully' : 'Vehicle added successfully', 'success');
      closeModal('vehicle-modal');
      await loadVehicles();
      await loadStats();
    } else {
      showToast('Failed to save vehicle', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    btn.textContent = 'Save Vehicle';
    btn.disabled = false;
  }
}
window.saveVehicle = saveVehicle;

async function deleteVehicle(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  try {
    const res = await adminAPI('DELETE', `/vehicles/${id}`);
    if (res.success) {
      showToast('Vehicle deleted', 'success');
      await loadVehicles();
      await loadStats();
    }
  } catch (err) {
    showToast('Delete failed', 'error');
  }
}
window.deleteVehicle = deleteVehicle;

async function toggleAvailability(id, currentStatus) {
  try {
    const res = await adminAPI('PUT', `/vehicles/${id}`, { available: !currentStatus });
    if (res.success) {
      showToast(`Vehicle marked as ${!currentStatus ? 'available' : 'sold'}`, 'success');
      await loadVehicles();
    }
  } catch (err) {
    showToast('Update failed', 'error');
  }
}
window.toggleAvailability = toggleAvailability;

// ===== INQUIRIES =====
async function loadInquiries() {
  try {
    const res = await adminAPI('GET', '/inquiries');
    inquiries = res.data || [];
    renderInquiries(inquiries);
  } catch (err) {
    console.error('Inquiries error:', err);
  }
}

function renderInquiries(list) {
  const tbody = document.getElementById('inquiries-tbody');
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:2rem">No inquiries yet</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(i => `
    <tr>
      <td><strong>${escHtml(i.name)}</strong></td>
      <td>
        <a href="tel:${escHtml(i.phone)}" style="color:var(--accent);text-decoration:none">${escHtml(i.phone)}</a>
      </td>
      <td>${escHtml(i.email || '—')}</td>
      <td><span class="badge ${i.type === 'finance_application' ? 'badge-blue' : 'badge-gold'}">${i.type?.replace(/_/g, ' ') || 'General'}</span></td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(i.message || '—')}</td>
      <td style="white-space:nowrap">${new Date(i.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
    </tr>`).join('');
}

// ===== NAVIGATION =====
function navigate(page) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

  const section = document.getElementById(`page-${page}`);
  if (section) section.classList.add('active');

  const link = document.querySelector(`[data-page="${page}"]`);
  if (link) link.classList.add('active');

  // Update topbar title
  const titles = {
    dashboard: 'Dashboard',
    vehicles: 'Vehicle Inventory',
    inquiries: 'Inquiries',
    settings: 'Settings'
  };
  safeSet('topbar-page-title', titles[page] || page);
}
window.navigate = navigate;

// ===== SIDEBAR =====
function initSidebar() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('admin-sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}

// ===== MODAL HELPERS =====
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.style.display = 'flex'; requestAnimationFrame(() => m.classList.add('open')); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); setTimeout(() => { m.style.display = 'none'; }, 250); document.body.style.overflow = ''; }
}
window.openModal = openModal;
window.closeModal = closeModal;

// ===== TOAST =====
let toastContainer;
function showToast(message, type = 'info') {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none';
    document.body.appendChild(toastContainer);
  }

  const colors = { success: '#22c55e', error: '#ef4444', info: 'var(--accent)' };
  const toast = document.createElement('div');
  toast.style.cssText = `padding:12px 20px;border-radius:6px;background:var(--bg-card);border:1px solid ${colors[type]};color:var(--text-primary);font-size:0.85rem;font-family:var(--font-sans);box-shadow:0 8px 24px rgba(0,0,0,0.4);pointer-events:all;display:flex;align-items:center;gap:10px;max-width:320px;animation:scaleIn 0.2s ease`;

  const dot = document.createElement('div');
  dot.style.cssText = `width:8px;height:8px;border-radius:50%;background:${colors[type]};flex-shrink:0`;
  toast.appendChild(dot);
  toast.appendChild(document.createTextNode(message));
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ===== UTILS =====
function safeSet(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Export for inline HTML
window.handleLogin = handleLogin;
window.logout = logout;
window.navigate = navigate;
