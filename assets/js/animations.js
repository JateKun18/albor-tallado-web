/**
 * animations.js — Albor Tallado v2
 * Animaciones globales + mejoras: page transitions, lazy images,
 * card glow, parallax sutil, reveal direccional, tilt mejorado
 */

(function () {
    'use strict';

    /* =====================================================
       1. CURSOR PERSONALIZADO CON TRAIL DORADO
    ===================================================== */
    function initCursor() {
        const dot = document.getElementById('cursorDot');
        const ring = document.getElementById('cursorRing');
        if (!dot || !ring) return;

        let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0, lastTrail = 0;

        function spawnTrail(x, y) {
            const p = document.createElement('div');
            p.style.cssText = `position:fixed;pointer-events:none;z-index:9997;width:5px;height:5px;
                border-radius:50%;background:rgba(184,134,69,0.55);transform:translate(-50%,-50%);
                left:${x}px;top:${y}px;transition:opacity 0.55s ease,transform 0.55s ease;`;
            document.body.appendChild(p);
            requestAnimationFrame(() => { p.style.opacity = '0'; p.style.transform = 'translate(-50%,-50%) scale(0)'; });
            setTimeout(() => p.remove(), 560);
        }

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
            dot.style.left = mouseX + 'px'; dot.style.top = mouseY + 'px';
            const now = Date.now();
            if (now - lastTrail > 35) { spawnTrail(mouseX, mouseY); lastTrail = now; }
        });

        (function animateRing() {
            ringX += (mouseX - ringX) * 0.1;
            ringY += (mouseY - ringY) * 0.1;
            ring.style.left = ringX + 'px'; ring.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        })();

        document.querySelectorAll('a,button,.galeria-item,.tilt-card,.product-card,.bespoke-gallery-item').forEach(el => {
            el.addEventListener('mouseenter', () => { ring.classList.add('hover'); dot.style.background = 'var(--color-oro)'; });
            el.addEventListener('mouseleave', () => { ring.classList.remove('hover'); dot.style.background = 'var(--color-espresso)'; });
        });
    }

    /* =====================================================
       2. REVEAL CON STAGGER + DIRECCIONES
    ===================================================== */
    function initReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.delay || 0);
                    setTimeout(() => entry.target.classList.add('visible'), delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

        document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up').forEach((el, i) => {
            if (!el.dataset.delay) el.dataset.delay = i * 55;
            observer.observe(el);
        });
    }

    /* =====================================================
       3. NAV SCROLL — TRANSPARENT → FROSTED GLASS
    ===================================================== */
    function initNavScroll() {
        const navbar = document.getElementById('navbar');
        const waFloat = document.getElementById('wa-float');
        if (!navbar) return;
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
            if (waFloat) waFloat.classList.toggle('visible', window.scrollY > window.innerHeight * 0.45);
        }, { passive: true });
    }

    /* =====================================================
       4. MAGNETIC BUTTONS
    ===================================================== */
    function initMagneticButtons() {
        document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const r = btn.getBoundingClientRect();
                const dx = (e.clientX - r.left - r.width / 2) * 0.25;
                const dy = (e.clientY - r.top - r.height / 2) * 0.25;
                btn.style.transform = `translate(${dx}px,${dy}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0,0)';
                btn.style.transition = 'transform 0.4s ease';
                setTimeout(() => btn.style.transition = '', 400);
            });
        });
    }

    /* =====================================================
       5. SMOOTH SCROLL
    ===================================================== */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            });
        });
    }

    /* =====================================================
       6. COUNT UP
    ===================================================== */
    function initCountUp() {
        const els = document.querySelectorAll('.count-up');
        if (!els.length) return;
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.dataset.target, 10);
                const suffix = el.dataset.suffix || '';
                const start = performance.now();
                (function update(now) {
                    const p = Math.min((now - start) / 1800, 1);
                    const ease = 1 - Math.pow(1 - p, 3);
                    el.textContent = Math.floor(ease * target) + suffix;
                    if (p < 1) requestAnimationFrame(update);
                    else el.textContent = target + suffix;
                })(start);
                obs.unobserve(el);
            });
        }, { threshold: 0.5 });
        els.forEach(el => obs.observe(el));
    }

    /* =====================================================
       7. SCROLL PROGRESS BAR
    ===================================================== */
    function initProgressBar() {
        const bar = document.getElementById('scroll-progress');
        if (!bar) return;
        window.addEventListener('scroll', () => {
            const total = document.body.scrollHeight - window.innerHeight;
            bar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
        }, { passive: true });
    }

    /* =====================================================
       8. 3D TILT + GLOW EN CARDS
    ===================================================== */
    function initTiltCards() {
        document.querySelectorAll('.tilt-card, .product-card, .galeria-item').forEach(card => {
            card.style.transition = 'transform 0.12s ease, box-shadow 0.3s ease';
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(14px)`;
                card.style.boxShadow = `${-x * 18}px ${-y * 18}px 40px rgba(184,134,69,0.18), 0 8px 32px rgba(0,0,0,0.3)`;
                card.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0)';
                card.style.boxShadow = '';
                card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
            });
        });
    }

    /* =====================================================
       9. HAMBURGER / MOBILE MENU
    ===================================================== */
    function initMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileClose = document.getElementById('mobile-close');
        if (!hamburger || !mobileMenu) return;
        hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
        if (mobileClose) mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
        document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => mobileMenu.classList.remove('open')));
    }

    /* =====================================================
       10. FAQ ACCORDION
    ===================================================== */
    function initFAQ() {
        document.querySelectorAll('.faq-question').forEach(q => {
            q.addEventListener('click', () => {
                const item = q.closest('.faq-item');
                const isOpen = item.classList.contains('open');
                document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
                if (!isOpen) item.classList.add('open');
            });
        });
    }

    /* =====================================================
       11. CATÁLOGO VISOR AUTO-SLIDE
    ===================================================== */
    function initCatalogoVisor() {
        document.querySelectorAll('.catalogo-card').forEach(function (card) {
            var slides = card.querySelectorAll('.catalogo-slide');
            var dots = card.querySelectorAll('.catalogo-dot');
            if (!slides.length) return;
            var current = 0, timer = null, paused = false;
            function goTo(idx) {
                slides[current].classList.remove('active');
                if (dots[current]) dots[current].classList.remove('active');
                current = (idx + slides.length) % slides.length;
                slides[current].classList.add('active');
                if (dots[current]) dots[current].classList.add('active');
            }
            function tick() { if (!paused) goTo(current + 1); }
            function reset() { clearInterval(timer); timer = setInterval(tick, 3500); }
            dots.forEach(function (d, i) { d.addEventListener('click', function () { goTo(i); reset(); }); });
            card.addEventListener('mouseenter', () => paused = true);
            card.addEventListener('mouseleave', () => paused = false);
            reset();
        });
    }

    /* =====================================================
       12. LAZY LOADING DE IMÁGENES
    ===================================================== */
    function initLazyImages() {
        const imgs = document.querySelectorAll('img[data-src]');
        if (!imgs.length) return;
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
                    img.removeAttribute('data-src');
                    img.style.transition = 'opacity 0.5s ease';
                    img.onload = () => img.style.opacity = '1';
                    obs.unobserve(img);
                }
            });
        }, { rootMargin: '200px' });
        imgs.forEach(img => { img.style.opacity = '0'; obs.observe(img); });
    }

    /* =====================================================
       13. PAGE TRANSITIONS — FADE ENTRE PÁGINAS
    ===================================================== */
    function initPageTransitions() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.4s ease';
        requestAnimationFrame(() => { document.body.style.opacity = '1'; });

        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('https://wa.me')) return;
            link.addEventListener('click', function (e) {
                e.preventDefault();
                document.body.style.opacity = '0';
                setTimeout(() => { window.location.href = href; }, 380);
            });
        });
    }

    /* =====================================================
       14. PARALLAX SUTIL EN SECCIONES
    ===================================================== */
    function initParallax() {
        const els = document.querySelectorAll('.parallax-section');
        if (!els.length) return;
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            els.forEach(el => {
                const rect = el.getBoundingClientRect();
                const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * 0.12;
                el.style.backgroundPositionY = `calc(50% + ${offset}px)`;
            });
        }, { passive: true });
    }

    /* =====================================================
       INIT ALL
    ===================================================== */
    document.addEventListener('DOMContentLoaded', function () {
        initCursor();
        initReveal();
        initNavScroll();
        initMagneticButtons();
        initSmoothScroll();
        initCountUp();
        initProgressBar();
        initTiltCards();
        initMobileMenu();
        initFAQ();
        initCatalogoVisor();
        initLazyImages();
        initPageTransitions();
        initParallax();
    });

})();
