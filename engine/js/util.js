/* ==========================================================================
   GWMS eLearning Engine — util.js
   Namespace, DOM helpers, screen-reader announcements.
   Classic script (no ES modules) so the engine also runs from file:// where
   module loading is blocked by the browser's CORS rules.
   ========================================================================== */
(function () {
  'use strict';

  var GWMS = window.GWMS = window.GWMS || {};

  /* ---------- DOM ---------- */

  /**
   * el('div.foo', {attrs}, [children])  — minimal hyperscript.
   * Children may be nodes, strings, or nested arrays; null/undefined skipped.
   */
  function el(spec, attrs, children) {
    var parts = String(spec).split('.');
    var tag = parts.shift() || 'div';
    var node = document.createElement(tag);
    if (parts.length) node.className = parts.join(' ');

    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') { node.className = (node.className ? node.className + ' ' : '') + v; }
        else if (k === 'text') { node.textContent = v; }
        else if (k === 'html') { node.innerHTML = v; }
        else if (k === 'dataset') { Object.keys(v).forEach(function (d) { node.dataset[d] = v[d]; }); }
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') { node.addEventListener(k.slice(2), v); }
        else if (v === true) { node.setAttribute(k, ''); }
        else { node.setAttribute(k, v); }
      });
    }

    append(node, children);
    return node;
  }

  function append(parent, children) {
    if (children === null || children === undefined || children === false) return parent;
    if (Array.isArray(children)) {
      children.forEach(function (c) { append(parent, c); });
      return parent;
    }
    parent.appendChild(children.nodeType ? children : document.createTextNode(String(children)));
    return parent;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- Text ---------- */

  /** Render a light inline markup subset: **bold**, *italic*, `code`. No raw HTML. */
  function inline(text) {
    var frag = document.createDocumentFragment();
    var re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    var last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      var t = m[0];
      if (t.slice(0, 2) === '**') frag.appendChild(el('strong', { text: t.slice(2, -2) }));
      else if (t[0] === '*') frag.appendChild(el('em', { text: t.slice(1, -1) }));
      else frag.appendChild(el('code', { text: t.slice(1, -1) }));
      last = m.index + t.length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    return frag;
  }

  /* ---------- Announcements ---------- */

  var liveTimer = null;
  /** Announce to assistive tech. politeness: 'polite' (default) | 'assertive'. */
  function announce(message, politeness) {
    var node = document.getElementById(
      politeness === 'assertive' ? 'live-assertive' : 'live-polite'
    );
    if (!node) return;
    // Clearing first forces re-announcement of identical strings.
    node.textContent = '';
    clearTimeout(liveTimer);
    liveTimer = setTimeout(function () { node.textContent = message; }, 60);
  }

  /* ---------- Misc ---------- */

  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  /**
   * Deterministic shuffle, seeded by a string. Same seed -> same order, every
   * time, on every device — which is what makes it safe to use for quiz
   * option order: a learner who answers, navigates away, and comes back sees
   * their own selection still lined up with the option they picked, instead
   * of the order scrambling underneath a stored answer index.
   */
  function seededShuffle(arr, seedStr) {
    var seed = 0;
    var s = String(seedStr || '');
    for (var i = 0; i < s.length; i++) { seed = (seed * 31 + s.charCodeAt(i)) >>> 0; }
    function next() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    }
    var out = arr.slice();
    for (var j = out.length - 1; j > 0; j--) {
      var k = Math.floor(next() * (j + 1));
      var tmp = out[j]; out[j] = out[k]; out[k] = tmp;
    }
    return out;
  }

  var uidCount = 0;
  function uid(prefix) { uidCount += 1; return (prefix || 'u') + '-' + uidCount; }

  function isFileProtocol() { return window.location.protocol === 'file:'; }

  /** Resolve an asset path that is relative to the course folder. */
  function assetURL(courseBase, src) {
    if (!src) return '';
    if (/^(https?:)?\/\//i.test(src) || src.slice(0, 5) === 'data:') return src;
    return courseBase.replace(/\/$/, '') + '/' + src.replace(/^\//, '');
  }

  GWMS.util = {
    el: el, append: append, clear: clear, $: $, $$: $$,
    inline: inline, announce: announce, slug: slug, uid: uid,
    isFileProtocol: isFileProtocol, assetURL: assetURL, seededShuffle: seededShuffle
  };
})();
