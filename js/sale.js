/* ============================================================
   BLACK FRIDAY SALE: the one place to switch it on or off

   on:      false hides the banner and stops adding the code to
            shop links. Nothing else on the site needs editing.
   endsAt:  leave '' to run until you switch it off. Or set a date
            and time with a timezone offset, for example
            '2026-12-01T23:59:59-08:00' (11:59 pm Pacific, Dec 1).
            After that moment the banner and the checkout code go
            away on their own.

   This file only controls the website. Set the same end date on
   the discount in Shopify admin too, so the code itself stops
   working at checkout when the sale ends.
   ============================================================ */
var SALE = {
  on: true,
  code: 'SMALLF15HES',
  endsAt: '',
  shopUrl: 'https://shiblingshop.com/'
};

(function () {
  if (!SALE.on || !SALE.code) return;
  if (SALE.endsAt) {
    var end = new Date(SALE.endsAt).getTime();
    if (isNaN(end)) { console.warn('SALE.endsAt is not a valid date, so the sale is off:', SALE.endsAt); return; }
    if (Date.now() >= end) return;
  }

  var code = SALE.code;
  var shopHost = /^(www\.)?shiblingshop\.com$/i;

  /* ---------- Checkout: apply the code automatically ----------
     Shopify's discount links (shop/discount/CODE?redirect=/path) save the
     code in a cookie on the shop and send the buyer on to the same page,
     so it is already applied when they reach checkout. */
  function discountLink(href) {
    var url;
    try { url = new URL(href, location.href); } catch (e) { return href; }
    if (!shopHost.test(url.hostname) || url.pathname.indexOf('/discount/') === 0) return href;
    return url.origin + '/discount/' + encodeURIComponent(code) +
      '?redirect=' + encodeURIComponent(url.pathname + url.search);
  }

  document.querySelectorAll('a[href*="shiblingshop.com"]').forEach(function (a) {
    a.href = discountLink(a.href);
  });

  /* ---------- Reminder next to the price on the board game page ----------
     Stays even if the banner is hidden, since this is where people decide. */
  var anchor = document.querySelector('.sf-buy-details') || document.querySelector('.sf-buy-price');
  if (anchor) {
    var note = document.createElement('p');
    note.className = 'sale-note';
    note.innerHTML = '<span class="sale-note-tag">Black Friday</span> <span class="sale-note-text">15% off with code <strong>' + code + '</strong></span>';
    anchor.parentNode.insertBefore(note, anchor.nextSibling);
  }

  /* ---------- Banner ---------- */
  var DISMISS_KEY = 'sale-hidden-' + code;
  try { if (sessionStorage.getItem(DISMISS_KEY)) return; } catch (e) {}

  var bar = document.createElement('div');
  bar.className = 'sale-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Black Friday sale');
  bar.innerHTML =
    '<div class="sale-clip"><div class="sale-inner">' +
      '<p class="sale-msg">' +
        '<svg class="sale-coin" viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" focusable="false">' +
          '<defs><radialGradient id="sale-coin-g" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#FFE9A0"/><stop offset=".45" stop-color="#F0C040"/><stop offset="1" stop-color="#B9821F"/></radialGradient></defs>' +
          '<circle cx="16" cy="16" r="15" fill="url(#sale-coin-g)"/>' +
          '<circle cx="16" cy="16" r="11.2" fill="none" stroke="#9A6A14" stroke-width="1.4" stroke-dasharray="1.6 1.8"/>' +
          '<path d="M16 8.5l1.9 5.6 5.6 1.9-5.6 1.9-1.9 5.6-1.9-5.6-5.6-1.9 5.6-1.9z" fill="#7A520C"/>' +
        '</svg>' +
        '<span class="sale-title">Black Friday</span>' +
        '<span class="sale-text"><strong>15% off everything</strong><span class="sale-text-tail"> with code</span></span>' +
      '</p>' +
      '<div class="sale-actions">' +
        '<button type="button" class="sale-code" aria-label="Copy discount code ' + code + '">' +
          '<span class="sale-ticket">' +
            '<span class="sale-ticket-code">' + code + '</span>' +
            '<span class="sale-ticket-action">' +
              '<svg class="sale-icon sale-icon--copy" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" focusable="false"><rect x="5" y="5" width="8.5" height="8.5" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10.5 3V2.6c0-.9-.7-1.6-1.6-1.6H3.1c-.9 0-1.6.7-1.6 1.6v5.8c0 .9.7 1.6 1.6 1.6h.4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>' +
              '<svg class="sale-icon sale-icon--done" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" focusable="false"><path d="M2.5 8.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
              '<span class="sale-ticket-label">Copy</span>' +
            '</span>' +
          '</span>' +
        '</button>' +
        '<a class="sale-shop" href="' + discountLink(SALE.shopUrl) + '" target="_blank" rel="noopener">' +
          'Shop the sale<span class="sale-arrow" aria-hidden="true">&rarr;</span>' +
          '<span class="sale-sr"> (opens the shop in a new tab, code applied at checkout)</span>' +
        '</a>' +
      '</div>' +
      '<span class="sale-sr" role="status" aria-live="polite"></span>' +
    '</div></div>' +
    '<button type="button" class="sale-close" aria-label="Hide the sale banner">' +
      '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
    '</button>';

  var header = document.querySelector('.site-header');
  if (header) header.insertBefore(bar, header.firstChild);
  else document.body.insertBefore(bar, document.body.firstChild);

  /* the header is fixed, so push the page down by the banner's height */
  var root = document.documentElement;
  var inner = bar.querySelector('.sale-inner');
  function syncHeight() { root.style.setProperty('--sale-h', inner.offsetHeight + 'px'); }
  root.classList.add('has-sale');
  syncHeight();
  if ('ResizeObserver' in window) new ResizeObserver(syncHeight).observe(inner);
  else window.addEventListener('resize', syncHeight);

  /* ---------- Copy the code ---------- */
  var btn = bar.querySelector('.sale-code');
  var label = bar.querySelector('.sale-ticket-label');
  var status = bar.querySelector('[role="status"]');
  var resetTimer = null;

  // Older iPhones and plain-http pages have no async clipboard: copy from a
  // hidden field instead. iOS needs a real selection range on an editable,
  // 16px field (smaller text makes Safari zoom in).
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px;pointer-events:none;';
    document.body.appendChild(ta);
    ta.contentEditable = 'true';
    ta.readOnly = false;
    var range = document.createRange();
    range.selectNodeContents(ta);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    sel.removeAllRanges();
    document.body.removeChild(ta);
    return ok;
  }

  function copyCode(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        if (!legacyCopy(text)) throw new Error('copy failed');
      });
    }
    return legacyCopy(text) ? Promise.resolve() : Promise.reject(new Error('copy failed'));
  }

  function show(state, text, announce) {
    btn.classList.toggle('is-copied', state === 'copied');
    btn.classList.toggle('is-failed', state === 'failed');
    label.textContent = text;
    status.textContent = '';
    // a fresh message each time, so a second tap is announced again
    setTimeout(function () { status.textContent = announce; }, 60);
    clearTimeout(resetTimer);
    resetTimer = setTimeout(function () {
      btn.classList.remove('is-copied', 'is-failed');
      label.textContent = 'Copy';
    }, state === 'copied' ? 2600 : 5000);
  }

  btn.addEventListener('click', function () {
    copyCode(code).then(function () {
      show('copied', 'Copied', 'Code ' + code + ' copied.');
    }, function () {
      // last resort: select the code on screen so it can be copied by hand
      var codeEl = bar.querySelector('.sale-ticket-code');
      var r = document.createRange();
      r.selectNodeContents(codeEl);
      var s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
      show('failed', 'Hold to copy', 'Could not copy automatically. The code is ' + code.split('').join(' ') + '.');
    });
  });

  /* ---------- Hide for this visit ---------- */
  bar.querySelector('.sale-close').addEventListener('click', function () {
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch (e) {}
    root.classList.remove('has-sale');
    root.style.removeProperty('--sale-h');
    bar.parentNode.removeChild(bar);
    var next = document.querySelector('.nav-logo') || document.getElementById('main');
    if (next && next.focus) next.focus();
  });
})();
