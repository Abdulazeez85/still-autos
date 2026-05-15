/* ============================================
   STILL AUTOS — FINANCE CALCULATOR JS
   ============================================ */

'use strict';

let calcState = {
  vehicle_price: 50_000_000,
  deposit_percent: 20,
  interest_rate: 22,
  tenor_months: 36
};

document.addEventListener('DOMContentLoaded', () => {
  initSliders();
  calculate();
  initApplyForm();
});

// ===== SLIDERS =====
function initSliders() {
  const sliders = {
    'slider-price': { state: 'vehicle_price', multiplier: 1_000_000, display: 'display-price', format: (v) => SA.Currency.formatMillion(v * 1_000_000) },
    'slider-deposit': { state: 'deposit_percent', multiplier: 1, display: 'display-deposit', format: (v) => `${v}%` },
    'slider-rate': { state: 'interest_rate', multiplier: 1, display: 'display-rate', format: (v) => `${v}%` },
    'slider-tenor': { state: 'tenor_months', multiplier: 1, display: 'display-tenor', format: (v) => `${v} months` }
  };

  Object.entries(sliders).forEach(([id, config]) => {
    const slider = document.getElementById(id);
    const display = document.getElementById(config.display);
    if (!slider) return;

    slider.addEventListener('input', () => {
      const val = parseFloat(slider.value);
      calcState[config.state] = val * config.multiplier;
      if (display) display.textContent = config.format(val);
      calculate();
    });

    // Set initial display
    const initVal = calcState[config.state] / config.multiplier;
    if (display) display.textContent = config.format(initVal);
    slider.value = initVal;
  });
}

// ===== CALCULATE =====
async function calculate() {
  try {
    const res = await SA.API.post('/finance/calculate', calcState);
    if (!res.success) return;
    const d = res.data;

    safeSet('result-monthly', SA.Currency.formatMillion(d.monthly_payment));
    safeSet('result-deposit', SA.Currency.formatMillion(d.deposit_amount));
    safeSet('result-loan', SA.Currency.formatMillion(d.loan_amount));
    safeSet('result-total', SA.Currency.formatMillion(d.total_repayment));
    safeSet('result-interest', SA.Currency.formatMillion(d.total_interest));
    safeSet('result-vehicle-price', SA.Currency.formatMillion(d.vehicle_price));

    // Interest rate display
    safeSet('result-rate', `${d.interest_rate}% p.a.`);
    safeSet('result-tenor', `${d.tenor_months} months`);

    updateChart(d.deposit_amount, d.loan_amount, d.total_interest);
  } catch (err) {
    console.error('Calculation error:', err);
  }
}
window.calculate = calculate;

// ===== DONUT CHART =====
function updateChart(deposit, principal, interest) {
  const total = deposit + principal + interest;
  const depositPct = (deposit / total) * 100;
  const principalPct = (principal / total) * 100;
  const interestPct = (interest / total) * 100;

  const svg = document.getElementById('donut-svg');
  if (!svg) return;

  const cx = 70, cy = 70, r = 55, stroke = 22;
  const circumference = 2 * Math.PI * r;

  function segment(pct, offset, color) {
    const length = (pct / 100) * circumference;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" 
      stroke-width="${stroke}" stroke-dasharray="${length} ${circumference}"
      stroke-dashoffset="${-offset * circumference / 100}" stroke-linecap="butt"/>`;
  }

  svg.innerHTML = `
    ${segment(depositPct, 0, 'var(--accent)')}
    ${segment(principalPct, depositPct, 'var(--text-muted)')}
    ${segment(interestPct, depositPct + principalPct, 'rgba(239,68,68,0.6)')}
  `;

  // Update center label
  const interestPctEl = document.getElementById('chart-interest-pct');
  if (interestPctEl) interestPctEl.textContent = `${interestPct.toFixed(0)}%`;
}

// ===== APPLY FORM =====
function initApplyForm() {
  const form = document.getElementById('finance-apply-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.innerHTML = '<span class="loading-spinner" style="width:16px;height:16px;border-width:2px"></span> Submitting...';
    btn.disabled = true;

    try {
      const data = {
        name: form.querySelector('[name="name"]')?.value,
        email: form.querySelector('[name="email"]')?.value,
        phone: form.querySelector('[name="phone"]')?.value,
        message: `Finance Application — Vehicle Budget: ${SA.Currency.formatMillion(calcState.vehicle_price)}, Deposit: ${calcState.deposit_percent}%, Tenor: ${calcState.tenor_months} months`,
        type: 'finance_application'
      };

      await SA.API.post('/inquiries', data);
      SA.Toast.show('Finance application submitted! Our team will be in touch within 24 hours.', 'success');
      form.reset();
    } catch (err) {
      SA.Toast.show('Submission failed. Please contact us on WhatsApp.', 'error');
    } finally {
      btn.innerHTML = 'Submit Application';
      btn.disabled = false;
    }
  });
}

function safeSet(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
