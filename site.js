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

// ── counts tick up from zero the first time they are seen ────────────────
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  var cells = [];
  document.querySelectorAll('.facts dd').forEach(function (dd) {
    var el = dd.children.length === 1 && dd.children[0].tagName === 'A' ? dd.children[0] : dd;
    if (el.children.length || !/^\d+$/.test(el.textContent.trim())) return;
    cells.push({ box: dd, el: el, to: +el.textContent });
  });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      var c = cells.filter(function (x) { return x.box === e.target; })[0], t0 = performance.now(), dur = 700 + Math.min(c.to, 40) * 12;
      (function step(now) {
        var u = Math.min((now - t0) / dur, 1), v = 1 - Math.pow(1 - u, 3);
        c.el.textContent = Math.round(c.to * v);
        if (u < 1) requestAnimationFrame(step); else c.el.textContent = c.to;
      })(t0);
    });
  }, { threshold: 0.6 });
  cells.forEach(function (c) { io.observe(c.box); });
})();

// ── research page: filter, section rail, copyable links ──────────────────
(function () {
  var main = document.getElementById('main');
  if (!main || !document.documentElement.classList.contains('inner')) return;
  var items = Array.prototype.slice.call(main.querySelectorAll('.item[id]'));
  if (items.length < 8) return;

  // each entry remembers its section and its own lower-cased text
  var sec = '';
  Array.prototype.forEach.call(main.children, function (k) {
    if (k.tagName === 'H2') sec = k.id || '';
    else if (k.classList.contains('item')) {
      var m = k.querySelector('.meta');
      k._sec = sec; k._meta = (m ? m.textContent : '').toLowerCase(); k._text = k.textContent.toLowerCase();
    }
  });

  // copyable link under each entry number
  items.forEach(function (it) {
    var a = document.createElement('a'); a.className = 'pl'; a.href = '#' + it.id; a.textContent = 'link';
    a.setAttribute('aria-label', 'copy a link to this entry');
    a.addEventListener('click', function (e) {
      if (!navigator.clipboard || !navigator.clipboard.writeText) return;   // falls back to a plain anchor jump
      e.preventDefault();
      navigator.clipboard.writeText(location.origin + location.pathname + '#' + it.id).then(function () {
        a.textContent = 'copied'; a.classList.add('done');
        setTimeout(function () { a.textContent = 'link'; a.classList.remove('done'); }, 1400);
      }, function () { location.hash = it.id; });
    });
    it.appendChild(a);
  });

  // filter: one free-text box, one row of venue chips
  var chips = [
    ['all', function () { return true; }],
    ['neurips', function (i) { return /neurips/.test(i._meta); }],
    ['wacv', function (i) { return /wacv/.test(i._meta); }],
    ['corl', function (i) { return /corl/.test(i._meta); }],
    ['jmm', function (i) { return /jmm/.test(i._meta); }],
    ['mathematics', function (i) { return i._sec === 'mathematics'; }],
    ['sole author', function (i) { return /sole author/.test(i._meta); }],
    ['first author', function (i) { return /first author/.test(i._meta); }]
  ];
  var box = document.createElement('div'); box.className = 'filter'; box.setAttribute('role', 'search');
  box.innerHTML = '<label>filter<input type="search" placeholder="a title, a venue, a word" autocomplete="off" spellcheck="false"></label>' +
    '<div class="f-chips" role="group" aria-label="filter by venue or authorship"></div><p class="f-n" aria-live="polite"></p>';
  var input = box.querySelector('input'), row = box.querySelector('.f-chips'), note = box.querySelector('.f-n'), cur = 0;
  chips.forEach(function (c, k) {
    var n = items.filter(c[1]).length; if (!n) return;
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', k ? 'false' : 'true');
    b.innerHTML = c[0] + '<i>' + n + '</i>';
    b.addEventListener('click', function () { cur = k; apply(); });
    c[2] = b; row.appendChild(b);
  });
  var anchor = main.querySelector('.jump') || main.querySelector('.facts');
  if (anchor) anchor.parentNode.insertBefore(box, anchor.nextSibling);

  var keys = window.matchMedia('(hover: hover)').matches;
  function apply() {
    var words = input.value.toLowerCase().split(/\s+/).filter(Boolean), active = !!words.length || cur !== 0, n = 0;
    chips.forEach(function (c, k) { if (c[2]) c[2].setAttribute('aria-pressed', k === cur ? 'true' : 'false'); });
    main.classList.toggle('filtering', active);
    items.forEach(function (it) {
      var ok = chips[cur][1](it) && words.every(function (w) { return it._text.indexOf(w) > -1; });
      it.hidden = !ok; if (ok) { n++; if (active) it.classList.add('in'); }
    });
    // a heading stays only while something under it does
    var h2 = null, h3 = null, heads = [];
    Array.prototype.forEach.call(main.children, function (k) {
      if (k.tagName === 'H2') { h2 = k; h3 = null; k._n = 0; heads.push(k); }
      else if (k.tagName === 'H3' && k.classList.contains('sub')) { h3 = k; k._n = 0; heads.push(k); }
      else if (k.classList.contains('item') && !k.hidden) { if (h2) h2._n++; if (h3) h3._n++; }
    });
    heads.forEach(function (h) { h.hidden = active && !h._n; if (active) h.classList.add('in'); });
    note.innerHTML = active
      ? '<b>' + n + '</b> of ' + items.length + ' entries' + (n ? '' : '. nothing matches') + '<button type="button">clear</button>'
      : '<b>' + items.length + '</b> entries' + (keys ? '. press / to search' : '');
    var clr = note.querySelector('button');
    if (clr) clr.addEventListener('click', function () { input.value = ''; cur = 0; apply(); input.focus(); });
  }
  input.addEventListener('input', apply);
  document.addEventListener('keydown', function (e) {
    var t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); input.focus(); input.select(); }
    else if (e.key === 'Escape' && t === input) { input.value = ''; cur = 0; apply(); input.blur(); }
  });
  apply();

  // section rail: fixed in the left margin on wide screens, marks the section in view
  var heads = Array.prototype.slice.call(main.querySelectorAll('h2[id], h3.sub[id]'));
  if (heads.length < 3) return;
  var rail = document.createElement('div'); rail.className = 'rail'; rail.setAttribute('role', 'navigation'); rail.setAttribute('aria-label', 'sections of this page');
  var short = { accepted: 'accepted', mathematics: 'mathematics' };
  var links = heads.map(function (h) {
    var a = document.createElement('a'); a.href = '#' + h.id; a.textContent = short[h.id] || h.textContent.trim();
    if (h.tagName === 'H3') a.className = 'sub';
    rail.appendChild(a); return a;
  });
  document.body.appendChild(rail);
  var queued = false;
  function spy() {
    queued = false; var on = -1;
    for (var k = 0; k < heads.length; k++) { if (!heads[k].hidden && heads[k].getBoundingClientRect().top < 200) on = k; }
    links.forEach(function (a, k) { a.classList.toggle('on', k === on); if (k === on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(spy); } }, { passive: true });
  spy();
})();

// ── homepage: the split. a fifth of the crops held out, two ways ─────────
(function () {
  var box = document.getElementById('split'); if (!box) return;
  var NS = 5, NC = 8, W = 560, RH = 26, GAP = 16, NSV = 'http://www.w3.org/2000/svg';
  var svg = box.querySelector('svg'), ko = box.querySelector('#k-o'), out = box.querySelector('#leak');
  var bc = box.querySelector('#s-crop'), bi = box.querySelector('#s-img'), mode = 'crop', test = [], rects = [];
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + (NS * (RH + GAP) - GAP + 8));
  for (var k = 0; k < NS * NC; k++) { var r = document.createElementNS(NSV, 'rect'); r.setAttribute('height', RH); svg.appendChild(r); rects.push(r); }
  function mix() {
    var n = NS * NC, i; test = [];
    if (mode === 'img') { var pick = (Math.random() * NS) | 0; for (i = 0; i < n; i++) test[i] = ((i / NC) | 0) === pick; return; }
    var idx = []; for (i = 0; i < n; i++) idx.push(i);
    for (i = n - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
    for (i = 0; i < n; i++) test[idx[i]] = i < NC;
  }
  var over = document.createElementNS(NSV, 'g'); svg.appendChild(over);
  function draw() {
    var step = 1 - ko.value / 100, w = W / ((NC - 1) * step + 1), tests = 0, touched = 0, shared = 0;
    while (over.firstChild) over.removeChild(over.firstChild);
    for (var s = 0; s < NS; s++) for (var c = 0; c < NC; c++) {
      var i = s * NC + c, r = rects[i], a = c * step, y = s * (RH + GAP) + (c % 2 ? 8 : 0);
      r.setAttribute('x', (a * w).toFixed(2)); r.setAttribute('y', y);
      r.setAttribute('width', w.toFixed(2)); r.setAttribute('class', test[i] ? 'te' : '');
      if (!test[i]) continue;
      tests++;
      // the parts of this test crop, in crop widths, that a training crop of the same image also covers
      var cuts = [];
      for (var d = 0; d < NC; d++) {
        if (d === c || test[s * NC + d]) continue;
        var lo = Math.max(a, d * step), hi = Math.min(a + 1, d * step + 1);
        if (hi - lo > 1e-9) cuts.push([lo, hi]);
      }
      cuts.sort(function (p, q) { return p[0] - q[0]; });
      var merged = [];
      cuts.forEach(function (p) { var m = merged[merged.length - 1]; if (m && p[0] <= m[1]) m[1] = Math.max(m[1], p[1]); else merged.push([p[0], p[1]]); });
      if (merged.length) touched++;
      merged.forEach(function (m) {
        shared += m[1] - m[0];
        var o = document.createElementNS(NSV, 'rect'); o.setAttribute('class', 'lk');
        o.setAttribute('x', (m[0] * w).toFixed(2)); o.setAttribute('y', y); o.setAttribute('height', RH); o.setAttribute('width', ((m[1] - m[0]) * w).toFixed(2));
        over.appendChild(o);
      });
    }
    box.querySelector('#o-o').textContent = ko.value + '%';
    out.textContent = (tests ? Math.round(100 * shared / tests) : 0) + '%';
    box.querySelector('#touch').textContent = touched + ' of ' + tests + ' test crops share pixels with a training crop';
  }
  function set(m) { mode = m; bc.setAttribute('aria-pressed', m === 'crop'); bi.setAttribute('aria-pressed', m === 'img'); mix(); draw(); }
  bc.addEventListener('click', function () { set('crop'); });
  bi.addEventListener('click', function () { set('img'); });
  box.querySelector('#s-mix').addEventListener('click', function () { mix(); draw(); });
  ko.addEventListener('input', draw);
  set('crop');
})();
