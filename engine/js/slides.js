/* ==========================================================================
   GWMS eLearning Engine — slides.js

   Slide type registry + shared block renderer.

   Structure of a rendered slide (every type shares this skeleton):

     header        eyebrow + <h1>              — focus target on slide change
     altbar        "Take this in another way"  — differentiation control
     body region   swappable: read / listen / watch
     interactive   type-specific (quiz, branch, reflection)
     interactions  reveals attached to the slide

   Adding a slide type = adding one entry to TYPES. Nothing else in the engine
   needs to know the type exists.
   ========================================================================== */
(function () {
  'use strict';

  var GWMS = window.GWMS = window.GWMS || {};
  var U = GWMS.util;
  var el = U.el, clear = U.clear, uid = U.uid;

  /* ======================================================================
     Block renderer — the shared content vocabulary
     ====================================================================== */

  function renderBlocks(blocks, ctx) {
    var frag = document.createDocumentFragment();
    (blocks || []).forEach(function (b) {
      var node = renderBlock(b, ctx);
      if (node) frag.appendChild(node);
    });
    return frag;
  }

  function renderBlock(b, ctx) {
    if (typeof b === 'string') return el('p', {}, U.inline(b));
    if (!b || !b.kind) return null;

    switch (b.kind) {
      case 'paragraph':
        return el('p', {}, U.inline(b.text || ''));

      case 'lead':
        return el('p.block-lead', {}, U.inline(b.text || ''));

      case 'heading':
        return el(b.level === 3 ? 'h3' : 'h2', {}, U.inline(b.text || ''));

      case 'list':
        return el(b.ordered ? 'ol.block-list' : 'ul.block-list', {},
          (b.items || []).map(function (item) { return el('li', {}, U.inline(item)); }));

      case 'quote':
        return el('blockquote.block-quote', {}, [
          el('p', {}, U.inline(b.text || '')),
          b.attribution ? el('cite', { text: b.attribution }) : null
        ]);

      case 'callout':
        return el('div.callout', {}, [
          b.label ? el('span.callout__label', { text: b.label }) : null,
          renderBlocks(b.content || [{ kind: 'paragraph', text: b.text || '' }], ctx)
        ]);

      case 'image':
        return renderFigure(b, ctx);

      default:
        return el('p', {}, U.inline(b.text || ''));
    }
  }

  function renderFigure(img, ctx) {
    var decorative = img.decorative === true || (img.alt === '' && img.decorative);
    var image = el('img', {
      src: U.assetURL(ctx.courseBase, img.src),
      alt: decorative ? '' : (img.alt || ''),
      loading: 'lazy',
      decoding: 'async',
      width: img.width || null,
      height: img.height || null
    });
    if (decorative) image.setAttribute('role', 'presentation');

    return el('figure.figure', {}, [
      el('div.figure__frame', {}, image),
      img.caption ? el('figcaption', {}, U.inline(img.caption)) : null,
      creditLine(img)
    ]);
  }

  /** Copyright / Creative Commons notice rendered next to any non-original asset. */
  function creditLine(asset) {
    if (!asset || !asset.credit) return null;
    var c = asset.credit;
    var bits = [el('b', { text: 'Credit: ' })];
    bits.push(document.createTextNode(c.holder || 'Unknown'));
    if (c.title) bits.push(document.createTextNode(' — “' + c.title + '”'));
    if (c.license) bits.push(document.createTextNode(' · ' + c.license));
    if (c.url) {
      bits.push(document.createTextNode(' · '));
      bits.push(el('a', { href: c.url, rel: 'noopener noreferrer', target: '_blank', text: 'source' }));
    }
    return el('p.credit', {}, bits);
  }

  /* ======================================================================
     Alternate representations — differentiation by learner characteristic
     ====================================================================== */

  function renderAltbar(slide, ctx, onChange) {
    var alts = slide.alternates || [];
    if (!alts.length) return null;

    var name = uid('alt');
    var opts = [{ mode: 'read', label: slide.readLabel || 'Read' }].concat(alts);

    return el('div.altbar', {}, [
      el('p.altbar__label', { id: name + '-label', text: 'Take this in' }),
      el('div.altbar__opts', { role: 'radiogroup', 'aria-labelledby': name + '-label' },
        opts.map(function (o, i) {
          var id = name + '-' + i;
          return el('label', {}, [
            el('input', {
              type: 'radio', name: name, id: id, value: o.mode,
              checked: i === 0,
              onchange: function () { onChange(o); }
            }),
            el('span', { text: o.label || o.mode })
          ]);
        }))
    ]);
  }

  function renderAlternateMedia(alt, slide, ctx) {
    var wrap = el('div.alt-media');

    if (alt.mode === 'audio') {
      var audio = el('audio', {
        controls: true,
        preload: 'none',
        src: U.assetURL(ctx.courseBase, alt.src),
        'aria-label': alt.label || 'Audio version of this slide'
      });
      audio.addEventListener('error', function () {
        var msg = el('p.media-error', {
          text: 'This audio has not been recorded yet. The written version below has the same content.'
        });
        if (audio.parentNode) audio.parentNode.replaceChild(msg, audio);
      });
      wrap.appendChild(audio);
      U.append(wrap, creditLine(alt));
      wrap.appendChild(el('p.media-note', {
        text: alt.transcriptIsBody
          ? 'Transcript — this is the same wording as the audio.'
          : 'Transcript below.'
      }));
      if (alt.transcript) {
        wrap.appendChild(renderBlocks(alt.transcript, ctx));
      }
      return wrap;
    }

    if (alt.mode === 'video') {
      wrap.appendChild(renderVideoPlayer(alt, ctx));
      U.append(wrap, creditLine(alt));
      if (alt.transcript) wrap.appendChild(renderTranscript(alt.transcript, ctx));
      return wrap;
    }

    wrap.appendChild(el('p.media-error', { text: 'Unsupported alternate format.' }));
    return wrap;
  }

  /* ======================================================================
     Video
     ====================================================================== */

  function renderVideoPlayer(v, ctx) {
    if (v.embed) {
      var src = v.embed;
      // Keep hosted players from writing tracking cookies where they support it.
      if (/youtube\.com|youtu\.be/.test(src)) src = src.replace('youtube.com', 'youtube-nocookie.com');
      return el('div.videowrap.videowrap--embed', {},
        el('iframe', {
          src: src,
          title: v.title || 'Embedded video',
          allow: 'accelerometer; clipboard-write; encrypted-media; picture-in-picture',
          referrerpolicy: 'strict-origin-when-cross-origin',
          allowfullscreen: true,
          loading: 'lazy'
        }));
    }

    var video = el('video', {
      controls: true,
      preload: 'metadata',
      playsinline: true,
      poster: v.poster ? U.assetURL(ctx.courseBase, v.poster.src) : null
    }, [
      el('source', { src: U.assetURL(ctx.courseBase, v.src), type: v.mime || 'video/mp4' }),
      v.captions ? el('track', {
        kind: 'captions',
        src: U.assetURL(ctx.courseBase, v.captions),
        srclang: v.captionsLang || 'en',
        label: v.captionsLabel || 'English captions',
        default: true
      }) : null
    ]);
    video.addEventListener('error', function () {
      var msg = el('p.media-error', { text: 'This video file could not be loaded. Use the transcript below.' });
      if (video.parentNode) video.parentNode.replaceChild(msg, video);
    }, true);

    return el('div.videowrap', {}, video);
  }

  function renderTranscript(transcript, ctx) {
    var panelId = uid('transcript');
    var btn = el('button.reveal__btn', {
      type: 'button', 'aria-expanded': 'false', 'aria-controls': panelId
    }, [
      el('span.reveal__marker', { 'aria-hidden': 'true', text: '+' }),
      el('span', { text: 'Transcript' })
    ]);
    var panel = el('div.reveal__panel', { id: panelId, hidden: true }, renderBlocks(transcript, ctx));
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
    return el('div.reveal', {}, [btn, panel]);
  }

  /* ======================================================================
     Reveals (click-to-reveal interactions)
     ====================================================================== */

  function renderReveals(slide, ctx) {
    var list = (slide.reveals || []).concat(slide.interactions || []);
    if (!list.length) return null;

    var wrap = el('div.reveals');
    var opened = ctx.progress.reveals[slide.id] || [];

    list.forEach(function (ix, i) {
      var ixId = ix.id || (slide.id + ':ix' + i);
      var panelId = uid('panel');
      var isOpen = opened.indexOf(ixId) !== -1;

      var done = el('span.reveal__done', { text: 'Opened', hidden: !isOpen });
      var btn = el('button.reveal__btn', {
        type: 'button',
        'aria-expanded': String(isOpen),
        'aria-controls': panelId
      }, [
        el('span.reveal__marker', { 'aria-hidden': 'true', text: '+' }),
        el('span', {}, U.inline(ix.label || 'Reveal')),
        done
      ]);

      var panel = el('div.reveal__panel', { id: panelId, hidden: !isOpen },
        renderBlocks(ix.content || [], ctx));

      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        panel.hidden = open;
        if (!open) {
          done.hidden = false;
          var seen = ctx.progress.reveals[slide.id] || [];
          if (seen.indexOf(ixId) === -1) seen.push(ixId);
          ctx.progress.reveals[slide.id] = seen;
          ctx.save();
          ctx.refreshGate();
          U.announce((ix.label || 'Section') + ' expanded.');
        }
      });

      wrap.appendChild(el('div.reveal', {}, [btn, panel]));
    });

    return wrap;
  }

  function revealsComplete(slide, progress) {
    var list = (slide.reveals || []).concat(slide.interactions || []);
    if (!list.length) return true;
    var opened = progress.reveals[slide.id] || [];
    return list.every(function (ix, i) {
      return opened.indexOf(ix.id || (slide.id + ':ix' + i)) !== -1;
    });
  }

  /* ======================================================================
     Slide types
     ====================================================================== */

  var TYPES = {};

  /* ---- text/image ---- */
  TYPES['text-image'] = {
    label: 'Content',
    body: function (slide, ctx) {
      var frag = document.createDocumentFragment();
      if (slide.image && slide.imagePosition !== 'after') frag.appendChild(renderFigure(slide.image, ctx));
      frag.appendChild(renderBlocks(slide.body, ctx));
      if (slide.image && slide.imagePosition === 'after') frag.appendChild(renderFigure(slide.image, ctx));
      return frag;
    },
    isComplete: function (slide, progress) { return revealsComplete(slide, progress); }
  };

  /* ---- reveal (a slide built around click-to-reveal) ---- */
  TYPES.reveal = {
    label: 'Explore',
    body: TYPES['text-image'].body,
    isComplete: function (slide, progress) { return revealsComplete(slide, progress); }
  };

  /* ---- video ---- */
  TYPES.video = {
    label: 'Video',
    body: function (slide, ctx) {
      var v = slide.video || {};
      var frag = document.createDocumentFragment();
      frag.appendChild(renderVideoPlayer(v, ctx));
      var cl = creditLine(v);
      if (cl) frag.appendChild(cl);
      if (v.embed && !v.captionsProvided) {
        frag.appendChild(el('p.media-note', {
          text: 'Captions are provided by the host player. Turn them on with the CC button.'
        }));
      }
      if (v.transcript) frag.appendChild(renderTranscript(v.transcript, ctx));
      frag.appendChild(renderBlocks(slide.body, ctx));
      return frag;
    },
    isComplete: function (slide, progress) { return revealsComplete(slide, progress); }
  };

  /* ---- shared by quiz, order and match ----
     One check per session, three ways to answer it. Attempts, the retry
     rule, the bridge, the feedback box, the saved answer, and the gate are
     the same for all three, so they live here. settleCheck returns
     revealAnswer: true once the answer is settled (right, no retry, or out
     of tries), which is when the caller shows the correct answer on its own
     controls. ---------------------------------------------------------- */
  function settleCheck(slide, ctx, host, o) {
    var attempts = ((ctx.progress.answers[slide.id] || {}).attempts || 0) +
      (o.state === 'restore' ? 0 : 1);
    var maxAttempts = slide.maxAttempts || 2;

    // Giving the answer away on the first wrong attempt makes "Try again"
    // pointless. Hold the correct answer back until they get it or run out
    // of attempts.
    var revealAnswer = o.isCorrect || slide.retry === false || attempts >= maxAttempts;

    var head = o.isCorrect ? (slide.correctHead || 'That’s it.') : (slide.incorrectHead || 'Not quite.');
    var text = o.isCorrect
      ? (slide.correctText || 'Move on when you’re ready.')
      : (revealAnswer
          ? (slide.revealText || o.revealText)
          : (slide.incorrectText || o.wrongText));
    // A bridge ties the lesson to the night's question. Every learner sees
    // it once the answer is settled (right, or out of tries), so the ones
    // who miss still get the connection. Held back on a first wrong try so
    // it does not give the answer away.
    if (slide.bridge && revealAnswer) text = slide.bridge;

    clear(host).appendChild(
      el('div', { class: 'feedback ' + (o.isCorrect ? 'feedback--ok' : 'feedback--no') }, [
        el('p.feedback__head', { text: head }),
        el('p', {}, U.inline(text))
      ]));

    ctx.progress.answers[slide.id] = { selected: o.selected, correct: o.isCorrect, attempts: attempts };
    ctx.save();
    ctx.refreshGate();

    if (o.state !== 'restore') {
      U.announce((o.isCorrect ? 'Correct. ' : 'Incorrect. ') + text, 'assertive');
    }
    return revealAnswer;
  }

  function checkComplete(slide, progress) {
    var a = progress.answers[slide.id];
    if (!a) return false;
    if (slide.requireCorrect) return !!a.correct;
    // With a bridge, a first wrong try is not the end: the learner tries
    // again, so everyone reaches the bridge before moving on.
    if (slide.bridge && slide.retry !== false) {
      return !!a.correct || (a.attempts || 0) >= (slide.maxAttempts || 2);
    }
    return true;
  }

  function checkGate(slide) {
    if (slide.requireCorrect) return 'Answer this check correctly to continue.';
    if (slide.bridge && slide.retry !== false) return 'Try once more to continue.';
    return 'Answer this check to continue.';
  }

  /* ---- quiz / knowledge check ---- */
  TYPES.quiz = {
    label: 'Knowledge check',
    body: TYPES['text-image'].body,
    interactive: function (slide, ctx) {
      var multiple = slide.select === 'multiple';
      var role = (slide.assessment && slide.assessment.role) || 'formative';
      var name = uid('q');
      var saved = ctx.progress.answers[slide.id] || null;
      var section = el('section.assess', { 'aria-labelledby': name + '-legend' });

      section.appendChild(el('p.assess__kind', {
        text: role === 'summative' ? 'End-of-scene check' : 'Quick check'
      }));

      var fieldset = el('fieldset.assess__set');
      fieldset.appendChild(el('legend.assess__q', { id: name + '-legend' }, U.inline(slide.question || '')));

      if (multiple) {
        fieldset.appendChild(el('p.reflect__hint', { text: 'Choose all that apply.' }));
      }

      // Seeded by the slide id, not random: the correct answer stops landing
      // in the same spot on every check across every session, but the order
      // stays identical across reloads of this same slide, so a saved answer
      // (stored as an index into this array) always restores onto the right
      // option instead of whatever happens to be sitting in that slot.
      var options = U.seededShuffle(slide.options || [], slide.id);

      var inputs = [];
      var list = el('ul.choices');
      options.forEach(function (opt, i) {
        var id = name + '-o' + i;
        var input = el('input', {
          type: multiple ? 'checkbox' : 'radio',
          name: name, id: id, value: String(i)
        });
        var why = el('span.choice__why', { hidden: true });
        var label = el('label', { for: id }, [
          el('span.choice__mark', { 'aria-hidden': 'true', hidden: true }),
          el('span', {}, U.inline(opt.text || '')),
          why
        ]);
        var li = el('li.choice', {}, [input, label]);
        inputs.push({ input: input, li: li, why: why, opt: opt, index: i });
        input.addEventListener('change', function () {
          submitBtn.disabled = !inputs.some(function (x) { return x.input.checked; });
        });
        list.appendChild(li);
      });
      fieldset.appendChild(list);
      section.appendChild(fieldset);

      var feedbackHost = el('div', { role: 'status', 'aria-live': 'polite' });
      section.appendChild(feedbackHost);

      var submitBtn = el('button.btn.btn--primary', {
        type: 'button', disabled: true, text: slide.submitLabel || 'Check my answer'
      });
      var retryBtn = el('button.btn', { type: 'button', text: 'Try again', hidden: true });
      section.appendChild(el('div.assess__actions', {}, [submitBtn, retryBtn]));

      function mark(state) {
        var chosen = inputs.filter(function (x) { return x.input.checked; });
        var correctIdx = inputs.filter(function (x) { return x.opt.correct; });
        var isCorrect = chosen.length === correctIdx.length &&
          chosen.every(function (x) { return x.opt.correct; });

        var revealAnswer = settleCheck(slide, ctx, feedbackHost, {
          isCorrect: isCorrect,
          state: state,
          selected: chosen.map(function (x) { return x.index; }),
          wrongText: 'Read the note under your choice, then try again.',
          revealText: 'The right answer is marked above, with the reasoning.'
        });

        // Show only the reasoning for what they picked; the correct option is
        // held back until the answer is settled.
        inputs.forEach(function (x) {
          x.input.disabled = true;
          var picked = x.input.checked;
          var mk = x.li.querySelector('.choice__mark');
          if (picked || (x.opt.correct && revealAnswer)) {
            x.li.dataset.state = x.opt.correct ? 'correct' : 'incorrect';
            mk.hidden = false;
            mk.textContent = x.opt.correct ? '✓ ' : '✕ ';
            if (x.opt.feedback) {
              x.why.hidden = false;
              clear(x.why).appendChild(U.inline(x.opt.feedback));
            }
          }
        });

        submitBtn.hidden = true;
        retryBtn.hidden = revealAnswer;
      }

      submitBtn.addEventListener('click', function () { mark('submit'); });

      retryBtn.addEventListener('click', function () {
        inputs.forEach(function (x) {
          x.input.disabled = false;
          x.input.checked = false;
          delete x.li.dataset.state;
          x.li.querySelector('.choice__mark').hidden = true;
          x.why.hidden = true;
        });
        clear(feedbackHost);
        submitBtn.hidden = false;
        submitBtn.disabled = true;
        retryBtn.hidden = true;
        inputs[0].input.focus();
      });

      if (saved && saved.selected) {
        saved.selected.forEach(function (i) { if (inputs[i]) inputs[i].input.checked = true; });
        mark('restore');
      }

      return section;
    },
    isComplete: checkComplete,
    gateMessage: checkGate
  };

  /* ---- order (tap the steps in the order they happen) ----
     Tap-only on purpose: drag and drop fails on a phone with cold hands and
     fails keyboard and screen-reader use outright. Each step is a button.
     Tapping gives it the next number; tapping a numbered step takes it
     back. The steps are shuffled with the same seeded shuffle the quiz
     uses, so a saved answer restores onto the right step. --------------- */
  TYPES.order = {
    label: 'Put in order',
    body: TYPES['text-image'].body,
    interactive: function (slide, ctx) {
      var name = uid('ord');
      var saved = ctx.progress.answers[slide.id] || null;
      var section = el('section.assess', { 'aria-labelledby': name + '-q' });
      section.appendChild(el('p.assess__kind', { text: 'Put in order' }));
      section.appendChild(el('p.assess__q', { id: name + '-q' }, U.inline(slide.question || '')));
      section.appendChild(el('p.reflect__hint', {},
        U.inline(slide.hint || 'Tap the steps in order. Tap again to undo.')));

      // items[i].at is where that step belongs (0-based). Display is shuffled.
      var items = U.seededShuffle((slide.items || []).map(function (it, i) {
        return { text: typeof it === 'string' ? it : (it.text || ''), at: i };
      }), slide.id);

      var picked = [];   // display indices, in the order they were tapped
      var rows = [];
      var list = el('ul.order');

      items.forEach(function (it, i) {
        var num = el('span.order__num', { 'aria-hidden': 'true' });
        var mk = el('span.check__mark', { 'aria-hidden': 'true', hidden: true });
        var fix = el('span.order__fix', { hidden: true });
        var btn = el('button.order__btn', { type: 'button', 'aria-pressed': 'false' }, [
          num,
          el('span.order__text', {}, [mk, U.inline(it.text), fix])
        ]);
        var li = el('li.order__item', {}, btn);
        btn.addEventListener('click', function () {
          var pos = picked.indexOf(i);
          if (pos === -1) {
            picked.push(i);
            U.announce('Step ' + picked.length + ': ' + it.text);
          } else {
            picked.splice(pos, 1);
            U.announce('Took back: ' + it.text);
          }
          paint();
        });
        rows.push({ btn: btn, num: num, mk: mk, fix: fix, li: li, item: it });
        list.appendChild(li);
      });
      section.appendChild(list);

      var feedbackHost = el('div', { role: 'status', 'aria-live': 'polite' });
      section.appendChild(feedbackHost);

      var submitBtn = el('button.btn.btn--primary', {
        type: 'button', disabled: true, text: slide.submitLabel || 'Check my answer'
      });
      var retryBtn = el('button.btn', { type: 'button', text: 'Try again', hidden: true });
      section.appendChild(el('div.assess__actions', {}, [submitBtn, retryBtn]));

      function paint() {
        rows.forEach(function (r, i) {
          var pos = picked.indexOf(i);
          r.num.textContent = pos === -1 ? '' : String(pos + 1);
          r.btn.setAttribute('aria-pressed', pos === -1 ? 'false' : 'true');
          r.btn.setAttribute('aria-label', (pos === -1 ? '' : 'Step ' + (pos + 1) + '. ') + r.item.text);
        });
        submitBtn.disabled = picked.length !== rows.length;
      }

      function mark(state) {
        var isCorrect = picked.length === rows.length &&
          picked.every(function (di, pos) { return items[di].at === pos; });

        var revealAnswer = settleCheck(slide, ctx, feedbackHost, {
          isCorrect: isCorrect,
          state: state,
          selected: picked.slice(),
          wrongText: 'The steps marked ✕ are out of place. Try again.',
          revealText: 'The right order is marked above.'
        });

        rows.forEach(function (r, i) {
          r.btn.disabled = true;
          var pos = picked.indexOf(i);
          var right = pos === r.item.at;
          r.li.dataset.state = right ? 'correct' : 'incorrect';
          r.mk.hidden = false;
          r.mk.textContent = right ? '✓ ' : '✕ ';
          var label = 'Step ' + (pos + 1) + '. ' + r.item.text + '. ' + (right ? 'Right.' : 'Out of place.');
          if (!right && revealAnswer) {
            r.fix.hidden = false;
            r.fix.textContent = 'Goes at ' + (r.item.at + 1) + '.';
            label += ' Goes at ' + (r.item.at + 1) + '.';
          }
          r.btn.setAttribute('aria-label', label);
        });

        submitBtn.hidden = true;
        retryBtn.hidden = revealAnswer;
      }

      submitBtn.addEventListener('click', function () { mark('submit'); });

      retryBtn.addEventListener('click', function () {
        picked = [];
        rows.forEach(function (r) {
          r.btn.disabled = false;
          delete r.li.dataset.state;
          r.mk.hidden = true;
          r.fix.hidden = true;
        });
        clear(feedbackHost);
        submitBtn.hidden = false;
        retryBtn.hidden = true;
        paint();
        rows[0].btn.focus();
      });

      if (saved && Array.isArray(saved.selected) && saved.selected.length === rows.length) {
        picked = saved.selected.filter(function (i) { return rows[i]; });
        paint();
        if (picked.length === rows.length) mark('restore');
      } else {
        paint();
      }

      return section;
    },
    isComplete: checkComplete,
    gateMessage: checkGate
  };

  /* ---- match (tap a line, then tap its match) ----
     Tap-only, same reasons as order. The left side is a list of slots in
     the authored order; the right side is a pool of chips, shuffled with
     the seeded shuffle. Tap a slot, then a chip, and the chip moves into
     the slot. Tap a filled slot to send its chip back to the pool. Phone
     first: slots stack above the pool rather than sitting in two columns
     that would be too narrow to read. -------------------------------- */
  TYPES.match = {
    label: 'Match',
    body: TYPES['text-image'].body,
    interactive: function (slide, ctx) {
      var name = uid('mt');
      var saved = ctx.progress.answers[slide.id] || null;
      var section = el('section.assess', { 'aria-labelledby': name + '-q' });
      section.appendChild(el('p.assess__kind', { text: 'Match them up' }));
      section.appendChild(el('p.assess__q', { id: name + '-q' }, U.inline(slide.question || '')));
      section.appendChild(el('p.reflect__hint', {},
        U.inline(slide.hint || 'Tap a line, then its match. Tap again to undo.')));

      var pairs = (slide.pairs || []).map(function (p, i) {
        return { left: (p && p.left) || '', right: (p && p.right) || '', at: i };
      });
      // chips[j].at is the slot that chip belongs to. Display is shuffled.
      var chips = U.seededShuffle(pairs.map(function (p, i) { return { text: p.right, at: i }; }), slide.id);

      var assign = pairs.map(function () { return -1; });   // slot -> chip display index
      var active = -1;                                       // the slot waiting for a chip
      var slots = [], chipRows = [];

      var slotList = el('ul.match__slots');
      pairs.forEach(function (p, i) {
        var mk = el('span.check__mark', { 'aria-hidden': 'true', hidden: true });
        var pick = el('span.match__pick');
        var fix = el('span.match__fix', { hidden: true });
        var btn = el('button.match__slotbtn', { type: 'button', 'aria-pressed': 'false' }, [
          el('span.match__left', {}, [mk, U.inline(p.left)]),
          pick,
          fix
        ]);
        var li = el('li.match__slot', {}, btn);
        btn.addEventListener('click', function () {
          if (assign[i] !== -1) {
            U.announce('Cleared ' + p.left + '.');
            assign[i] = -1;
          }
          active = i;
          paint();
        });
        slots.push({ btn: btn, mk: mk, pick: pick, fix: fix, li: li, pair: p });
        slotList.appendChild(li);
      });
      section.appendChild(slotList);

      section.appendChild(el('p.match__poollabel', { id: name + '-pool', text: 'Choices' }));
      var pool = el('ul.match__pool', { 'aria-labelledby': name + '-pool' });
      chips.forEach(function (c, j) {
        var btn = el('button.match__chip', { type: 'button' }, U.inline(c.text));
        var li = el('li', {}, btn);
        btn.addEventListener('click', function () {
          var target = (active !== -1 && assign[active] === -1) ? active : assign.indexOf(-1);
          if (target === -1) return;
          assign[target] = j;
          U.announce(pairs[target].left + ' matched with: ' + c.text);
          active = assign.indexOf(-1);
          paint();
          if (active !== -1) slots[active].btn.focus();
        });
        chipRows.push({ btn: btn, li: li, chip: c });
        pool.appendChild(li);
      });
      section.appendChild(pool);

      var feedbackHost = el('div', { role: 'status', 'aria-live': 'polite' });
      section.appendChild(feedbackHost);

      var submitBtn = el('button.btn.btn--primary', {
        type: 'button', disabled: true, text: slide.submitLabel || 'Check my answer'
      });
      var retryBtn = el('button.btn', { type: 'button', text: 'Try again', hidden: true });
      section.appendChild(el('div.assess__actions', {}, [submitBtn, retryBtn]));

      function paint() {
        slots.forEach(function (s, i) {
          var ci = assign[i];
          s.btn.setAttribute('aria-pressed', active === i ? 'true' : 'false');
          s.li.dataset.filled = ci === -1 ? 'false' : 'true';
          s.pick.textContent = ci === -1 ? 'Tap to choose' : chips[ci].text;
          s.btn.setAttribute('aria-label', s.pair.left + '. ' +
            (ci === -1 ? 'Nothing chosen yet.' : 'Matched with: ' + chips[ci].text));
        });
        chipRows.forEach(function (c, j) { c.li.hidden = assign.indexOf(j) !== -1; });
        submitBtn.disabled = assign.indexOf(-1) !== -1;
      }

      function mark(state) {
        var isCorrect = assign.every(function (ci, i) { return ci !== -1 && chips[ci].at === i; });

        var revealAnswer = settleCheck(slide, ctx, feedbackHost, {
          isCorrect: isCorrect,
          state: state,
          selected: assign.slice(),
          wrongText: 'The pairs marked ✕ are wrong. Try again.',
          revealText: 'The right pairs are marked above.'
        });

        slots.forEach(function (s, i) {
          s.btn.disabled = true;
          s.btn.setAttribute('aria-pressed', 'false');
          var ci = assign[i];
          var right = ci !== -1 && chips[ci].at === i;
          s.li.dataset.state = right ? 'correct' : 'incorrect';
          s.mk.hidden = false;
          s.mk.textContent = right ? '✓ ' : '✕ ';
          var label = s.pair.left + '. Matched with: ' + (ci === -1 ? 'nothing' : chips[ci].text) + '. ' +
            (right ? 'Right.' : 'Wrong.');
          if (!right && revealAnswer) {
            s.fix.hidden = false;
            s.fix.textContent = 'Should be: ' + s.pair.right;
            label += ' Should be: ' + s.pair.right;
          }
          s.btn.setAttribute('aria-label', label);
        });
        chipRows.forEach(function (c) { c.btn.disabled = true; });

        submitBtn.hidden = true;
        retryBtn.hidden = revealAnswer;
      }

      submitBtn.addEventListener('click', function () { mark('submit'); });

      retryBtn.addEventListener('click', function () {
        assign = pairs.map(function () { return -1; });
        active = 0;
        slots.forEach(function (s) {
          s.btn.disabled = false;
          delete s.li.dataset.state;
          s.mk.hidden = true;
          s.fix.hidden = true;
        });
        chipRows.forEach(function (c) { c.btn.disabled = false; });
        clear(feedbackHost);
        submitBtn.hidden = false;
        retryBtn.hidden = true;
        paint();
        slots[0].btn.focus();
      });

      if (saved && Array.isArray(saved.selected) && saved.selected.length === pairs.length) {
        assign = saved.selected.map(function (j) { return chips[j] ? j : -1; });
        paint();
        if (assign.indexOf(-1) === -1) mark('restore');
      } else {
        paint();
      }

      return section;
    },
    isComplete: checkComplete,
    gateMessage: checkGate
  };

  /* ---- reflection (captured, never graded) ----
     One prompt, or several on one screen via `fields`. The multi-field form is
     what the IRF needs: Unit 4 of the curriculum guide puts all three IRF
     questions on the last screen of the module, not on three screens. ------- */

  /** Reflection answers are stored as {fieldId: text}. Older single-prompt
      saves were plain strings, so normalise on read. */
  function reflectionAnswers(slide, progress) {
    var raw = progress.reflections[slide.id];
    if (typeof raw === 'string') return { main: raw };
    return raw || {};
  }

  function reflectionFields(slide) {
    if (Array.isArray(slide.fields) && slide.fields.length) return slide.fields;
    return [{ id: 'main', prompt: slide.prompt || '', hint: slide.hint, placeholder: slide.placeholder }];
  }

  /** The note under a writing box must match what actually happens to it. */
  function defaultPrivacyNote(slide) {
    var sends = GWMS.irf && GWMS.irf.isConfigured();
    if (!sends) {
      return 'What you write stays in this browser. It is not sent anywhere and it clears when this tab closes.';
    }
    if (slide.submit) {
      return 'Pressing send shares this with the program. No name goes with it — nobody can tell which answers are yours.';
    }
    return 'This is shared with the program on the last screen, with no name attached. Nothing is sent until you press send there.';
  }

  TYPES.reflection = {
    label: 'Reflection',
    body: TYPES['text-image'].body,
    interactive: function (slide, ctx) {
      var fields = reflectionFields(slide);
      var answers = reflectionAnswers(slide, ctx.progress);
      var multi = fields.length > 1;

      var savedFlag = el('span.reflect__saved', { text: 'Saved', role: 'status' });
      var saveBtn = el('button.btn', { type: 'button', text: multi ? 'Save my answers' : 'Save my answer' });
      var areas = [];

      function anyText() {
        return areas.some(function (a) { return a.el.value.trim(); });
      }

      var timer = null;
      function persist(announceIt) {
        var out = {};
        areas.forEach(function (a) { out[a.id] = a.el.value; });
        ctx.progress.reflections[slide.id] = out;
        ctx.save();
        savedFlag.hidden = !anyText();
        ctx.refreshGate();
        if (announceIt) U.announce('Saved on this device.');
      }

      var fieldNodes = fields.map(function (f, i) {
        var fid = f.id || ('f' + i);
        var domId = uid('reflect');
        var area = el('textarea', {
          id: domId,
          rows: multi ? 3 : 6,
          placeholder: f.placeholder || '',
          spellcheck: 'true'
        });
        area.value = answers[fid] || '';
        area.addEventListener('input', function () {
          savedFlag.hidden = true;
          clearTimeout(timer);
          timer = setTimeout(function () { persist(false); }, 700);
        });
        areas.push({ id: fid, el: area });

        return el('div.reflect__group', {}, [
          el('label.assess__q.reflect__field', { for: domId }, U.inline(f.prompt || '')),
          f.hint ? el('span.reflect__hint', {}, U.inline(f.hint)) : null,
          area
        ]);
      });

      savedFlag.hidden = !anyText();
      saveBtn.addEventListener('click', function () { clearTimeout(timer); persist(true); });

      var section = el('section.assess.reflect', {}, [
        el('p.assess__kind', { text: slide.kindLabel || 'Reflection — not graded' }),
        fieldNodes
      ]);

      // --- Submitting screen (the IRF) --------------------------------------
      if (slide.submit && GWMS.irf && GWMS.irf.isConfigured()) {
        var sendBtn = el('button.btn.btn--primary', { type: 'button', text: slide.sendLabel || 'Send it' });
        var status = el('p.sendstatus', { role: 'status', 'aria-live': 'polite' });
        var already = ctx.progress.submitted[slide.id];

        function paintStatus(state) {
          clear(status);
          status.className = 'sendstatus sendstatus--' + state.status;
          var text = {
            sent: 'Sent. You’re done.',
            handed: 'Sent. You’re done.',
            queued: 'Saved on this device. It will send by itself next time there’s a connection.',
            local: 'Saved on this device.',
            sending: 'Sending…'
          }[state.status] || '';
          status.appendChild(document.createTextNode(text));
          sendBtn.disabled = state.status === 'sending';
          sendBtn.hidden = state.status === 'sent' || state.status === 'handed';
        }

        sendBtn.addEventListener('click', function () {
          clearTimeout(timer);
          persist(false);
          paintStatus({ status: 'sending' });
          U.announce('Sending your answers.');

          var payload = ctx.buildIrfPayload(slide, areas);
          GWMS.irf.submit(payload).then(function (res) {
            ctx.progress.submitted[slide.id] = { status: res.status, at: new Date().toISOString() };
            ctx.save();
            paintStatus(res);
            ctx.refreshGate();
            U.announce(res.status === 'queued'
              ? 'Saved on this device. It will send when there is a connection.'
              : 'Sent. You are done.');
          });
        });

        if (already) paintStatus(already);
        section.appendChild(el('div.reflect__foot', {}, [sendBtn, saveBtn, savedFlag]));
        section.appendChild(status);
      } else {
        section.appendChild(el('div.reflect__foot', {}, [saveBtn, savedFlag]));
      }

      section.appendChild(el('p.privacy-note', {
        text: slide.privacyNote || defaultPrivacyNote(slide)
      }));
      return section;
    },
    isComplete: function (slide, progress) {
      var answers = reflectionAnswers(slide, progress);
      var fields = reflectionFields(slide);
      // requireAll is what the IRF needs — no student leaves before completing it.
      var written = slide.requireAll
        ? fields.every(function (f, i) { return (answers[f.id || ('f' + i)] || '').trim(); })
        : fields.some(function (f, i) { return (answers[f.id || ('f' + i)] || '').trim(); });

      if (!written) return false;
      if (slide.submit && GWMS.irf && GWMS.irf.isConfigured()) {
        return !!progress.submitted[slide.id];
      }
      return true;
    },
    gateMessage: function (slide, progress) {
      var answers = reflectionAnswers(slide, progress);
      var fields = reflectionFields(slide);
      var written = fields.every(function (f, i) { return (answers[f.id || ('f' + i)] || '').trim(); });
      if (slide.submit && written) return 'Press send, then you’re done.';
      return slide.requireAll
        ? 'Answer all of these before you finish. Short answers are fine.'
        : 'Write something before moving on. Anything counts.';
    }
  };

  /* ---- branching decision point ---- */
  TYPES.branch = {
    label: 'Decision',
    body: TYPES['text-image'].body,
    interactive: function (slide, ctx) {
      var chosen = ctx.progress.choices[slide.id];
      var section = el('section.assess');
      section.appendChild(el('p.assess__kind', { text: 'Your call' }));
      section.appendChild(el('p.assess__q', {}, U.inline(slide.question || '')));

      var feedbackHost = el('div', { role: 'status', 'aria-live': 'polite' });
      var list = el('ul.branch__opts');

      (slide.options || []).forEach(function (opt, i) {
        var optId = opt.id || ('opt' + i);
        var btn = el('button.branch__btn', {
          type: 'button',
          'aria-pressed': String(chosen === optId)
        }, [
          el('span.branch__idx', { 'aria-hidden': 'true', text: String(i + 1) }),
          el('span', {}, [
            U.inline(opt.text || ''),
            opt.sub ? el('span.branch__sub', {}, U.inline(opt.sub)) : null
          ])
        ]);

        btn.addEventListener('click', function () {
          ctx.progress.choices[slide.id] = optId;
          ctx.save();
          Array.prototype.forEach.call(list.querySelectorAll('.branch__btn'), function (b) {
            b.setAttribute('aria-pressed', 'false');
          });
          btn.setAttribute('aria-pressed', 'true');

          if (opt.feedback) {
            clear(feedbackHost).appendChild(el('div.feedback.feedback--ok', {}, [
              el('p', {}, U.inline(opt.feedback))
            ]));
            U.announce(opt.feedback + ' Continuing.');
          }
          ctx.refreshGate();
          if (opt.target) {
            setTimeout(function () { ctx.nav.goTo(opt.target, { push: true }); }, opt.feedback ? 900 : 0);
          }
        });

        list.appendChild(el('li', {}, btn));
      });

      section.appendChild(list);
      section.appendChild(feedbackHost);
      return section;
    },
    isComplete: function (slide, progress) { return !!progress.choices[slide.id]; },
    gateMessage: function () { return 'Choose one of the options to continue.'; }
  };

  /* ======================================================================
     Slide assembly
     ====================================================================== */

  function renderSlide(slide, ctx) {
    var type = TYPES[slide.type] || TYPES['text-image'];
    var root = el('article.slide', { 'data-enter': '1', 'data-type': slide.type });

    // --- Header ---
    var eyebrow = slide.eyebrow || ctx.scene.title || '';
    if (eyebrow) root.appendChild(el('p.slide__eyebrow', { text: eyebrow }));
    root.appendChild(el('h1.slide__title', { id: 'slide-heading', tabindex: '-1' },
      U.inline(slide.title || '')));

    // --- Alternate representation control ---
    var bodyRegion = el('div.slide__content');
    function paintBody(alt) {
      clear(bodyRegion);
      if (!alt || alt.mode === 'read') {
        bodyRegion.appendChild(type.body ? type.body(slide, ctx) : renderBlocks(slide.body, ctx));
      } else {
        bodyRegion.appendChild(renderAlternateMedia(alt, slide, ctx));
        if (alt.transcriptIsBody) {
          bodyRegion.appendChild(type.body ? type.body(slide, ctx) : renderBlocks(slide.body, ctx));
        }
      }
    }
    var altbar = renderAltbar(slide, ctx, function (alt) {
      paintBody(alt);
      U.announce('Switched to the ' + (alt.label || alt.mode) + ' version.');
    });
    if (altbar) root.appendChild(altbar);

    paintBody(null);
    root.appendChild(bodyRegion);

    // --- Reveals ---
    var reveals = renderReveals(slide, ctx);
    if (reveals) root.appendChild(reveals);

    // --- Type-specific interactive region ---
    if (type.interactive) root.appendChild(type.interactive(slide, ctx));

    return root;
  }

  function isComplete(slide, progress) {
    var type = TYPES[slide.type] || TYPES['text-image'];
    return type.isComplete ? type.isComplete(slide, progress) : true;
  }

  function gateMessage(slide, progress) {
    var type = TYPES[slide.type] || TYPES['text-image'];
    if (type.gateMessage) return type.gateMessage(slide, progress);
    return 'Open everything on this slide to continue.';
  }

  function typeLabel(slideType) {
    return (TYPES[slideType] && TYPES[slideType].label) || 'Slide';
  }

  GWMS.slides = {
    render: renderSlide,
    isComplete: isComplete,
    gateMessage: gateMessage,
    typeLabel: typeLabel,
    types: TYPES,
    renderBlocks: renderBlocks
  };
})();
