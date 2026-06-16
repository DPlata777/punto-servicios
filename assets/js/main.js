/* ============================================
   Punto Servicios Colombia - Main JS
   ============================================ */

(function() {
  'use strict';

  /* ---------- PAGE LOADER + TRANSICIÓN ENTRE VISTAS ---------- */
  (function pageLoader() {
    var loader = document.getElementById('page-loader');
    if (!loader) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var reveal = function () { document.body.classList.add('loaded'); };
    if (document.readyState === 'complete') {
      reveal();
    } else {
      window.addEventListener('load', reveal);
      setTimeout(reveal, 1800); // respaldo si 'load' tarda
    }

    // Volver con bfcache (atrás/adelante): asegurar estado visible
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) { document.body.classList.remove('page-leaving'); reveal(); }
    });

    if (reduce) return; // sin transición de salida con movimiento reducido

    var sameOrigin = function (a) { return a && a.href && a.origin === window.location.origin; };

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (a.dataset.noTransition !== undefined) return;
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' ||
          href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 ||
          href.indexOf('javascript:') === 0) return;
      if (!sameOrigin(a)) return;
      if (a.pathname === window.location.pathname && a.hash) return; // mismo doc, solo ancla
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      document.body.classList.remove('loaded');
      document.body.classList.add('page-leaving');
      var target = a.href;
      setTimeout(function () { window.location.href = target; }, 420);
    });
  })();

  /* ---------- NAV: Scroll state ---------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const setScrolled = () => {
      nav.classList.toggle('scrolled', window.scrollY > 12);
    };
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });
  }

  /* ---------- MOBILE MENU ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const iconOpen = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
  const iconClose = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  if (navToggle && mobileMenu) {
    navToggle.innerHTML = iconOpen;
    navToggle.setAttribute('aria-label', 'Abrir menú');
    navToggle.setAttribute('aria-expanded', 'false');

    const toggleMenu = () => {
      const isOpen = mobileMenu.classList.toggle('open');
      navToggle.innerHTML = isOpen ? iconClose : iconOpen;
      navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    navToggle.addEventListener('click', toggleMenu);
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (mobileMenu.classList.contains('open')) toggleMenu();
      });
    });
  }

  /* ---------- FAQ ACCORDION ---------- */
  document.querySelectorAll('.faq-item').forEach((item, idx) => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer-inner');
    if (!btn || !answer) return;

    const id = `faq-answer-${idx}`;
    answer.id = id;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', id);

    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });

  /* ---------- SCROLL REVEAL ---------- */
  if ('IntersectionObserver' in window) {
    const reveals = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  /* ---------- COUNTERS (only if GSAP not loaded) ---------- */
  const hasGsap = typeof gsap !== 'undefined';
  const counters = document.querySelectorAll('[data-counter]');
  if (!hasGsap && counters.length && 'IntersectionObserver' in window) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      const startVal = 0;
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = startVal + (target - startVal) * eased;
        const display = Number.isInteger(target) ? Math.round(value) : value.toFixed(1);
        el.textContent = display + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animate(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => cio.observe(c));
  }

  /* ---------- CONTACT FORM ---------- */
  const form = document.querySelector('#contact-form');
  if (form) {
    const success = form.querySelector('.form-success');
    const fields = form.querySelectorAll('[required]');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      fields.forEach(f => {
        const wrap = f.closest('.form-field');
        const val = (f.value || '').trim();
        let ok = val.length > 0;
        if (ok && f.type === 'email') {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        }
        if (ok && f.type === 'tel') {
          ok = /^[+\d][\d\s\-()]{6,}$/.test(val);
        }
        wrap.classList.toggle('invalid', !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        const firstInvalid = form.querySelector('.form-field.invalid input, .form-field.invalid textarea, .form-field.invalid select');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (success) {
        success.classList.add('show');
        success.setAttribute('role', 'status');
        form.reset();
        setTimeout(() => success.classList.remove('show'), 6000);
      }
    });

    form.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('input', () => {
        const wrap = input.closest('.form-field');
        if (wrap && wrap.classList.contains('invalid')) wrap.classList.remove('invalid');
      });
    });
  }

  /* ---------- YEAR IN FOOTER ---------- */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

})();
