/* ==========================================================================
   GWMS eLearning Engine — storage.js

   Deliberate ethical position (AECT required element: ethical use of ed tech):
   nothing leaves the device. There is no backend, no account, no analytics
   beacon, no third-party script.

     - Learner work (answers, reflections, visited slides) -> sessionStorage.
       It is wiped when the browser tab closes. A shared training-site tablet
       therefore does not hand one boy's reflection to the next boy who picks
       it up.
     - Display preferences (text size, theme, typeface) -> localStorage, so an
       accessibility setting does not have to be re-entered every session.
       These are settings, not disclosures.

   Both are inspectable and erasable by the learner from the "Your data" panel.
   ========================================================================== */
(function () {
  'use strict';

  var GWMS = window.GWMS = window.GWMS || {};

  var PROGRESS_PREFIX = 'gwms.progress.';
  var PREFS_KEY = 'gwms.prefs';

  /** Storage may be unavailable (private mode, disabled cookies). Degrade to memory. */
  function safeStore(kind) {
    try {
      var s = window[kind];
      var probe = '__gwms_probe__';
      s.setItem(probe, '1');
      s.removeItem(probe);
      return s;
    } catch (e) {
      var mem = {};
      return {
        getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
        setItem: function (k, v) { mem[k] = String(v); },
        removeItem: function (k) { delete mem[k]; },
        key: function (i) { return Object.keys(mem)[i] || null; },
        get length() { return Object.keys(mem).length; },
        __memory: true
      };
    }
  }

  var session = safeStore('sessionStorage');
  var local = safeStore('localStorage');

  function readJSON(store, key, fallback) {
    try {
      var raw = store.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function writeJSON(store, key, value) {
    try { store.setItem(key, JSON.stringify(value)); } catch (e) { /* quota or blocked */ }
  }

  /* ---------- Progress (per course, per tab session) ---------- */

  function emptyProgress() {
    return {
      visited: [],      // slide ids seen, in first-visit order
      answers: {},      // slideId -> { selected:[], correct:bool, attempts:int }
      reflections: {},  // slideId -> text
      choices: {},      // slideId -> chosen branch option id
      reveals: {},      // slideId -> [interaction ids opened]
      current: null     // slide id
    };
  }

  function loadProgress(courseId) {
    var p = readJSON(session, PROGRESS_PREFIX + courseId, null);
    if (!p) return emptyProgress();
    var base = emptyProgress();
    Object.keys(base).forEach(function (k) { if (!(k in p)) p[k] = base[k]; });
    return p;
  }

  function saveProgress(courseId, progress) {
    writeJSON(session, PROGRESS_PREFIX + courseId, progress);
  }

  function clearProgress(courseId) {
    try { session.removeItem(PROGRESS_PREFIX + courseId); } catch (e) { /* noop */ }
  }

  /* ---------- Preferences (persistent, device-local) ---------- */

  var DEFAULT_PREFS = {
    textSize: 'normal',
    lineSpacing: 'normal',
    typeface: 'default',
    theme: 'system',
    motion: 'system'
  };

  function loadPrefs() {
    var stored = readJSON(local, PREFS_KEY, {});
    var out = {};
    Object.keys(DEFAULT_PREFS).forEach(function (k) {
      out[k] = (stored && typeof stored[k] === 'string') ? stored[k] : DEFAULT_PREFS[k];
    });
    return out;
  }

  function savePrefs(prefs) { writeJSON(local, PREFS_KEY, prefs); }

  function clearPrefs() {
    try { local.removeItem(PREFS_KEY); } catch (e) { /* noop */ }
  }

  GWMS.storage = {
    loadProgress: loadProgress,
    saveProgress: saveProgress,
    clearProgress: clearProgress,
    emptyProgress: emptyProgress,
    loadPrefs: loadPrefs,
    savePrefs: savePrefs,
    clearPrefs: clearPrefs,
    defaults: DEFAULT_PREFS,
    isEphemeral: !!session.__memory
  };
})();
