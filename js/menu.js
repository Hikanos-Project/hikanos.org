(function () {
  var header = document.querySelector('.site-header');
  var toggle = header && header.querySelector('.menu-toggle');
  var menu = document.getElementById('site-menu');
  if (!toggle || !menu) return;

  document.documentElement.classList.add('has-menu-js');
  toggle.hidden = false;

  function setOpen(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) {
    if (mq.matches) setOpen(false);
  });
})();

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var DURATION = 300;

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href*="#"]');
    if (!link || reduce.matches || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (link.pathname !== window.location.pathname || link.origin !== window.location.origin) return;
    var id = decodeURIComponent(link.hash.slice(1));
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();

    var margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    var start = window.scrollY;
    var end = Math.max(0, Math.min(
      start + target.getBoundingClientRect().top - margin,
      document.documentElement.scrollHeight - window.innerHeight));
    var t0 = null;

    function step(now) {
      if (t0 === null) t0 = now;
      var p = Math.min(1, (now - t0) / DURATION);
      var eased = 1 - Math.pow(1 - p, 3);
      window.scrollTo(0, start + (end - start) * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    history.pushState(null, '', '#' + id);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
})();
