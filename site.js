// three small things. every one is optional: the pages read the same without them.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. reveal each block once as it arrives. siblings that enter on the same
  //    frame stagger, so a section lands as a sequence rather than a slab.
  var sel = '.hero, .lede, h2, h3.sub, .item, .row, .links, ul.plain, .more';
  var nodes = Array.prototype.slice.call(document.querySelectorAll(sel));
  if (!nodes.length) root.classList.remove('js-reveal');
  else if (reduce || !('IntersectionObserver' in window)) {
    nodes.forEach(function (n) { n.classList.add('in'); });
  } else {
    var lastBand = -999, run = 0;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var band = Math.round(e.boundingClientRect.top / 40);
        run = (band === lastBand) ? run + 1 : 0;
        lastBand = band;
        e.target.style.setProperty('--d', Math.min(run, 4) * 70 + 'ms');
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  // 2. a spotlight that follows the pointer across a work item.
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', function (e) {
      var it = e.target.closest && e.target.closest('.item');
      if (!it) return;
      var r = it.getBoundingClientRect();
      it.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      it.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  // 3. the footer shows the local time in seoul; without js it just says "seoul".
  var clock = document.querySelector('.clock');
  if (clock && window.Intl && Intl.DateTimeFormat) {
    var fmt = new Intl.DateTimeFormat('en-GB', { timeZone: clock.getAttribute('data-tz'), hour: '2-digit', minute: '2-digit' });
    var tick = function () { clock.textContent = 'seoul ' + fmt.format(new Date()); };
    tick(); setInterval(tick, 30000);
  }

  // 4. cv: the print link exists only when printing can be triggered.
  var p = document.querySelector('a.print');
  if (p && window.print) {
    p.hidden = false;
    p.addEventListener('click', function (e) { e.preventDefault(); window.print(); });
  }
})();
