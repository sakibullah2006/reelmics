(function () {
  'use strict';

  /* ─── Product data ──────────────────────────────────────────── */
  const PACKAGES = [
    { label: '1 mic pack',  price: 29.95, original: 59.95 },
    { label: '2 mic packs', price: 39.95, original: 79.95 },
  ];

  let state = {
    selectedPkg: 0,
    micType: 'USB-C for Android & iPhone 15+',
    cart: [],
  };

  /* ─── Helpers ───────────────────────────────────────────────── */
  function fmt(n) { return '$' + n.toFixed(2); }

  /* ─── Package selector ──────────────────────────────────────── */
  function initPackages() {
    const cols = document.querySelectorAll('.package_col[data-pkg]');
    cols.forEach(function (col) {
      col.addEventListener('click', function () {
        cols.forEach(function (c) {
          c.classList.remove('active');
          const r = c.querySelector('.pck-bx-rad');
          if (r) r.checked = false;
        });
        col.classList.add('active');
        const radio = col.querySelector('.pck-bx-rad');
        if (radio) radio.checked = true;
        state.selectedPkg = parseInt(col.dataset.pkg, 10);
        updateTotal();
      });
    });
  }

  /* ─── Mic-type selector ─────────────────────────────────────── */
  function initMicType() {
    document.querySelectorAll('.select-size').forEach(function (label) {
      label.addEventListener('click', function () {
        document.querySelectorAll('.select-size').forEach(function (l) { l.classList.remove('selected'); });
        label.classList.add('selected');
        const p = label.querySelector('p');
        state.micType = p ? p.textContent.trim() : '';
      });
    });
  }

  /* ─── Order total ───────────────────────────────────────────── */
  function updateTotal() {
    const pkg = PACKAGES[state.selectedPkg];
    // New order total box
    const main = document.querySelector('.order-total-main');
    const cents = document.querySelector('.order-total-cents');
    if (main && cents) {
      const [dollars, c] = pkg.price.toFixed(2).split('.');
      main.textContent = dollars;
      cents.textContent = '.' + c;
    }
    const saved = document.querySelector('.order-savings-amt');
    if (saved) {
      const s = pkg.original - pkg.price;
      const pct = Math.round(s / pkg.original * 100);
      saved.textContent = '$' + s.toFixed(2) + ' (' + pct + '%)';
    }
  }

  /* ─── Cart ──────────────────────────────────────────────────── */
  function cartTotal() {
    return state.cart.reduce(function (s, i) { return s + i.price; }, 0);
  }

  function renderCart() {
    // Header cart count
    document.querySelectorAll('.cart-count').forEach(function(el) {
      el.textContent = state.cart.length;
    });

    // Items area (first child of the flex column)
    const itemsEl = document.querySelector(
      '.offcanvas-body .d-flex.flex-column > div:first-child'
    );
    if (itemsEl) {
      if (state.cart.length === 0) {
        itemsEl.innerHTML = '<div class="text-center py-3" style="color:#999;">Your cart is empty</div>';
      } else {
        itemsEl.innerHTML = state.cart
          .map(function (item, i) {
            return (
              '<div class="d-flex justify-content-between align-items-start py-2" ' +
              'style="border-bottom:1px solid #f0f0f0;">' +
              '<div>' +
              '<div style="font-size:13px;font-weight:700;">' + item.label + '</div>' +
              '<div style="font-size:11px;color:#888;">' + item.micType + '</div>' +
              '</div>' +
              '<div class="d-flex align-items-center gap-2">' +
              '<span style="font-weight:700;font-size:14px;">' + fmt(item.price) + '</span>' +
              '<button data-idx="' + i + '" class="cart-remove-btn btn btn-sm" ' +
              'style="padding:0 6px;font-size:13px;color:#aaa;background:none;border:none;line-height:1;">✕</button>' +
              '</div>' +
              '</div>'
            );
          })
          .join('');

        // Bind remove buttons
        itemsEl.querySelectorAll('.cart-remove-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            state.cart.splice(parseInt(btn.dataset.idx, 10), 1);
            renderCart();
          });
        });
      }
    }

    // Total line
    const totalEl = document.querySelector(
      '.offcanvas-body .d-flex.justify-content-between.align-items-center > div:first-child'
    );
    if (totalEl) totalEl.textContent = 'Total: ' + fmt(cartTotal());
  }

  /* ─── Add to cart ───────────────────────────────────────────── */
  function initAddToCart() {
    const btn = document.querySelector('.common__button');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const pkg = PACKAGES[state.selectedPkg];

      state.cart.push({
        label:   pkg.label,
        price:   pkg.price,
        micType: state.micType,
      });

      renderCart();

      // Button feedback
      const original = btn.innerHTML;
      btn.style.background = '#1e8449';
      btn.innerHTML = '&#10003; Added!';
      btn.style.pointerEvents = 'none';

      setTimeout(function () {
        btn.style.background = '';
        btn.innerHTML = original;
        btn.style.pointerEvents = '';
      }, 1800);

      // Open cart drawer after a beat
      setTimeout(function () {
        var offcanvasEl = document.getElementById('offcanvasRight');
        if (offcanvasEl && window.bootstrap) {
          bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl).show();
        }
      }, 400);
    });
  }

  /* ─── Slick carousels ───────────────────────────────────────── */
  function initSlick() {
    if (typeof $ === 'undefined' || typeof $.fn.slick === 'undefined') return;

    var prevBtn = '<button class="slick-prev slick-arrow" aria-label="Previous" type="button"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>';
    var nextBtn = '<button class="slick-next slick-arrow" aria-label="Next" type="button"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>';

    $('.slide-div').slick({
      slidesToShow:   1,
      slidesToScroll: 1,
      arrows:         true,
      prevArrow:      prevBtn,
      nextArrow:      nextBtn,
      fade:           false,
      asNavFor:       '.slider-nav',
      autoplay:       false,
      dots:           false,
    });

    $('.slider-nav').slick({
      slidesToShow:   5,
      slidesToScroll: 1,
      asNavFor:       '.slide-div',
      dots:           false,
      centerMode:     false,
      focusOnSelect:  true,
      arrows:         false,
    });
  }

  /* ─── Sticky CTA bar (mobile) ───────────────────────────────── */
  function initStickyBar() {
    var bar = document.createElement('div');
    bar.id = 'sticky-cta';
    bar.innerHTML =
      '<button id="sticky-cta-btn" style="' +
      'display:flex;align-items:center;justify-content:center;gap:8px;' +
      'width:100%;background:#27ae60;color:#fff;font-size:15px;font-weight:700;' +
      'padding:15px;border:none;cursor:pointer;font-family:Oswald,sans-serif;' +
      'text-transform:uppercase;letter-spacing:1px;">' +
      '<i class="fa fa-shopping-cart"></i> Add To Cart</button>';

    Object.assign(bar.style, {
      position:   'fixed',
      bottom:     '0',
      left:       '0',
      right:      '0',
      zIndex:     '998',
      display:    'none',
      boxShadow:  '0 -2px 12px rgba(0,0,0,.15)',
    });

    document.body.appendChild(bar);

    var mainBtn = document.querySelector('.common__button');
    var observer = new IntersectionObserver(function (entries) {
      bar.style.display = entries[0].isIntersecting ? 'none' : 'block';
    }, { threshold: 0.1 });

    if (mainBtn) observer.observe(mainBtn);

    document.getElementById('sticky-cta-btn').addEventListener('click', function () {
      if (mainBtn) {
        mainBtn.click();
        mainBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    // Only show on mobile
    var mq = window.matchMedia('(min-width: 769px)');
    function onMQ(e) { if (e.matches) bar.style.display = 'none'; }
    mq.addEventListener('change', onMQ);
    if (mq.matches) bar.style.display = 'none';
  }

  /* ─── Selling fast live counter ─────────────────────────────── */
  function initSellingFast() {
    var strong = document.querySelector('.selling_fast-strip strong');
    if (!strong) return;
    var count = 34;
    setInterval(function () {
      if (Math.random() < 0.2) {
        count += Math.floor(Math.random() * 2) + 1;
        strong.textContent = count + ' Units Sold In Last Hour';
      }
    }, 7000);
  }

  /* ─── Review carousel (vanilla, no slick dependency) ───────── */
  function initReviewCarousels() {
    document.querySelectorAll('.banner_review-box').forEach(function (box) {
      // Skip if already initialised by us
      if (box.dataset.reviewInit) return;
      box.dataset.reviewInit = '1';

      // Extract unique review cols (skip clones)
      var cols = [];
      box.querySelectorAll('.slick-slide:not(.slick-cloned) .banner_review-col')
        .forEach(function (c) { cols.push(c.cloneNode(true)); });

      if (cols.length === 0) return;

      // Rebuild the box with a simple flex track
      box.innerHTML = '';

      var track = document.createElement('div');
      track.style.cssText =
        'display:flex;transition:transform 0.4s ease;will-change:transform;';

      cols.forEach(function (col) {
        var slide = document.createElement('div');
        slide.style.cssText = 'flex:0 0 100%;width:100%;min-width:0;';
        slide.appendChild(col);
        track.appendChild(slide);
      });

      var wrapper = document.createElement('div');
      wrapper.style.cssText = 'overflow:hidden;';
      wrapper.appendChild(track);
      box.appendChild(wrapper);

      // Dots
      var dotsEl = null;
      if (cols.length > 1) {
        dotsEl = document.createElement('div');
        dotsEl.style.cssText = 'text-align:center;padding:10px 0 2px;';
        cols.forEach(function (_, i) {
          var btn = document.createElement('button');
          btn.style.cssText =
            'width:8px;height:8px;border-radius:50%;border:none;' +
            'background:#ddd;margin:0 3px;cursor:pointer;padding:0;' +
            'transition:background 0.2s;';
          if (i === 0) btn.style.background = '#f5a623';
          btn.addEventListener('click', function () { goTo(i); });
          dotsEl.appendChild(btn);
        });
        box.appendChild(dotsEl);
      }

      var current = 0;

      function goTo(idx) {
        current = idx;
        track.style.transform = 'translateX(-' + idx * 100 + '%)';
        if (dotsEl) {
          dotsEl.querySelectorAll('button').forEach(function (b, i) {
            b.style.background = i === idx ? '#f5a623' : '#ddd';
          });
        }
      }

      if (cols.length > 1) {
        setInterval(function () { goTo((current + 1) % cols.length); }, 5000);
      }
    });
  }

  /* ─── Thumbnail active highlight ────────────────────────────── */
  function initThumbnailHighlight() {
    // Once slick fires `afterChange`, mark the matching thumb active
    if (typeof $ === 'undefined') return;
    $('.slide-div').on('afterChange', function (_e, _slick, idx) {
      $('.slider-nav .slick-slide').removeClass('thumb-active');
      $('.slider-nav .slick-slide[data-slick-index="' + idx + '"]').addClass('thumb-active');
    });
  }

  /* ─── Bootstrap: override quantity to update from our packages ─ */
  function patchBootstrapOffcanvas() {
    // Make sure Bootstrap's Offcanvas is available before cart button is pressed
    // (Bootstrap JS is loaded after this script; it's fine — getOrCreateInstance
    //  is called inside the click handler which fires later.)
  }

  /* ─── Left review card auto-carousel ───────────────────────── */
  var LEFT_REVIEWS = [
    {
      title: 'Crystal-Clear Sound for My YouTube Channel!',
      text: '"The ReelMic™ Wireless Mic transformed the audio quality in my videos. It\'s easy to use and works perfectly with my iPhone and laptop. Highly recommended!"',
      name: 'Alex Johnson',
      color: '#b39ddb',
    },
    {
      title: 'Fantastic Audio Clarity',
      text: '"I do a lot of podcasts and interviews and the audio clarity of the ReelMic™ is remarkable. Definitely an upgrade!"',
      name: 'James Pearson',
      color: '#90caf9',
    },
    {
      title: 'Amazing Product for a Great Price',
      text: '"Was not expecting such incredible sound quality at this price. Truly impressed."',
      name: 'Andrew Patel',
      color: '#a5d6a7',
    },
  ];

  function initLeftReviewCarousel() {
    var card = document.querySelector('.left-review-card');
    if (!card) return;

    var title  = card.querySelector('.left-review-title');
    var text   = card.querySelector('.left-review-text');
    var name   = card.querySelector('.left-review-name');
    var avatar = card.querySelector('.left-review-avatar');
    var dots   = card.querySelectorAll('.left-review-dots span');
    var idx = 0;

    function show(i) {
      var r = LEFT_REVIEWS[i];
      card.style.opacity = '0';
      card.style.transition = 'opacity 0.3s';
      setTimeout(function () {
        title.textContent  = r.title;
        text.textContent   = r.text;
        name.textContent   = r.name;
        avatar.style.background = r.color;
        dots.forEach(function (d, j) {
          d.classList.toggle('active', j === i);
        });
        card.style.opacity = '1';
      }, 300);
    }

    dots.forEach(function (dot, i) {
      dot.style.cursor = 'pointer';
      dot.addEventListener('click', function () {
        idx = i;
        show(idx);
        resetTimer();
      });
    });

    var timer;
    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        idx = (idx + 1) % LEFT_REVIEWS.length;
        show(idx);
      }, 4000);
    }
    resetTimer();
  }

  /* ─── Init ──────────────────────────────────────────────────── */
  function boot() {
    initPackages();
    initMicType();
    updateTotal();
    initAddToCart();
    renderCart();
    initSellingFast();
    initStickyBar();
    initLeftReviewCarousel();
    initReviewCarousels();
    patchBootstrapOffcanvas();

    // Wait for jQuery + slick (loaded later in the page)
    var attempts = 0;
    var poll = setInterval(function () {
      attempts++;
      if (typeof $ !== 'undefined' && typeof $.fn.slick !== 'undefined') {
        clearInterval(poll);
        initSlick();
        initThumbnailHighlight();
      }
      if (attempts > 60) clearInterval(poll); // give up after ~3 s
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
