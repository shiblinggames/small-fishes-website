/* ============================================================
   OCEAN BACKGROUND PARALLAX
   Scrolls background-position-y from 0% (surface) to 100% (abyss)
   ============================================================ */
var oceanBg = document.getElementById('ocean-bg');
var depthOverlay = document.getElementById('depth-overlay');
var scrollProgress = document.getElementById('scroll-progress');
var treasureGlow = document.getElementById('treasure-glow');

function updateOceanDepth() {
  var scrolled = window.scrollY;
  var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  var progress = maxScroll > 0 ? Math.min(scrolled / maxScroll, 1) : 0;
  oceanBg.style.backgroundPositionY = (progress * 100) + '%';
  depthOverlay.style.opacity = progress * 0.7;
  scrollProgress.style.width = (progress * 100) + '%';
  var glowProgress = Math.max(0, (progress - 0.62) / 0.38);
  treasureGlow.style.opacity = glowProgress;
}

var scrollTicking = false;
window.addEventListener('scroll', function () {
  if (!scrollTicking) {
    requestAnimationFrame(function () {
      updateOceanDepth();
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });
updateOceanDepth();

/* ============================================================
   HOMEPAGE TRAILER — load and play only while on screen
   ============================================================ */
var homeTrailer = document.getElementById('home-trailer');
if (homeTrailer) {
  var trailerObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        if (homeTrailer.preload === 'none') homeTrailer.preload = 'auto';
        var p = homeTrailer.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        homeTrailer.pause();
      }
    });
  }, { threshold: 0.35 });
  trailerObserver.observe(homeTrailer);
}

/* ============================================================
   SCROLL REVEAL — slow, once, honours reduced motion
   ============================================================ */
var revealEls = document.querySelectorAll('.reveal');
var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (revealEls.length && 'IntersectionObserver' in window && !reduceMotion) {
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach(function (el) { revealObserver.observe(el); });
} else {
  revealEls.forEach(function (el) { el.classList.add('in'); });
}

/* ============================================================
   HERO CAROUSEL — crossfade, autoplay (paused on hover / hidden tab /
   reduced motion), tabs, arrows, keys, swipe
   ============================================================ */
var heroCarousel = document.getElementById('hero');
if (heroCarousel) {
  var slides = Array.prototype.slice.call(heroCarousel.querySelectorAll('.slide'));
  var tabs = Array.prototype.slice.call(heroCarousel.querySelectorAll('.hero-tab'));
  var SLIDE_MS = 6500;
  var current = 0;
  var timer = null;
  var autoplay = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  heroCarousel.style.setProperty('--slide-ms', SLIDE_MS + 'ms');
  if (!autoplay) heroCarousel.classList.add('no-autoplay');

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('is-active', i === current); });
    tabs.forEach(function (t, i) {
      var on = i === current;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function restart() {
    if (timer) clearInterval(timer);
    if (autoplay) timer = setInterval(function () { showSlide(current + 1); }, SLIDE_MS);
  }

  function goTo(index) { showSlide(index); restart(); }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { goTo(+t.dataset.slide); });
  });
  heroCarousel.querySelectorAll('.hero-arrow').forEach(function (b) {
    b.addEventListener('click', function () { goTo(current + (+b.dataset.dir)); });
  });

  heroCarousel.addEventListener('mouseenter', function () { heroCarousel.classList.add('is-paused'); if (timer) clearInterval(timer); timer = null; });
  heroCarousel.addEventListener('mouseleave', function () { heroCarousel.classList.remove('is-paused'); restart(); });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (timer) clearInterval(timer); timer = null; } else restart();
  });

  heroCarousel.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft') goTo(current - 1);
  });

  var touchX = null;
  heroCarousel.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  heroCarousel.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  restart();
}

/* ============================================================
   MOBILE HAMBURGER MENU
   ============================================================ */
var navHamburger = document.getElementById('nav-hamburger');
var navMobileMenu = document.getElementById('nav-mobile-menu');

function openMobileMenu() {
  navMobileMenu.classList.add('open');
  navHamburger.classList.add('open');
  navHamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  navMobileMenu.classList.remove('open');
  navHamburger.classList.remove('open');
  navHamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (navHamburger && navMobileMenu) {
  navHamburger.addEventListener('click', function () {
    navMobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
  });
  navMobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && navMobileMenu && navMobileMenu.classList.contains('open')) {
    closeMobileMenu();
  }
});

/* ============================================================
   WHAT'S IN THE BOX — MODAL
   ============================================================ */
var itbOpen = document.getElementById('itb-open');
var itbModal = document.getElementById('itb-modal');
var itbModalClose = document.getElementById('itb-modal-close');
var itbModalBackdrop = document.getElementById('itb-modal-backdrop');

function openItbModal(e) {
  if (e && e.preventDefault) e.preventDefault();
  itbModal.hidden = false;
  document.body.style.overflow = 'hidden';
  var content = document.querySelector('.itb-modal-content');
  if (content) {
    content.style.animation = 'none';
    content.offsetHeight; // force reflow
    content.style.animation = '';
  }
}

function closeItbModal() {
  itbModal.hidden = true;
  document.body.style.overflow = '';
}

if (itbOpen) itbOpen.addEventListener('click', openItbModal);
if (itbModalClose) itbModalClose.addEventListener('click', closeItbModal);
if (itbModalBackdrop) itbModalBackdrop.addEventListener('click', closeItbModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeItbModal();
});

/* ============================================================
   SHOP CAROUSEL + DOTS
   ============================================================ */
var shopCarousel = document.getElementById('shop-carousel');
var shopPrev = document.getElementById('shop-prev');
var shopNext = document.getElementById('shop-next');

if (shopCarousel && shopPrev && shopNext) {
  var cardWidth = function () {
    var card = shopCarousel.querySelector('.shop-card');
    return card ? card.offsetWidth + 24 : 304;
  };
  shopPrev.addEventListener('click', function () {
    shopCarousel.scrollBy({ left: -cardWidth(), behavior: 'smooth' });
  });
  shopNext.addEventListener('click', function () {
    shopCarousel.scrollBy({ left: cardWidth(), behavior: 'smooth' });
  });

  var shopCards = shopCarousel.querySelectorAll('.shop-card');
  if (shopCards.length > 1) {
    var dotsWrap = document.createElement('div');
    dotsWrap.className = 'carousel-dots';
    shopCarousel.parentElement.parentElement.appendChild(dotsWrap);

    var dots = Array.from(shopCards).map(function (card, i) {
      var dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' carousel-dot--active' : '');
      dot.setAttribute('aria-label', 'Go to item ' + (i + 1));
      dot.addEventListener('click', function () {
        shopCarousel.scrollTo({ left: card.offsetLeft - shopCarousel.offsetLeft, behavior: 'smooth' });
      });
      dotsWrap.appendChild(dot);
      return dot;
    });

    shopCarousel.addEventListener('scroll', function () {
      var center = shopCarousel.scrollLeft + shopCarousel.offsetWidth / 2;
      var closest = 0;
      var minDist = Infinity;
      shopCards.forEach(function (card, i) {
        var cardCenter = card.offsetLeft - shopCarousel.offsetLeft + card.offsetWidth / 2;
        var dist = Math.abs(center - cardCenter);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('carousel-dot--active', i === closest);
      });
    }, { passive: true });
  }
}

/* ============================================================
   FAQ ACCORDION ANIMATION
   ============================================================ */
document.querySelectorAll('.faq-item').forEach(function (details) {
  var answer = details.querySelector('.faq-answer');
  if (!answer) return;

  answer.style.overflow = 'hidden';
  answer.style.transition = 'height 0.32s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.28s ease';

  details.querySelector('.faq-question').addEventListener('click', function (e) {
    e.preventDefault();

    if (details.open) {
      answer.style.height = answer.scrollHeight + 'px';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          answer.style.height = '0';
          answer.style.opacity = '0';
        });
      });
      answer.addEventListener('transitionend', function onClose(ev) {
        if (ev.propertyName !== 'height') return;
        details.removeAttribute('open');
        answer.style.height = '';
        answer.style.opacity = '';
        answer.removeEventListener('transitionend', onClose);
      });
    } else {
      details.setAttribute('open', '');
      var h = answer.scrollHeight;
      answer.style.height = '0';
      answer.style.opacity = '0';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          answer.style.height = h + 'px';
          answer.style.opacity = '1';
        });
      });
      answer.addEventListener('transitionend', function onOpen(ev) {
        if (ev.propertyName !== 'height') return;
        answer.style.height = 'auto';
        answer.style.opacity = '';
        answer.removeEventListener('transitionend', onOpen);
      });
    }
  });
});

/* ============================================================
   EMAIL FORM
   ============================================================ */
var emailForm = document.getElementById('email-form');
var emailSuccess = document.getElementById('email-success');

if (emailForm) {
  emailForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('email-input').value;
    var btn = emailForm.querySelector('button[type="submit"]');
    btn.textContent = '···';
    btn.disabled = true;
    fetch('https://app.convertkit.com/forms/3d91d67926/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_address: email })
    }).finally(function () {
      emailForm.hidden = true;
      emailSuccess.hidden = false;
    });
  });
}

/* ============================================================
   PAGE TRANSITIONS + SCROLL-TO-TOP
   ============================================================ */
if (history.scrollRestoration) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);

var pageTransition = document.getElementById('page-transition');
if (pageTransition) {
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      pageTransition.style.opacity = '0';
    });
  });

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#') ||
        href.startsWith('mailto') || link.target === '_blank') return;
    e.preventDefault();
    pageTransition.style.opacity = '1';
    setTimeout(function () { window.location.href = href; }, 380);
  });
}
