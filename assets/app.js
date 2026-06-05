// CS Motor Group — interactions
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
document.querySelectorAll('.reveal,.reveal-stagger,.iv,.iv-stagger,.txt-rise').forEach(el => io.observe(el));

// ============ NAV SCROLL STATE ============
const navShell = document.querySelector('.nav-shell');
if (navShell) {
  const updateNav = () => navShell.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
}

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

// ============ MAGNETIC BUTTONS ============
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
  });
  btn.addEventListener('mouseleave', () => btn.style.transform = 'translate(0,0)');
});

// ============ TILT CARDS + SPOTLIGHT ============
document.querySelectorAll('.tilt-card, .spotlight-follow').forEach(card => {
  const isTilt = card.classList.contains('tilt-card');
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.style.setProperty('--mx', (x * 100) + '%');
    card.style.setProperty('--my', (y * 100) + '%');
    if (isTilt) {
      const rx = (0.5 - y) * 6;
      const ry = (x - 0.5) * 6;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    }
  });
  card.addEventListener('mouseleave', () => {
    if (isTilt) card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    card.style.setProperty('--mx', '50%');
    card.style.setProperty('--my', '50%');
  });
});

// ============ CURSOR GLOW ============
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
document.body.appendChild(cursorGlow);
let glowOn = false;
window.addEventListener('mousemove', (e) => {
  cursorGlow.style.transform = `translate3d(${e.clientX - 190}px, ${e.clientY - 190}px, 0)`;
  if (!glowOn) { cursorGlow.classList.add('on'); glowOn = true; }
});
window.addEventListener('mouseleave', () => cursorGlow.classList.remove('on'));

// ============ HERO PARALLAX ============
const heroBg = document.querySelector('[data-parallax-bg]');
const heroContent = document.querySelector('[data-parallax-content]');
if (heroBg || heroContent) {
  window.addEventListener('scroll', () => {
    const h = window.innerHeight;
    const p = Math.min(1, Math.max(0, window.scrollY / h));
    if (heroBg) heroBg.style.transform = `translateY(${p * 18}%) scale(${1.05 + p * 0.06})`;
    if (heroContent) {
      heroContent.style.transform = `translateY(${p * -10}%)`;
      heroContent.style.opacity = String(1 - p * 0.9);
    }
  }, { passive: true });
}

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
