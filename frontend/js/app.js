/* ============================================
   STILL AUTOS — CORE APP JS
   Theme system, navbar, utilities
   ============================================ */

'use strict';

// ===== CONFIGURATION =====
const CONFIG = {
  API_BASE: '/api',
  WHATSAPP_NUMBER: '2348012345678',
  CURRENCY: 'NGN',
  CURRENCY_LOCALE: 'en-NG'
};

// ===== THEME SYSTEM =====
const ThemeManager = {
  STORAGE_KEY: 'still-autos-theme',
  
  init() {
    // Disable transitions on initial load
    document.documentElement.classList.add('no-transitions');
    
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (systemDark ? 'dark' : 'light');
    
    this.set(theme, false);
    
    // Re-enable transitions after first paint
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.documentElement.classList.remove('no-transitions');
      }, 50);
    });
    
    // Listen for system changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.set(e.matches ? 'dark' : 'light');
      }
    });
  },
  
  set(theme, save = true) {
    document.documentElement.setAttribute('data-theme', theme);
    if (save) localStorage.setItem(this.STORAGE_KEY, theme);
    this.updateToggleBtn(theme);
  },
  
  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    this.set(current === 'dark' ? 'light' : 'dark');
  },
  
  get() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  },
  
  updateToggleBtn(theme) {
    const btns = document.querySelectorAll('.theme-toggle');
    btns.forEach(btn => {
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    });
  }
};

// ===== NAVBAR =====
const Navbar = {
  init() {
    const nav = document.querySelector('.navbar');
    const hamburger = document.querySelector('.nav-hamburger');
    const mobileMenu = document.querySelector('.nav-mobile');
    const themeToggles = document.querySelectorAll('.theme-toggle');
    
    if (!nav) return;
    
    // Scroll behavior
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
    
    // Hamburger
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
      
      // Close on overlay click
      mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) this.closeMobile(hamburger, mobileMenu);
      });
      
      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => this.closeMobile(hamburger, mobileMenu));
      });
    }
    
    // Theme toggles
    themeToggles.forEach(btn => {
      btn.addEventListener('click', () => ThemeManager.toggle());
    });
    
    // Active link
    this.setActiveLink();
  },
  
  closeMobile(hamburger, menu) {
    hamburger.classList.remove('open');
    menu.classList.remove('open');
    document.body.style.overflow = '';
  },
  
  setActiveLink() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-links a, .nav-mobile-links a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path || (path === '/' && href === '/') || (path.includes(href) && href !== '/')) {
        a.classList.add('active');
      }
    });
  }
};

// ===== CURRENCY FORMATTER =====
const Currency = {
  format(amount, compact = false) {
    if (compact) {
      if (amount >= 1_000_000_000) return `₦${(amount / 1_000_000_000).toFixed(1)}B`;
      if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(0)}M`;
      if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat(CONFIG.CURRENCY_LOCALE, {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amount);
  },
  
  formatMillion(amount) {
    return `₦${(amount / 1_000_000).toFixed(0)}M`;
  }
};

// ===== API HELPER =====
const API = {
  async get(endpoint) {
    try {
      const res = await fetch(`${CONFIG.API_BASE}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('API GET Error:', endpoint, err);
      throw err;
    }
  },
  
  async post(endpoint, data) {
    try {
      const res = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('API POST Error:', endpoint, err);
      throw err;
    }
  }
};

// ===== VEHICLE CARD BUILDER =====
const VehicleCard = {
  render(vehicle) {
    const price = Currency.format(vehicle.price);
    const priceM = Currency.formatMillion(vehicle.price);
    const mileageDisplay = vehicle.mileage === 0 ? 'Brand New' : `${vehicle.mileage.toLocaleString()} km`;
    const whatsappMsg = encodeURIComponent(`Hi Still Autos, I'm interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model} priced at ${priceM}. Please provide more information.`);
    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${whatsappMsg}`;
    
    return `
      <article class="vehicle-card animate-fade-up" onclick="window.location.href='/vehicle/${vehicle.id}'">
        <div class="card-image">
          <img 
            src="${vehicle.images[0]}" 
            alt="${vehicle.year} ${vehicle.make} ${vehicle.model}"
            loading="lazy"
            onerror="this.src='https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80'"
          />
          <div class="card-badges">
            ${vehicle.featured ? '<span class="badge badge-featured">Featured</span>' : ''}
            <span class="badge ${vehicle.condition === 'new' ? 'badge-new' : 'badge-used'}">${vehicle.condition === 'new' ? 'New' : 'Pre-Owned'}</span>
          </div>
          <div class="card-overlay">
            <div class="card-quick-actions">
              <a href="/vehicle/${vehicle.id}" class="card-quick-btn view" onclick="event.stopPropagation()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </a>
              <a href="${whatsappUrl}" target="_blank" class="card-quick-btn whatsapp" onclick="event.stopPropagation()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
        
        <div class="card-body">
          <div class="card-make">${vehicle.make}</div>
          <h2 class="card-model">${vehicle.model}</h2>
          <div class="card-year">${vehicle.year} · ${vehicle.color_ext}</div>
          
          <div class="card-specs">
            <span class="spec-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              ${vehicle.horsepower}hp
            </span>
            <span class="spec-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${vehicle.acceleration}
            </span>
            <span class="spec-pill">${vehicle.transmission}</span>
            <span class="spec-pill">${mileageDisplay}</span>
          </div>
          
          <div class="card-footer">
            <div class="card-price">
              <div class="card-price-label">Starting Price</div>
              <div class="card-price-value">${priceM}</div>
              <div class="card-price-sub">${vehicle.location}</div>
            </div>
            <div class="card-cta-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>
      </article>
    `;
  }
};

// ===== TOAST NOTIFICATIONS =====
const Toast = {
  container: null,
  
  init() {
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      display: flex; flex-direction: column; gap: 8px; pointer-events: none;
    `;
    document.body.appendChild(this.container);
  },
  
  show(message, type = 'info', duration = 3500) {
    if (!this.container) this.init();
    
    const colors = {
      success: '#22c55e',
      error: '#ef4444',
      info: 'var(--accent)',
      warning: '#f59e0b'
    };
    
    const toast = document.createElement('div');
    toast.style.cssText = `
      padding: 12px 20px; border-radius: 6px; background: var(--bg-card);
      border: 1px solid ${colors[type]}; color: var(--text-primary);
      font-size: 0.875rem; font-family: var(--font-sans);
      box-shadow: 0 8px 24px rgba(0,0,0,0.2); pointer-events: all;
      animation: fadeUp 0.3s ease; max-width: 320px;
      display: flex; align-items: center; gap: 10px;
    `;
    
    const dot = document.createElement('div');
    dot.style.cssText = `width: 8px; height: 8px; border-radius: 50%; background: ${colors[type]}; flex-shrink: 0;`;
    toast.appendChild(dot);
    toast.appendChild(document.createTextNode(message));
    
    this.container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = '0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// ===== SCROLL REVEAL =====
const ScrollReveal = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeUp 0.6s ease forwards';
          entry.target.style.opacity = '1';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    
    document.querySelectorAll('[data-reveal]').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.animationDelay = `${i * 0.05}s`;
      observer.observe(el);
    });
  }
};

// ===== WHATSAPP HELPERS =====
const WhatsApp = {
  openGeneral(message = '') {
    const msg = message || 'Hi Still Autos, I would like to enquire about your luxury vehicle collection.';
    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  },
  
  openVehicle(vehicle) {
    const price = Currency.formatMillion(vehicle.price);
    const msg = `Hi Still Autos, I'm interested in the *${vehicle.year} ${vehicle.make} ${vehicle.model}* priced at *${price}*. Please provide more information and schedule a viewing.`;
    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  }
};

// ===== MODAL =====
const Modal = {
  open(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.style.display = 'flex';
      requestAnimationFrame(() => modal.classList.add('open'));
      document.body.style.overflow = 'hidden';
    }
  },
  
  close(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('open');
      setTimeout(() => { modal.style.display = 'none'; }, 300);
      document.body.style.overflow = '';
    }
  }
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  Navbar.init();
  Toast.init();
  ScrollReveal.init();
});

// Export to window
window.SA = { ThemeManager, Navbar, Currency, API, VehicleCard, Toast, WhatsApp, Modal };
