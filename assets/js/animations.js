/**
 * animations.js — Albor Tallado
 * Animaciones globales compartidas entre todas las páginas
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

        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;
        let trailParticles = [];

        // Crear trail dorado
        function spawnTrail(x, y) {
            const p = document.createElement('div');
            p.className = 'cursor-trail';
            p.style.cssText = `position:fixed;pointer-events:none;z-index:9997;width:4px;height:4px;
                border-radius:50%;background:rgba(184,134,69,0.6);transform:translate(-50%,-50%);
                left:${x}px;top:${y}px;transition:opacity 0.5s ease, transform 0.5s ease;`;
            document.body.appendChild(p);
            requestAnimationFrame(() => {
                p.style.opacity = '0';
                p.style.transform = 'translate(-50%,-50%) scale(0)';
            });
            setTimeout(() => p.remove(), 500);
        }

        let lastTrail = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';

            const now = Date.now();
            if (now - lastTrail > 40) {
                spawnTrail(mouseX, mouseY);
                lastTrail = now;
            }
        });

        function animateRing() {
            ringX += (mouseX - ringX) * 0.1;
            ringY += (mouseY - ringY) * 0.1;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        document.querySelectorAll('a, button, .galeria-item, .proceso-step, .catalogo-card, .contact-card, .tilt-card').forEach(el => {
            el.addEventListener('mouseenter', () => {
                ring.classList.add('hover');
                dot.style.background = 'var(--color-oro)';
            });
            el.addEventListener('mouseleave', () => {
                ring.classList.remove('hover');
                dot.style.background = 'var(--color-espresso)';
            });
        });
    }

    /* =====================================================
       2. INTERSECTION OBSERVER — REVEAL CON STAGGER
    ===================================================== */
    function initReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || (i * 80);
                    setTimeout(() => entry.target.classList.add('visible'), parseInt(delay));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal').forEach((el, i) => {
            el.dataset.delay = i * 60;
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
            if (waFloat) waFloat.classList.toggle('visible', window.scrollY > window.innerHeight * 0.5);
        }, { passive: true });
    }

    /* =====================================================
       4. MAGNETIC BUTTONS
    ===================================================== */
    function initMagneticButtons() {
        document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) * 0.22;
                const dy = (e.clientY - cy) * 0.22;
                btn.style.transform = `translate(${dx}px, ${dy}px)`;
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
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    /* =====================================================
       6. COUNT UP — .count-up[data-target="N"]
    ===================================================== */
    function initCountUp() {
        const countEls = document.querySelectorAll('.count-up');
        if (!countEls.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.target, 10);
                    const suffix = el.dataset.suffix || '';
                    const duration = 1800;
                    const start = performance.now();

                    function update(now) {
                        const progress = Math.min((now - start) / duration, 1);
                        const ease = 1 - Math.pow(1 - progress, 3);
                        el.textContent = Math.floor(ease * target) + suffix;
                        if (progress < 1) requestAnimationFrame(update);
                        else el.textContent = target + suffix;
                    }
                    requestAnimationFrame(update);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        countEls.forEach(el => observer.observe(el));
    }

    /* =====================================================
       7. SCROLL PROGRESS BAR
    ===================================================== */
    function initProgressBar() {
        const bar = document.getElementById('scroll-progress');
        if (!bar) return;
        window.addEventListener('scroll', () => {
            const total = document.body.scrollHeight - window.innerHeight;
            const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
            bar.style.width = pct + '%';
        }, { passive: true });
    }

    /* =====================================================
       8. 3D TILT EFFECT EN CARDS
    ===================================================== */
    function initTiltCards() {
        document.querySelectorAll('.tilt-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(10px)`;
                card.style.transition = 'transform 0.1s ease';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0)';
                card.style.transition = 'transform 0.5s ease';
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
        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => mobileMenu.classList.remove('open'));
        });
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
        const INTERVAL = 3500;
        document.querySelectorAll('.catalogo-card').forEach(function (card) {
            var slides = card.querySelectorAll('.catalogo-slide');
            var dots = card.querySelectorAll('.catalogo-dot');
            if (!slides.length) return;
            var current = 0;
            var timer = null;
            var paused = false;

            function goTo(index) {
                slides[current].classList.remove('active');
                if (dots[current]) dots[current].classList.remove('active');
                current = (index + slides.length) % slides.length;
                slides[current].classList.add('active');
                if (dots[current]) dots[current].classList.add('active');
            }

            function tick() { if (!paused) goTo(current + 1); }
            function resetTimer() { clearInterval(timer); timer = setInterval(tick, INTERVAL); }

            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () { goTo(i); resetTimer(); });
            });
            card.addEventListener('mouseenter', function () { paused = true; });
            card.addEventListener('mouseleave', function () { paused = false; });
            resetTimer();
        });
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
    });

})();
