// hyunjun yi — one script for every page. every part is optional:
// the pages read the same with it switched off.
//   1. shared: reveals, clock, copy button
//   2. search: one box that reaches every page, section and paper
//   3. homepage: the hero figure

// ── 1. shared ────────────────────────────────────────────────────────────
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // reveal each block once as it arrives. siblings that enter on the same
  // frame stagger, so a section lands as a sequence rather than a slab.
  var sel = '.kicker, .eyebrow, .lede, h2, h3.sub, .item, .page-title, .poster, .rows, .poster-sub, .hero-cta, .hero-at, .nf-fig, .foot-in, .foot-big';
  document.querySelectorAll('.poster, .page-title').forEach(function (h) {
    h.querySelectorAll('.w').forEach(function (w, k) { w.style.setProperty('--k', k); });
  });
  var nodes = Array.prototype.slice.call(document.querySelectorAll(sel));
  // blocks already in the first viewport show at once; the observer takes the rest.
  var vh0 = window.innerHeight;
  nodes = nodes.filter(function (n) {
    if (n.getBoundingClientRect().top < vh0 * 0.9) { n.classList.add('in'); return false; }
    return true;
  });
  if (reduce || !('IntersectionObserver' in window)) {
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

  // a light follows the pointer across the drafting paper of a figure.
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', function (e) {
      var host = e.target.closest && e.target.closest('.card, .rows.pics a');
      var fig = host && host.querySelector('.fig');
      if (!fig) return;
      var r = fig.getBoundingClientRect();
      fig.style.setProperty('--mx', (e.clientX - r.left) + 'px'); fig.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  // the bar draws in to a capsule once the page has moved.
  var moved = false;
  function onScroll() { var y = window.scrollY > 24; if (y !== moved) { moved = y; root.classList.toggle('scrolled', y); } }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // the footer shows the local time in seoul; without js it just says "seoul".
  var clocks = document.querySelectorAll('.clock');
  if (clocks.length && window.Intl && Intl.DateTimeFormat) {
    var fmt = new Intl.DateTimeFormat('en-GB', { timeZone: clocks[0].getAttribute('data-tz'), hour: '2-digit', minute: '2-digit' });
    var tick = function () { var now = 'Seoul ' + fmt.format(new Date()); Array.prototype.forEach.call(clocks, function (c) { c.textContent = now; }); };
    tick(); setInterval(tick, 30000);
  }

  // contact: a button that puts the address on the clipboard, where that is possible.
  var cp = document.querySelector('.copy');
  if (cp && navigator.clipboard && navigator.clipboard.writeText) {
    cp.hidden = false;
    cp.addEventListener('click', function () {
      navigator.clipboard.writeText(cp.getAttribute('data-copy')).then(function () {
        cp.textContent = 'Copied'; setTimeout(function () { cp.textContent = 'Copy address'; }, 1600);
      }, function () {});
    });
  }

  // 404: name the address that was asked for.
  var nf = document.querySelector('.nf-path');
  if (nf) { nf.textContent = 'No page at ' + location.pathname.slice(0, 80); nf.hidden = false; }
})();

// ── 2. search ────────────────────────────────────────────────────────────
// opens from the bar, with cmd/ctrl + k, or with / on pages that have no filter
// of their own. the paper list is read from the research page itself, so there
// is no second index to keep in step.
(function () {
  var links = document.querySelector('.bar-links');
  if (!links || !window.URL || !window.DOMParser) return;
  var me = document.querySelector('script[src*="site.js"]');
  var base = me ? me.src : location.href;
  function at(p) { return new URL(p, base).href; }

  var fixed = [
    ['Home', 'Page', at('./')],
    ['Research: every paper and its status', 'Page', at('research.html')],
    ['Peer-reviewed and accepted', 'Research', at('research.html#accepted')],
    ['Open problems and new records', 'Research', at('research.html#mathematics')],
    ['GitHub', 'Elsewhere', 'https://github.com/hjyi2027'],
    ['ORCID', 'Elsewhere', 'https://orcid.org/0009-0006-1197-0063'],
    ['LinkedIn', 'Elsewhere', 'https://www.linkedin.com/in/hyunjun-yi-3424573a0/'],
    ['Email', 'Elsewhere', 'mailto:hjyi2027@gmail.com']
  ].map(function (e) { return { t: e[0], k: e[1], u: e[2], x: (e[0] + ' ' + e[1]).toLowerCase() }; });
  var papers = null, loading = false;
  var names = { accepted: 'Accepted', 'in-review': 'In review', mathematics: 'Mathematics' };

  // the venue and authorship of a paper, without its date or its links
  var SKIP = /^(((january|february|march|april|may|june|july|august|september|october|november|december) )?\d{4}|pdf|openreview|code|doi|zenodo|review thread|arxiv:\S+|earlier version, doi)$/i;
  function brief(m) {
    if (!m) return '';
    var c = m.cloneNode(true), b = c.querySelector('.badge'); if (b) b.parentNode.removeChild(b);
    return c.textContent.split('\u00b7').map(function (p) { return p.replace(/\s+/g, ' ').trim(); })
      .filter(function (p) { return p && !SKIP.test(p); }).join(' \u00b7 ');
  }
  function read(doc) {
    var out = [], sec = '', main = doc.getElementById('main');
    if (!main) return out;
    Array.prototype.forEach.call(main.children, function (k) {
      if (k.tagName === 'H2') sec = names[k.id] || '';
      else if (k.classList.contains('item') && k.id) {
        var h = k.querySelector('h3'), m = k.querySelector('.meta');
        if (!h) return;
        var t = h.textContent.trim();
        out.push({ t: t, k: sec, s: brief(m), u: at('research.html#' + k.id), x: (t + ' ' + (m ? m.textContent : '') + ' ' + sec).toLowerCase() });
      }
    });
    return out;
  }
  function load() {
    if (papers || loading) return;
    if (document.getElementById('accepted') && document.querySelector('.item[id]')) { papers = read(document); return; }
    loading = true;
    fetch(at('research.html')).then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
      papers = read(new DOMParser().parseFromString(html, 'text/html')); loading = false; if (!pal.hidden) draw();
    }, function () { papers = []; loading = false; });
  }

  var pal = document.createElement('div'); pal.className = 'pal'; pal.hidden = true;
  pal.setAttribute('role', 'dialog'); pal.setAttribute('aria-modal', 'true'); pal.setAttribute('aria-label', 'Search this site');
  var LENS = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="M13.2 13.2 17 17"/></svg>';
  pal.innerHTML = '<div class="pal-box"><div class="pal-in">' + LENS + '<input type="search" placeholder="Search papers, venues and pages" autocomplete="off" spellcheck="false" ' +
    'role="combobox" aria-expanded="true" aria-controls="pal-list" aria-label="Search this site"><kbd>esc</kbd></div>' +
    '<ol id="pal-list" role="listbox"></ol><p class="pal-foot"><span><kbd>&uarr;</kbd><kbd>&darr;</kbd> to move</span><span><kbd>&crarr;</kbd> to open</span><span class="pal-n"></span></p></div>';
  document.body.appendChild(pal);
  var input = pal.querySelector('input'), list = pal.querySelector('ol'), count = pal.querySelector('.pal-n'), shown = [], cur = 0, back = null;

  var GLYPH = { Page: '\u2192', Home: '#', Research: '#', Elsewhere: '\u2197' };
  var HEAD = { Page: 'Pages', Home: 'On the homepage', Research: 'On the research page', Elsewhere: 'Elsewhere' };
  var rows = [];
  // the title, with each matched word marked
  function marked(el, text, words) {
    var low = text.toLowerCase(), i = 0;
    while (words.length && i < text.length) {
      var at0 = -1, len = 0;
      words.forEach(function (w) { var p = low.indexOf(w, i); if (p > -1 && (at0 < 0 || p < at0)) { at0 = p; len = w.length; } });
      if (at0 < 0) break;
      if (at0 > i) el.appendChild(document.createTextNode(text.slice(i, at0)));
      var m = document.createElement('mark'); m.textContent = text.slice(at0, at0 + len); el.appendChild(m);
      i = at0 + len;
    }
    if (i < text.length) el.appendChild(document.createTextNode(text.slice(i)));
  }
  function draw() {
    var words = input.value.toLowerCase().split(/\s+/).filter(Boolean), pool = fixed.concat(papers || []);
    if (words.length) {
      shown = pool.filter(function (e) { return words.every(function (w) { return e.x.indexOf(w) > -1; }); });
      // a hit in the title outranks a hit in the venue line
      var inTitle = function (e) { return words.every(function (w) { return e.t.toLowerCase().indexOf(w) > -1; }) ? 0 : 1; };
      shown = shown.map(function (e, i) { return [inTitle(e), i, e]; }).sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }).map(function (a) { return a[2]; });
    } else shown = fixed.slice();
    var total = shown.length; shown = shown.slice(0, 40); cur = Math.min(cur, Math.max(shown.length - 1, 0));
    list.textContent = ''; rows = [];
    var lastKind = null;
    shown.forEach(function (e, i) {
      if (!words.length && e.k !== lastKind) {                 // with nothing typed, the list is a map of the site
        lastKind = e.k;
        var hd = document.createElement('li'); hd.className = 'pal-h'; hd.setAttribute('role', 'presentation'); hd.textContent = HEAD[e.k] || e.k; list.appendChild(hd);
      }
      var li = document.createElement('li'), g = document.createElement('span'), body = document.createElement('span'), b = document.createElement('b');
      li.id = 'pal-' + i; li.setAttribute('role', 'option'); li.setAttribute('aria-selected', i === cur ? 'true' : 'false');
      g.className = 'pal-g'; g.setAttribute('aria-hidden', 'true'); g.textContent = GLYPH[e.k] || '\u00b6';
      body.className = 'pal-b'; marked(b, e.t, words); body.appendChild(b);
      if (e.s) { var sm = document.createElement('small'); sm.textContent = e.s; body.appendChild(sm); }
      li.appendChild(g); li.appendChild(body);
      if (words.length || !HEAD[e.k]) { var k = document.createElement('i'); k.textContent = e.k; li.appendChild(k); }
      li.addEventListener('click', function () { go(e); });
      li.addEventListener('pointermove', function () { if (cur !== i) { cur = i; mark(); } });
      list.appendChild(li); rows.push(li);
    });
    if (!shown.length) { var n = document.createElement('li'); n.className = 'pal-none'; n.textContent = loading ? 'Reading the research page' : 'Nothing matches'; list.appendChild(n); }
    input.setAttribute('aria-activedescendant', shown.length ? 'pal-' + cur : '');
    count.textContent = words.length ? total + (total === 1 ? ' match' : ' matches') : (papers ? papers.length + ' papers indexed' : '');
  }
  function mark() {
    rows.forEach(function (li, i) { li.setAttribute('aria-selected', i === cur ? 'true' : 'false'); });
    input.setAttribute('aria-activedescendant', 'pal-' + cur);
    var el = rows[cur]; if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }
  function open() {
    if (!pal.hidden) return;
    back = document.activeElement; load(); pal.hidden = false; document.documentElement.classList.add('pal-open');
    input.value = ''; cur = 0; draw(); input.focus();
  }
  function close() {
    if (pal.hidden) return;
    pal.hidden = true; document.documentElement.classList.remove('pal-open');
    if (back && back.focus) back.focus();
  }
  function go(e) {
    var to = new URL(e.u, location.href), same = to.origin === location.origin && to.pathname === location.pathname && to.hash;
    close();
    if (!same) { location.href = e.u; return; }
    var el = document.getElementById(to.hash.slice(1));
    if (el && el.hidden && window.__showAll) window.__showAll();
    if (location.hash === to.hash && el) el.scrollIntoView(); else location.hash = to.hash;
  }
  input.addEventListener('input', function () { cur = 0; draw(); });
  pal.addEventListener('click', function (e) { if (e.target === pal) close(); });
  pal.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (shown.length) { cur = (cur + (e.key === 'ArrowDown' ? 1 : shown.length - 1)) % shown.length; mark(); } }
    else if (e.key === 'Enter') { e.preventDefault(); if (shown[cur]) go(shown[cur]); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') e.preventDefault();          // one control in the dialog; focus stays on it
  });
  document.addEventListener('keydown', function (e) {
    var t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); if (pal.hidden) open(); else close(); }
    else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey && !document.querySelector('.filter')) { e.preventDefault(); open(); }
  });

  var btn = document.createElement('button'); btn.type = 'button'; btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-label', 'Search this site');
  btn.innerHTML = LENS + 'Search<kbd>' + (/Mac|iPhone|iPad/.test(navigator.platform || '') ? '&#8984;K' : 'Ctrl K') + '</kbd>';
  btn.addEventListener('click', open);
  btn.addEventListener('pointerenter', load);                // warm the index before the click
  links.appendChild(btn);

  // phones: the links fold into a full-screen menu behind one button.
  var barIn = document.querySelector('.bar-in'), root = document.documentElement;
  if (barIn) {
    var mb = document.createElement('button'); mb.type = 'button'; mb.className = 'menu-btn';
    mb.setAttribute('aria-expanded', 'false'); mb.setAttribute('aria-controls', 'menu');
    mb.innerHTML = '<span class="menu-w">Menu</span><span class="menu-i" aria-hidden="true"><i></i><i></i></span>';
    var menu = document.createElement('div'); menu.id = 'menu'; menu.className = 'menu'; menu.hidden = true;
    var here = location.pathname.replace(/index\.html$/, '');
    var big = [['Home', at('./')], ['Research', at('research.html')]];
    var small = [['GitHub', 'https://github.com/hjyi2027'], ['ORCID', 'https://orcid.org/0009-0006-1197-0063'], ['LinkedIn', 'https://www.linkedin.com/in/hyunjun-yi-3424573a0/']];
    menu.innerHTML = '<nav aria-label="Menu"><ul class="menu-big">' + big.map(function (e, i) {
      var cur = new URL(e[1]).pathname.replace(/index\.html$/, '') === here ? ' aria-current="page"' : '';
      return '<li style="--k:' + i + '"><a href="' + e[1] + '"' + cur + '><span>0' + (i + 1) + '</span>' + e[0] + '</a></li>';
    }).join('') + '</ul><ul class="menu-small">' + small.map(function (e) { return '<li><a href="' + e[1] + '">' + e[0] + '</a></li>'; }).join('') +
      '</ul></nav><a class="pill" href="mailto:hjyi2027@gmail.com">hjyi2027@gmail.com<span class="pill-dot" aria-hidden="true">&rarr;</span></a>';
    var setMenu = function (open, refocus) {
      menu.hidden = !open; mb.setAttribute('aria-expanded', open ? 'true' : 'false');
      mb.firstChild.textContent = open ? 'Close' : 'Menu';
      root.classList.toggle('menu-open', open);
      if (open) { var first = menu.querySelector('a'); if (first) first.focus(); } else if (refocus) mb.focus();
    };
    mb.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false, true); });
    if (window.matchMedia) {
      var wide = window.matchMedia('(min-width: 761px)'), shut = function () { if (wide.matches && !menu.hidden) setMenu(false); };
      if (wide.addEventListener) wide.addEventListener('change', shut); else if (wide.addListener) wide.addListener(shut);
    }
    barIn.appendChild(mb); document.body.appendChild(menu); root.classList.add('has-menu');
  }
})();

// ── 3. homepage ──────────────────────────────────────────────────────────
(function () {
  if (!document.documentElement.classList.contains('home')) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // the hero figure: the largest isosceles set in nine dimensions. it is the 45
  // edge midpoints of a regular simplex plus the simplex's centroid, 46 points,
  // drawn turning in projection. any three of them form an isosceles triangle,
  // and the figure marks one such triangle at a time.
  // plain canvas 2d, no library. with reduced motion it draws one still frame.
  var cv = document.querySelector('canvas.field');
  if (!cv) return;
  var host = cv.closest('.hero') || cv.parentNode;
  var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, on = true, raf = 0;
  var D = 10, i, j, k;
  // a seeded generator, so the figure opens the same way on every visit
  var seed = 20261105;
  function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  // three orthonormal directions inside the simplex's own hyperplane
  var ax = [];
  for (k = 0; k < 3; k++) {
    var v = [], m = 0, n = 0;
    for (i = 0; i < D; i++) { v[i] = rnd() - 0.5; m += v[i]; }
    for (i = 0; i < D; i++) v[i] -= m / D;
    for (j = 0; j < k; j++) { var dot = 0; for (i = 0; i < D; i++) dot += v[i] * ax[j][i]; for (i = 0; i < D; i++) v[i] -= dot * ax[j][i]; }
    for (i = 0; i < D; i++) n += v[i] * v[i];
    n = Math.sqrt(n); for (i = 0; i < D; i++) v[i] /= n;
    ax.push(v);
  }
  var pairs = []; for (i = 0; i < D; i++) for (j = i + 1; j < D; j++) pairs.push([i, j]);
  var speed = [0.11, -0.07, 0.05, 0.09, -0.04];      // radians a second, one per coordinate plane
  var P = [], M = [], tiltX = 0, tiltY = 0, aimX = 0, aimY = 0;
  var hl = { a: 3, b: 17, t0: -1e9 }, lead = null, lead2 = null, HOLD = 4.2;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size(); window.addEventListener('resize', function () { size(); kick(); });
  host.addEventListener('pointermove', function (e) {
    var r = cv.getBoundingClientRect();
    aimX = Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / (r.width / 2)));
    aimY = Math.max(-1, Math.min(1, (e.clientY - r.top - r.height / 2) / (r.height / 2)));
  }, { passive: true });
  host.addEventListener('pointerleave', function () { aimX = 0; aimY = 0; });
  document.addEventListener('visibilitychange', function () { on = !document.hidden; if (on) kick(); });
  new IntersectionObserver(function (es) { on = es[0].isIntersecting && !document.hidden; if (on) kick(); }).observe(cv);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(kick);

  var INK = 'rgba(23,23,26,', BLUE = 'rgba(39,71,212,', FONT = '11.5px "Geist Mono", ui-monospace, Menlo, monospace';
  function place(t) {
    var cx = W / 2, cy = H / 2, s = Math.min(W, H) * 0.56, c;
    var ca = Math.cos(tiltX * 0.5), sa = Math.sin(tiltX * 0.5), cb = Math.cos(tiltY * 0.4), sb = Math.sin(tiltY * 0.4);
    for (i = 0; i < D; i++) {
      var q = []; for (c = 0; c < D; c++) q[c] = (c === i ? 1 : 0) - 1 / D;
      for (k = 0; k < 5; k++) {                                  // turn the whole simplex in ten dimensions
        var th = speed[k] * t, co = Math.cos(th), si = Math.sin(th), x0 = q[2 * k], y0 = q[2 * k + 1];
        q[2 * k] = x0 * co - y0 * si; q[2 * k + 1] = x0 * si + y0 * co;
      }
      var x = 0, y = 0, z = 0;
      for (c = 0; c < D; c++) { x += q[c] * ax[0][c]; y += q[c] * ax[1][c]; z += q[c] * ax[2][c]; }
      var x1 = x * ca + z * sa, z1 = z * ca - x * sa, y1 = y * cb + z1 * sb, z2 = z1 * cb - y * sb;   // lean toward the pointer
      var f = 1 / (1 - z2 * 0.28);
      P[i] = [cx + x1 * s * f, cy + y1 * s * f, z2];
    }
    for (k = 0; k < pairs.length; k++) {
      var A = P[pairs[k][0]], B = P[pairs[k][1]];
      M[k] = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2];
    }
  }
  function label(text, lx, ly, px, py, col) {
    ctx.font = FONT; ctx.textBaseline = 'middle';
    var w = ctx.measureText(text).width, left = px < lx + w / 2, ex = left ? lx - 7 : lx + w + 7;
    ctx.strokeStyle = col + '0.55)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ly); ctx.stroke();
    ctx.fillStyle = col + '1)'; ctx.fillText(text, lx, ly);
  }
  function tick(ax0, ay0, bx, by) {                               // the mark geometers put on equal sides
    var mx = (ax0 + bx) / 2, my = (ay0 + by) / 2, dx = bx - ax0, dy = by - ay0, l = Math.sqrt(dx * dx + dy * dy) || 1;
    ctx.moveTo(mx - dy / l * 5, my + dx / l * 5); ctx.lineTo(mx + dy / l * 5, my - dx / l * 5);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    if (!on || !W) return;
    var t = reduce ? 38 : now / 1000, cx = W / 2, cy = H / 2;
    tiltX += (aimX - tiltX) * 0.05; tiltY += (aimY - tiltY) * 0.05;
    place(t);
    ctx.clearRect(0, 0, W, H);

    // the simplex: its 45 edges and 10 vertices, drawn light
    ctx.beginPath();
    for (k = 0; k < pairs.length; k++) { var A = P[pairs[k][0]], B = P[pairs[k][1]]; ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); }
    ctx.strokeStyle = INK + '0.13)'; ctx.lineWidth = 1; ctx.stroke();

    // one isosceles triangle: the centroid and two midpoints, a new pair every few seconds
    var u = t - hl.t0;
    if (u > HOLD || u < 0) {                                     // of a dozen random pairs, keep the widest triangle
      var best = -1;
      for (k = 0; k < 12; k++) {
        var pa = (rnd() * 45) | 0, pb = (rnd() * 45) | 0;
        var ar = Math.abs((M[pa][0] - cx) * (M[pb][1] - cy) - (M[pa][1] - cy) * (M[pb][0] - cx));
        if (pa !== pb && ar > best) { best = ar; hl.a = pa; hl.b = pb; }
      }
      hl.t0 = t; u = 0;
    }
    var e = reduce ? 1 : Math.max(0, Math.min(1, u / 0.7, (HOLD - u) / 0.7)), a = M[hl.a], b = M[hl.b];
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.closePath();
    ctx.fillStyle = BLUE + (0.09 * e) + ')'; ctx.fill();
    ctx.strokeStyle = BLUE + (0.9 * e) + ')'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.beginPath(); tick(cx, cy, a[0], a[1]); tick(cx, cy, b[0], b[1]); ctx.stroke();

    for (i = 0; i < D; i++) {
      ctx.beginPath(); ctx.arc(P[i][0], P[i][1], 3.4, 0, 6.2832);
      ctx.fillStyle = '#fafaf8'; ctx.fill(); ctx.strokeStyle = INK + '0.5)'; ctx.lineWidth = 1; ctx.stroke();
    }
    for (k = 0; k < M.length; k++) {
      var d = Math.max(0, Math.min(1, (M[k][2] + 0.5))), hot = k === hl.a || k === hl.b;
      ctx.beginPath(); ctx.arc(M[k][0], M[k][1], 2.3 + 1.9 * d, 0, 6.2832);
      ctx.fillStyle = INK + (0.5 + 0.5 * d) + ')'; ctx.fill();
      if (hot && e > 0) { ctx.fillStyle = BLUE + e + ')'; ctx.fill(); }
    }
    ctx.beginPath(); ctx.arc(cx, cy, 9, 0, 6.2832); ctx.fillStyle = BLUE + '0.14)'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 4.6, 0, 6.2832); ctx.fillStyle = BLUE + '1)'; ctx.fill();

    // labels, each tied to the part it names
    // the midpoint nearest the lower left and the vertex nearest the upper left carry the other two
    var lo = M[0], hi = P[0], ez = reduce ? 1 : 0.06;
    for (k = 1; k < M.length; k++) if (M[k][1] - M[k][0] > lo[1] - lo[0]) lo = M[k];
    for (i = 1; i < D; i++) if (P[i][1] + P[i][0] < hi[1] + hi[0]) hi = P[i];
    if (!lead) { lead = [lo[0], lo[1]]; lead2 = [hi[0], hi[1]]; }
    lead[0] += (lo[0] - lead[0]) * ez; lead[1] += (lo[1] - lead[1]) * ez;
    lead2[0] += (hi[0] - lead2[0]) * ez; lead2[1] += (hi[1] - lead2[1]) * ez;
    var small = W < 480;
    label('Centroid', W * (small ? 0.70 : 0.78), H * 0.14, cx, cy, BLUE);
    label(small ? 'Edge midpoint' : 'Edge midpoint, 1 of 45', W * (small ? 0.04 : 0.06), H * 0.88, lead[0], lead[1], INK);
    if (!small) label('Regular simplex in nine dimensions', W * 0.04, H * 0.10, lead2[0], lead2[1], INK);
    if (!reduce) kick();
  }
  kick();
})();
