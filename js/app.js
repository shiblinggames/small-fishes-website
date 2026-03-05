/* ============================================================
   SMALL FISHES: SEAS THE BOOTY — Scroll-Driven Animation
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     CONFIG
  ---------------------------------------------------------- */
  const FRAME_COUNT  = 145;
  const FRAME_SPEED  = 2.0;
  const IMAGE_SCALE  = 0.85;
  const PRELOAD_FAST = 12;

  /* ----------------------------------------------------------
     STATE — declared first so resizeCanvas can reference them
  ---------------------------------------------------------- */
  const frames   = new Array(FRAME_COUNT).fill(null);
  let loadedCount  = 0;
  let currentFrame = 0;
  let sampledBg    = '#000000';
  let lastSampleFrame = -999;

  /* ----------------------------------------------------------
     ELEMENTS
  ---------------------------------------------------------- */
  const loader      = document.getElementById('loader');
  const loaderBar   = document.getElementById('loader-bar');
  const loaderPct   = document.getElementById('loader-percent');
  const canvas      = document.getElementById('canvas');
  const canvasWrap  = document.getElementById('canvas-wrap');
  const scrollCont  = document.getElementById('scroll-container');
  const darkOverlay = document.getElementById('dark-overlay');
  const marqueeWrap = document.getElementById('marquee');
  const marqueeText = marqueeWrap.querySelector('.marquee-text');
  const heroSection = document.querySelector('.hero-standalone');
  const ctx         = canvas.getContext('2d');

  /* ----------------------------------------------------------
     CANVAS SIZING
  ---------------------------------------------------------- */
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
    // reset scale after resize
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (frames[currentFrame]) drawFrame(currentFrame);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  /* ----------------------------------------------------------
     BACKGROUND COLOR SAMPLER
  ---------------------------------------------------------- */
  function sampleBgColor(img) {
    try {
      const tmp = document.createElement('canvas');
      tmp.width = tmp.height = 4;
      const tc = tmp.getContext('2d');
      tc.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, 4, 4);
      const d = tc.getImageData(0, 0, 1, 1).data;
      sampledBg = `rgb(${d[0]},${d[1]},${d[2]})`;
    } catch (e) {
      sampledBg = '#000000';
    }
  }

  /* ----------------------------------------------------------
     FRAME DRAWING — padded cover mode
  ---------------------------------------------------------- */
  function drawFrame(index) {
    const img = frames[index];
    if (!img) return;
    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    ctx.fillStyle = sampledBg;
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  /* ----------------------------------------------------------
     FRAME PRELOADER — two-phase
  ---------------------------------------------------------- */
  function framePath(i) {
    const n = String(i + 1).padStart(4, '0');
    return `frames/frame_${n}.webp`;
  }

  function loadFrame(i, onDone) {
    const img = new Image();
    img.onload = function () {
      frames[i] = img;
      loadedCount++;
      if (Math.abs(i - lastSampleFrame) >= 20) {
        sampleBgColor(img);
        lastSampleFrame = i;
      }
      const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
      loaderBar.style.width = pct + '%';
      loaderPct.textContent = pct + '%';
      if (onDone) onDone(i);
    };
    img.onerror = function () {
      loadedCount++;
      const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
      loaderBar.style.width = pct + '%';
      loaderPct.textContent = pct + '%';
      if (onDone) onDone(i);
    };
    img.src = framePath(i);
  }

  function hideLoader() {
    loader.classList.add('hidden');
  }

  function startPreload() {
    var fastDone = 0;

    // Phase 1: first PRELOAD_FAST frames — fast first paint
    for (var i = 0; i < PRELOAD_FAST; i++) {
      (function (idx) {
        loadFrame(idx, function () {
          fastDone++;
          if (fastDone === PRELOAD_FAST) {
            if (frames[0]) drawFrame(0);
            init();
            // Phase 2: load the rest in background
            for (var j = PRELOAD_FAST; j < FRAME_COUNT; j++) {
              (function (jdx) {
                loadFrame(jdx, function () {
                  if (loadedCount >= FRAME_COUNT) {
                    hideLoader();
                  }
                });
              })(j);
            }
          }
        });
      })(i);
    }
  }

  /* ----------------------------------------------------------
     LENIS SMOOTH SCROLL
  ---------------------------------------------------------- */
  gsap.registerPlugin(ScrollTrigger);

  var lenis = new Lenis({
    duration: 1.2,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add(function (time) {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  /* ----------------------------------------------------------
     SECTION POSITIONING
  ---------------------------------------------------------- */
  function positionSections() {
    var totalH = scrollCont.offsetHeight;
    document.querySelectorAll('.scroll-section').forEach(function (sec) {
      if (sec.dataset.persist === 'true') return; // position:fixed via CSS, skip
      var enter = parseFloat(sec.dataset.enter) / 100;
      var leave = parseFloat(sec.dataset.leave) / 100;
      var mid   = (enter + leave) / 2;
      sec.style.top       = (mid * totalH) + 'px';
      sec.style.transform = 'translateY(-50%)';
    });
  }

  window.addEventListener('resize', function () {
    positionSections();
    ScrollTrigger.refresh();
  });

  /* ----------------------------------------------------------
     HERO ENTRANCE — staggered word reveal on load
  ---------------------------------------------------------- */
  function initHeroEntrance() {
    var words  = document.querySelectorAll('.hero-heading .word');
    var label  = document.querySelector('.hero-label');
    var sub    = document.querySelector('.hero-sub');
    var tag    = document.querySelector('.hero-tagline');
    var scroll = document.querySelector('.scroll-indicator');

    gsap.set([label, words, sub, tag, scroll], { opacity: 0, y: 28 });

    gsap.timeline({ delay: 0.2 })
      .to(label,  { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
      .to(words,  { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }, '-=0.3')
      .to(sub,    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
      .to(tag,    { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4')
      .to(scroll, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2');
  }

  /* ----------------------------------------------------------
     HERO TRANSITION — circle-wipe + fade
  ---------------------------------------------------------- */
  function initHeroTransition() {
    ScrollTrigger.create({
      trigger: scrollCont,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: function (self) {
        var p = self.progress;
        heroSection.style.opacity = String(Math.max(0, 1 - p * 18));
        heroSection.style.pointerEvents = p > 0.06 ? 'none' : '';
        var wipe   = Math.min(1, Math.max(0, (p - 0.005) / 0.07));
        var radius = wipe * 80;
        canvasWrap.style.clipPath = 'circle(' + radius + '% at 50% 50%)';
      },
    });
  }

  /* ----------------------------------------------------------
     CANVAS FRAME SCROLL BINDING
  ---------------------------------------------------------- */
  function initCanvasScroll() {
    ScrollTrigger.create({
      trigger: scrollCont,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: function (self) {
        var accelerated = Math.min(self.progress * FRAME_SPEED, 1);
        var index = Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1);
        if (index !== currentFrame) {
          currentFrame = index;
          requestAnimationFrame(function () { drawFrame(currentFrame); });
        }
      },
    });
  }

  /* ----------------------------------------------------------
     DARK OVERLAY — stats section (50–64%)
  ---------------------------------------------------------- */
  function initDarkOverlay() {
    var enter     = 0.50;
    var leave     = 0.64;
    var fadeRange = 0.035;

    ScrollTrigger.create({
      trigger: scrollCont,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: function (self) {
        var p = self.progress;
        var opacity = 0;
        if (p >= enter - fadeRange && p < enter) {
          opacity = (p - (enter - fadeRange)) / fadeRange;
        } else if (p >= enter && p <= leave) {
          opacity = 0.92;
        } else if (p > leave && p <= leave + fadeRange) {
          opacity = 0.92 * (1 - (p - leave) / fadeRange);
        }
        darkOverlay.style.opacity = String(opacity);
      },
    });
  }

  /* ----------------------------------------------------------
     MARQUEE (visible 34–72%)
  ---------------------------------------------------------- */
  function initMarquee() {
    var showEnter = 0.34;
    var showLeave = 0.72;
    var fadeRange = 0.03;

    gsap.to(marqueeText, {
      xPercent: -28,
      ease: 'none',
      scrollTrigger: {
        trigger: scrollCont,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });

    ScrollTrigger.create({
      trigger: scrollCont,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: function (self) {
        var p = self.progress;
        var op = 0;
        if (p >= showEnter && p < showEnter + fadeRange) {
          op = (p - showEnter) / fadeRange;
        } else if (p >= showEnter + fadeRange && p <= showLeave) {
          op = 1;
        } else if (p > showLeave && p <= showLeave + fadeRange) {
          op = 1 - (p - showLeave) / fadeRange;
        }
        marqueeWrap.style.opacity = String(op);
      },
    });
  }

  /* ----------------------------------------------------------
     SECTION ANIMATIONS
  ---------------------------------------------------------- */
  function setupSectionAnimations() {
    document.querySelectorAll('.scroll-section').forEach(function (section) {
      var type    = section.dataset.animation;
      var persist = section.dataset.persist === 'true';
      var enter   = parseFloat(section.dataset.enter) / 100;
      var leave   = parseFloat(section.dataset.leave) / 100;

      var children = section.querySelectorAll(
        '.section-label, .section-heading, .section-body, .section-price, .section-note, .cta-button, .stat'
      );

      var tl = gsap.timeline({ paused: true });

      if (persist) {
        // Persist section scrolls up naturally — use opacity-only so children
        // never offset below the glass card boundary during the scrub.
        tl.from(children, { opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power2.out' });
      } else {
        switch (type) {
          case 'slide-left':
            tl.from(children, { x: -70, opacity: 0, stagger: 0.13, duration: 0.9, ease: 'power3.out' });
            break;
          case 'slide-right':
            tl.from(children, { x: 70, opacity: 0, stagger: 0.13, duration: 0.9, ease: 'power3.out' });
            break;
          case 'stagger-up':
            tl.from(children, { y: 55, opacity: 0, stagger: 0.14, duration: 0.85, ease: 'power3.out' });
            break;
          case 'scale-up':
            tl.from(children, { scale: 0.88, opacity: 0, stagger: 0.12, duration: 1.0, ease: 'power2.out' });
            break;
          default: // fade-up
            tl.from(children, { y: 45, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out' });
            break;
        }
      }

      // Scrub window (fraction of total scroll progress) for fade in/out
      var SCRUB = 0.05;

      ScrollTrigger.create({
        trigger: scrollCont,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: function (self) {
          var p = self.progress;

          if (persist) {
            // Fade in over SCRUB window after enter, fade out over SCRUB before leave
            var fadeIn  = Math.max(0, Math.min(1, (p - enter) / SCRUB));
            var fadeOut = Math.max(0, Math.min(1, (leave - p) / SCRUB));
            var op = Math.min(fadeIn, fadeOut);
            section.style.opacity = String(op);
            section.style.pointerEvents = op > 0.1 ? 'auto' : 'none';
            tl.progress(fadeIn);
          } else {
            if (p >= enter) {
              tl.play();
            } else {
              tl.reverse();
            }
          }
        },
      });
    });
  }

  /* ----------------------------------------------------------
     COUNTER ANIMATIONS
  ---------------------------------------------------------- */
  function initCounters() {
    document.querySelectorAll('.stat-number').forEach(function (el) {
      var target   = parseFloat(el.dataset.value);
      var decimals = parseInt(el.dataset.decimals || '0', 10);
      var statSec  = el.closest('.scroll-section');
      var enter    = parseFloat(statSec.dataset.enter) / 100;
      var triggered = false;

      ScrollTrigger.create({
        trigger: scrollCont,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: function (self) {
          if (!triggered && self.progress >= enter) {
            triggered = true;
            gsap.fromTo(el,
              { textContent: 0 },
              {
                textContent: target,
                duration: 1.8,
                ease: 'power1.out',
                snap: { textContent: decimals === 0 ? 1 : 0.01 },
                onUpdate: function () {
                  el.textContent = decimals === 0
                    ? Math.round(parseFloat(el.textContent))
                    : parseFloat(el.textContent).toFixed(decimals);
                },
              }
            );
          }
          if (triggered && self.progress < enter - 0.03) {
            triggered = false;
            el.textContent = '0';
          }
        },
      });
    });
  }

  /* ----------------------------------------------------------
     INIT — called after PRELOAD_FAST frames are ready
  ---------------------------------------------------------- */
  function init() {
    positionSections();
    initHeroEntrance();
    initHeroTransition();
    initCanvasScroll();
    initDarkOverlay();
    initMarquee();
    setupSectionAnimations();
    initCounters();
    ScrollTrigger.refresh();
  }

  /* ----------------------------------------------------------
     EMAIL FORM HANDLER
     To connect a real service, replace the submit handler below:
       - Formspree:  fetch('https://formspree.io/f/YOUR_ID', ...)
       - Mailchimp:  use their embedded form action URL
       - ConvertKit: use their API endpoint
  ---------------------------------------------------------- */
  var emailForm    = document.getElementById('email-form');
  var emailSuccess = document.getElementById('email-success');

  if (emailForm) {
    emailForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('email-input').value.trim();
      if (!email) return;

      var btn = emailForm.querySelector('.email-submit');
      btn.textContent = '...';
      btn.disabled = true;

      // ── Kit (ConvertKit) submission ──────────────────────────────
      // Replace YOUR_FORM_ID with the numeric ID from your Kit embed code
      // e.g. https://app.convertkit.com/forms/1234567/subscriptions → 1234567
      var KIT_FORM_ID = '9161452';

      fetch('https://app.kit.com/forms/' + KIT_FORM_ID + '/subscriptions', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'email_address=' + encodeURIComponent(email),
      })
        .then(function () {
          showSuccess();
        })
        .catch(function () {
          btn.textContent = 'Try again';
          btn.disabled = false;
        });
      // ─────────────────────────────────────────────────────────────

      function showSuccess() {
        emailForm.style.display = 'none';
        emailSuccess.hidden = false;
      }
    });
  }

  /* ----------------------------------------------------------
     KICK OFF
  ---------------------------------------------------------- */
  startPreload();

})();
