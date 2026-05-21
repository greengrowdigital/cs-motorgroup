// Global Gas Station — interactions
window.addEventListener('load', () => {
  setTimeout(() => {
    const l = document.querySelector('.loader');
    if (l) l.classList.add('hidden');
  }, 1100);
});

const scrollBar = document.querySelector('.scroll-progress');
if (scrollBar) {
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    scrollBar.style.width = pct + '%';
  });
}

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.14, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal,.reveal-stagger').forEach(el => io.observe(el));

const menuBtn = document.getElementById('menuBtn');
const menuPanel = document.getElementById('menuPanel');
if (menuBtn && menuPanel) {
  menuBtn.addEventListener('click', () => menuPanel.classList.toggle('hidden'));
  menuPanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menuPanel.classList.add('hidden')));
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
