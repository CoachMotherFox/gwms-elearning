/* ==========================================================================
   GWMS eLearning Engine — app.js
   Boot, course loading, preferences, dialogs, keyboard support.
   ========================================================================== */
(function () {
  'use strict';

  var GWMS = window.GWMS = window.GWMS || {};
  var U = GWMS.util;
  var el = U.el, clear = U.clear, $ = U.$;

  var COURSES_ROOT = '../courses';
  var DEFAULT_COURSE = 'session-01';

  var state = {
    course: null,
    courseBase: '',
    progress: null,
    nav: null,
    issues: [],
    index: null,
    irfConfig: null
  };

  /* ======================================================================
     Loading

     A course is authored as plain course.json. That is the source of truth.

     Browsers block fetch() on file:// URLs, so double-clicking index.html
     would otherwise show an empty screen — unacceptable for an artifact that
     gets handed to a reviewer as a folder. The loader therefore has two paths:

       served over http(s) -> fetch course.json  (always current; no build step
                              while authoring)
       opened from file://  -> <script src="course.bundle.js">, a one-line
                              wrapper around the same JSON, produced by
                              tools/bundle.sh

     Nothing else in the engine knows or cares which path was used.
     ====================================================================== */

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Could not load ' + src)); };
      document.head.appendChild(s);
    });
  }

  function loadJSONWithFallback(jsonURL, bundleURL, readGlobal) {
    var cached = readGlobal();
    if (cached) return Promise.resolve(cached);

    if (!U.isFileProtocol()) {
      return fetch(jsonURL, { cache: 'no-cache' })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + jsonURL);
          return r.json();
        })
        .catch(function (fetchErr) {
          return loadScript(bundleURL)
            .then(function () {
              var data = readGlobal();
              if (!data) throw fetchErr;
              return data;
            })
            .catch(function () { throw fetchErr; });
        });
    }

    return loadScript(bundleURL).then(function () {
      var data = readGlobal();
      if (!data) throw new Error('Bundle loaded but contained no course data.');
      return data;
    });
  }

  function loadCourse(id) {
    var base = COURSES_ROOT + '/' + id;
    return loadJSONWithFallback(
      base + '/course.json',
      base + '/course.bundle.js',
      function () {
        return window.GWMS_COURSE_BUNDLE && window.GWMS_COURSE_BUNDLE[id];
      }
    );
  }

  function loadCourseIndex() {
    return loadJSONWithFallback(
      COURSES_ROOT + '/index.json',
      COURSES_ROOT + '/index.bundle.js',
      function () { return window.GWMS_COURSE_INDEX; }
    ).catch(function () { return null; });
  }

  /* ======================================================================
     Preferences
     ====================================================================== */

  function applyPrefs(prefs) {
    var root = document.documentElement;
    root.dataset.textSize = prefs.textSize;
    root.dataset.lineSpacing = prefs.lineSpacing;
    root.dataset.typeface = prefs.typeface;
    root.dataset.motion = prefs.motion;
    if (prefs.theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = prefs.theme;
  }

  function wirePrefs() {
    var prefs = GWMS.storage.loadPrefs();
    applyPrefs(prefs);

    U.$$('#dlg-prefs [data-pref]').forEach(function (group) {
      var key = group.dataset.pref;
      U.$$('input', group).forEach(function (input) {
        input.checked = (prefs[key] === input.value);
        input.addEventListener('change', function () {
          if (!input.checked) return;
          prefs[key] = input.value;
          GWMS.storage.savePrefs(prefs);
          applyPrefs(prefs);
          U.announce(group.getAttribute('aria-label') + ' set to ' + input.nextElementSibling.textContent + '.');
        });
      });
    });
  }

  /* ======================================================================
     Dialogs
     ====================================================================== */

  var lastFocus = null;

  function openDialog(dlg) {
    lastFocus = document.activeElement;
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');           // very old browsers: inline panel
    var firstBtn = dlg.querySelector('button, [href], input, textarea, select');
    if (firstBtn) firstBtn.focus();
  }

  function closeDialog(dlg) {
    if (typeof dlg.close === 'function' && dlg.open) dlg.close();
    else dlg.removeAttribute('open');
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  function wireDialogs() {
    U.$$('[data-close]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeDialog(document.getElementById(btn.dataset.close));
      });
    });
    U.$$('dialog').forEach(function (dlg) {
      // Clicking the backdrop closes the sheet.
      dlg.addEventListener('click', function (e) {
        if (e.target === dlg) closeDialog(dlg);
      });
      dlg.addEventListener('cancel', function () {
        if (lastFocus && document.contains(lastFocus)) setTimeout(function () { lastFocus.focus(); }, 0);
      });
    });
  }

  function showInfo(title, nodes) {
    var dlg = $('#dlg-info');
    $('#dlg-info-title').textContent = title;
    var body = clear($('#dlg-info-body'));
    U.append(body, nodes);
    if ($('#dlg-menu').open) closeDialog($('#dlg-menu'));
    openDialog(dlg);
  }

  /* ======================================================================
     Info panels: credits, data, accessibility check
     ====================================================================== */

  function creditsPanel() {
    var items = GWMS.validate.credits(state.course);
    if (!items.length) {
      return el('p', { text: 'This course does not yet reference any external assets.' });
    }
    return [
      el('p.sheet__intro', {
        text: 'Every asset used in this course and where it comes from. Original GWMS material is marked as such.'
      }),
      el('ul.info-list', {}, items.map(function (item) {
        var c = item.credit || {};
        return el('li', {}, [
          el('b', { text: item.where + ' — ' + item.kind }),
          el('span', { text: (c.holder || 'Unknown holder') + (c.title ? ' — “' + c.title + '”' : '') }),
          el('br'),
          el('span', { text: c.licence || 'Licence not recorded' }),
          c.url ? [el('br'), el('a', { href: c.url, target: '_blank', rel: 'noopener noreferrer', text: c.url })] : null
        ]);
      }))
    ];
  }

  function dataPanel() {
    var p = state.progress;
    var answered = Object.keys(p.answers).length;
    var sends = GWMS.irf.isConfigured();
    var cfg = GWMS.irf.describe();
    var pending = GWMS.irf.pendingCount();
    var sharesReflection = sends && state.irfConfig && state.irfConfig.includeReflection !== false;

    var clearWork = el('button.btn.btn--wide', { type: 'button', text: 'Erase my answers and start over' });
    clearWork.addEventListener('click', function () {
      GWMS.storage.clearProgress(state.course.id);
      state.progress = GWMS.storage.emptyProgress();
      U.announce('Your answers have been erased.');
      closeDialog($('#dlg-info'));
      startCourse(state.course, true);
    });

    var clearSettings = el('button.btn.btn--wide', { type: 'button', text: 'Reset display settings' });
    clearSettings.addEventListener('click', function () {
      GWMS.storage.clearPrefs();
      var d = GWMS.storage.loadPrefs();
      applyPrefs(d);
      U.$$('#dlg-prefs [data-pref] input').forEach(function (i) {
        i.checked = d[i.closest('[data-pref]').dataset.pref] === i.value;
      });
      U.announce('Display settings reset.');
    });

    var items = [];

    if (sends) {
      items.push(el('li', {}, [
        el('b', { text: 'What gets sent to the program' }),
        el('span', {
          text: 'When you press send on the last screen: which session it was, the time, your three answers about the session' +
            (sharesReflection ? ', and what you wrote for the session question' : '') + '.'
        })
      ]));
      items.push(el('li', {}, [
        el('b', { text: 'What does not get sent' }),
        el('span', {
          text: 'Your name. There is no login, no account, and nothing on this device that says who you are, so nothing sent can be traced back to you' +
            (cfg && cfg.participantCode ? ' beyond the code this site assigns.' : '.')
        })
      ]));
      items.push(el('li', {}, [
        el('b', { text: 'When it gets sent' }),
        el('span', { text: 'Only when you press send. Nothing goes anywhere while you are typing, and nothing on the earlier screens is sent at all.' })
      ]));
      if (pending) {
        items.push(el('li', {}, [
          el('b', { text: 'Waiting to send' }),
          el('span', { text: pending + ' set(s) of answers are still on this device because there was no connection. They send by themselves next time there is one.' })
        ]));
      }
    } else {
      items.push(el('li', {}, [
        el('b', { text: 'Your answers and writing' }),
        el('span', { text: 'Kept in this browser tab only (' + answered + ' check' + (answered === 1 ? '' : 's') + ' answered). They are erased when you close the tab, and they are not sent anywhere.' })
      ]));
    }

    items.push(el('li', {}, [
      el('b', { text: 'On this device' }),
      el('span', { text: 'Your place in the module and your answers sit in this browser tab and clear when it closes. Text size, theme and typeface are remembered so you do not have to set them again.' })
    ]));

    items.push(el('li', {}, [
      el('b', { text: 'Third parties' }),
      el('span', { text: hasEmbeds() ? 'This course embeds video from an outside host, which may see that the video was played.' : 'No trackers, no analytics, no third-party fonts or scripts.' })
    ]));

    return [
      el('p.sheet__intro', {
        text: sends
          ? 'There is no login and no account. The program collects what is below to find out whether the sessions are working — not to keep tabs on anybody.'
          : 'This course has no login, no server, and no analytics. Nothing you do here is sent anywhere.'
      }),
      el('ul.info-list', {}, items),
      el('div', { style: 'display:grid;gap:.5rem;margin-top:1.25rem' }, [clearWork, clearSettings])
    ];
  }

  function completionPanel() {
    var p = state.progress;
    var quizzes = [];
    state.course.scenes.forEach(function (s) {
      s.slides.forEach(function (sl) { if (sl.type === 'quiz') quizzes.push(sl); });
    });
    var answered = quizzes.filter(function (q) { return p.answers[q.id]; });
    var right = answered.filter(function (q) { return p.answers[q.id].correct; });
    // A reflection is a string for a single-prompt slide and a {fieldId: text}
    // object for a multi-field one like the IRF. Count either shape.
    var written = Object.keys(p.reflections).filter(function (k) {
      var v = p.reflections[k];
      if (typeof v === 'string') return v.trim();
      return v && Object.keys(v).some(function (f) { return (v[f] || '').trim(); });
    }).length;

    var backBtn = el('button.btn.btn--wide', { type: 'button', text: 'Back to contents' });
    backBtn.addEventListener('click', function () {
      closeDialog($('#dlg-info'));
      $('#btn-menu').click();
    });

    return [
      el('p.sheet__intro', { text: 'That is the end of the eLearning for this session.' }),
      el('div.tally', {}, [
        el('div', {}, [el('b', { text: right.length + '/' + quizzes.length }), el('span', { text: 'Checks correct' })]),
        el('div', {}, [el('b', { text: String(written) }), el('span', { text: 'Reflections' })]),
        el('div', {}, [el('b', { text: p.visited.length + '/' + state.nav.flat.length }), el('span', { text: 'Slides seen' })])
      ]),
      answered.length < quizzes.length
        ? el('div.issue.issue--warn', {}, el('span', {
            text: 'You still have ' + (quizzes.length - answered.length) + ' check' +
              (quizzes.length - answered.length === 1 ? '' : 's') + ' unanswered. Use Contents to go back to them.'
          }))
        : null,
      el('p', { text: 'The Instruction Rating Form is separate — hand this device back and complete the IRF before you leave.' }),
      el('div', { style: 'margin-top:1rem' }, backBtn)
    ];
  }

  function hasEmbeds() {
    return state.course.scenes.some(function (s) {
      return s.slides.some(function (sl) { return sl.video && sl.video.embed; });
    });
  }

  function checkPanel() {
    var issues = state.issues;
    var errors = issues.filter(function (i) { return i.level === 'error'; });
    var warns = issues.filter(function (i) { return i.level === 'warn'; });

    var nodes = [
      el('p.sheet__intro', { text: 'Runs automatically every time this course loads. It checks the things the AECT rubric scores: alt text on graphics, captions or transcripts on media, resolvable navigation, and more than one assessment strategy.' }),
      el('div.tally', {}, [
        el('div', {}, [el('b', { text: String(errors.length) }), el('span', { text: 'Errors' })]),
        el('div', {}, [el('b', { text: String(warns.length) }), el('span', { text: 'Warnings' })]),
        el('div', {}, [el('b', { text: String(state.nav.flat.length) }), el('span', { text: 'Slides' })])
      ])
    ];

    if (!issues.length) {
      nodes.push(el('div.issue.issue--warn', {}, el('span', { text: 'No content issues found.' })));
    } else {
      nodes.push(el('div', { style: 'display:grid;gap:.5rem' },
        errors.concat(warns).map(function (i) {
          return el('div', { class: 'issue issue--' + (i.level === 'error' ? 'error' : 'warn') }, [
            el('span', { text: i.message }),
            el('span.issue__where', { text: i.where + (i.wcag ? ' · ' + i.wcag : '') })
          ]);
        })));
    }

    // Contrast is measured live, against the theme and text size in use now.
    var c = GWMS.validate.contrast(document.getElementById('main'));
    nodes.push(el('h3', { style: 'margin-top:1.5rem', text: 'Colour contrast on this slide' }));
    nodes.push(el('p.sheet__intro', {
      text: c.checked + ' text/background pairing' + (c.checked === 1 ? '' : 's') +
        ' measured in the theme and text size you are using now. Lowest ratio: ' +
        (isFinite(c.lowest) ? c.lowest.toFixed(2) + ':1' : 'n/a') + '. WCAG AA needs 4.5:1 for body text, 3:1 for large text.'
    }));
    if (!c.fails.length) {
      nodes.push(el('div.issue.issue--warn', {}, el('span', { text: 'All pairings pass WCAG AA.' })));
    } else {
      nodes.push(el('div', { style: 'display:grid;gap:.5rem' }, c.fails.map(function (f) {
        return el('div.issue.issue--error', {}, [
          el('span', { text: '“' + f.sample + '” — ' + f.ratio.toFixed(2) + ':1, needs ' + f.need + ':1' }),
          el('span.issue__where', { text: f.size + 'px · WCAG 1.4.3' })
        ]);
      })));
    }
    return nodes;
  }

  function sessionsPanel(index) {
    return [
      el('p.sheet__intro', { text: 'Every course folder listed in courses/index.json.' }),
      el('ul.info-list', {}, (index.courses || []).map(function (c) {
        var here = c.id === state.course.id;
        return el('li', {}, [
          el('b', { text: c.title || c.id }),
          c.summary ? el('span', { text: c.summary }) : null,
          here
            ? el('span', { text: 'Open now.', style: 'color:var(--ink-muted)' })
            : el('a', { href: '?course=' + encodeURIComponent(c.id), text: 'Open this session' })
        ]);
      }))
    ];
  }

  /* ======================================================================
     Rendering a slide
     ====================================================================== */

  function refreshGate() {
    var entry = state.nav.current();
    if (!entry) return;
    var slide = entry.slide;
    var gate = $('#slide-gate');
    var nextBtn = $('#btn-next');

    var required = slide.required === true;
    var blocked = required && !GWMS.slides.isComplete(slide, state.progress);
    var atEnd = !state.nav.hasNext();

    nextBtn.disabled = blocked;
    nextBtn.dataset.role = atEnd ? 'finish' : 'next';
    nextBtn.textContent = '';
    U.append(nextBtn, atEnd
      ? ['Finish']
      : ['Next ', el('span', { 'aria-hidden': 'true', text: '→' })]);

    if (blocked) {
      gate.hidden = false;
      gate.textContent = GWMS.slides.gateMessage(slide, state.progress);
      nextBtn.setAttribute('aria-describedby', 'slide-gate');
    } else {
      gate.hidden = true;
      gate.textContent = '';
      nextBtn.removeAttribute('aria-describedby');
    }

    $('#btn-prev').disabled = !state.nav.hasPrev();
  }

  /* The one place a payload is assembled. Everything in it is either session
     metadata or something the learner typed on this module. No identifiers. */
  function buildIrfPayload(slide, areas) {
    var m = state.course.meta || {};
    var answers = {};
    areas.forEach(function (a) { answers[a.id] = a.el.value.trim(); });

    var payload = {
      courseId: state.course.id,
      session: m.session || null,
      stage: m.stage || null,
      week: m.week || null,
      theme: m.theme || null,
      submittedAt: new Date().toISOString(),
      answers: answers
    };

    var cfg = GWMS.irf.describe();
    if (cfg && state.irfConfig && state.irfConfig.includeReflection !== false && slide.reflectionFrom) {
      var raw = state.progress.reflections[slide.reflectionFrom];
      var text = (typeof raw === 'string') ? raw : (raw && raw.main) || '';
      payload.probingQuestion = m.probingQuestion || null;
      payload.reflection = text.trim();
    }
    if (state.irfConfig && state.irfConfig.participantCode) {
      payload.participantCode = state.irfConfig.participantCode;
    }
    return payload;
  }

  function paintSlide(entry, meta) {
    var ctx = {
      course: state.course,
      courseBase: state.courseBase,
      scene: entry.scene,
      progress: state.progress,
      nav: state.nav,
      save: function () { GWMS.storage.saveProgress(state.course.id, state.progress); },
      refreshGate: refreshGate,
      buildIrfPayload: buildIrfPayload
    };

    var host = $('#slide-root');
    var fresh = GWMS.slides.render(entry.slide, ctx);
    host.parentNode.replaceChild(fresh, host);
    fresh.id = 'slide-root';

    // Progress
    var pct = state.nav.progressPercent();
    var bar = $('#progress');
    bar.setAttribute('aria-valuenow', String(pct));
    bar.setAttribute('aria-valuetext', state.nav.statusText());
    $('#progress-fill').style.width = pct + '%';
    $('#slide-status').textContent = state.nav.statusText();

    refreshGate();
    ctx.save();

    // Focus + scroll. Focusing the heading is what makes keyboard and screen
    // reader users land in the new content instead of at the top of the page.
    var heading = fresh.querySelector('.slide__title');
    if (heading) heading.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: (meta && meta.silent) ? 'auto' : 'smooth' });

    U.announce(state.nav.announceText());
  }

  /* ======================================================================
     Keyboard
     ====================================================================== */

  function wireKeyboard() {
    document.addEventListener('keydown', function (e) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector('dialog[open]')) return;

      var t = e.target;
      var tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
      // Let native controls keep their own arrow-key behaviour.
      if (tag === 'VIDEO' || tag === 'AUDIO' || tag === 'IFRAME') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (!$('#btn-next').disabled) { e.preventDefault(); $('#btn-next').click(); }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (!$('#btn-prev').disabled) { e.preventDefault(); $('#btn-prev').click(); }
      }
    });
  }

  /* ======================================================================
     Boot
     ====================================================================== */

  function startCourse(course, resetToStart) {
    state.course = course;
    state.progress = resetToStart ? GWMS.storage.emptyProgress() : GWMS.storage.loadProgress(course.id);

    state.issues = GWMS.validate.course(course);
    reportIssues(state.issues, course);

    state.nav = GWMS.navigation.create(course, state.progress, {
      onChange: function (entry, meta) {
        paintSlide(entry, meta);
        if ($('#dlg-menu').open) closeDialog($('#dlg-menu'));
      }
    });

    // Header
    var meta = course.meta || {};
    $('#course-eyebrow').textContent = [meta.stage || meta.neighborhood, meta.week ? 'Week ' + meta.week : null, meta.theme]
      .filter(Boolean).join(' · ');
    $('#course-title').textContent = course.title || course.id;
    document.title = (course.title || course.id) + ' — GWMS';
    if (course.lang) document.documentElement.lang = course.lang;

    var startId = (!resetToStart && state.progress.current && state.nav.get(state.progress.current))
      ? state.progress.current
      : state.nav.first().slide.id;

    state.nav.goTo(startId, { push: false });
    document.body.classList.remove('is-booting');
  }

  function reportIssues(issues, course) {
    if (!issues.length) return;
    var errs = issues.filter(function (i) { return i.level === 'error'; });
    var label = '[GWMS] "' + (course.title || course.id) + '": ' +
      errs.length + ' error(s), ' + (issues.length - errs.length) + ' warning(s). ' +
      'Open Contents → Accessibility check for detail.';
    if (errs.length) console.error(label); else console.warn(label);
    if (console.table) {
      console.table(issues.map(function (i) {
        return { level: i.level, where: i.where, wcag: i.wcag || '', message: i.message };
      }));
    }
  }

  function fatal(courseId, err) {
    document.body.classList.remove('is-booting');
    $('#course-title').textContent = 'Could not load the course';
    var host = $('#slide-root');
    clear(host);
    U.append(host, el('div.fatal', {}, [
      el('h1.slide__title', { tabindex: '-1', text: 'This course did not load' }),
      el('p', { text: 'The engine looked for the course folder "' + courseId + '" and could not read it.' }),
      el('pre', { text: String(err && err.message || err) }),
      U.isFileProtocol()
        ? el('div.callout', {}, [
            el('span.callout__label', { text: 'Opened from a file' }),
            el('p', { text: 'You opened index.html directly. That works when the course has a bundled copy (course.bundle.js). Either run tools/bundle.sh once, or serve the project folder:' }),
            el('pre', { text: 'cd "' + 'path/to/project' + '"\npython3 -m http.server 8000\n# then open http://localhost:8000/engine/' })
          ])
        : el('div.callout', {}, [
            el('span.callout__label', { text: 'Check the path' }),
            el('p', { text: 'Expected to find courses/' + courseId + '/course.json relative to the project root.' })
          ])
    ]));
    var h = host.querySelector('h1');
    if (h) h.focus();
  }

  function boot() {
    wirePrefs();
    wireDialogs();
    wireKeyboard();

    var params = new URLSearchParams(window.location.search);
    var courseId = params.get('course') || DEFAULT_COURSE;
    state.courseBase = COURSES_ROOT + '/' + courseId;

    $('#btn-menu').addEventListener('click', function () {
      GWMS.navigation.renderMenu($('#menu-scenes'), state.course, state.nav, state.progress, function (id) {
        state.nav.goTo(id, { push: true });
      });
      openDialog($('#dlg-menu'));
    });
    $('#btn-prefs').addEventListener('click', function () { openDialog($('#dlg-prefs')); });
    $('#btn-next').addEventListener('click', function (e) {
      if (e.currentTarget.dataset.role === 'finish') showInfo('You’ve reached the end', completionPanel());
      else state.nav.next();
    });
    $('#btn-prev').addEventListener('click', function () { state.nav.prev(); });
    $('#btn-credits').addEventListener('click', function () { showInfo('Credits and licences', creditsPanel()); });
    $('#btn-privacy').addEventListener('click', function () { showInfo('Your data', dataPanel()); });
    $('#btn-check').addEventListener('click', function () { showInfo('Accessibility check', checkPanel()); });

    // The index carries the IRF destination, so it loads first. A missing or
    // unreadable index is not fatal: the module still runs, and the IRF falls
    // back to staying on the device.
    loadCourseIndex()
      .then(function (index) {
        state.index = index;
        state.irfConfig = (index && index.irf) || null;
        GWMS.irf.configure(state.irfConfig);
        if (GWMS.irf.isConfigured()) GWMS.irf.flush();
        return loadCourse(courseId);
      })
      .then(function (course) {
        startCourse(course, false);
        var index = state.index;
        if (index && index.courses && index.courses.length >= 2) {
          var btn = el('button.linkbtn', { type: 'button', text: 'All sessions' });
          btn.addEventListener('click', function () { showInfo('All sessions', sessionsPanel(index)); });
          $('#dlg-menu .sheet__foot').appendChild(btn);
        }
      })
      .catch(function (err) { fatal(courseId, err); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
