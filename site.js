// hyunjun yi — one script for every page. every part is optional:
// the pages read the same with it switched off.
//   1. shared: reveals, clock, print link, counts
//   2. search: one box that reaches every page, section and paper
//   3. research page: filter, titles-only view, section rail, copyable links
//   4. homepage: three instruments, the hero figure

// ── 1. shared ────────────────────────────────────────────────────────────
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // reveal each block once as it arrives. siblings that enter on the same
  // frame stagger, so a section lands as a sequence rather than a slab.
  var sel = '.kicker, .num, .eyebrow, .lede, h2, h3.sub, .item, .row, ul.plain, .links, .latest, ' +
            '.page-title, .poster, .big, .mail, .cols, .rows, .facts, .play, .poster-sub, .hero-cta, .sec-head, .ticker, .feature, .hero-at, .fig-note, .nf-fig, .night, .sponsors, .about-fig, .points, .tl-day, .foot-in, .foot-big, .r-map, .cv-id, .cv-toc, .edu-fig';
  document.querySelectorAll('.poster, .big, .mail, .page-title').forEach(function (h) {
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

  // cv: the contents card counts the entries under each section.
  document.querySelectorAll('.cv-toc ol a').forEach(function (a) {
    var h = document.getElementById(a.getAttribute('href').slice(1)), sec = h && h.closest('.cv-sec'), n = a.querySelector('.toc-n');
    if (!sec || !n) return;
    var k = sec.querySelectorAll('.cv-body > .row').length;
    n.textContent = k + (k === 1 ? ' entry' : ' entries');
  });

  // cv: the education chart marks today on its school-year axis, which runs
  // from august 2024 to july 2027, and only while today falls inside it.
  var now = document.querySelector('.ef-now');
  if (now) {
    var d = new Date(), mo = (d.getFullYear() - 2024) * 12 + d.getMonth() - 7 + (d.getDate() - 1) / 31;
    if (mo >= 0 && mo <= 36) { now.style.left = (mo / 36 * 100).toFixed(2) + '%'; now.hidden = false; }
  }

  // cv: the print link exists only when printing can be triggered.
  var p = document.querySelector('.print');
  if (p && window.print) {
    p.hidden = false;
    (p.tagName === 'A' ? p : p.querySelector('a')).addEventListener('click', function (e) { e.preventDefault(); window.print(); });
  }

  // the cv counts carry a unit chart: a dot for each unit, or for each hundred
  // when the count runs into the thousands. the dots are drawn from the number
  // itself, so they cannot drift from it.
  document.querySelectorAll('.cv-facts div').forEach(function (box) {
    var dd = box.querySelector('dd'), m = dd && /^\D{0,2}(\d{1,3}(?:,\d{3})+|\d+)/.exec(dd.textContent.trim());
    if (!m) return;
    var n = +m[1].replace(/,/g, ''), per = n > 60 ? 100 : 1, k = Math.floor(n / per);
    if (!k || k > 60) return;
    var s = document.createElement('span');
    s.className = 'dots'; s.setAttribute('aria-hidden', 'true'); s._per = per;
    for (var i = 0; i < k; i++) { var d = document.createElement('i'); d.className = 'on'; s.appendChild(d); }
    if (per > 1) { var cap = document.createElement('small'); cap.textContent = ('Each dot is ' + per + ' ' + (box.getAttribute('data-unit') || '')).trim(); s.appendChild(cap); }
    box.insertBefore(s, dd);
  });

  // counts tick up from zero the first time they are seen. a sign or unit
  // around the number ($, +, k) stays put while the digits run, and a unit
  // chart beside the number fills in step with it.
  if (!reduce && 'IntersectionObserver' in window) {
    var cells = [];
    document.querySelectorAll('.facts dd, .cv-figs dd').forEach(function (dd) {
      var el = dd.children.length === 1 && dd.children[0].tagName === 'A' ? dd.children[0] : dd;
      var m = !el.children.length && /^(\D{0,2})(\d{1,3}(?:,\d{3})+|\d+)(\D{0,3})$/.exec(el.textContent.trim());
      if (!m) return;
      var dots = dd.parentNode.querySelector('.dots');
      var c = { box: dd, el: el, to: +m[2].replace(/,/g, ''), pre: m[1], post: m[3], comma: m[2].indexOf(',') > -1, end: el.textContent,
                dots: dots ? dots.querySelectorAll('i') : null, per: dots ? dots._per : 1 };
      paint(c, 0);
      cells.push(c);
    });
    function fmt(c, n) { return c.pre + (c.comma ? n.toLocaleString('en-US') : n) + c.post; }
    function paint(c, n) {
      if (!c.dots) return;
      for (var i = 0, f = Math.floor(n / c.per); i < c.dots.length; i++) c.dots[i].classList.toggle('on', i < f);
    }
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var c = cells.filter(function (x) { return x.box === e.target; })[0], t0 = performance.now(), dur = 700 + Math.min(c.to, 40) * 12;
        (function step(now) {
          var u = Math.min((now - t0) / dur, 1), v = 1 - Math.pow(1 - u, 3);
          var n = Math.round(c.to * v);
          c.el.textContent = fmt(c, n); paint(c, n);
          if (u < 1) requestAnimationFrame(step); else { c.el.textContent = c.end; paint(c, c.to); }
        })(t0);
      });
    }, { threshold: 0.6 });
    cells.forEach(function (c) { cio.observe(c.box); });
  }
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
    ['CV', 'Page', at('cv.html')],
    ['About', 'Home', at('./#about')],
    ['Play: the sampler, the line break, the split', 'Home', at('./#play')],
    ['YIMO, a free olympiad', 'Home', at('./#yimo')],
    ['Contact', 'Home', at('./#contact')],
    ['Peer-reviewed and accepted', 'Research', at('research.html#accepted')],
    ['Open problems table', 'Research', at('research.html#open-problems')],
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
    var big = [['Home', at('./')], ['Research', at('research.html')], ['CV', at('cv.html')]];
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

// ── 3. research page ─────────────────────────────────────────────────────
(function () {
  var main = document.getElementById('main');
  if (!main) return;
  var items = Array.prototype.slice.call(main.querySelectorAll('.item[id]'));
  if (items.length < 8) return;
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
                set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  // each entry remembers its section and its own lower-cased text
  var sec = '', heads = [];
  Array.prototype.forEach.call(main.children, function (k) {
    if (k.tagName === 'H2') { sec = k.id || ''; heads.push(k); }
    else if (k.tagName === 'H3' && k.classList.contains('sub')) heads.push(k);
    else if (k.classList.contains('item')) {
      var m = k.querySelector('.meta');
      k._sec = sec; k._meta = (m ? m.textContent : '').toLowerCase(); k._text = k.textContent.toLowerCase();
    }
  });
  heads.forEach(function (h) {
    h._label = h.textContent.replace(/\s+/g, ' ').trim().replace(/\.$/, '');
    h._count = document.createElement('span'); h._count.className = 'h-n'; h.appendChild(h._count);
  });

  // a map of the page beside the lede: one square a paper, grouped by status.
  // hovering a square names the paper; choosing one goes to it.
  var mapBox = main.querySelector('.r-map');
  if (mapBox) {
    var CLS = { accepted: 'accepted', 'in-review': 'review', solved: 'solved', 'new-records': 'records', 'new-discoveries': 'discoveries', 'in-revision': 'revision' };
    var NAME = { accepted: 'Accepted', 'in-review': 'In review' };
    var groups = [], g = null;
    Array.prototype.forEach.call(main.children, function (k) {
      var head = k.tagName === 'H2' || (k.tagName === 'H3' && k.classList.contains('sub'));
      if (head && CLS[k.id]) { g = { id: k.id, name: NAME[k.id] || k.textContent.trim(), list: [] }; groups.push(g); }
      else if (head) g = null;
      else if (g && k.classList.contains('item') && k.id) g.list.push(k);
    });
    var capIdle = '<b>' + items.length + ' papers</b>Choose a square to see which paper it is.';
    var gs = document.createElement('div'); gs.className = 'map-gs';
    var cap = document.createElement('p'); cap.className = 'map-cap'; cap.setAttribute('aria-live', 'polite'); cap.innerHTML = capIdle;
    var n = 0;
    groups.forEach(function (gr) {
      if (!gr.list.length) return;
      var wrap = document.createElement('div'); wrap.className = 'map-g ' + CLS[gr.id];
      var lab = document.createElement('span'); lab.className = 'map-l'; lab.textContent = gr.name;
      var num = document.createElement('b'); num.textContent = gr.list.length; lab.appendChild(num);
      var cells = document.createElement('div'); cells.className = 'map-c';
      gr.list.forEach(function (it) {
        n++;
        var a = document.createElement('a'), h = it.querySelector('h3'), title = h ? h.textContent.trim() : it.id, no = (n < 10 ? '0' : '') + n;
        a.href = '#' + it.id; a.setAttribute('aria-label', title);
        var say = function () {
          cap.textContent = '';
          var b = document.createElement('b'); b.textContent = title; cap.appendChild(b);
          cap.appendChild(document.createTextNode(no + ' \u00b7 ' + gr.name));
        };
        a.addEventListener('pointerenter', say); a.addEventListener('focus', say);
        a.addEventListener('click', function () { if (it.hidden && window.__showAll) window.__showAll(); });
        cells.appendChild(a);
      });
      wrap.appendChild(lab); wrap.appendChild(cells); gs.appendChild(wrap);
    });
    gs.addEventListener('pointerleave', function () { cap.innerHTML = capIdle; });
    var mh = document.createElement('p'); mh.className = 'map-h'; mh.innerHTML = 'Every paper on this page<span>one square each</span>';
    mapBox.appendChild(mh); mapBox.appendChild(gs); mapBox.appendChild(cap); mapBox.hidden = false;
  }

  // the table's status cells become small tags.
  Array.prototype.forEach.call(document.querySelectorAll('table.problems tbody td:last-child'), function (td) {
    var parts = td.textContent.split('\u00b7').map(function (p) { return p.trim(); }).filter(Boolean);
    td.textContent = '';
    parts.forEach(function (p) { var t = document.createElement('span'); t.className = 'tag' + (/^jmm /i.test(p) ? ' on' : ''); t.textContent = p; td.appendChild(t); });
  });

  // each entry is written as a title, one record line and an abstract. here the
  // record line is laid out in parts: status above the title, authorship under
  // it, and the links as buttons after the abstract. the written line stays in
  // the page, hidden, so the filter, the search box and a script-free reader
  // all still use it. an entry that has a highlight card borrows its figure.
  var WHEN = /^((january|february|march|april|may|june|july|august|september|october|november|december) )?\d{4}$/;
  var LINK = /^(pdf|openreview|code|doi|zenodo|review thread|arxiv:\S+|earlier version, doi)$/;
  var WHO = /^(sole author|first author|co-first author|with )/;
  var figs = {};
  Array.prototype.forEach.call(document.querySelectorAll('.feature .card'), function (c) {
    var f = c.querySelector('.fig'); if (f) figs[(c.getAttribute('href') || '').slice(1)] = f;
  });
  function make(tag, cls) { var e = document.createElement(tag); e.className = cls; return e; }
  items.forEach(function (it) {
    var meta = it.querySelector('.meta'), h = it.querySelector('h3');
    if (!meta || !h) return;
    var segs = [[]], top = make('p', 'm-top'), by = make('p', 'm-by'), act = make('p', 'm-act'), when = '';
    Array.prototype.forEach.call(meta.childNodes, function (n) {
      if (n.nodeType === 1 && n.classList.contains('badge')) { top.appendChild(n.cloneNode(true)); return; }
      if (n.nodeType !== 3) { segs[segs.length - 1].push(n.cloneNode(true)); return; }
      n.nodeValue.split('·').forEach(function (part, i) {
        if (i) segs.push([]);
        if (part) segs[segs.length - 1].push(document.createTextNode(part));
      });
    });
    segs.forEach(function (seg) {
      var text = seg.map(function (n) { return n.textContent; }).join('').replace(/\s+/g, ' ').trim();
      if (!text) return;
      while (seg.length && seg[0].nodeType === 3 && !seg[0].nodeValue.trim()) seg.shift();
      while (seg.length && seg[seg.length - 1].nodeType === 3 && !seg[seg.length - 1].nodeValue.trim()) seg.pop();
      var low = text.toLowerCase(), first = seg[0], last = seg[seg.length - 1];
      if (first.nodeType === 3) first.nodeValue = first.nodeValue.replace(/^\s+/, '');
      if (last.nodeType === 3) last.nodeValue = last.nodeValue.replace(/\s+$/, '');
      var link = seg.filter(function (n) { return n.nodeType === 1 && n.tagName === 'A'; })[0];
      if (WHEN.test(low)) when = text;
      else if (link && LINK.test(low)) { link.className = 'act'; link.textContent = text; act.appendChild(link); }
      else if (WHO.test(low)) { if (by.childNodes.length) by.appendChild(document.createTextNode(' · ')); seg.forEach(function (n) { by.appendChild(n); }); }
      else {
        var st = make('span', 'm-st');
        if (first.nodeType === 1 && first.tagName === 'A' && /^accepted$/i.test(first.textContent)) first.className = 'chip';
        else if (first.nodeType === 3 && /^Accepted\b/.test(first.nodeValue)) {
          var chip = make('span', 'chip'); chip.textContent = 'Accepted'; st.appendChild(chip);
          first.nodeValue = first.nodeValue.slice(8);
        }
        seg.forEach(function (n) { st.appendChild(n); });
        // "accepted, venue" reads as chip then venue; drop the comma that joined them
        var after = st.firstChild && st.firstChild.nextSibling;
        if (st.firstChild.className === 'chip' && after && after.nodeType === 3) after.nodeValue = after.nodeValue.replace(/^,?\s*/, '');
        top.appendChild(st);
      }
    });
    if (when) { var d = make('span', 'm-date'); d.textContent = when; top.appendChild(d); }
    it.insertBefore(top, h);
    if (by.childNodes.length) it.insertBefore(by, h.nextSibling);
    if (act.childNodes.length) it.appendChild(act);
    meta.hidden = true; it.classList.add('rich');
    if (figs[it.id]) { var t = figs[it.id].cloneNode(true); t.classList.add('thumb'); it.insertBefore(t, top); it.classList.add('has-fig'); }
  });

  items.forEach(function (it) {
    // a copyable link under the entry number
    var a = document.createElement('a'); a.className = 'pl'; a.href = '#' + it.id; a.textContent = 'Link';
    a.setAttribute('aria-label', 'Copy a link to this entry');
    a.addEventListener('click', function (e) {
      if (!navigator.clipboard || !navigator.clipboard.writeText) return;   // falls back to a plain anchor jump
      e.preventDefault();
      navigator.clipboard.writeText(location.origin + location.pathname + '#' + it.id).then(function () {
        a.textContent = 'Copied'; a.classList.add('done');
        setTimeout(function () { a.textContent = 'Link'; a.classList.remove('done'); }, 1400);
      }, function () { location.hash = it.id; });
    });
    it.appendChild(a);
    // in the titles-only view, each entry opens its own abstract
    var b = document.createElement('button'); b.type = 'button'; b.className = 'ex'; b.textContent = 'Abstract'; b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', function () { unfold(it, !it.classList.contains('open')); });
    it._ex = b; it.appendChild(b);
  });
  function unfold(it, yes) { it.classList.toggle('open', yes); it._ex.setAttribute('aria-expanded', yes ? 'true' : 'false'); it._ex.textContent = yes ? 'Close' : 'Abstract'; }

  // filter: one free-text box, one row of venue chips, one view switch
  var chips = [
    ['All', function () { return true; }],
    ['NeurIPS', function (i) { return /neurips/.test(i._meta); }],
    ['WACV', function (i) { return /wacv/.test(i._meta); }],
    ['CoRL', function (i) { return /corl/.test(i._meta); }],
    ['JMM', function (i) { return /jmm/.test(i._meta); }],
    ['Mathematics', function (i) { return i._sec === 'mathematics'; }],
    ['Sole author', function (i) { return /sole author/.test(i._meta); }],
    ['First author', function (i) { return /first author/.test(i._meta); }]
  ];
  var box = document.createElement('div'); box.className = 'filter'; box.setAttribute('role', 'search');
  box.innerHTML = '<div class="f-field"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="M13.2 13.2 17 17"/></svg>' +
    '<input type="search" placeholder="Filter by title, venue or any word" autocomplete="off" spellcheck="false" aria-label="Filter the entries">' +
    '<span class="f-where" aria-hidden="true"></span><kbd class="f-key">/</kbd><button type="button" class="f-clear" aria-label="Clear the filter" hidden>&times;</button></div>' +
    '<p class="f-n" aria-live="polite"></p>' +
    '<div class="f-view" role="group" aria-label="How much of each entry to show"><button type="button" aria-pressed="true">Full</button><button type="button" aria-pressed="false">Titles</button></div>' +
    '<div class="f-chips" role="group" aria-label="Filter by venue or authorship"></div>' +
    '<span class="f-meter" aria-hidden="true"><i></i></span>';
  var input = box.querySelector('input'), row = box.querySelector('.f-chips'), note = box.querySelector('.f-n'), cur = 0;
  var views = box.querySelectorAll('.f-view button'), wipe = box.querySelector('.f-clear'), meter = box.querySelector('.f-meter i');
  chips.forEach(function (c, k) {
    var n = items.filter(c[1]).length; if (!n) return;
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', k ? 'false' : 'true');
    b.innerHTML = c[0] + '<i>' + n + '</i>';
    b.addEventListener('click', function () { cur = k; apply(); });
    c[2] = b; row.appendChild(b);
  });
  // a count that names a venue sets that venue's chip on the way to the list
  Array.prototype.forEach.call(main.querySelectorAll('[data-chip]'), function (a) {
    a.addEventListener('click', function () {
      for (var k = 0; k < chips.length; k++) if (chips[k][0] === a.getAttribute('data-chip') && chips[k][2]) { cur = k; input.value = ''; apply(); }
    });
  });
  var anchor = main.querySelector('.jump') || main.querySelector('.facts');
  if (anchor) anchor.parentNode.insertBefore(box, anchor.nextSibling);

  // matched words are tinted where they stand, without touching the page's markup
  var paint = window.CSS && CSS.highlights && window.Highlight && document.createTreeWalker;
  function tint(words) {
    if (!paint) return;
    CSS.highlights.delete('find');
    if (!words.length) return;
    var ranges = [];
    items.forEach(function (it) {
      if (it.hidden || ranges.length > 1500) return;
      Array.prototype.forEach.call(it.querySelectorAll('h3, p:not(.meta)'), function (el) {
        var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), node;
        while ((node = walk.nextNode())) {
          var low = node.nodeValue.toLowerCase();
          words.forEach(function (w) {
            for (var p = low.indexOf(w); p > -1; p = low.indexOf(w, p + w.length)) {
              var r = document.createRange(); r.setStart(node, p); r.setEnd(node, p + w.length); ranges.push(r);
            }
          });
        }
      });
    });
    if (ranges.length) CSS.highlights.set('find', new (Function.prototype.bind.apply(Highlight, [null].concat(ranges)))());
  }
  var keys = window.matchMedia('(hover: hover)').matches;
  function apply() {
    var words = input.value.toLowerCase().split(/\s+/).filter(Boolean), active = !!words.length || cur !== 0, n = 0;
    var hit = function (it) { return words.every(function (w) { return it._text.indexOf(w) > -1; }); };
    chips.forEach(function (c, k) {
      if (!c[2]) return;
      c[2].setAttribute('aria-pressed', k === cur ? 'true' : 'false');
      var m = items.filter(function (it) { return c[1](it) && hit(it); }).length;        // each chip counts what it would show now
      c[2].lastChild.textContent = m; c[2].classList.toggle('none', !m);
    });
    main.classList.toggle('filtering', active);
    items.forEach(function (it) {
      var ok = chips[cur][1](it) && hit(it);
      it.hidden = !ok; if (ok) { n++; if (active) it.classList.add('in'); }
    });
    // a heading stays only while something under it does, and carries the count
    var h2 = null, h3 = null;
    Array.prototype.forEach.call(main.children, function (k) {
      if (k.tagName === 'H2') { h2 = k; h3 = null; k._n = 0; }
      else if (k.tagName === 'H3' && k.classList.contains('sub')) { h3 = k; k._n = 0; }
      else if (k.classList.contains('item') && !k.hidden) { if (h2) h2._n++; if (h3) h3._n++; }
    });
    heads.forEach(function (h) { h.hidden = active && !h._n; if (active) h.classList.add('in'); if (h._count) h._count.textContent = h._n; });
    note.innerHTML = active
      ? '<b>' + n + '</b> of ' + items.length + (n ? '' : ', nothing matches') + '<button type="button">Clear</button>'
      : '<b>' + items.length + '</b> entries';
    var clr = note.querySelector('button');
    if (clr) clr.addEventListener('click', function () { showAll(); input.focus(); });
    wipe.hidden = !input.value; box.querySelector('.f-key').hidden = !keys || !!input.value;
    meter.style.setProperty('--f', n / items.length); box.classList.toggle('on', active);
    tint(words);
  }
  wipe.addEventListener('click', function () { input.value = ''; apply(); input.focus(); });
  function showAll() { input.value = ''; cur = 0; apply(); }
  window.__showAll = showAll;                                 // the search box calls this before jumping to a hidden entry
  input.addEventListener('input', apply);
  document.addEventListener('keydown', function (e) {
    var t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); input.focus(); input.select(); }
    else if (e.key === 'Escape' && t === input) { showAll(); input.blur(); }
  });
  apply();

  // titles only: remembered between visits; an entry linked by its #id arrives open
  function compact(yes) {
    main.classList.toggle('compact', yes);
    views[0].setAttribute('aria-pressed', yes ? 'false' : 'true'); views[1].setAttribute('aria-pressed', yes ? 'true' : 'false');
    if (!yes) items.forEach(function (it) { if (it.classList.contains('open')) unfold(it, false); });
    else aim();
  }
  function aim() {
    var el = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
    if (el && el._ex && main.classList.contains('compact')) unfold(el, true);
  }
  Array.prototype.forEach.call(views, function (b, k) {
    b.addEventListener('click', function () { compact(k === 1); store.set('hy:view', k === 1 ? 'compact' : 'full'); });
  });
  // on wide screens the toolbar follows the reader down the list
  var pinned = false, pinQ = false;
  function pin() {
    pinQ = false;
    var y = getComputedStyle(box).position === 'sticky' && box.getBoundingClientRect().top <= parseFloat(getComputedStyle(box).top) + 1 && window.scrollY > 40;
    if (y !== pinned) { pinned = y; box.classList.toggle('stuck', y); }
  }
  window.addEventListener('scroll', function () { if (!pinQ) { pinQ = true; requestAnimationFrame(pin); } }, { passive: true });
  pin();
  window.addEventListener('hashchange', aim);
  if (store.get('hy:view') === 'compact') compact(true);

  // section rail: marks the section in view
  var marks = heads.filter(function (h) { return h.id; });
  if (marks.length < 3) return;
  var rail = document.createElement('div'); rail.className = 'rail'; rail.setAttribute('role', 'navigation'); rail.setAttribute('aria-label', 'Sections of this page');
  var short = { accepted: 'Accepted', mathematics: 'Mathematics' }, where = box.querySelector('.f-where');
  var links = marks.map(function (h) {
    var a = document.createElement('a'); a.href = '#' + h.id; a.textContent = short[h.id] || h._label;
    if (h.tagName === 'H3') a.className = 'sub';
    rail.appendChild(a); return a;
  });
  document.body.appendChild(rail);
  var queued = false;
  function spy() {
    queued = false; var on = -1;
    for (var k = 0; k < marks.length; k++) { if (!marks[k].hidden && marks[k].getBoundingClientRect().top < 260) on = k; }
    where.textContent = on > -1 ? links[on].textContent : '';
    links.forEach(function (a, k) { a.classList.toggle('on', k === on); if (k === on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(spy); } }, { passive: true });
  spy();
})();

// ── 4. homepage ──────────────────────────────────────────────────────────
(function () {
  if (!document.documentElement.classList.contains('home')) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── the three instruments share one stage, behind tabs ──
  (function () {
    var list = document.querySelector('.lab-tabs'); if (!list) return;
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function show(k, focus) {
      tabs.forEach(function (t, i) {
        var yes = i === k, p = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', yes ? 'true' : 'false'); t.tabIndex = yes ? 0 : -1;
        if (p) p.classList.toggle('on', yes);
      });
      if (focus) tabs[k].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(i); });
      t.addEventListener('keydown', function (e) {
        var d = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
        if (e.key === 'Home') { e.preventDefault(); show(0, true); }
        else if (e.key === 'End') { e.preventDefault(); show(tabs.length - 1, true); }
        else if (d) { e.preventDefault(); show((i + d + tabs.length) % tabs.length, true); }
      });
    });
    show(0);
  })();

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
    var presets = Array.prototype.slice.call(box.querySelectorAll('.presets button'));
    function calc() {
      var T = +kt.value, P = +kp.value, K = +kk.value, z = 0, p = lg.map(function (l) { return Math.exp(l / T); });
      p.forEach(function (v) { z += v; }); p = p.map(function (v) { return v / z; });
      var keep = [], cum = 0;                       // tokens are already sorted by logit
      for (var i = 0; i < p.length; i++) { keep[i] = i < K && cum < P; cum += p[i]; }
      z = 0; p = p.map(function (v, i) { return keep[i] ? v : 0; }); p.forEach(function (v) { z += v; });
      probs = p.map(function (v) { return v / z; });
      rows.forEach(function (r, i) {
        r.classList.toggle('cut', !keep[i]); r.children[1].style.setProperty('--p', probs[i]);
        r.children[2].textContent = keep[i] ? Math.round(probs[i] * 100) + '%' : 'Cut';
      });
      box.querySelector('#o-t').textContent = T.toFixed(2); box.querySelector('#o-p').textContent = P.toFixed(2);
      box.querySelector('#o-k').textContent = K; box.querySelector('#acc').textContent = Math.round(probs[0] * 100) + '%';
      presets.forEach(function (b) { b.setAttribute('aria-pressed', (+b.getAttribute('data-t') === T && +b.getAttribute('data-p') === P && +b.getAttribute('data-k') === K) ? 'true' : 'false'); });
    }
    // presets move all three knobs at once
    presets.forEach(function (b) { b.addEventListener('click', function () { kt.value = b.getAttribute('data-t'); kp.value = b.getAttribute('data-p'); kk.value = b.getAttribute('data-k'); calc(); }); });
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
    // the first time the sampler is on screen it draws a run by itself
    if (!reduce && 'IntersectionObserver' in window) {
      var once = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { once.disconnect(); box.querySelector('#draw').click(); }
      }, { threshold: 0.6 });
      once.observe(box);
    }
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
        g.setAttribute('aria-label', (on[i] ? 'Remove' : 'Add') + ' line break after ' + w);
        g.addEventListener('click', function () { if (on[i]) delete on[i]; else on[i] = 1; draw(i); });
        poem.appendChild(g);
        if (on[i]) poem.appendChild(document.createElement('br'));
      });
      var mine = Object.keys(on).map(Number), hit = mine.filter(function (g) { return his.indexOf(g) > -1; }).length, extra = mine.length - hit;
      score.innerHTML = 'You and Williams agree on <b>' + hit + ' of 7</b>' + (extra ? '<span style="display:block;margin-top:6px">plus ' + extra + ' he did not make</span>' : '');
    }
    draw();
    box.querySelector('#b-w').addEventListener('click', function () { on = {}; his.forEach(function (g) { on[g] = 1; }); draw(); });
    box.querySelector('#b-p').addEventListener('click', function () { on = {}; draw(); });
  })();

  // ── the split: a fifth of the crops held out, two ways ──
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
