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

   Screen order follows the curriculum guide's own fields, and Unit 4:
   "Block 4: Cleanup, eLearning, IRF … The IRF is the last screen of the module.
   No student leaves before completing it."
   --------------------------------------------------------------------------- */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CURRICULUM = path.join(ROOT, 'courses', '_curriculum');
const COURSES = path.join(ROOT, 'courses');

const RIGHTS = 'Jamey Phoenix Bethea, Conceptual Combat Academy';

/* The three IRF questions, asked of every participant, every session. */
const IRF = [
  { id: 'mat', prompt: 'What happened today on the mat?' },
  { id: 'worked', prompt: 'What worked?' },
  { id: 'didnt', prompt: 'What did not work?' }
];

/* Program-level rules that make the same two distractors wrong in every
   Descent session: the Roads carry no finishes, and nobody gets slammed. */
const WRONG = [
  {
    text: 'Submitting your partner',
    feedback: 'Not in the Roads. These are the two path domains, Enter and Arrive, and they carry no finish — the path delivers you into a pin and the pin owns the finish.'
  },
  {
    text: 'Putting your partner down hard',
    feedback: 'Never. Everything runs at light resistance, and the tap is honored instantly, every time.'
  }
];

function pad(n) { return String(n).padStart(2, '0'); }

/* ------------------------------------------------------------------ screens */

function screenQuestion(s, stage, hasAudio) {
  const slide = {
    id: `s${pad(s.n)}-question`,
    type: 'text-image',
    eyebrow: `Session ${s.n} · Probing question`,
    title: s.probingQuestion,
    body: [
      {
        kind: 'lead',
        text: 'That is the question for this session. It runs through the whole session: the grappling class, rolling and recovery, and the lesson.'
      },
      {
        kind: 'callout',
        label: 'Where this sits',
        text: `Session ${s.n} of 36. ${stage.name}, Week ${s.week}, ${s.theme}. On the mat that stage runs ${stage.neighborhood}.`
      }
    ]
  };
  if (hasAudio) {
    slide.alternates = [{
      mode: 'audio',
      label: 'Listen',
      src: 'assets/probing-question.m4a',
      transcriptIsBody: true,
      own: true,
      _todo: 'Placeholder narration, machine-generated. Replace with the facilitator\'s voice.'
    }];
  }
  return slide;
}

function screenGame(s) {
  const body = [{ kind: 'lead', text: s.gameText }];
  if (s.gameNote) body.push({ kind: 'paragraph', text: s.gameNote });

  const slide = {
    id: `s${pad(s.n)}-game`,
    type: 'text-image',
    eyebrow: 'The game',
    title: s.gameName,
    body
  };

  const reveals = [];
  if (s.keyCondition) {
    reveals.push({
      id: 'key-condition',
      label: 'What had to be true first',
      content: [
        { kind: 'paragraph', text: s.keyCondition },
        {
          kind: 'paragraph',
          text: `Card: ${s.card}.` + (s.domain ? ` Domain: ${s.domain}.` : '')
        }
      ]
    });
  }
  reveals.push({
    id: 'the-tap',
    label: 'Still true every session: the tap',
    content: [
      { kind: 'list', ordered: true, items: ["Tap your partner's body", 'Tap the mat', 'Say stop'] },
      { kind: 'paragraph', text: 'Any of the three ends the round immediately. When your partner taps, you stop. Not after you finish the move. Immediately.' }
    ]
  });
  slide.reveals = reveals;
  return slide;
}

function screenCheck(s) {
  return {
    id: `s${pad(s.n)}-check`,
    type: 'quiz',
    eyebrow: 'Quick check',
    title: 'How you win it',
    assessment: { role: 'formative', scored: false },
    question: `In ${s.gameName}, what counts as the win?`,
    select: 'single',
    retry: true,
    options: [
      { text: s.gameWin, correct: true, feedback: 'That is the win condition, and nothing else scores.' },
      WRONG[0],
      WRONG[1]
    ],
    correctHead: "That's it.",
    correctText: 'That is the whole win condition for today.',
    incorrectHead: 'Not quite.',
    incorrectText: 'Read the note under your choice, then try again.',
    revealText: 'The right answer is marked above, with the reason.'
  };
}

function screenGrappling(s) {
  if (!s.grapplingTlo) return null;
  return {
    id: `s${pad(s.n)}-grappling`,
    type: 'text-image',
    eyebrow: 'On the mat',
    title: 'What you were working on',
    body: [
      { kind: 'lead', text: s.grapplingTlo },
      { kind: 'heading', level: 3, text: 'Which broke down into' },
      { kind: 'list', ordered: true, items: s.grapplingElos }
    ]
  };
}

function screenCasel(s, stage) {
  if (!s.caselTlo) return null;
  return {
    id: `s${pad(s.n)}-casel`,
    type: 'text-image',
    eyebrow: 'The other half',
    title: 'And the part that was not about grappling',
    body: [
      { kind: 'lead', text: s.caselTlo },
      { kind: 'heading', level: 3, text: 'Which broke down into' },
      { kind: 'list', ordered: true, items: s.caselElos },
      { kind: 'callout', label: 'CASEL', text: stage.casel.join(' · ') }
    ]
  };
}

function screenConnection(s, stage) {
  if (!s.connection) return null;
  return {
    id: `s${pad(s.n)}-connection`,
    type: 'reveal',
    eyebrow: 'The connection',
    title: 'Where those two meet',
    body: [{ kind: 'lead', text: s.connection }],
    reveals: [{
      id: 'stage-arc',
      label: `Where this sits in ${stage.name}`,
      content: [{ kind: 'paragraph', text: stage.connection }]
    }]
  };
}

function screenReflection(s) {
  const slide = {
    id: `s${pad(s.n)}-reflection`,
    type: 'reflection',
    eyebrow: 'Reflection',
    title: 'Your answer',
    prompt: s.probingQuestion,
    hint: 'Nobody is grading this and nobody else sees it. A few words is plenty.',
    placeholder: 'Whatever comes to mind…'
  };
  if (s.privateOk) {
    slide.hint = 'You do not have to write anything here. Looking at it yourself is the whole task. If you do write, nobody else sees it.';
  }
  return slide;
}

function screenIRF(s, next) {
  return {
    id: `s${pad(s.n)}-irf`,
    type: 'reflection',
    eyebrow: 'Before you go',
    title: 'Instruction Rating Form',
    kindLabel: 'IRF — every participant, every session',
    fields: IRF,
    requireAll: true,
    required: true,
    privacyNote: 'These three answers are how the program checks whether the session worked. They are about the session, not about you.',
    body: next
      ? [{ kind: 'callout', label: 'Next session', text: next }]
      : [{ kind: 'callout', label: 'Last session', text: 'That is all 36.' }],
    _todo: 'Unit 4 routes IRF responses through a Google Form backend or basic LMS. This engine has no backend, so answers stay on the device. Wire the submit target before the pilot.'
  };
}

/* ------------------------------------------------------------------- course */

function buildCourse(s, stage, sessions, hasAudio) {
  const nextSession = sessions.find((x) => x.n === s.n + 1);
  const next = nextSession
    ? `Session ${nextSession.n}: ${nextSession.probingQuestion}`
    : null;

  const today = [
    screenQuestion(s, stage, hasAudio),
    screenGame(s),
    screenCheck(s)
  ];

  const lesson = [
    screenGrappling(s),
    screenCasel(s, stage),
    screenConnection(s, stage)
  ].filter(Boolean);

  const close = [
    screenReflection(s),
    screenIRF(s, next)
  ];

  const scenes = [{ id: 'today', title: 'Today', slides: today }];
  if (lesson.length) scenes.push({ id: 'lesson', title: 'The lesson', slides: lesson });
  scenes.push({ id: 'close', title: 'Before you go', slides: close });

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
      card: s.card,
      domain: s.domain,
      keyCondition: s.keyCondition,
      probingQuestion: s.probingQuestion,
      grapplingTlo: s.grapplingTlo,
      grapplingElos: s.grapplingElos,
      caselTlo: s.caselTlo,
      caselElos: s.caselElos,
      connection: s.connection,
      _source: `GWMS Curriculum Guide — Session ${s.n} Lesson and Intervention Guide (Unit 7), GWMS Technical Map, Unit 4 (Block 4 structure), Unit 6 (stage objectives).`
    },
    _generated: 'Written by tools/build-sessions.js from courses/_curriculum/. Re-running overwrites this file.',
    scenes
  };

  if (s._todo) course.meta._todo = s._todo;
  return course;
}

/* --------------------------------------------------------------------- main */

const stageFiles = fs.readdirSync(CURRICULUM).filter((f) => f.endsWith('.json')).sort();
if (!stageFiles.length) {
  console.error('No curriculum data in courses/_curriculum/.');
  process.exit(2);
}

const index = { program: 'Grappling With My Self (GWMS)', note: 'Generated by tools/build-sessions.js.', courses: [] };
let written = 0;

for (const file of stageFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(CURRICULUM, file), 'utf8'));
  const stage = data.stage;

  for (const s of data.sessions) {
    const dir = path.join(COURSES, `session-${pad(s.n)}`);
    fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });

    const hasAudio = fs.existsSync(path.join(dir, 'assets', 'probing-question.m4a'));
    const course = buildCourse(s, stage, data.sessions, hasAudio);

    fs.writeFileSync(path.join(dir, 'course.json'), JSON.stringify(course, null, 2) + '\n');
    index.courses.push({
      id: course.id,
      title: `${course.title} — ${stage.name}`,
      summary: `Week ${s.week}, ${s.theme}. “${s.probingQuestion}” Game: ${s.gameName}.`
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
