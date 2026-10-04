// three small things. every one is optional: the pages read the same without them.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. reveal each block once as it arrives. siblings that enter on the same
  //    frame stagger, so a section lands as a sequence rather than a slab.
  var sel = '.hero, .page-title, .kicker, .lede, h2, h3.sub, .item, .row, .links, ul.plain, .more';
  var nodes = Array.prototype.slice.call(document.querySelectorAll(sel));
  // blocks already in the first viewport show at once; the observer takes the rest.
  var vh0 = window.innerHeight;
  nodes = nodes.filter(function (n) {
    var r = n.getBoundingClientRect();
    if (r.top < vh0 * 0.9) { n.classList.add('in'); return false; }
    return true;
  });
  if (!document.querySelector(sel)) root.classList.remove('js-reveal');
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

// ── homepage only: loader, word reveals, and the line field ──────────────
(function () {
  if (!document.documentElement.classList.contains('home')) return;
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // loader lifts once fonts are in (or after 900ms, whichever first)
  var lift = function () { root.classList.add('ready'); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(lift);
  setTimeout(lift, 900);

  // stagger index for each word in a poster line
  document.querySelectorAll('.poster, .big, .mail').forEach(function (h) {
    h.querySelectorAll('.w').forEach(function (w, k) { w.style.setProperty('--k', k); });
  });
  var sel = '.poster, .big, .mail, .num, .cols, .rows, .facts, .play, .poster-sub, .ticker, .rows + .more';
  var nodes = Array.prototype.slice.call(document.querySelectorAll(sel));
  // anything already in the first viewport reveals on load, no observer needed;
  // the observer handles what scrolls in later.
  var vh = window.innerHeight;
  var later = nodes.filter(function (n) {
    var r = n.getBoundingClientRect();
    if (r.top < vh * 0.9) { n.classList.add('in'); return false; }
    return true;
  });
  if (reduce || !('IntersectionObserver' in window)) {
    later.forEach(function (n) { n.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    later.forEach(function (n) { io.observe(n); });
  }

  // ── the sampler: fixed toy logits, live decoding knobs ──
  (function () {
    var box = document.getElementById('sampler'); if (!box) return;
    var tok = ['408', '418', '398', '400', '428', '406', '48', '4008'];
    var lg = [3.2, 2.4, 2.0, 1.7, 1.2, 0.9, 0.2, -0.4];
    var bars = box.querySelector('.bars'), rows = [], probs = [];
    tok.forEach(function (t, i) {
      var r = document.createElement('div'); r.className = 'bar-row' + (i ? '' : ' hit');
      r.innerHTML = '<span>' + t + '</span><i></i><b></b>'; bars.appendChild(r); rows.push(r);
    });
    var kt = box.querySelector('#k-t'), kp = box.querySelector('#k-p'), kk = box.querySelector('#k-k');
    function calc() {
      var T = +kt.value, P = +kp.value, K = +kk.value, z = 0, p = lg.map(function (l) { return Math.exp(l / T); });
      p.forEach(function (v) { z += v; }); p = p.map(function (v) { return v / z; });
      var keep = [], cum = 0;                       // tokens are already sorted by logit
      for (var i = 0; i < p.length; i++) { keep[i] = i < K && cum < P; cum += p[i]; }
      z = 0; p = p.map(function (v, i) { return keep[i] ? v : 0; }); p.forEach(function (v) { z += v; });
      probs = p.map(function (v) { return v / z; });
      rows.forEach(function (r, i) {
        r.classList.toggle('cut', !keep[i]); r.children[1].style.setProperty('--p', probs[i]);
        r.children[2].textContent = keep[i] ? Math.round(probs[i] * 100) + '%' : 'cut';
      });
      box.querySelector('#o-t').textContent = T.toFixed(2); box.querySelector('#o-p').textContent = P.toFixed(2);
      box.querySelector('#o-k').textContent = K; box.querySelector('#acc').textContent = Math.round(probs[0] * 100) + '%';
    }
    [kt, kp, kk].forEach(function (k) { k.addEventListener('input', calc); });
    calc();
    var out = box.querySelector('.out'), stream = box.querySelector('.stream'), timer;
    function pick() { var u = Math.random(), c = 0; for (var i = 0; i < probs.length; i++) { c += probs[i]; if (u < c) return i; } return 0; }
    box.querySelector('#draw').addEventListener('click', function () {
      clearInterval(timer); stream.textContent = ''; var n = 0, ok = 0;
      timer = setInterval(function () {
        var i = pick(), d = document.createElement('s'); if (!i) { d.className = 'ok'; ok++; }
        stream.appendChild(d); out.textContent = tok[i]; out.classList.toggle('miss', !!i);
        if (++n >= 60) { clearInterval(timer); box.querySelector('#acc').textContent = ok + ' of 60'; }
      }, reduce ? 0 : 28);
    });
  })();

  // ── the line break: the red wheelbarrow as prose you can break ──
  (function () {
    var box = document.getElementById('breaker'); if (!box) return;
    var words = 'so much depends upon a red wheel barrow glazed with rain water beside the white chickens'.split(' ');
    var his = [2, 3, 6, 7, 10, 11, 14], on = {}, poem = box.querySelector('.poem'), score = box.querySelector('#score');
    his.forEach(function (g) { on[g] = 1; });
    function draw(changed) {
      poem.textContent = '';
      words.forEach(function (w, i) {
        var s = document.createElement('span'); s.className = 'wd' + (changed === i - 1 ? ' new' : ''); s.textContent = w; poem.appendChild(s);
        if (i === words.length - 1) return;
        var g = document.createElement('button'); g.type = 'button'; g.className = 'gap' + (on[i] ? ' on' : '');
        g.setAttribute('aria-label', (on[i] ? 'remove' : 'add') + ' line break after ' + w);
        g.addEventListener('click', function () { if (on[i]) delete on[i]; else on[i] = 1; draw(i); });
        poem.appendChild(g);
        if (on[i]) poem.appendChild(document.createElement('br'));
      });
      var mine = Object.keys(on).map(Number), hit = mine.filter(function (g) { return his.indexOf(g) > -1; }).length, extra = mine.length - hit;
      score.innerHTML = 'you and williams agree on <b>' + hit + ' of 7</b>' + (extra ? '<span style="display:block;margin-top:6px">plus ' + extra + ' he did not make</span>' : '');
    }
    draw();
    box.querySelector('#b-w').addEventListener('click', function () { on = {}; his.forEach(function (g) { on[g] = 1; }); draw(); });
    box.querySelector('#b-p').addEventListener('click', function () { on = {}; draw(); });
  })();

  // the line field: vertical lines warped by a value-noise flow that follows
  // the pointer and the scroll velocity. plain canvas 2d, no library.
  var cv = document.querySelector('canvas.field');
  if (!cv || reduce) return;
  var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1;
  var px = -1e4, py = -1e4, tx = px, ty = py, vel = 0, lastY = window.scrollY, t = 0, on = true;

  // tiny 2d value noise
  var P = new Uint8Array(512);
  for (var i = 0; i < 256; i++) P[i] = i;
  for (i = 255; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, s = P[i]; P[i] = P[j]; P[j] = s; }
  for (i = 0; i < 256; i++) P[256 + i] = P[i];
  function fade(u) { return u * u * (3 - 2 * u); }
  function noise(x, y) {
    var X = Math.floor(x) & 255, Y = Math.floor(y) & 255; x -= Math.floor(x); y -= Math.floor(y);
    var a = P[P[X] + Y] / 255, b = P[P[X + 1] + Y] / 255, c = P[P[X] + Y + 1] / 255, d = P[P[X + 1] + Y + 1] / 255;
    var u = fade(x), v = fade(y);
    return (a + (b - a) * u) + ((c + (d - c) * u) - (a + (b - a) * u)) * v;
  }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size(); window.addEventListener('resize', size);

  cv.parentNode.addEventListener('pointermove', function (e) {
    var r = cv.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top;
  }, { passive: true });
  cv.parentNode.addEventListener('pointerleave', function () { tx = -1e4; ty = -1e4; });
  window.addEventListener('scroll', function () { vel += Math.abs(window.scrollY - lastY); lastY = window.scrollY; }, { passive: true });
  document.addEventListener('visibilitychange', function () { on = !document.hidden; if (on) requestAnimationFrame(frame); });
  new IntersectionObserver(function (es) { on = es[0].isIntersecting && !document.hidden; if (on) requestAnimationFrame(frame); }).observe(cv);

  var bone = 'rgba(239,230,211,', brass = 'rgba(201,162,77,';
  function frame() {
    if (!on) return;
    t += 0.004; vel *= 0.92;
    px += (tx - px) * 0.08; py += (ty - py) * 0.08;
    ctx.clearRect(0, 0, W, H);
    var gap = W < 700 ? 14 : 18, n = Math.ceil(W / gap) + 2, step = 10;
    var amp = 26 + Math.min(vel, 60) * 0.6;
    for (var i = 0; i < n; i++) {
      var x0 = i * gap - gap;
      ctx.beginPath();
      for (var y = -step; y <= H + step; y += step) {
        var nx = noise(x0 * 0.004 + t, y * 0.003 - t * 0.6) - 0.5;
        var dx = x0 - px, dy = y - py, d2 = dx * dx + dy * dy, r = 220;
        var pull = d2 < r * r ? (1 - Math.sqrt(d2) / r) : 0;
        pull = pull * pull * 90;
        var x = x0 + nx * amp * 2 + (dx < 0 ? -pull : pull) * 0.5;
        if (y === -step) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      var near = Math.abs(x0 - px) < 260 ? 1 - Math.abs(x0 - px) / 260 : 0;
      ctx.strokeStyle = (near > 0.25 ? brass : bone) + (0.10 + near * 0.35) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
