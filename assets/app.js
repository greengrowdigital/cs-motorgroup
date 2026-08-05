// CS Motor Group — interactions
const scrollBar = document.querySelector('.scroll-progress');
if (scrollBar) {
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = h.scrollTop / (h.scrollHeight - h.clientHeight);
    scrollBar.style.transform = 'scaleX(' + pct + ')';
  }, { passive: true });
}

const revealTargets = document.querySelectorAll('.reveal,.reveal-stagger,.iv,.iv-stagger,.txt-rise');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
revealTargets.forEach(el => io.observe(el));

// Safety net: fast scrolling can skip intersection frames, so anything that has
// already passed the viewport bottom gets revealed outright.
const sweepRevealed = () => {
  revealTargets.forEach(el => {
    if (el.classList.contains('in')) return;
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add('in');
      io.unobserve(el);
    }
  });
};
window.addEventListener('scroll', sweepRevealed, { passive: true });
window.addEventListener('load', sweepRevealed);

// Header is CSS-sticky now — no scroll state class needed.

// ============ COUNTERS ============
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseFloat(el.dataset.to || '0');
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const dur = parseInt(el.dataset.dur || '1800', 10);
    const start = performance.now();
    const fmt = n => decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(target);
    };
    requestAnimationFrame(tick);
    counterIO.unobserve(el);
  });
}, { rootMargin: '-40px' });
document.querySelectorAll('[data-counter]').forEach(el => counterIO.observe(el));

// ============ MOBILE MENU ============
const menuBtn = document.getElementById('menuBtn');
const menuPanel = document.getElementById('menuPanel');
if (menuBtn && menuPanel) {
  const setMenu = (open) => {
    menuPanel.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
  };
  menuBtn.addEventListener('click', () => setMenu(menuPanel.hidden));
  menuPanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  // Close when the viewport grows back to the desktop nav
  window.addEventListener('resize', () => { if (window.innerWidth >= 1024) setMenu(false); });
}

const I18N_KEY = 'gg-lang';
function applyLang(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-en],[data-es]').forEach(el => {
    const v = el.getAttribute('data-' + lang);
    if (v != null) el.textContent = v;
  });
  document.querySelectorAll('[data-en-html],[data-es-html]').forEach(el => {
    const v = el.getAttribute('data-' + lang + '-html');
    if (v != null) el.innerHTML = v;
  });
  document.querySelectorAll('[data-en-placeholder],[data-es-placeholder]').forEach(el => {
    const v = el.getAttribute('data-' + lang + '-placeholder');
    if (v != null) el.setAttribute('placeholder', v);
  });
  document.querySelectorAll('.lang-toggle [data-lang]').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-lang') === lang);
  });
  try { localStorage.setItem(I18N_KEY, lang); } catch (_) {}
}
const savedLang = (() => { try { return localStorage.getItem(I18N_KEY); } catch (_) { return null; } })() || 'en';
applyLang(savedLang);
document.querySelectorAll('.lang-toggle [data-lang]').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.getAttribute('data-lang')));
});

// Live pump-style price ticker (mock prices, small flutter)
const tickers = document.querySelectorAll('[data-ticker-val]');
const basePrices = {
  regular: 3.49,
  plus: 3.79,
  premium: 3.99,
  diesel: 3.85
};
function jitter(v) { return (v + (Math.random() - 0.5) * 0.02).toFixed(2); }
function tick() {
  tickers.forEach(el => {
    const k = el.getAttribute('data-ticker-val');
    if (basePrices[k] != null) el.textContent = '$' + jitter(basePrices[k]);
  });
}
if (tickers.length) { tick(); setInterval(tick, 4000); }

// Fake form
document.querySelectorAll('form[data-fake]').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const out = form.querySelector('[data-form-result]');
    if (out) {
      const lang = document.documentElement.lang;
      out.textContent = lang === 'es'
        ? 'Gracias. Te contactaremos pronto.'
        : 'Thanks. We will get back to you shortly.';
      out.classList.remove('hidden');
    }
    form.reset();
  });
});

document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

// ============ BEFORE / AFTER SLIDER ============
document.querySelectorAll('.ba-slider').forEach(slider => {
  const after = slider.querySelector('.ba-after');
  const handle = slider.querySelector('.ba-handle');
  if (!after || !handle) return;
  const setPos = (clientX) => {
    const r = slider.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
    after.style.clipPath = `inset(0 0 0 ${pct}%)`;
    handle.style.left = pct + '%';
  };
  let dragging = false;
  const start = (x) => { dragging = true; setPos(x); };
  slider.addEventListener('mousedown', e => start(e.clientX));
  slider.addEventListener('touchstart', e => start(e.touches[0].clientX), { passive: true });
  window.addEventListener('mousemove', e => { if (dragging) setPos(e.clientX); });
  window.addEventListener('touchmove', e => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('mouseup', () => dragging = false);
  window.addEventListener('touchend', () => dragging = false);
  // Hover-glide when not dragging (desktop nicety)
  slider.addEventListener('mousemove', e => { if (!dragging && e.buttons === 0) setPos(e.clientX); });
});

// ============ LIVE PRICING FROM SQUARE ============
// Elements carrying data-sq-price="<slug>" show the shop's real Square price.
// The markup keeps a hardcoded price as its text, so if Square is unreachable,
// not yet configured, or simply has no matching item, the page still reads
// correctly — we only ever overwrite on a confirmed hit.
(function () {
  const slots = document.querySelectorAll('[data-sq-price]');
  if (!slots.length) return;

  const money = (n) =>
    '$' + (Number.isInteger(n) ? n.toLocaleString('en-US')
                               : n.toLocaleString('en-US', { minimumFractionDigits: 2 }));

  fetch('/api/services')
    .then(r => (r.ok ? r.json() : null))
    .then(data => {
      const services = data && data.services ? data.services : {};
      slots.forEach(el => {
        const svc = services[el.dataset.sqPrice];
        if (!svc || typeof svc.price !== 'number') return;

        // data-sq-prefix renders things like "From $70"
        el.textContent = (el.dataset.sqPrefix ? el.dataset.sqPrefix + ' ' : '') + money(svc.price);
        el.setAttribute('data-sq-live', '');

        // Keep any linked booking option in sync with the live price
        const target = el.dataset.sqSync && document.querySelector(el.dataset.sqSync);
        if (target) target.setAttribute('data-price', String(svc.price));
      });
    })
    .catch(() => { /* hardcoded prices stay on screen */ });
})();
