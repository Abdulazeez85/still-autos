/* ============================================
   STILL AUTOS — HOMEPAGE JS
   ============================================ */

'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  await loadFeaturedVehicles();
  initMarquee();
  initHeroParallax();
  initCounters();
});

// ===== LOAD FEATURED VEHICLES =====
async function loadFeaturedVehicles() {
  const grid = document.getElementById('featured-grid');
  const heroCard = document.getElementById('hero-featured-card');
  if (!grid) return;

  try {
    const res = await SA.API.get('/vehicles?featured=true&sort=popular');
    const vehicles = res.data;

    if (!vehicles || !vehicles.length) {
      grid.innerHTML = '<p class="text-muted" style="grid-column:1/-1;text-align:center;">No featured vehicles at this time.</p>';
      return;
    }

    // Hero featured card (first vehicle)
    if (heroCard && vehicles[0]) {
      const v = vehicles[0];
      const price = SA.Currency.formatMillion(v.price);
      heroCard.href = `/vehicle/${v.id}`;
      heroCard.innerHTML = `
        <img src="${v.images[0]}" alt="${v.make} ${v.model}" loading="lazy" 
          onerror="this.src='https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=80'" />
        <div class="card-overlay-info">
          <div class="card-badges">
            <span class="badge badge-featured">Editor's Pick</span>
            <span class="badge badge-${v.condition === 'new' ? 'new' : 'used'}">${v.condition === 'new' ? 'Brand New' : 'Pre-Owned'}</span>
          </div>
          <div class="fhc-make">${v.make}</div>
          <div class="fhc-title">${v.model}</div>
          <div class="fhc-price">${price}</div>
        </div>
        <div class="fhc-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      `;
    }

    // Remaining cards
    const remaining = vehicles.slice(1, 4);
    grid.innerHTML = remaining.map(v => SA.VehicleCard.render(v)).join('');

  } catch (err) {
    console.error('Failed to load featured vehicles:', err);
    grid.innerHTML = '<p class="text-muted" style="grid-column:1/-1;text-align:center;">Unable to load vehicles.</p>';
  }
}

// ===== MARQUEE =====
function initMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  // Duplicate for seamless loop
  track.innerHTML = track.innerHTML + track.innerHTML;
}

// ===== HERO PARALLAX =====
function initHeroParallax() {
  const heroBg = document.querySelector('.hero-bg img');
  if (!heroBg) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ===== COUNTER ANIMATION =====
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'));
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }

  requestAnimationFrame(update);
}

// ===== FINANCE TEASER CALCULATOR =====
const financeTeaser = document.getElementById('finance-teaser-result');
const teaserPrice = document.getElementById('teaser-price');

if (teaserPrice) {
  teaserPrice.addEventListener('input', async () => {
    const price = parseInt(teaserPrice.value) * 1_000_000;
    try {
      const res = await SA.API.post('/finance/calculate', {
        vehicle_price: price,
        deposit_percent: 20,
        interest_rate: 22,
        tenor_months: 36
      });
      if (res.success && financeTeaser) {
        financeTeaser.textContent = SA.Currency.formatMillion(res.data.monthly_payment) + '/mo';
      }
    } catch (e) {}
  });
}
