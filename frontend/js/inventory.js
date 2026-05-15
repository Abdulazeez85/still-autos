/* ============================================
   STILL AUTOS — INVENTORY PAGE JS
   ============================================ */

'use strict';

const InventoryPage = {
  vehicles: [],
  filtered: [],
  params: new URLSearchParams(window.location.search),

  async init() {
    await this.loadVehicles();
    this.bindFilters();
    this.bindSearch();
    this.bindSort();
    this.applyURLParams();
  },

  async loadVehicles() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = this.skeletonCards(6);
    try {
      const res = await SA.API.get('/vehicles');
      this.vehicles = res.data;
      this.filtered = [...this.vehicles];
      this.render();
    } catch (err) {
      grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🚗</div><h3>Unable to load inventory</h3><p class="text-muted">Please try refreshing the page.</p></div>`;
    }
  },

  skeletonCards(n) {
    return Array(n).fill(`<div class="vehicle-card"><div class="card-image skeleton" style="height:220px"></div><div class="card-body"><div class="skeleton" style="height:12px;width:60px;margin-bottom:8px;border-radius:4px"></div><div class="skeleton" style="height:24px;width:80%;margin-bottom:12px;border-radius:4px"></div><div class="skeleton" style="height:36px;border-radius:4px;margin-bottom:16px"></div><div class="skeleton" style="height:40px;border-radius:4px"></div></div></div>`).join('');
  },

  render() {
    const grid = document.getElementById('inventory-grid');
    const count = document.getElementById('vehicle-count');
    if (count) count.innerHTML = `<strong>${this.filtered.length}</strong> vehicles found`;
    if (!this.filtered.length) {
      grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>No vehicles match your filters</h3><p class="text-muted">Try adjusting your search criteria.</p><br><button class="btn btn-outline" onclick="InventoryPage.resetFilters()">Clear All Filters</button></div>`;
      return;
    }
    grid.innerHTML = this.filtered.map(v => SA.VehicleCard.render(v)).join('');
    grid.querySelectorAll('.vehicle-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.animation = `fadeUp 0.5s ease ${i * 0.06}s forwards`;
    });
  },

  applyURLParams() {
    ['make','body','condition'].forEach(f => {
      const val = this.params.get(f);
      if (val) {
        const el = document.querySelector(`input[data-filter="${f}"][value="${val}"]`);
        if (el) { el.checked = true; this.applyFilters(); }
      }
    });
  },

  bindFilters() {
    document.querySelectorAll('[data-filter]').forEach(input => {
      input.addEventListener('change', () => this.applyFilters());
    });
  },

  bindSearch() {
    const search = document.getElementById('search-input');
    if (!search) return;
    let debounce;
    search.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => this.applyFilters(), 300);
    });
  },

  bindSort() {
    const sort = document.getElementById('sort-select');
    if (sort) sort.addEventListener('change', () => this.applyFilters());
  },

  applyFilters() {
    const search = document.getElementById('search-input')?.value?.toLowerCase() || '';
    const sort = document.getElementById('sort-select')?.value || 'newest';
    const makes = [...document.querySelectorAll('[data-filter="make"]:checked')].map(el => el.value.toLowerCase());
    const bodies = [...document.querySelectorAll('[data-filter="body"]:checked')].map(el => el.value.toLowerCase());
    const conditions = [...document.querySelectorAll('[data-filter="condition"]:checked')].map(el => el.value);
    const fuels = [...document.querySelectorAll('[data-filter="fuel"]:checked')].map(el => el.value.toLowerCase());

    this.filtered = this.vehicles.filter(v => {
      if (search && !(v.make + ' ' + v.model + ' ' + v.year).toLowerCase().includes(search)) return false;
      if (makes.length && !makes.includes(v.make.toLowerCase())) return false;
      if (bodies.length && !bodies.includes(v.body.toLowerCase())) return false;
      if (conditions.length && !conditions.includes(v.condition)) return false;
      if (fuels.length && !fuels.includes(v.fuel.toLowerCase())) return false;
      return true;
    });

    const sorters = {
      newest: (a,b) => new Date(b.created_at) - new Date(a.created_at),
      price_asc: (a,b) => a.price - b.price,
      price_desc: (a,b) => b.price - a.price,
      popular: (a,b) => (b.views||0) - (a.views||0)
    };
    if (sorters[sort]) this.filtered.sort(sorters[sort]);
    this.render();
  },

  resetFilters() {
    document.querySelectorAll('[data-filter]').forEach(el => { if (el.type==='checkbox'||el.type==='radio') el.checked=false; });
    const s = document.getElementById('search-input');
    if (s) s.value = '';
    this.filtered = [...this.vehicles];
    this.render();
  }
};

document.getElementById('filter-toggle')?.addEventListener('click', () => {
  document.querySelector('.filter-sidebar')?.classList.toggle('mobile-open');
});
document.getElementById('filter-close')?.addEventListener('click', () => {
  document.querySelector('.filter-sidebar')?.classList.remove('mobile-open');
});

document.addEventListener('DOMContentLoaded', () => InventoryPage.init());
window.InventoryPage = InventoryPage;
