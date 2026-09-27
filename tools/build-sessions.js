#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   GWMS eLearning Engine — build-sessions.js

   Emits one courses/session-NN/course.json per session from the transcribed
   curriculum in courses/_curriculum/*.json.

     node tools/build-sessions.js

   This is an authoring scaffold, not a build step. The engine never runs it and
   never reads _curriculum/. It writes ordinary course.json files that you can
   hand-edit afterwards — but a re-run overwrites them, so put durable changes
   in the curriculum data or in this file.

   Rebuilt September 26, 2026 for the 90-minute class and the 5-minute
   eLearning-plus-IRF window. Every module now runs six screens: today's
   question, the three CVP games with each player's win, one quick check, the
   takeaway, your answer to today's question, and the IRF. Session 1 runs the
   GOLMEST orientation recap instead of the three games.
   --------------------------------------------------------------------------- */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CURRICULUM = path.join(ROOT, 'courses', '_curriculum');
const COURSES = path.join(ROOT, 'courses');

const RIGHTS = 'Jamey Phoenix Bethea, Conceptual Combat Academy';

/* The four IRF questions, asked of every participant, every session, on
   their own. Replaced September 27, 2026 — see docs/IRF-BACKEND.md for the
   Google Sheet and Apps Script columns this drives. */
const IRF = [
  { id: 'liked', prompt: 'What did you like?' },
  { id: 'disliked', prompt: 'What did you not like?' },
  { id: 'change', prompt: 'What would you change?' },
  { id: 'keep', prompt: 'What would you keep?' }
];

/* The two wrong answers on the check are program rules, not invention, and
   they differ by stage: the Paths carry no finish at all, while the Chest Pin
   and Back Pin do carry owned finishes that must release on the tap. Each
   stage supplies its own pair in courses/_curriculum/. */

function pad(n) { return String(n).padStart(2, '0'); }

/* Some game names carry a trailing note aimed at the curriculum author, not
   the learner, e.g. "(Continuous)", "(Terminal)". The full verbatim name
   stays in the curriculum data; the learner-facing title drops a trailing
   parenthetical. Everything else about a KB title, including any dash it
   carries, is kept word for word. */
function gameTitle(name) {
  return String(name).replace(/\s*\([^()]*\)\s*$/, '').trim();
}

/* ------------------------------------------------------------------ screens

   Six screens, in the guide's own order. Nothing here is authored beyond
   plain-language framing sentences — every fact comes from the curriculum
   data, which itself comes straight from that session's Grappling Class
   Guide and Lesson and Intervention Guide.                                 */

function screenQuestion(s) {
  return {
    id: `s${pad(s.n)}-question`,
    type: 'text-image',
    eyebrow: `Session ${s.n} · Today's question`,
    title: s.probingQuestion,
    body: []
  };
}

/* Cut to the bone, per instructor direction September 27, 2026: a boy at a
   7th grade reading level, typing four answers after, has to clear the whole
   module in five minutes. This screen shows only the three game names and
   each player's win, one line each — no start, no rules text, no SLO label.
   The full game (start, task, skill) still lives in courses/_curriculum/ and
   on that session's Grappling Class Guide for the coach. */
function screenGames(s) {
  const body = [];
  s.games.forEach((game) => {
    body.push({ kind: 'heading', level: 3, text: gameTitle(game.title) });
    body.push({ kind: 'list', items: game.win.map((w) => `${w.role} ${w.text}`) });
  });

  return {
    id: `s${pad(s.n)}-games`,
    type: 'text-image',
    eyebrow: 'Tonight on the mat',
    title: 'The three games',
    body
  };
}

function screenGolmestRecap(s) {
  const g = s.golmest;
  return {
    id: `s${pad(s.n)}-golmest`,
    type: 'text-image',
    eyebrow: 'Tonight on the mat',
    title: g.recapTitle,
    body: [
      { kind: 'lead', text: g.recapText },
      { kind: 'heading', level: 3, text: g.standard.label },
      { kind: 'list', items: g.standard.items },
      { kind: 'heading', level: 3, text: g.tap.label },
      { kind: 'list', ordered: true, items: g.tap.items }
    ]
  };
}

/* The quiz always checks the pinned game's win for the top player — the
   position every session builds toward, and the one the stage's two wrong
   answers (the finish/harm rules) are written against. Session 1 has no
   pinned game, so it checks the tap instead. correctHead/correctText/
   incorrectHead/incorrectText/revealText are left out on purpose: the engine
   already has its own default wording for all five, repeated identically
   across all 36 sessions otherwise. */
function screenCheck(s, stage) {
  if (s.golmest) {
    const g = s.golmest;
    return {
      id: `s${pad(s.n)}-check`,
      type: 'quiz',
      eyebrow: 'Quick check',
      title: 'What you just learned',
      assessment: { role: 'formative', scored: false },
      question: g.quizQuestion,
      select: 'single',
      retry: true,
      options: [
        { text: g.quizCorrect, correct: true, feedback: 'That\'s it, every session.' },
        { text: g.quizWrong[0], feedback: 'Too slow. Stop right away.' },
        { text: g.quizWrong[1], feedback: 'Too slow. Stop right away.' }
      ]
    };
  }

  const pinned = s.games[2];
  const win = pinned.win[0];
  return {
    id: `s${pad(s.n)}-check`,
    type: 'quiz',
    eyebrow: 'Quick check',
    title: 'How you win it',
    assessment: { role: 'formative', scored: false },
    question: `${gameTitle(pinned.title)}: the top player's win?`,
    select: 'single',
    retry: true,
    options: [
      { text: `${win.role} ${win.text}`, correct: true, feedback: "That's it." },
      stage.wrongAnswers[0],
      stage.wrongAnswers[1]
    ]
  };
}

function screenTakeaway(s) {
  return {
    id: `s${pad(s.n)}-takeaway`,
    type: 'text-image',
    eyebrow: 'The takeaway',
    title: 'What tonight was really about',
    body: [
      { kind: 'lead', text: s.takeaway }
    ]
  };
}

function screenReflection(s) {
  const slide = {
    id: `s${pad(s.n)}-reflection`,
    type: 'reflection',
    eyebrow: 'On your own',
    title: 'Your answer',
    prompt: s.probingQuestion,
    hint: 'Not graded.',
    placeholder: 'Whatever comes to mind…'
  };
  if (s.privateOk) {
    slide.hint = 'Just look at it. Nothing to write.';
  }
  return slide;
}

function screenIRF(s, isLast) {
  return {
    id: `s${pad(s.n)}-irf`,
    type: 'reflection',
    eyebrow: 'On your own',
    title: 'Instruction Rating Form',
    kindLabel: 'IRF',
    fields: IRF,
    requireAll: true,
    required: true,
    submit: true,
    sendLabel: 'Send it',
    reflectionFrom: `s${pad(s.n)}-reflection`,
    body: isLast ? [{ kind: 'callout', label: 'Last session', text: 'That is all 36.' }] : [],
    _note: 'Unit 4: the IRF is the last screen of the module and no student leaves before completing it. Where this lands is set once in courses/_curriculum/irf.json — see docs/IRF-BACKEND.md. With no destination configured the screen still works and the answers stay on the device.'
  };
}

/* ------------------------------------------------------------------- course */

function buildCourse(s, stage) {
  const today = [
    screenQuestion(s),
    s.golmest ? screenGolmestRecap(s) : screenGames(s),
    screenCheck(s, stage)
  ];

  const close = [
    screenTakeaway(s),
    screenReflection(s),
    screenIRF(s, s.n === 36)
  ];

  const scenes = [
    { id: 'today', title: 'Today', slides: today },
    { id: 'close', title: 'Before you go', slides: close }
  ];

  const course = {
    id: `session-${pad(s.n)}`,
    title: `Session ${s.n} — ${s.theme}`,
    lang: 'en',
    rightsHolder: RIGHTS,
    meta: {
      session: s.n,
      sessionOf: 36,
      stage: stage.name,
      week: s.week,
      theme: s.theme,
      neighborhood: stage.neighborhood,
      block: 'Block 4 — Cleanup, eLearning, IRF',
      casel: stage.casel,
      bloom: stage.bloom,
      probingQuestion: s.probingQuestion,
      games: s.golmest ? null : s.games.map((g) => ({ skill: g.skill, title: g.title })),
      connection: s.connection,
      takeaway: s.takeaway,
      _source: `GWMS Curriculum Guide — Session ${s.n} Grappling Class Guide and Lesson and Intervention Guide (Unit 7), GWMS Game Rulings, GWMS 90-Minute Class: Locked Decisions.`
    },
    _generated: 'Written by tools/build-sessions.js from courses/_curriculum/. Re-running overwrites this file.',
    scenes
  };

  return course;
}

/* --------------------------------------------------------------------- main */

const stageFiles = fs.readdirSync(CURRICULUM)
  .filter((f) => f.endsWith('.json') && f !== 'irf.json')
  .sort();
if (!stageFiles.length) {
  console.error('No curriculum data in courses/_curriculum/.');
  process.exit(2);
}

const index = { program: 'Grappling With My Self (GWMS)', note: 'Generated by tools/build-sessions.js.', courses: [] };

// Where IRF responses land. Authored once, in courses/_curriculum/irf.json.
const irfPath = path.join(CURRICULUM, 'irf.json');
if (fs.existsSync(irfPath)) {
  index.irf = JSON.parse(fs.readFileSync(irfPath, 'utf8'));
}
let written = 0;

for (const file of stageFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(CURRICULUM, file), 'utf8'));
  const stage = data.stage;

  for (const s of data.sessions) {
    const dir = path.join(COURSES, `session-${pad(s.n)}`);
    fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });

    const course = buildCourse(s, stage);

    fs.writeFileSync(path.join(dir, 'course.json'), JSON.stringify(course, null, 2) + '\n');
    const summaryGame = s.golmest ? 'Orientation night, GOLMEST.' : `Games: ${s.games.map((g) => gameTitle(g.title)).join(', ')}.`;
    index.courses.push({
      id: course.id,
      title: `${course.title} — ${stage.name}`,
      summary: `Week ${s.week}, ${s.theme}. “${s.probingQuestion}” ${summaryGame}`
    });
    written += 1;
    process.stdout.write(`  ✓ ${course.id}  ${course.scenes.reduce((n, sc) => n + sc.slides.length, 0)} screens\n`);
  }
}

// Keep the engine demo listed if it is still on disk.
if (fs.existsSync(path.join(COURSES, 'engine-demo', 'course.json'))) {
  index.courses.push({
    id: 'engine-demo',
    title: 'Engine demo — every slide type',
    summary: 'Not course content. Exercises every slide type and assessment strategy.'
  });
}

fs.writeFileSync(path.join(COURSES, 'index.json'), JSON.stringify(index, null, 2) + '\n');
console.log(`\nWrote ${written} session module(s) and courses/index.json.`);
