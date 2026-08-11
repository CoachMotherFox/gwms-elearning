/* ==========================================================================
   GWMS eLearning Engine — navigation.js

   Course > Scenes > Slides is authored as a tree; navigation flattens it into
   an ordered list so that "next" has a sensible default, while still allowing
   any slide to override where it goes.

   Order of precedence for "next":
     1. a branch choice the learner just made (handled by the slide type)
     2. slide.next — an explicit slide id
     3. the following slide in the flat order (crosses scene boundaries)

   "Back" pops a visit history rather than stepping backwards through the flat
   order, because with branching those are not the same thing: a learner who
   jumped from slide 4 to slide 9 expects Back to return to slide 4.
   ========================================================================== */
(function () {
  'use strict';

  var GWMS = window.GWMS = window.GWMS || {};
  var U = GWMS.util;
  var el = U.el, clear = U.clear;

  function createNavigator(course, progress, hooks) {
    var flat = [];
    var byId = Object.create(null);

    course.scenes.forEach(function (scene, si) {
      scene.slides.forEach(function (slide, li) {
        var entry = {
          slide: slide, scene: scene,
          sceneIndex: si, slideIndex: li,
          flatIndex: flat.length
        };
        flat.push(entry);
        byId[slide.id] = entry;
      });
    });

    var history = [];
    var current = null;

    function get(id) { return byId[id] || null; }

    function first() { return flat[0]; }

    function nextIdOf(entry) {
      if (!entry) return null;
      if (entry.slide.next === null) return null;           // explicit end of path
      if (entry.slide.next) return entry.slide.next;
      var n = flat[entry.flatIndex + 1];
      return n ? n.slide.id : null;
    }

    function hasNext() { return !!nextIdOf(current); }
    function hasPrev() { return history.length > 0; }

    function markVisited(id) {
      if (progress.visited.indexOf(id) === -1) progress.visited.push(id);
      progress.current = id;
    }

    /**
     * goTo(id, {push:true}) — push:true records the slide we are leaving so
     * Back can return to it. Menu jumps also push, so Back is always "where I
     * just was".
     */
    function goTo(id, opts) {
      opts = opts || {};
      var entry = get(id);
      if (!entry) {
        console.warn('[GWMS] No slide with id "' + id + '".');
        return false;
      }
      if (current && opts.push !== false && current.slide.id !== id) {
        history.push(current.slide.id);
      }
      current = entry;
      markVisited(id);
      hooks.onChange(entry, { direction: opts.direction || 'forward' });
      return true;
    }

    function next() {
      var id = nextIdOf(current);
      if (!id) return false;
      return goTo(id, { push: true, direction: 'forward' });
    }

    function prev() {
      if (!history.length) return false;
      var id = history.pop();
      var entry = get(id);
      if (!entry) return false;
      current = entry;
      markVisited(id);
      hooks.onChange(entry, { direction: 'back' });
      return true;
    }

    function progressPercent() {
      if (!current || !flat.length) return 0;
      return Math.round(((current.flatIndex + 1) / flat.length) * 100);
    }

    function statusText() {
      if (!current) return '';
      var scenes = course.scenes.length;
      var scenePart = scenes > 1
        ? 'Scene ' + (current.sceneIndex + 1) + ' of ' + scenes + ' · '
        : '';
      return scenePart + 'Slide ' + (current.slideIndex + 1) + ' of ' + current.scene.slides.length;
    }

    function announceText() {
      if (!current) return '';
      return (current.slide.title || 'Slide') + '. ' + statusText() + '.';
    }

    return {
      flat: flat,
      get: get,
      first: first,
      goTo: goTo,
      next: next,
      prev: prev,
      hasNext: hasNext,
      hasPrev: hasPrev,
      current: function () { return current; },
      progressPercent: progressPercent,
      statusText: statusText,
      announceText: announceText,
      historyDepth: function () { return history.length; }
    };
  }

  /* ======================================================================
     Contents menu
     ====================================================================== */

  function renderMenu(container, course, nav, progress, onPick) {
    clear(container);

    course.scenes.forEach(function (scene, si) {
      var list = el('ul.menu-list');

      scene.slides.forEach(function (slide) {
        var isCurrent = nav.current() && nav.current().slide.id === slide.id;
        var visited = progress.visited.indexOf(slide.id) !== -1;

        var btn = el('button.menu-item', {
          type: 'button',
          'aria-current': isCurrent ? 'true' : null,
          dataset: { visited: String(visited), slide: slide.id }
        }, [
          el('span.menu-item__dot', { 'aria-hidden': 'true' }),
          el('span.menu-item__text', {}, [
            el('span', { text: slide.title || slide.id }),
            el('span.menu-item__type', { text: ' ' + GWMS.slides.typeLabel(slide.type) })
          ]),
          visited ? el('span.sr-only', { text: '(visited)' }) : null,
          isCurrent ? el('span.sr-only', { text: '(current slide)' }) : null
        ]);

        btn.addEventListener('click', function () { onPick(slide.id); });
        list.appendChild(el('li', {}, btn));
      });

      container.appendChild(el('section.menu-scene', {}, [
        el('h3.menu-scene__title', { text: scene.title || ('Scene ' + (si + 1)) }),
        list
      ]));
    });
  }

  GWMS.navigation = {
    create: createNavigator,
    renderMenu: renderMenu
  };
})();
