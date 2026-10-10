/**
 * Minimal Mobile Startpage Controller
 * Clean Cat Petting, Time-of-Day Boxes, Themes & Search
 */

(function() {
  'use strict';

  // ── Clean Up Any Stale Service Workers & Caches ──
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(regs) {
      for (var i = 0; i < regs.length; i++) regs[i].unregister();
    });
  }
  if ('caches' in window) {
    caches.keys().then(function(keys) {
      for (var j = 0; j < keys.length; j++) caches.delete(keys[j]);
    });
  }

  function haptic(ms = 12) {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(ms); } catch(e) {}
    }
  }

  // ── Multi-Theme System (Synchronized with Viyoga) ──
  const THEMES = ['amber', 'mallow', 'gruvbox-material', 'safelight', 'tungsten'];
  const THEME_COLORS = {
    amber: '#0B0906',
    mallow: '#0A0712',
    'gruvbox-material': '#282828',
    safelight: '#0B0406',
    tungsten: '#0A0A0C'
  };

  let currentTheme = 'safelight';
  try {
    const params = new URLSearchParams(window.location.search);
    let qTheme = params.get('theme');
    if (qTheme === 'gruvbox' || qTheme === 'slick') qTheme = 'gruvbox-material';
    if (qTheme && THEMES.indexOf(qTheme) >= 0) {
      currentTheme = qTheme;
    } else {
      // Synchronized with main Viyoga website ('theme' in localStorage)
      let stored = localStorage.getItem('theme') || localStorage.getItem('viyoga_mobile_theme') || 'safelight';
      if (stored === 'gruvbox' || stored === 'slick') stored = 'gruvbox-material';
      currentTheme = (THEMES.indexOf(stored) >= 0) ? stored : 'safelight';
    }
  } catch(e) {
    currentTheme = 'safelight';
  }

  const themeBtn = document.getElementById('themeBtn');

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[theme] || '#1A2026');

    if (themeBtn) {
      themeBtn.setAttribute('aria-label', 'Theme: ' + theme + ' (click to switch)');
      themeBtn.setAttribute('title', 'Theme: ' + theme + ' (click to switch)');
    }

    try {
      localStorage.setItem('theme', theme);
      localStorage.setItem('viyoga_mobile_theme', theme);
    } catch(e) {}
    document.dispatchEvent(new CustomEvent('themechange'));
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      haptic(15);
      const idx = THEMES.indexOf(currentTheme);
      const nextTheme = THEMES[(idx + 1) % THEMES.length];
      applyTheme(nextTheme);
    });
  }
  applyTheme(currentTheme);

  // ── Multi-Font System (Synchronized with Viyoga) ──
  const FONTS = ['space', 'maple', 'iosevka'];
  const FONT_LABELS = { space: 'Space Mono', maple: 'Maple Mono', iosevka: 'Iosevka' };
  let currentFont = 'space';
  try {
    const params = new URLSearchParams(window.location.search);
    const qFont = params.get('font');
    if (qFont && FONTS.indexOf(qFont) >= 0) {
      currentFont = qFont;
    } else {
      currentFont = localStorage.getItem('font') || 'space';
      if (FONTS.indexOf(currentFont) < 0) currentFont = 'space';
    }
  } catch(e) {
    currentFont = 'space';
  }

  const fontBtn = document.getElementById('fontBtn');

  function applyFont(font) {
    currentFont = font;
    document.documentElement.setAttribute('data-font', font);

    if (fontBtn) {
      fontBtn.setAttribute('aria-label', 'Font: ' + FONT_LABELS[font] + ' (click to switch)');
      fontBtn.setAttribute('title', 'Font: ' + FONT_LABELS[font] + ' (click to switch)');
    }

    try {
      localStorage.setItem('font', font);
    } catch(e) {}
    document.dispatchEvent(new CustomEvent('fontchange'));
  }

  if (fontBtn) {
    fontBtn.addEventListener('click', () => {
      haptic(15);
      const idx = FONTS.indexOf(currentFont);
      const nextFont = FONTS[(idx + 1) % FONTS.length];
      applyFont(nextFont);
    });
  }
  applyFont(currentFont);

  // ── Sleeping Cat Petting ──
  const catLogo = document.getElementById('catLogo');
  const signalShell = document.querySelector('.signal-shell');
  const kittyState = document.getElementById('kittyState');
  let petTimer = null;

  if (catLogo) {
    const HEARTS = ['♥', '✦', '🐾', 'zzZ', '★'];

    function spawnFloatingHeart(e) {
      const heart = document.createElement('span');
      heart.className = 'pet-heart';
      heart.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];

      const rect = catLogo.getBoundingClientRect();
      const x = (e && e.clientX) ? (e.clientX - rect.left) : (rect.width * (0.3 + Math.random() * 0.4));
      const y = (e && e.clientY) ? (e.clientY - rect.top) : (rect.height * 0.35);

      heart.style.left = `${Math.max(8, Math.min(rect.width - 25, x))}px`;
      heart.style.top = `${Math.max(8, y)}px`;

      catLogo.appendChild(heart);
      setTimeout(() => heart.remove(), 750);
    }

    function petKitty(e) {
      haptic(20);
      catLogo.classList.remove('pet-bounce');
      void catLogo.offsetWidth;
      catLogo.classList.add('pet-bounce');
      spawnFloatingHeart(e);

      if (kittyState) {
        kittyState.textContent = 'PURRING ♥';
        clearTimeout(petTimer);
        petTimer = setTimeout(() => {
          kittyState.textContent = 'PURRING';
        }, 1800);
      }
    }

    catLogo.addEventListener('click', petKitty);
    if (signalShell) {
      signalShell.addEventListener('click', (e) => {
        if (!e.target.closest('.cat-logo')) {
          petKitty(e);
        }
      });
    }
  }

  // ── Time & Day Progress Boxes (12 Blocks = 2h each) ──
  const kittyTime = document.getElementById('kittyTime');
  const timeMeter = document.getElementById('timeMeter');

  function updateTime() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    
    if (kittyTime) {
      kittyTime.textContent = `${hh}:${mm}`;
    }

    if (timeMeter) {
      const boxes = timeMeter.querySelectorAll('i');
      const totalMinutes = now.getHours() * 60 + now.getMinutes();
      // 1440 min / 12 boxes = 120 min (2 hours per box)
      const litCount = Math.floor(totalMinutes / 120);
      const currentIdx = Math.min(litCount, boxes.length - 1);

      boxes.forEach((box, idx) => {
        box.className = '';
        if (idx < litCount) {
          box.classList.add('lit');
        } else if (idx === currentIdx) {
          box.classList.add('active-now');
        }
      });
    }
  }

  updateTime();
  setInterval(updateTime, 1000);

  // ── Search & Bang Engine ──
  const bangs = {
    '!dd': 'https://duckduckgo.com/?q=',
    '@dd': 'https://duckduckgo.com/?q=',
    '!yt': 'https://www.youtube.com/results?search_query=',
    '@yt': 'https://www.youtube.com/results?search_query=',
    '!rd': 'https://www.reddit.com/search/?q=',
    '@rd': 'https://www.reddit.com/search/?q=',
    '!gh': 'https://github.com/search?q=',
    '@gh': 'https://github.com/search?q=',
    '!fmhy': 'https://fmhy.net/search/?q=',
    '@fmhy': 'https://fmhy.net/search/?q=',
    '!ani': 'https://miruro.to/search?query=',
    '@ani': 'https://miruro.to/search?query='
  };

  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('searchClear');

  if (input && clearBtn) {
    input.addEventListener('input', () => {
      clearBtn.classList.toggle('active', input.value.length > 0);
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.classList.remove('active');
      input.focus();
    });
  }

  if (form && input) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const raw = input.value.trim();
      if (!raw) return;

      // 1. Direct URL navigation
      const isUrl = /^(https?:\/\/|[a-z0-9-]+\.[a-z]{2,}(\/.*)?$|localhost(:\d+)?)/i.test(raw);
      if (isUrl && !raw.includes(' ')) {
        const target = raw.startsWith('http://') || raw.startsWith('https://') ? raw : 'https://' + raw;
        window.location.href = target;
        return;
      }

      // 2. Bang matching
      for (const [bang, base] of Object.entries(bangs)) {
        if (raw === bang) {
          window.location.href = base.split('?')[0].split('/search')[0];
          return;
        }
        if (raw.startsWith(bang + ' ')) {
          const q = raw.slice(bang.length).trim();
          window.location.href = base + encodeURIComponent(q);
          return;
        }
      }

      // 3. Fallback: Google
      window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(raw);
    });
  }

  // ── Touch & Cursor Spotlight Sheen (matching viyoga spotlight) ──
  if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    const SPOT_SEL = '.signal-panel, .shortcut, .search-form, .theme-btn, .brand-prompt';
    function attachSpotlight(el) {
      el.classList.add('spot');
      const updateCoords = (clientX, clientY) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (clientX - r.left) + 'px');
        el.style.setProperty('--my', (clientY - r.top) + 'px');
      };
      el.addEventListener('pointermove', (e) => updateCoords(e.clientX, e.clientY));
      el.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) updateCoords(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
    }
    document.querySelectorAll(SPOT_SEL).forEach(attachSpotlight);
  }
})();
