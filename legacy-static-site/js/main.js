// ============================================================
// CODE ATTRIBUTION — HARVARD REFERENCING METHOD
// ============================================================
//
// Reference 1
// Author:        Mozilla Developer Network (MDN)
// Year:          2024
// Title:         Intersection Observer API
// Link:          https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
// Date Accessed: 16 August 2026
//
// Reference 2
// Author:        Mozilla Developer Network (MDN)
// Year:          2024
// Title:         Window: requestAnimationFrame() Method
// Link:          https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
// Date Accessed: 16 August 2026
//
// Reference 3
// Author:        Mozilla Developer Network (MDN)
// Year:          2024
// Title:         Clipboard API — navigator.clipboard.writeText()
// Link:          https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
// Date Accessed: 16 August 2026
//
// Reference 4
// Author:        Mozilla Developer Network (MDN)
// Year:          2024
// Title:         Element: classList Property
// Link:          https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
// Date Accessed: 16 August 2026
//
// Reference 5
// Author:        Mozilla Developer Network (MDN)
// Year:          2024
// Title:         EventTarget: addEventListener() Method
// Link:          https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// Date Accessed: 16 August 2026
//
// ============================================================

'use strict';

// ── Navbar scroll ─────────────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ── Hamburger menu ─────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    mobileNav.classList.toggle('open', open);
  });
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target) && !mobileNav.contains(e.target)) {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    }
  });
}

// ── Fade-up on scroll ─────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ── Animated counters ──────────────────────────────────
function animateCount(el, to, duration = 1400) {
  const start = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(eased * to);
    const suffix = to >= 100 ? '+' : (el.dataset.suffix || '');
    el.textContent = val.toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = to.toLocaleString() + suffix;
  };
  requestAnimationFrame(tick);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const t = parseInt(e.target.dataset.target, 10);
      if (!isNaN(t)) animateCount(e.target, t);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));

// ── Smooth anchor scroll ───────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset - 16, behavior: 'smooth' });
    }
  });
});
