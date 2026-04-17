/**
 * bespoke-cinematic.js
 * Albor Tallado — Animación cinematográfica para sección Bespoke
 * Canvas autónomo: Ken Burns + cross-fade + partículas doradas + vignette
 * Sin dependencias externas. Vanilla JS puro.
 */

(function () {
  'use strict';

  // ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────
  var IMAGES = [
    'assets/img/BESPOKE/FRONTAL.png',
    'assets/img/BESPOKE/DETALLE.png',
    'assets/img/BESPOKE/CENITAL%20LATERAL.png',
    'assets/img/BESPOKE/LATREAL.png',
    'assets/img/BESPOKE/MANO%20Y%20PRODUCTO.png'
  ];

  var GOLD        = 'rgba(184,134,69,';   // color base partículas
  var DARK        = '#1E1B18';
  var IMG_DURATION  = 4000;               // ms por imagen
  var FADE_DURATION = 800;               // ms de cross-fade
  var PARTICLE_COUNT = 12;

  // ─── ESTADO ──────────────────────────────────────────────────────────────────
  var container, canvas, ctx;
  var W, H;
  var images       = [];
  var loaded       = 0;
  var currentIdx   = 0;
  var nextIdx      = 1;
  var fadeAlpha    = 0;       // 0 = solo current, 1 = solo next
  var phase        = 'show';  // 'show' | 'fade'
  var phaseStart   = 0;
  var animFrame    = null;
  var particles    = [];

  // Ken Burns por imagen: cada entrada define dirección/zoom para variedad
  var KB_CONFIGS = [
    { startScale: 1.08, endScale: 1.0,  startX:  0.02, endX: -0.02, startY:  0.01, endY: -0.01 },
    { startScale: 1.0,  endScale: 1.08, startX: -0.02, endX:  0.02, startY: -0.01, endY:  0.01 },
    { startScale: 1.05, endScale: 1.0,  startX:  0.0,  endX:  0.03, startY:  0.02, endY: -0.02 },
    { startScale: 1.0,  endScale: 1.06, startX:  0.03, endX: -0.01, startY: -0.02, endY:  0.01 },
    { startScale: 1.07, endScale: 1.0,  startX: -0.01, endX:  0.02, startY:  0.0,  endY:  0.02 }
  ];

  // ─── PARTÍCULAS ──────────────────────────────────────────────────────────────
  function createParticle() {
    return {
      x:      Math.random() * W,
      y:      H + Math.random() * 60,
      r:      1.5 + Math.random() * 2.5,
      speed:  0.25 + Math.random() * 0.4,
      drift:  (Math.random() - 0.5) * 0.3,
      alpha:  0.15 + Math.random() * 0.25,
      flicker: Math.random() * Math.PI * 2    // fase inicial aleatoria
    };
  }

  function initParticles() {
    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var p = createParticle();
      p.y = Math.random() * H; // distribuir verticalmente al inicio
      particles.push(p);
    }
  }

  function updateParticles(dt) {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.y      -= p.speed * dt * 0.06;
      p.x      += p.drift;
      p.flicker += 0.04;
      if (p.y < -20) {
        particles[i] = createParticle();
      }
    }
  }

  function drawParticles() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var flicker = 0.8 + 0.2 * Math.sin(p.flicker);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = GOLD + (p.alpha * flicker).toFixed(3) + ')';
      ctx.fill();
    }
  }

  // ─── VIGNETTE ────────────────────────────────────────────────────────────────
  function drawVignette() {
    var grd = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  // ─── DIBUJAR IMAGEN CON KEN BURNS ───────────────────────────────────────────
  function drawImageKB(img, progress, alpha) {
    if (!img || !img.naturalWidth) return;

    var kb    = KB_CONFIGS[images.indexOf(img) % KB_CONFIGS.length];
    var ease  = easeInOutCubic(progress);
    var scale = kb.startScale + (kb.endScale - kb.startScale) * ease;
    var panX  = (kb.startX  + (kb.endX  - kb.startX)  * ease) * W;
    var panY  = (kb.startY  + (kb.endY  - kb.startY)  * ease) * H;

    // Ajuste cover: escalar imagen para cubrir canvas
    var imgAspect    = img.naturalWidth / img.naturalHeight;
    var canvasAspect = W / H;
    var drawW, drawH;
    if (imgAspect > canvasAspect) {
      drawH = H * scale;
      drawW = drawH * imgAspect;
    } else {
      drawW = W * scale;
      drawH = drawW / imgAspect;
    }

    var x = (W - drawW) / 2 + panX;
    var y = (H - drawH) / 2 + panY;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, x, y, drawW, drawH);
    ctx.restore();
  }

  // ─── EASING ──────────────────────────────────────────────────────────────────
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  // ─── LOOP PRINCIPAL ──────────────────────────────────────────────────────────
  var lastTime = 0;

  function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    var dt = timestamp - lastTime;
    lastTime = timestamp;

    if (!phaseStart) phaseStart = timestamp;
    var elapsed = timestamp - phaseStart;

    ctx.clearRect(0, 0, W, H);

    if (phase === 'show') {
      var progress = Math.min(elapsed / IMG_DURATION, 1);
      drawImageKB(images[currentIdx], progress, 1);

      if (elapsed >= IMG_DURATION) {
        phase = 'fade';
        phaseStart = timestamp;
        elapsed = 0;
      }
    }

    if (phase === 'fade') {
      var fadeProgress = Math.min(elapsed / FADE_DURATION, 1);
      var alpha = easeInOutSine(fadeProgress);

      // Imagen actual: progreso kb congelado al final del show
      drawImageKB(images[currentIdx], 1, 1 - alpha);
      // Imagen siguiente: empieza desde kb inicio
      drawImageKB(images[nextIdx], 0, alpha);

      if (elapsed >= FADE_DURATION) {
        currentIdx = nextIdx;
        nextIdx    = (nextIdx + 1) % images.length;
        phase      = 'show';
        phaseStart = timestamp;
      }
    }

    updateParticles(dt);
    drawParticles();
    drawVignette();

    animFrame = requestAnimationFrame(loop);
  }

  // ─── RESIZE ──────────────────────────────────────────────────────────────────
  function resize() {
    W = container.offsetWidth  || 800;
    H = container.offsetHeight || 450;
    canvas.width  = W;
    canvas.height = H;

    // Reposicionar partículas al nuevo tamaño
    for (var i = 0; i < particles.length; i++) {
      if (particles[i].x > W) particles[i].x = Math.random() * W;
    }
  }

  // ─── CARGA DE IMÁGENES ───────────────────────────────────────────────────────
  function loadImages(srcs, cb) {
    var total = srcs.length;
    var result = new Array(total);
    srcs.forEach(function (src, i) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        result[i] = img;
        loaded++;
        if (loaded === total) cb(result);
      };
      img.onerror = function () {
        // Si falla, crear imagen placeholder vacía para no romper el loop
        result[i] = new Image();
        loaded++;
        if (loaded === total) cb(result);
      };
      img.src = src;
    });
  }

  // ─── INIT ────────────────────────────────────────────────────────────────────
  function init() {
    container = document.getElementById('bespoke-cinematic');
    if (!container) return; // div no encontrado, salir silenciosamente

    // Asegurar que el contenedor tenga posición para que el canvas lo cubra
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }
    container.style.overflow = 'hidden';

    // Crear canvas
    canvas = document.createElement('canvas');
    canvas.style.cssText = [
      'position:absolute',
      'top:0',
      'left:0',
      'width:100%',
      'height:100%',
      'display:block'
    ].join(';');
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');

    // Dimensiones iniciales
    resize();
    initParticles();

    // ResizeObserver para responsividad
    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function () { resize(); });
      ro.observe(container);
    } else {
      window.addEventListener('resize', resize);
    }

    // Fondo oscuro mientras cargan las imágenes
    ctx.fillStyle = DARK;
    ctx.fillRect(0, 0, W, H);

    // Cargar imágenes y arrancar animación
    loadImages(IMAGES, function (imgs) {
      images = imgs;
      lastTime  = 0;
      phaseStart = 0;
      animFrame = requestAnimationFrame(loop);
    });
  }

  // Arrancar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
