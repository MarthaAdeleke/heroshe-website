(function () {
  var body = document.body;

  /* ---- Mobile drawer ---- */
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function setNavOpen(open) {
    if (!btn || !nav) return;
    body.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (!open) closeAllMenus();
  }

  if (btn && nav) {
    btn.addEventListener('click', function () {
      setNavOpen(!body.classList.contains('nav-open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNavOpen(false);
    });
  }

  /* ---- Products dropdown ---- */
  var menus = [].slice.call(document.querySelectorAll('.has-menu'));

  function closeAllMenus(except) {
    menus.forEach(function (item) {
      if (item === except) return;
      item.classList.remove('is-open');
      var t = item.querySelector('.nav__trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }

  menus.forEach(function (item) {
    var trigger = item.querySelector('.nav__trigger');
    if (!trigger) return;

    trigger.addEventListener('click', function () {
      var open = !item.classList.contains('is-open');
      closeAllMenus(item);
      item.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
    });

    // Keyboard users tabbing out of the panel should close it
    item.addEventListener('focusout', function (e) {
      if (!item.contains(e.relatedTarget)) {
        item.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-menu')) closeAllMenus();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeAllMenus();
    setNavOpen(false);
  });

  /* Collapsing the footer accordions is a mobile-only affordance. */
  document.querySelectorAll('.footer__col').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (window.matchMedia('(min-width: 768px)').matches) d.open = true;
    });
  });

  /* ---- Pricing: mobile plan tabs ----
     Only present on pricing.html. Switches which plan's column the comparison
     table shows below the 767px breakpoint (see .ptabs / .ptable[data-active-plan]
     in styles.css) — full-width horizontal scroll wasn't a good mobile experience
     for a side-by-side comparison table. */
  var ptabs = document.querySelector('.ptabs');
  var ptable = document.querySelector('.ptable');
  if (ptabs && ptable) {
    var ptabButtons = [].slice.call(ptabs.querySelectorAll('.ptabs__btn'));
    ptabButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        ptable.setAttribute('data-active-plan', btn.dataset.plan);
        ptabButtons.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-selected', String(active));
        });
      });
    });
  }

  /* ---- Get Started: service picker ----
     Only present on get-started.html. Navigates to whichever service page's
     radio is selected — this page has no backend, so "Continue" is just a
     client-side router across the four existing service pages. */
  var signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var selected = signupForm.querySelector('input[name="service"]:checked');
      if (selected) window.location.href = selected.value;
    });
  }
})();
