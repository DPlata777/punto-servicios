/* ============================================
   Punto Servicios Colombia - Animations
   GSAP + ScrollTrigger + Lenis
   ============================================ */

(function () {
  'use strict';

  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const isDesktop = window.matchMedia('(min-width: 981px)').matches && !isTouch;

  /* ---------- LENIS SMOOTH SCROLL ---------- */
  // Páginas con body.no-smooth (p. ej. la política legal) usan scroll nativo,
  // más intuitivo con la rueda del ratón en documentos largos de lectura.
  const noSmooth = document.body.classList.contains('no-smooth');
  let lenis = null;
  if (typeof Lenis !== 'undefined' && !prefersReduced && !noSmooth) {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.psLenis = lenis; // expuesto para scroll suave a anclas (índice de política)
  }

  /* ---------- SCROLL PROGRESS BAR ---------- */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    progress.style.setProperty('--progress', (ratio * 100).toFixed(2) + '%');
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  /* ---------- CUSTOM CURSOR ---------- */
  if (isDesktop) {
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.18, ease: 'power3' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.18, ease: 'power3' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3' });

    window.addEventListener('mousemove', (e) => {
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    });

    const hoverables = 'a, button, .card, .team-deep, .faq-question, .city-pill, .service-item, .contact-method, .btn';
    document.querySelectorAll(hoverables).forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('cursor-hover'));
    });
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  if (isDesktop && !prefersReduced) {
    document.querySelectorAll('.btn, .rail-btn').forEach(btn => {
      const wrap = btn.closest('.magnetic') || btn;
      const strength = 0.35;
      let xTo = gsap.quickTo(wrap, 'x', { duration: 0.35, ease: 'power3' });
      let yTo = gsap.quickTo(wrap, 'y', { duration: 0.35, ease: 'power3' });

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - (rect.left + rect.width / 2)) * strength;
        const y = (e.clientY - (rect.top + rect.height / 2)) * strength;
        xTo(x); yTo(y);
      });
      btn.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- SPLIT TEXT (manual) ----------
     Returns array of inner spans, with initial hidden state set synchronously
     so there's no flash before animation runs.
  */
  function splitWords(el) {
    if (!el || el.dataset.split === 'true') return [];
    el.dataset.split = 'true';
    const text = el.textContent.trim();
    el.textContent = '';
    const words = text.split(/\s+/);
    const wordSpans = words.map(w => {
      const word = document.createElement('span');
      word.className = 'word';
      const inner = document.createElement('span');
      inner.className = 'word-inner';
      inner.textContent = w;
      word.appendChild(inner);
      el.appendChild(word);
      el.appendChild(document.createTextNode(' '));
      return inner;
    });
    // Hide synchronously via inline style so no flash of visible text
    gsap.set(wordSpans, { yPercent: 110 });
    return wordSpans;
  }

  // Helper: set elements to a "from" state synchronously then animate in on scroll
  function revealOnScroll(els, fromVars, toVars) {
    if (!els || !els.length) return;
    gsap.set(els, fromVars);
    const arr = Array.isArray(els) ? els : Array.from(els);
    arr.forEach((el, i) => {
      const tt = Object.assign({}, toVars, {
        delay: (toVars.delay || 0) + (toVars._stagger ? i * toVars._stagger : 0),
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
      delete tt._stagger;
      gsap.to(el, tt);
    });
  }

  /* ---------- HERO TIMELINE ---------- */
  if (!prefersReduced) {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      const words = splitWords(heroTitle);

      // Set initial states for hero pieces synchronously
      gsap.set('.hero-content .eyebrow', { y: 20, opacity: 0 });
      gsap.set('.hero-subtitle', { y: 20, opacity: 0 });
      gsap.set('.hero-actions > *', { y: 20, opacity: 0 });
      gsap.set('.hero-visual', { scale: 0.92, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to('.hero-content .eyebrow', { y: 0, opacity: 1, duration: 0.6 })
        .to(words, { yPercent: 0, duration: 0.9, stagger: 0.05 }, '-=0.3')
        .to('.hero-subtitle', { y: 0, opacity: 1, duration: 0.6 }, '-=0.5')
        .to('.hero-actions > *', { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 }, '-=0.3')
        .to('.hero-visual', { scale: 1, opacity: 1, duration: 1, ease: 'power4.out' }, '-=1');
    }
  }

  /* ---------- PAGE HEADER REVEAL ---------- */
  const pageHeaderTitle = document.querySelector('.page-header h1');
  if (pageHeaderTitle && !prefersReduced) {
    const words = splitWords(pageHeaderTitle);

    gsap.set('.page-header .eyebrow', { y: 20, opacity: 0 });
    gsap.set('.page-header p', { y: 20, opacity: 0 });
    gsap.set('.breadcrumb', { y: 10, opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.breadcrumb', { y: 0, opacity: 1, duration: 0.5 })
      .to('.page-header .eyebrow', { y: 0, opacity: 1, duration: 0.5 }, '-=0.2')
      .to(words, { yPercent: 0, duration: 0.9, stagger: 0.04 }, '-=0.3')
      .to('.page-header p', { y: 0, opacity: 1, duration: 0.6 }, '-=0.5');
  }

  /* ---------- SCROLLTRIGGER REVEALS ---------- */
  if (!prefersReduced && typeof ScrollTrigger !== 'undefined') {

    // Section title words: split + animate (once, no reverse)
    document.querySelectorAll('.section-header h2, .svc-title, .faq-category-title, .mv-card h3').forEach(h => {
      const words = splitWords(h);
      if (!words.length) return;
      gsap.to(words, {
        yPercent: 0,
        duration: 0.8,
        stagger: 0.04,
        ease: 'power3.out',
        scrollTrigger: { trigger: h, start: 'top 90%', once: true }
      });
    });

    // Eyebrow + body paragraph reveal (sync set, then animate in once)
    const softReveal = (selector, fromVars, toVars) => {
      const els = document.querySelectorAll(selector);
      if (!els.length) return;
      gsap.set(els, fromVars);
      els.forEach(el => {
        gsap.to(el, Object.assign({}, toVars, {
          scrollTrigger: { trigger: el, start: 'top 92%', once: true }
        }));
      });
    };

    softReveal('.section-header .eyebrow', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
    softReveal('.section-header p', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' });
    softReveal('.mv-card p', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' });
    softReveal('.svc-body p', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' });

    // Grids: staggered card reveal (sync set, animate once)
    document.querySelectorAll('.services-grid, .features-grid, .team-grid, .team-deep-grid, .principles-grid, .form-grid').forEach(grid => {
      const items = Array.from(grid.children);
      if (!items.length) return;
      gsap.set(items, { y: 40, opacity: 0 });
      gsap.to(items, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: grid, start: 'top 88%', once: true }
      });
    });

    // FAQ items
    document.querySelectorAll('.faq-list').forEach(list => {
      const items = Array.from(list.children);
      if (!items.length) return;
      gsap.set(items, { y: 20, opacity: 0 });
      gsap.to(items, {
        y: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: { trigger: list, start: 'top 88%', once: true }
      });
    });

    // Counters
    document.querySelectorAll('[data-counter]').forEach(el => {
      const target = parseFloat(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => {
          const display = Number.isInteger(target) ? Math.round(obj.val) : obj.val.toFixed(1);
          el.textContent = display + suffix;
        }
      });
    });

    // Hero card stack subtle parallax (only if exists)
    if (document.querySelector('.hero-card-float')) {
      gsap.to('.hero-card-float', {
        yPercent: -15,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
      });
    }
    if (document.querySelector('.hero-card-float-2')) {
      gsap.to('.hero-card-float-2', {
        yPercent: 10,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
      });
    }

    // Aura blobs drift
    document.querySelectorAll('.aura').forEach((blob, i) => {
      gsap.to(blob, {
        yPercent: i % 2 ? 20 : -20,
        xPercent: i % 2 ? -10 : 10,
        scrollTrigger: { trigger: blob.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.2 }
      });
    });

    // SVC stages: visual + number + checks + steps
    document.querySelectorAll('.svc-stage').forEach((stage) => {
      const visual = stage.querySelector('.svc-visual');
      if (visual) {
        gsap.set(visual, { scale: 0.92, opacity: 0 });
        gsap.to(visual, {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: stage, start: 'top 75%', once: true }
        });
        gsap.to(visual, {
          yPercent: -8,
          scrollTrigger: { trigger: stage, start: 'top bottom', end: 'bottom top', scrub: 1 }
        });
      }
      const number = stage.querySelector('.svc-number');
      if (number) {
        gsap.set(number, { y: 60, opacity: 0 });
        gsap.to(number, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power4.out',
          scrollTrigger: { trigger: number, start: 'top 92%', once: true }
        });
      }
      const checks = Array.from(stage.querySelectorAll('.svc-checklist li'));
      if (checks.length) {
        gsap.set(checks, { x: -20, opacity: 0 });
        gsap.to(checks, {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: stage.querySelector('.svc-checklist'), start: 'top 90%', once: true }
        });
      }
      const steps = Array.from(stage.querySelectorAll('.process-step'));
      if (steps.length) {
        gsap.set(steps, { y: 30, opacity: 0 });
        gsap.to(steps, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: stage.querySelector('.process-list'), start: 'top 88%', once: true }
        });
      }
    });

    // Principles pop
    document.querySelectorAll('.principle').forEach((p) => {
      gsap.set(p, { scale: 0.9, opacity: 0 });
      gsap.to(p, {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: 'back.out(1.4)',
        scrollTrigger: { trigger: p, start: 'top 94%', once: true }
      });
    });

    // Team deep cards (grid)
    document.querySelectorAll('.team-deep').forEach((card) => {
      gsap.set(card, { y: 40, opacity: 0 });
      gsap.to(card, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 92%', once: true }
      });
    });

    // Big numbers
    document.querySelectorAll('.big-num').forEach(num => {
      gsap.set(num, { y: 60, opacity: 0 });
      gsap.to(num, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: { trigger: num, start: 'top 90%', once: true }
      });
    });

    // CTA banner
    document.querySelectorAll('.cta-banner').forEach(b => {
      gsap.set(b, { scale: 0.96, opacity: 0, y: 30 });
      gsap.to(b, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: b, start: 'top 85%', once: true }
      });
    });

    // Contact methods
    document.querySelectorAll('.contact-method').forEach((c, i) => {
      gsap.set(c, { x: -30, opacity: 0 });
      gsap.to(c, {
        x: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        delay: i * 0.04,
        scrollTrigger: { trigger: c, start: 'top 94%', once: true }
      });
    });

    // Form card
    const formCard = document.querySelector('.form-card');
    if (formCard) {
      gsap.set(formCard, { y: 40, opacity: 0 });
      gsap.to(formCard, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: formCard, start: 'top 90%', once: true }
      });
    }

    // Feature cards (more specific selector to ensure they reveal)
    document.querySelectorAll('.feature').forEach(f => {
      gsap.set(f, { y: 30, opacity: 0 });
      gsap.to(f, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: f, start: 'top 92%', once: true }
      });
    });

    // Card tilt (services grid cards)
    document.querySelectorAll('.card').forEach(c => {
      gsap.set(c, { y: 30, opacity: 0 });
      gsap.to(c, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: c, start: 'top 92%', once: true }
      });
    });
  }

  /* ---------- MARQUEE INFINITE ---------- */
  document.querySelectorAll('.marquee').forEach(marquee => {
    const track = marquee.querySelector('.marquee-track');
    if (!track) return;
    // Duplicate content for seamless loop
    track.innerHTML += track.innerHTML;
    const trackWidth = track.scrollWidth / 2;
    const duration = trackWidth / 50;
    gsap.to(track, {
      x: -trackWidth,
      duration: duration,
      ease: 'none',
      repeat: -1
    });
  });

  /* ---------- TILT CARDS (3D + pop en z + brillo que sigue el mouse) ---------- */
  if (isDesktop && !prefersReduced) {
    document.querySelectorAll('.tilt').forEach(card => {
      const inner = card.querySelector('.tilt-content') || card;
      const xRotTo = gsap.quickTo(inner, 'rotationY', { duration: 0.4, ease: 'power2' });
      const yRotTo = gsap.quickTo(inner, 'rotationX', { duration: 0.4, ease: 'power2' });
      const zTo = gsap.quickTo(inner, 'z', { duration: 0.4, ease: 'power2' });

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;   // 0..1
        const py = (e.clientY - rect.top) / rect.height;   // 0..1
        xRotTo((px - 0.5) * 8);
        yRotTo((py - 0.5) * -8);
        zTo(22);
        // Posición del overlay de brillo (--shine-x / --shine-y)
        card.style.setProperty('--shine-x', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--shine-y', (py * 100).toFixed(1) + '%');
      });
      card.addEventListener('mouseleave', () => { xRotTo(0); yRotTo(0); zTo(0); });
    });
  }

  /* ---------- NAV HIDE/SHOW ON SCROLL DIRECTION ---------- */
  let lastScroll = 0;
  const nav = document.querySelector('.nav');
  if (nav) {
    nav.style.transition = 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1), background 250ms ease, border-color 250ms ease, box-shadow 250ms ease';
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 200 && y > lastScroll + 4) {
        nav.style.transform = 'translateY(-110%)';
      } else if (y < lastScroll - 4 || y < 200) {
        nav.style.transform = 'translateY(0)';
      }
      lastScroll = y;
    }, { passive: true });
  }

  /* ---------- REFRESH SCROLLTRIGGER ON LOAD ---------- */
  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });

  // Also refresh after a tick in case images/fonts load late
  setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }, 600);

})();
