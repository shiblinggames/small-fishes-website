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
   SECTION FADE-IN ON SCROLL
   ============================================================ */
var fadeObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(function (el) {
  fadeObserver.observe(el);
});

/* ============================================================
   STATS ROW STAGGER
   ============================================================ */
var statsRow = document.querySelector('.stats-row');
if (statsRow) {
  var statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statsObserver.observe(statsRow);
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

function openItbModal() {
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
   SHOP CAROUSEL
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
}

/* ============================================================
   EMAIL FORM
   ============================================================ */
var emailForm = document.getElementById('email-form');
var emailSuccess = document.getElementById('email-success');

if (emailForm) {
  emailForm.addEventListener('submit', function (e) {
    e.preventDefault();
    emailForm.hidden = true;
    emailSuccess.hidden = false;
  });
}

/* ============================================================
   PAGE TRANSITIONS
   ============================================================ */
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
