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

  /* ---- Pricing: Quarterly / Annual toggle ----
     Only present on pricing.html. Swaps every element carrying both
     data-quarterly and data-annual (the three plan prices/cadences, and the
     one comparison-table row that changes by billing period) to the
     selected period's text. Everything else in the table is identical
     between periods, so nothing else needs a data-annual value. */
  var phero__toggle = document.querySelector('.phero__toggle');
  if (phero__toggle) {
    var billingButtons = [].slice.call(phero__toggle.querySelectorAll('.phero__toggle-btn'));
    var swappable = [].slice.call(document.querySelectorAll('[data-quarterly][data-annual]'));
    billingButtons.forEach(function (billingBtn) {
      billingBtn.addEventListener('click', function () {
        var period = billingBtn.dataset.billing;
        billingButtons.forEach(function (b) {
          var active = b === billingBtn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-selected', String(active));
        });
        swappable.forEach(function (el) {
          el.textContent = el.dataset[period];
        });
      });
    });
  }

  /* ---- Book A Call: calendar mockup ----
     Only present on book-a-call.html. Real current-month calendar (Date-
     driven, not hardcoded), weekdays only — the site states Mon–Fri 9am–5pm
     everywhere else (see Contact Us), so weekends are disabled here too, and
     slots are generated hourly across those same hours. There's no backend
     and no real availability data: picking a day/time/submitting the form
     just walks the visitor through the motions and ends on a static
     confirmation message. */
  var calGrid = document.getElementById('cal-grid');
  if (calGrid) {
    var calMonthLabel = document.getElementById('cal-month');
    var calPrev = document.getElementById('cal-prev');
    var calNext = document.getElementById('cal-next');
    var slotsLabel = document.getElementById('slots-label');
    var slotsGrid = document.getElementById('slots-grid');
    var bookForm = document.getElementById('book-form');
    var bookConfirm = document.getElementById('book-confirm');
    var bookPicker = document.getElementById('book-picker');
    var bkSummary = document.getElementById('bk-summary');
    var bkConfirmSub = document.getElementById('bk-confirm-sub');

    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var viewYear = today.getFullYear();
    var viewMonth = today.getMonth();
    var selectedDate = null;
    var selectedTime = null;

    function isPastOrWeekend(date) {
      var day = date.getDay();
      return date < today || day === 0 || day === 6;
    }

    function renderCalendar() {
      calMonthLabel.textContent = monthNames[viewMonth] + ' ' + viewYear;
      calGrid.innerHTML = '';

      var firstDay = new Date(viewYear, viewMonth, 1).getDay();
      var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

      for (var pad = 0; pad < firstDay; pad++) {
        var padCell = document.createElement('span');
        padCell.className = 'calendar__day calendar__day--pad';
        calGrid.appendChild(padCell);
      }

      for (var d = 1; d <= daysInMonth; d++) {
        var date = new Date(viewYear, viewMonth, d);
        var dayBtn = document.createElement('button');
        dayBtn.type = 'button';
        dayBtn.className = 'calendar__day';
        dayBtn.textContent = String(d);

        if (date.getTime() === today.getTime()) dayBtn.classList.add('calendar__day--today');
        if (selectedDate && date.getTime() === selectedDate.getTime()) dayBtn.classList.add('calendar__day--selected');

        if (isPastOrWeekend(date)) {
          dayBtn.disabled = true;
        } else {
          dayBtn.addEventListener('click', function () {
            var y = viewYear, m = viewMonth;
            selectedDate = new Date(y, m, Number(this.textContent));
            selectedTime = null;
            renderCalendar();
            renderSlots();
          });
        }
        calGrid.appendChild(dayBtn);
      }
    }

    function renderSlots() {
      if (!selectedDate) {
        slotsLabel.textContent = 'Pick a weekday to see available times';
        slotsGrid.innerHTML = '';
        bookForm.hidden = true;
        return;
      }
      slotsLabel.textContent = 'Available times — ' + selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
      slotsGrid.innerHTML = '';
      var hours = [9, 10, 11, 12, 13, 14, 15, 16];
      hours.forEach(function (h) {
        var label = (h > 12 ? h - 12 : h) + ':00 ' + (h >= 12 ? 'PM' : 'AM');
        var slotBtn = document.createElement('button');
        slotBtn.type = 'button';
        slotBtn.className = 'timeslot';
        slotBtn.textContent = label;
        if (selectedTime === label) slotBtn.classList.add('is-selected');
        slotBtn.addEventListener('click', function () {
          selectedTime = label;
          renderSlots();
          bookForm.hidden = false;
          bkSummary.textContent = selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) + ' at ' + label;
          bookForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        slotsGrid.appendChild(slotBtn);
      });
    }

    calPrev.addEventListener('click', function () {
      viewMonth -= 1;
      if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
      renderCalendar();
    });
    calNext.addEventListener('click', function () {
      viewMonth += 1;
      if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
      renderCalendar();
    });

    bookForm.addEventListener('submit', function (e) {
      e.preventDefault();
      bkConfirmSub.textContent = 'We’ll call you ' + bkSummary.textContent + '. A confirmation has been sent to your email.';
      bookPicker.hidden = true;
      bookForm.hidden = true;
      bookConfirm.hidden = false;
      bookConfirm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    renderCalendar();
    renderSlots();
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
