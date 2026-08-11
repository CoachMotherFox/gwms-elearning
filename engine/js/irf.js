/* ==========================================================================
   GWMS eLearning Engine — irf.js

   Sends Instruction Rating Form responses somewhere they can be counted.

   Unit 4 of the curriculum guide: "The IRF is the last screen of the module.
   No student leaves before completing it… IRF responses log through a Google
   Form backend or basic LMS."

   What travels:
     - which session it was, and when
     - the three IRF answers, which are about the session
     - the reflection on the probing question, when includeReflection is on
       (it is, by default — program decision, see docs/IRF-BACKEND.md)
     - an optional site-assigned code, off unless a site turns it on

   What never travels:
     - names, device ids, IP-linked identifiers, anything derived from them.
       There is no account and nothing that ties two sessions to one boy.

   Everything is sent from one place, the IRF screen, on one deliberate press.
   Nothing is shipped quietly while a participant is still typing, and the
   screen says plainly what is about to leave. If the copy on that screen and
   the contents of this payload ever disagree, the copy is the bug.

   Two transports, because sites differ:
     googleForm  — POST straight at a Form's formResponse endpoint. No server
                   to run, and the Form already writes to a Sheet. The browser
                   gets an opaque response back, so delivery is best-effort and
                   cannot be confirmed.
     appsScript  — POST JSON at an Apps Script Web App bound to a Sheet. Needs
                   a five-minute deploy, and in exchange it confirms delivery
                   and gives you real columns.

   Anything that fails to send is queued in localStorage and retried on the
   next load, because the training site's wifi is not a given and a lost IRF
   is a lost session record.
   ========================================================================== */
(function () {
  'use strict';

  var GWMS = window.GWMS = window.GWMS || {};

  var OUTBOX_KEY = 'gwms.irf.outbox';
  var MAX_OUTBOX = 200;
  var TIMEOUT_MS = 12000;

  var config = null;

  function configure(cfg) {
    config = (cfg && cfg.transport && cfg.transport !== 'none') ? cfg : null;
  }

  function isConfigured() { return !!config; }

  /* ---------- outbox ---------- */

  function readOutbox() {
    try {
      var raw = window.localStorage.getItem(OUTBOX_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }

  function writeOutbox(list) {
    try {
      window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(list.slice(-MAX_OUTBOX)));
    } catch (e) { /* storage blocked or full; the send already happened or failed */ }
  }

  function enqueue(payload) {
    var list = readOutbox();
    list.push(payload);
    writeOutbox(list);
  }

  function pendingCount() { return readOutbox().length; }

  /* ---------- transports ---------- */

  function withTimeout(promise) {
    return new Promise(function (resolve, reject) {
      var done = false;
      var timer = setTimeout(function () {
        if (!done) { done = true; reject(new Error('Timed out')); }
      }, TIMEOUT_MS);
      promise.then(function (v) {
        if (!done) { done = true; clearTimeout(timer); resolve(v); }
      }, function (e) {
        if (!done) { done = true; clearTimeout(timer); reject(e); }
      });
    });
  }

  /**
   * Google Form. The field ids look like "entry.1234567890" and are read off
   * the live form — see docs/IRF-BACKEND.md.
   * no-cors means we never see the status. Resolving here means "handed to the
   * network", not "landed in the Sheet".
   */
  function sendGoogleForm(payload) {
    var map = config.fields || {};
    var body = new URLSearchParams();

    Object.keys(payload.answers).forEach(function (k) {
      if (map[k]) body.append(map[k], payload.answers[k]);
    });
    if (map.session) body.append(map.session, String(payload.session));
    if (map.submittedAt) body.append(map.submittedAt, payload.submittedAt);
    if (map.probingQuestion && payload.probingQuestion) {
      body.append(map.probingQuestion, payload.probingQuestion);
    }
    if (map.reflection && payload.reflection) {
      body.append(map.reflection, payload.reflection);
    }
    if (map.participantCode && payload.participantCode) {
      body.append(map.participantCode, payload.participantCode);
    }

    return withTimeout(fetch(config.url, {
      method: 'POST',
      mode: 'no-cors',
      body: body
    })).then(function () { return { confirmed: false }; });
  }

  /**
   * Apps Script Web App. text/plain dodges the CORS preflight, which Apps
   * Script does not answer. The script reads the raw body as JSON.
   */
  function sendAppsScript(payload) {
    return withTimeout(fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json().catch(function () { return { ok: true }; });
    }).then(function (data) {
      if (data && data.ok === false) throw new Error(data.error || 'Rejected by the sheet');
      return { confirmed: true };
    }));
  }

  function transport(payload) {
    if (!config) return Promise.reject(new Error('No IRF transport configured'));
    if (config.transport === 'googleForm') return sendGoogleForm(payload);
    if (config.transport === 'appsScript') return sendAppsScript(payload);
    return Promise.reject(new Error('Unknown IRF transport "' + config.transport + '"'));
  }

  /* ---------- public ---------- */

  /**
   * submit(payload) -> Promise<{status}>
   *   'sent'      delivered, and the transport confirmed it
   *   'handed'    handed to the network, delivery not confirmable (Google Form)
   *   'queued'    could not send; stored and will retry on the next load
   *   'local'     no transport configured; nothing left the device
   */
  function submit(payload) {
    if (!config) return Promise.resolve({ status: 'local' });
    // A Web App deployed to "Anyone" is an open endpoint. A shared token keeps
    // a stray scraper from writing rows into the sheet. It is not a secret in
    // any real sense — it ships in the page — it just raises the floor.
    if (config.token) payload.token = config.token;

    return transport(payload).then(function (res) {
      return { status: res.confirmed ? 'sent' : 'handed' };
    }).catch(function (err) {
      enqueue(payload);
      console.warn('[GWMS] IRF send failed, queued for retry:', err.message);
      return { status: 'queued', error: err.message };
    });
  }

  /** Retry everything sitting in the outbox. Called once on boot. */
  function flush() {
    if (!config) return Promise.resolve({ sent: 0, remaining: pendingCount() });

    var list = readOutbox();
    if (!list.length) return Promise.resolve({ sent: 0, remaining: 0 });

    var remaining = [];
    var sent = 0;

    return list.reduce(function (chain, payload) {
      return chain.then(function () {
        return transport(payload).then(function () { sent += 1; })
          .catch(function () { remaining.push(payload); });
      });
    }, Promise.resolve()).then(function () {
      writeOutbox(remaining);
      if (sent) console.info('[GWMS] Sent ' + sent + ' queued IRF response(s).');
      return { sent: sent, remaining: remaining.length };
    });
  }

  function clearOutbox() { writeOutbox([]); }

  GWMS.irf = {
    configure: configure,
    isConfigured: isConfigured,
    submit: submit,
    flush: flush,
    pendingCount: pendingCount,
    clearOutbox: clearOutbox,
    describe: function () {
      if (!config) return null;
      return { transport: config.transport, url: config.url, participantCode: !!config.participantCode };
    }
  };
})();
