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
    if (c.licence) bits.push(document.createTextNode(' · ' + c.licence));
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

      var inputs = [];
      var list = el('ul.choices');
      (slide.options || []).forEach(function (opt, i) {
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

        var attempts = ((ctx.progress.answers[slide.id] || {}).attempts || 0) +
          (state === 'restore' ? 0 : 1);
        var maxAttempts = slide.maxAttempts || 2;

        // Giving the answer away on the first wrong attempt makes "Try again"
        // pointless. Show only the reasoning for what they picked, and hold the
        // correct option back until they get it or run out of attempts.
        var revealAnswer = isCorrect || slide.retry === false || attempts >= maxAttempts;

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

        var head = isCorrect ? (slide.correctHead || 'That’s it.') : (slide.incorrectHead || 'Not quite.');
        var text = isCorrect
          ? (slide.correctText || 'Move on when you’re ready.')
          : (revealAnswer
              ? (slide.revealText || 'The right answer is marked above, with the reasoning.')
              : (slide.incorrectText || 'Read the note under your choice, then try again.'));

        clear(feedbackHost).appendChild(
          el('div', { class: 'feedback ' + (isCorrect ? 'feedback--ok' : 'feedback--no') }, [
            el('p.feedback__head', { text: head }),
            el('p', {}, U.inline(text))
          ]));

        submitBtn.hidden = true;
        retryBtn.hidden = revealAnswer;

        ctx.progress.answers[slide.id] = {
          selected: chosen.map(function (x) { return x.index; }),
          correct: isCorrect,
          attempts: attempts
        };
        ctx.save();
        ctx.refreshGate();

        if (state !== 'restore') {
          U.announce((isCorrect ? 'Correct. ' : 'Incorrect. ') + text, 'assertive');
        }
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
    isComplete: function (slide, progress) {
      var a = progress.answers[slide.id];
      if (!a) return false;
      return slide.requireCorrect ? !!a.correct : true;
    },
    gateMessage: function (slide) {
      return slide.requireCorrect
        ? 'Answer this check correctly to continue.'
        : 'Answer this check to continue.';
    }
  };

  /* ---- reflection (captured, never graded) ---- */
  TYPES.reflection = {
    label: 'Reflection',
    body: TYPES['text-image'].body,
    interactive: function (slide, ctx) {
      var id = uid('reflect');
      var saved = ctx.progress.reflections[slide.id] || '';

      var area = el('textarea', {
        id: id,
        rows: 6,
        placeholder: slide.placeholder || '',
        spellcheck: 'true'
      });
      area.value = saved;

      var savedFlag = el('span.reflect__saved', { text: 'Saved', hidden: !saved, role: 'status' });
      var saveBtn = el('button.btn', { type: 'button', text: 'Save my answer' });

      var timer = null;
      function persist(announceIt) {
        ctx.progress.reflections[slide.id] = area.value;
        ctx.save();
        savedFlag.hidden = !area.value.trim();
        ctx.refreshGate();
        if (announceIt) U.announce('Your answer is saved on this device.');
      }
      area.addEventListener('input', function () {
        savedFlag.hidden = true;
        clearTimeout(timer);
        timer = setTimeout(function () { persist(false); }, 700);
      });
      saveBtn.addEventListener('click', function () { clearTimeout(timer); persist(true); });

      return el('section.assess.reflect', {}, [
        el('p.assess__kind', { text: 'Reflection — not graded' }),
        el('label.assess__q.reflect__field', { for: id }, U.inline(slide.prompt || '')),
        slide.hint ? el('span.reflect__hint', {}, U.inline(slide.hint)) : null,
        area,
        el('div.reflect__foot', {}, [saveBtn, savedFlag]),
        el('p.privacy-note', {
          text: 'What you write stays in this browser. It is not sent anywhere and it clears when this tab closes.'
        })
      ]);
    },
    isComplete: function (slide, progress) {
      return !!(progress.reflections[slide.id] || '').trim();
    },
    gateMessage: function () { return 'Write something before moving on. Anything counts.'; }
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

  function gateMessage(slide) {
    var type = TYPES[slide.type] || TYPES['text-image'];
    if (type.gateMessage) return type.gateMessage(slide);
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
