/**
 * hero-cinematic.js
 * Albor Tallado — Vignette pulsante cinematográfica para todos los hero canvas.
 *
 * Detecta #page-canvas (catalogo, bespoke, contacto) y #golden-canvas (index).
 * No duplica lógica de partículas existente — solo añade un canvas de vignette
 * independiente (z-index superior) con un radial-gradient oscuro que respira.
 *
 * Opacity ciclo: 0.30 → 0.50 → 0.30 en ~6 s.
 * Sin dependencias externas. Vanilla JS.
 */

(function () {
  'use strict';

  // ─── CONFIGURACIÓN ─────────────────────────────────────────────────────────
  var VIGNETTE_MIN    = 0.30;   // opacidad mínima del borde oscuro
  var VIGNETTE_MAX    = 0.50;   // opacidad máxima del borde oscuro
  var VIGNETTE_PERIOD = 6000;   // ms para un ciclo completo de respiración
  var INNER_RADIUS    = 0.28;   // fracción de H para inicio del degradado
  var OUTER_RADIUS    = 0.90;   // fracción de H para borde exterior

  // ─── HELPER: crear canvas de vignette sobre el canvas fuente ───────────────
  function mountVignetteCanvas(sourceCanvas) {
    // Obtener el contenedor posicionado del canvas fuente
    var parent = sourceCanvas.parentElement;
    if (!parent) return null;

    // El parent debe tener position para que absolute funcione
    var pos = getComputedStyle(parent).position;
    if (pos === 'static') {
      parent.style.position = 'relative';
    }

    var vc = document.createElement('canvas');
    vc.setAttribute('aria-hidden', 'true');

    // Copiar posicionamiento del canvas fuente para quedar encima
    var srcStyle = getComputedStyle(sourceCanvas);
    vc.style.cssText = [
      'position:absolute',
      'top:0',
      'left:0',
      'width:100%',
      'height:100%',
      'pointer-events:none',
      'display:block',
      // z-index 1 por encima del canvas de partículas
      'z-index:' + (parseInt(srcStyle.zIndex || '2', 10) + 1)
    ].join(';');

    // Insertar inmediatamente después del canvas fuente
    var next = sourceCanvas.nextSibling;
    if (next) {
      parent.insertBefore(vc, next);
    } else {
      parent.appendChild(vc);
    }

    return vc;
  }

  // ─── DIBUJAR VIGNETTE EN UN FRAME ──────────────────────────────────────────
  function drawVignette(ctx, W, H, alpha) {
    ctx.clearRect(0, 0, W, H);
    var cx  = W / 2;
    var cy  = H / 2;
    var r0  = H * INNER_RADIUS;
    var r1  = H * OUTER_RADIUS;
    var grd = ctx.createRadialGradient(cx, cy, r0, cx, cy, r1);
    grd.addColorStop(0, 'rgba(30,27,24,0)');
    grd.addColorStop(0.6, 'rgba(30,27,24,' + (alpha * 0.55).toFixed(3) + ')');
    grd.addColorStop(1,   'rgba(30,27,24,' + alpha.toFixed(3) + ')');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  // ─── LOOP DE ANIMACIÓN PARA UN CANVAS DE VIGNETTE ──────────────────────────
  function startVignetteLoop(vignetteCanvas, sourceCanvas) {
    var ctx = vignetteCanvas.getContext('2d');
    var W, H;

    function resize() {
      W = vignetteCanvas.width  = sourceCanvas.offsetWidth  || vignetteCanvas.offsetWidth  || 800;
      H = vignetteCanvas.height = sourceCanvas.offsetHeight || vignetteCanvas.offsetHeight || 450;
    }
    resize();

    // Sincronizar tamaño cuando cambie la ventana
    window.addEventListener('resize', function () { resize(); });

    // ResizeObserver si disponible (más preciso para contenedores fluidos)
    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function () { resize(); });
      ro.observe(sourceCanvas.parentElement || sourceCanvas);
    }

    var startTime = null;

    function loop(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;

      // Función sinusoidal que oscila entre VIGNETTE_MIN y VIGNETTE_MAX
      var t     = (elapsed % VIGNETTE_PERIOD) / VIGNETTE_PERIOD; // 0..1
      var phase = Math.sin(t * Math.PI * 2);                      // -1..1
      var alpha = VIGNETTE_MIN + (VIGNETTE_MAX - VIGNETTE_MIN) * (phase * 0.5 + 0.5);

      drawVignette(ctx, W, H, alpha);
      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  // ─── INICIALIZACIÓN ────────────────────────────────────────────────────────
  function init() {
    // Intentar los dos IDs de canvas conocidos
    var targets = [
      document.getElementById('page-canvas'),
      document.getElementById('golden-canvas')
    ].filter(Boolean);

    if (!targets.length) return; // nada que hacer en esta página

    targets.forEach(function (sourceCanvas) {
      var vc = mountVignetteCanvas(sourceCanvas);
      if (!vc) return;
      startVignetteLoop(vc, sourceCanvas);
    });
  }

  // Arrancar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
