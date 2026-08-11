/* ==========================================================================
   GWMS eLearning Engine — validate.js

   Course integrity + accessibility checker.

   This is deliberately part of the engine rather than a separate lint step.
   Across 36 sessions the realistic failure mode is not "we never thought about
   alt text", it is "session 23 shipped with one image missing it". The check
   runs on every course load, logs to the console, and is exposed to the author
   through Contents -> Accessibility check.

   Severity:
     error — breaks navigation, or fails a WCAG A/AA success criterion outright
     warn  — likely accessibility or pedagogy problem, needs a human decision
   ========================================================================== */
(function () {
  'use strict';

  var GWMS = window.GWMS = window.GWMS || {};

  var KNOWN_TYPES = ['text-image', 'video', 'reveal', 'branch', 'quiz', 'reflection'];

  function validateCourse(course) {
    var issues = [];

    function err(where, msg, wcag) { issues.push({ level: 'error', where: where, message: msg, wcag: wcag || null }); }
    function warn(where, msg, wcag) { issues.push({ level: 'warn', where: where, message: msg, wcag: wcag || null }); }

    if (!course || typeof course !== 'object') {
      err('course', 'Course file did not parse into an object.');
      return issues;
    }
    if (!course.id) err('course', 'Course is missing an "id".');
    if (!course.title) err('course', 'Course is missing a "title".');
    if (!Array.isArray(course.scenes) || !course.scenes.length) {
      err('course', 'Course has no scenes.');
      return issues;
    }

    var slideIds = Object.create(null);
    var allSlides = [];

    course.scenes.forEach(function (scene, si) {
      var sWhere = 'scene[' + si + ']';
      if (!scene.id) err(sWhere, 'Scene is missing an "id".');
      if (!scene.title) warn(sWhere, 'Scene has no title; the Contents menu will show a generic label.');
      if (!Array.isArray(scene.slides) || !scene.slides.length) {
        err(sWhere, 'Scene "' + (scene.id || si) + '" has no slides.');
        return;
      }
      scene.slides.forEach(function (slide, li) {
        var where = (scene.id || sWhere) + ' / ' + (slide.id || 'slide[' + li + ']');
        if (!slide.id) err(where, 'Slide is missing an "id".');
        else if (slideIds[slide.id]) err(where, 'Duplicate slide id "' + slide.id + '".');
        else slideIds[slide.id] = true;
        allSlides.push({ slide: slide, where: where });
        validateSlide(slide, where, err, warn);
      });
    });

    // Cross-references resolve?
    allSlides.forEach(function (entry) {
      var slide = entry.slide;
      if (slide.next && !slideIds[slide.next]) {
        err(entry.where, 'slide.next points at "' + slide.next + '", which does not exist.');
      }
      (slide.options || []).forEach(function (opt, i) {
        if (slide.type === 'branch') {
          if (!opt.target) err(entry.where, 'Branch option ' + (i + 1) + ' has no "target".');
          else if (!slideIds[opt.target]) err(entry.where, 'Branch option ' + (i + 1) + ' targets "' + opt.target + '", which does not exist.');
        }
      });
    });

    // Assessment mix — the rubric asks for more than one strategy.
    var kinds = {};
    allSlides.forEach(function (e) {
      if (e.slide.type === 'quiz') kinds[(e.slide.assessment && e.slide.assessment.role) || 'formative'] = true;
      if (e.slide.type === 'reflection') kinds.reflection = true;
      if (e.slide.type === 'branch') kinds.scenario = true;
    });
    if (Object.keys(kinds).length < 2 && !course.suppressAssessmentWarning) {
      warn('course', 'Only one assessment strategy is present. AECT Required Element 2 expects multiple ' +
        '(e.g. a mid-scene knowledge check, an end-of-scene summative check, and a reflection prompt).');
    }

    return issues;
  }

  function validateSlide(slide, where, err, warn) {
    if (!slide.type) { err(where, 'Slide has no "type".'); return; }
    if (KNOWN_TYPES.indexOf(slide.type) === -1) {
      err(where, 'Unknown slide type "' + slide.type + '". Known types: ' + KNOWN_TYPES.join(', ') + '.');
      return;
    }
    if (!slide.title) warn(where, 'Slide has no title; the slide heading and the Contents menu need one.');

    // --- Images: alt text is mandatory. Decorative must say so explicitly. ---
    collectImages(slide).forEach(function (img) {
      if (typeof img.alt !== 'string') {
        err(where, 'Image "' + (img.src || '?') + '" has no "alt". Set alt text, or set "decorative": true.', 'WCAG 1.1.1');
      } else if (img.alt.trim() === '' && !img.decorative) {
        err(where, 'Image "' + (img.src || '?') + '" has empty alt but is not marked "decorative": true.', 'WCAG 1.1.1');
      } else if (img.alt && /^(image|photo|picture|graphic) of/i.test(img.alt.trim())) {
        warn(where, 'Alt text starts with "image of" — screen readers already announce it as an image.');
      }
      if (img.credit && !img.credit.holder) {
        warn(where, 'Image credit has no "holder"; the credits panel will be incomplete.');
      }
      if (!img.credit && !img.own) {
        warn(where, 'Image "' + (img.src || '?') + '" has neither "own": true nor a "credit" block. ' +
          'Every third-party asset needs a copyright or Creative Commons notice.');
      }
    });

    // --- Video/audio: a text equivalent is mandatory. ---
    if (slide.type === 'video') {
      var v = slide.video || {};
      if (!v.src && !v.embed) err(where, 'Video slide has neither "src" (file) nor "embed" (hosted URL).');
      if (v.src && !v.captions) {
        err(where, 'File-based video has no "captions" track (.vtt).', 'WCAG 1.2.2');
      }
      if (v.embed && !v.captionsProvided) {
        warn(where, 'Embedded video: confirm the hosted copy has real captions (not auto-generated) and set "captionsProvided": true.', 'WCAG 1.2.2');
      }
      if (!v.transcript) {
        err(where, 'Video slide has no "transcript". A transcript is the text path for this content.', 'WCAG 1.2.3');
      }
    }

    slide.alternates && slide.alternates.forEach(function (alt, i) {
      if (!alt.mode) err(where, 'Alternate ' + (i + 1) + ' has no "mode" (audio | video).');
      if (!alt.label) warn(where, 'Alternate ' + (i + 1) + ' has no "label" for its control.');
      if (alt.mode === 'audio' && !alt.src) err(where, 'Audio alternate ' + (i + 1) + ' has no "src".');
      if (alt.mode === 'audio' && !alt.transcriptIsBody && !alt.transcript) {
        err(where, 'Audio alternate ' + (i + 1) + ' needs "transcript", or "transcriptIsBody": true if the slide text is the script.', 'WCAG 1.2.1');
      }
    });

    // --- Assessment shape ---
    if (slide.type === 'quiz') {
      if (!slide.question) err(where, 'Quiz slide has no "question".');
      if (!Array.isArray(slide.options) || slide.options.length < 2) {
        err(where, 'Quiz slide needs at least two options.');
      } else {
        var correct = slide.options.filter(function (o) { return o.correct; });
        if (!correct.length) err(where, 'Quiz slide has no option marked "correct": true.');
        if (correct.length > 1 && slide.select !== 'multiple') {
          err(where, 'Quiz has multiple correct options but "select" is not "multiple".');
        }
        slide.options.forEach(function (o, i) {
          if (!o.text) err(where, 'Quiz option ' + (i + 1) + ' has no "text".');
          if (!o.feedback) warn(where, 'Quiz option ' + (i + 1) + ' has no "feedback". Immediate, specific feedback is the point of a knowledge check.');
        });
      }
    }

    if (slide.type === 'reflection') {
      if (!slide.prompt) err(where, 'Reflection slide has no "prompt".');
      if (slide.graded) warn(where, 'Reflection slides are captured, not graded. Remove "graded".');
    }

    if (slide.type === 'branch') {
      if (!slide.question) err(where, 'Branching slide has no "question".');
      if (!Array.isArray(slide.options) || slide.options.length < 2) {
        err(where, 'Branching slide needs at least two options.');
      }
    }

    if (slide.type === 'reveal' && !(slide.reveals || slide.interactions)) {
      err(where, 'Reveal slide has no "reveals" and no "interactions".');
    }

    (slide.interactions || []).concat(slide.reveals || []).forEach(function (ix, i) {
      if (ix.type && ix.type !== 'reveal') warn(where, 'Interaction ' + (i + 1) + ' has unsupported type "' + ix.type + '".');
      if (!ix.label) err(where, 'Reveal interaction ' + (i + 1) + ' has no "label" for its button.');
      if (!ix.content || !ix.content.length) warn(where, 'Reveal interaction ' + (i + 1) + ' has no content to reveal.');
    });
  }

  /** Walk a slide and gather every image-bearing object. */
  function collectImages(slide) {
    var out = [];
    function scanBlocks(blocks) {
      (blocks || []).forEach(function (b) {
        if (b && b.kind === 'image') out.push(b);
      });
    }
    if (slide.image) out.push(slide.image);
    scanBlocks(slide.body);
    (slide.interactions || []).concat(slide.reveals || []).forEach(function (ix) { scanBlocks(ix.content); });
    (slide.options || []).forEach(function (o) { if (o.image) out.push(o.image); });
    if (slide.video && slide.video.poster) out.push(slide.video.poster);
    return out;
  }

  /** Gather every credited asset in a course, for the credits panel. */
  function collectCredits(course) {
    var out = [];
    (course.scenes || []).forEach(function (scene) {
      (scene.slides || []).forEach(function (slide) {
        collectImages(slide).forEach(function (img) { push(img, slide, 'Image'); });
        if (slide.video) push(slide.video, slide, 'Video');
        (slide.alternates || []).forEach(function (a) { push(a, slide, a.mode === 'audio' ? 'Audio' : 'Video'); });
      });
    });
    (course.credits || []).forEach(function (c) {
      out.push({ kind: c.kind || 'Asset', where: c.where || course.title, credit: c, src: c.src || '' });
    });
    return out;

    function push(asset, slide, kind) {
      if (!asset) return;
      if (asset.own) {
        out.push({ kind: kind, where: slide.title || slide.id, src: asset.src || asset.embed || '', credit: { holder: course.rightsHolder || 'Course author', licence: 'All rights reserved (original work)', own: true } });
      } else if (asset.credit) {
        out.push({ kind: kind, where: slide.title || slide.id, src: asset.src || asset.embed || '', credit: asset.credit });
      }
    }
  }

  /* ======================================================================
     Runtime colour-contrast audit (WCAG 1.4.3)

     The palette was measured when it was chosen, but a learner can change the
     theme and the text size, and an author can add a callout inside a callout.
     This measures what is actually on screen right now, in the theme and size
     the learner is actually using, so the claim stays true rather than being
     a comment in a stylesheet.
     ====================================================================== */

  function relLuminance(rgb) {
    var c = rgb.map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  /** Parse an rgb()/rgba() string. Returns null for anything not fully opaque. */
  function parseRGB(str) {
    var m = /rgba?\(([^)]+)\)/.exec(str || '');
    if (!m) return null;
    var parts = m[1].split(/[,\/\s]+/).filter(Boolean).map(Number);
    if (parts.length > 3 && parts[3] < 1) return null;
    return parts.slice(0, 3);
  }

  function effectiveBackground(node) {
    var n = node;
    while (n && n !== document.documentElement) {
      var bg = parseRGB(getComputedStyle(n).backgroundColor);
      if (bg) return bg;
      n = n.parentElement;
    }
    return parseRGB(getComputedStyle(document.body).backgroundColor) || [255, 255, 255];
  }

  function contrastRatio(a, b) {
    var l1 = relLuminance(a), l2 = relLuminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  function auditContrast(scope) {
    var nodes = (scope || document).querySelectorAll('*');
    var results = [], seen = Object.create(null);

    Array.prototype.forEach.call(nodes, function (e) {
      if (e.children.length) return;                     // leaf text nodes only
      var text = (e.textContent || '').trim();
      if (!text) return;
      var cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return;

      var fg = parseRGB(cs.color);
      if (!fg) return;
      var bg = effectiveBackground(e);
      var px = parseFloat(cs.fontSize);
      var bold = parseInt(cs.fontWeight, 10) >= 700;
      var large = px >= 24 || (px >= 18.66 && bold);
      var need = large ? 3 : 4.5;
      var ratio = contrastRatio(fg, bg);

      var key = cs.color + '|' + bg.join() + '|' + need;
      if (seen[key]) return;
      seen[key] = true;

      results.push({
        sample: text.slice(0, 40),
        ratio: Math.round(ratio * 100) / 100,
        need: need,
        size: Math.round(px),
        pass: ratio >= need
      });
    });

    return {
      checked: results.length,
      fails: results.filter(function (r) { return !r.pass; }),
      lowest: results.reduce(function (m, r) { return Math.min(m, r.ratio); }, Infinity)
    };
  }

  GWMS.validate = {
    course: validateCourse,
    credits: collectCredits,
    contrast: auditContrast,
    KNOWN_TYPES: KNOWN_TYPES
  };
})();
