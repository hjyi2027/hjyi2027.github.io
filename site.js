// Reveal each block once, as it arrives. Siblings that enter on the same frame
// stagger, so a section lands as a sequence rather than a slab.
(function () {
  var root = document.documentElement;
  var sel = '.hero, .lede, h2, .item, .row, .links, ul.plain';
  var nodes = Array.prototype.slice.call(document.querySelectorAll(sel));
  if (!nodes.length) { root.classList.remove('js-reveal'); return; }

  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    nodes.forEach(function (n) { n.classList.add('in'); });
    return;
  }

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
})();
