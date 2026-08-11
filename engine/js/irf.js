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

  /* Apps Script is slow when cold — a first request of the evening routinely
     takes 10-20s before the container is warm, and it redirects once more on
     top of that. A short timeout here does not fail fast, it invents failures
     and queues duplicates of rows that actually landed. */
  var TIMEOUT_MS = 45000;

  var config = null;

  /* One request at a time.
     Apps Script answers a POST with a 302 to a single-use echo URL. Two
     requests in flight — the boot-time flush and a learner pressing send —
     race on those keys and one comes back 404. Everything therefore queues
     behind this chain. */
  var chain = Promise.resolve();
  function serial(fn) {
    var run = chain.then(fn, fn);
    chain = run.then(function () {}, function () {});
    return run;
  }

  /* Stable per submission, generated once and carried through every retry, so
     the sheet can drop a duplicate if a row lands and the reply is lost. */
  function submissionId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return 'sub-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e9).toString(36);
  }

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

  /**
   * Give the caller an AbortSignal and a matching timeout.
   *
   * The signal matters more than the timeout. Racing a promise against a timer
   * leaves the request running: it can still succeed after we have given up,
   * writing a row, while the outbox queues the same response for a retry that
   * writes it a second time. Aborting means "queued" is the truth — the
   * request is genuinely dead and the only copy is the one on this device.
   */
  function runWithTimeout(fn) {
    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timedOut = false;
    var timer = setTimeout(function () {
      timedOut = true;
      if (controller) controller.abort();
    }, TIMEOUT_MS);

    return fn(controller ? controller.signal : undefined)
      .then(function (v) { clearTimeout(timer); return v; })
      .catch(function (e) {
        clearTimeout(timer);
        throw timedOut ? new Error('Timed out after ' + Math.round(TIMEOUT_MS / 1000) + 's') : e;
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
    if (map.submissionId && payload.submissionId) {
      body.append(map.submissionId, payload.submissionId);
    }

    return runWithTimeout(function (signal) {
      return fetch(config.url, { method: 'POST', mode: 'no-cors', body: body, signal: signal });
    }).then(function () { return { confirmed: false }; });
  }

  /**
   * Apps Script Web App. text/plain dodges the CORS preflight, which Apps
   * Script does not answer. The script reads the raw body as JSON.
   */
  function sendAppsScript(payload) {
    return runWithTimeout(function (signal) {
      return fetch(config.url, {
        method: 'POST',
        // text/plain dodges the CORS preflight, which Apps Script does not answer.
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: signal
      });
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).then(function (text) {
      var data;
      try { data = JSON.parse(text); } catch (e) {
        // Apps Script serves an HTML sign-in page when the deployment is not
        // set to "Anyone". Say that, rather than "invalid JSON".
        throw new Error(/<!DOCTYPE|<html/i.test(text)
          ? 'Got a sign-in page instead of a result — set the Web App deployment access to "Anyone"'
          : 'Unexpected reply from the sheet');
      }
      if (data && data.ok === false) throw new Error(data.error || 'Rejected by the sheet');
      return { confirmed: true };
    });
  }

  function transport(payload) {
    if (!config) return Promise.reject(new Error('No IRF transport configured'));
    return serial(function () {
      if (config.transport === 'googleForm') return sendGoogleForm(payload);
      if (config.transport === 'appsScript') return sendAppsScript(payload);
      return Promise.reject(new Error('Unknown IRF transport "' + config.transport + '"'));
    });
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
    if (!payload.submissionId) payload.submissionId = submissionId();

    return attempt(payload, 3).then(function (res) {
      return { status: res.confirmed ? 'sent' : 'handed' };
    }).catch(function (err) {
      enqueue(payload);
      console.warn('[GWMS] IRF send failed, queued for retry:', err.message);
      return { status: 'queued', error: err.message };
    });
  }

  function delay(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  /**
   * Apps Script's redirect target intermittently 404s on a cold container.
   * That is a lost reply, not a failed write: the 302 is only issued after
   * doPost has run, so the row has very probably landed already. Retrying is
   * therefore both the right move and a duplicate risk — which is why
   * submissionId is stable across attempts and the sheet drops repeats.
   * Without that dedupe in the deployed script, prefer one attempt.
   */
  function attempt(payload, tries) {
    return transport(payload).catch(function (err) {
      if (tries <= 1) throw err;
      console.warn('[GWMS] IRF attempt failed (' + err.message + '), retrying…');
      return delay(tries === 3 ? 1500 : 4000).then(function () {
        return attempt(payload, tries - 1);
      });
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
