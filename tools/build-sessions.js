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

/* The two wrong answers on the check are program rules, not invention, and
   they differ by stage: the Roads carry no finish at all, while the Chest Pin
   and Back Pin do carry owned finishes that must release on the tap. Each
   stage supplies its own pair in courses/_curriculum/. */

function pad(n) { return String(n).padStart(2, '0'); }

/* ---------------------------------------------------------------- lookback

   Spaced retrieval across the 36 sessions.

   The program runs three sessions a week, so lags of 3, 6 and 12 sessions are
   one week, two weeks and four weeks. Each session draws the next lag in turn,
   which spreads every module's callback across an expanding interval instead
   of always reaching back the same distance.

   It is a retrieval prompt, not a re-read: the earlier probing question is
   shown, the learner is asked to remember their own answer first, and what
   that session was driving at sits behind a reveal they have to open.

   Nothing here is new content. The question and the connection line are that
   session's own, straight from its Lesson and Intervention Guide.            */

const LAGS = [3, 6, 12];

function lookbackFor(n) {
  if (n <= 1) return null;
  const preferred = LAGS[(n - 1) % LAGS.length];
  const order = [preferred].concat(LAGS.filter((l) => l !== preferred).sort((a, b) => b - a));
  for (const lag of order) {
    if (n - lag >= 1) return n - lag;
  }
  return 1;                            // sessions 2 and 3 can only look at 1
}

function screenLookback(s, prior, priorStage) {
  if (!prior) return null;

  const slide = {
    id: `s${pad(s.n)}-lookback`,
    eyebrow: 'Look back',
    title: `Session ${prior.n} asked you this`,
    body: [
      { kind: 'quote', text: prior.probingQuestion, attribution: `Session ${prior.n} — ${priorStage.name}, ${prior.theme}` },
      { kind: 'paragraph', text: 'Before you read on, see if you can remember what you answered.' }
    ]
  };

  // The moral, not the structure. `takeaway` is that session's own one-line
  // close, spoken straight to the room at the end of its Lesson and
  // Intervention block — what to actually walk away with, not a sentence
  // about how the mat and the reflection happen to line up.
  if (prior.takeaway) {
    slide.type = 'reveal';
    slide.reveals = [{
      id: 'what-it-was-after',
      label: 'What that one was really about',
      content: [{ kind: 'paragraph', text: prior.takeaway }]
    }];
  } else {
    slide.type = 'text-image';
  }
  return slide;
}

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

/* Some corrected game names carry a trailing note aimed at the curriculum
   author, not the learner: "(mud and guard version, locked win condition)",
   "(same capstone-week exception as 34)". The full verbatim name stays in the
   curriculum data and in course meta, and the learner-facing title and quiz
   drop that trailing parenthetical. Qualifiers that are not parenthetical,
   like "played from the retaining side", are part of the name and stay. */
function gameTitle(name) {
  return String(name).replace(/\s*\([^()]*\)\s*$/, '').trim();
}

function screenGame(s) {
  const body = [{ kind: 'lead', text: s.gameText }];
  if (s.gameNote) body.push({ kind: 'paragraph', text: s.gameNote });

  const slide = {
    id: `s${pad(s.n)}-game`,
    type: 'text-image',
    eyebrow: 'The game',
    title: gameTitle(s.gameName),
    body
  };

  const reveals = [];
  if (s.keyCondition) {
    reveals.push({
      id: 'key-condition',
      label: 'What had to be true first',
      content: [{ kind: 'paragraph', text: s.keyCondition }]
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

function screenCheck(s, stage) {
  return {
    id: `s${pad(s.n)}-check`,
    type: 'quiz',
    eyebrow: 'Quick check',
    title: 'How you win it',
    assessment: { role: 'formative', scored: false },
    question: `In ${gameTitle(s.gameName)}, what counts as the win?`,
    select: 'single',
    retry: true,
    options: [
      { text: s.gameWin, correct: true, feedback: 'That is the win condition, and nothing else scores.' },
      stage.wrongAnswers[0],
      stage.wrongAnswers[1]
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
      { kind: 'lead', text: secondPerson(s.grapplingTlo) },
      { kind: 'heading', level: 3, text: 'Which broke down into' },
      { kind: 'list', ordered: true, items: s.grapplingElos.map(secondPerson) }
    ]
  };
}

function screenCasel(s) {
  if (!s.caselTlo) return null;
  return {
    id: `s${pad(s.n)}-casel`,
    type: 'text-image',
    eyebrow: 'The other half',
    title: 'And the part that was not about grappling',
    body: [
      { kind: 'lead', text: secondPerson(s.caselTlo) },
      { kind: 'heading', level: 3, text: 'Which broke down into' },
      { kind: 'list', ordered: true, items: s.caselElos.map(secondPerson) }
    ]
  };
}

function screenConnection(s, stage) {
  if (!s.connection) return null;
  const slide = {
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
  if (s.note) {
    slide.body.push({ kind: 'callout', label: 'Worth saying plainly', text: s.note });
  }
  return slide;
}

/* ------------------------------------------------------------ second person

   The curriculum guide writes TLOs and ELOs as a spec about a "participant",
   third person, for facilitators reading a binder. A kid reading it on their
   own phone is not a case file. Every one of those lines gets stripped of the
   "By the end of this session, the participant will" stem and reworked into
   direct address before it reaches the screen — mechanical pronoun swaps
   only, never a paraphrase of what the line actually says.                  */

function secondPerson(text) {
  let t = String(text).replace(/^By the end of this session,\s*the participant will\s*/i, '');
  t = t.replace(/\btheir\b/g, 'your').replace(/\bthey\b/g, 'you').replace(/\bthem\b/g, 'you');
  t = t.replace(/\bthemselves\b/g, 'yourself').replace(/\bthey are\b/g, 'you are');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/* ------------------------------------------------------------- summative

   AECT 3.3 wants a summative measure alongside the formative checkpoint, and
   it has to test whether the session's point landed, not whether a game rule
   was memorised.

   So the question is "what was this session asking of you", the right answer
   is that session's own CASEL TLO, and the wrong answers are the CASEL TLOs of
   two other sessions in the same stage. Every option is real curriculum, which
   makes the distractors plausible by construction — they are genuine targets,
   just not today's — and means nothing here is authored.

   Option order is not fixed here. The engine shuffles quiz options itself,
   seeded by the slide id, so the right answer lands in a different position
   from session to session but stays put across reloads of the same slide. */

function screenSummative(s, stage, sessions) {
  if (!s.caselTlo) return null;

  const pool = sessions.filter((x) => x.n !== s.n && x.caselTlo);
  if (pool.length < 2) return null;

  // Deterministic picks, so a rebuild produces the same paper every time.
  const a = pool[s.n % pool.length];
  const b = pool[(s.n + Math.floor(pool.length / 2)) % pool.length];
  const wrong = (b.n === a.n) ? [a, pool[(s.n + 1) % pool.length]] : [a, b];

  const options = [
    { text: secondPerson(s.caselTlo), correct: true, feedback: 'That was the target for today.' },
    ...wrong.map((w) => ({
      text: secondPerson(w.caselTlo),
      feedback: `That is Session ${w.n}'s target, not today's.`
    }))
  ];

  return {
    id: `s${pad(s.n)}-summative`,
    type: 'quiz',
    eyebrow: 'End-of-session check',
    title: 'What today was asking of you',
    assessment: { role: 'summative', scored: true },
    question: 'Which one was this session actually asking you to do?',
    select: 'single',
    retry: true,
    options: options,
    correctHead: "That's the one.",
    correctText: 'That was the point of the whole session, on the mat and off it.',
    incorrectHead: 'Not today.',
    incorrectText: 'That is a real target from this stage, just not this session. Try again.',
    revealText: "Today's target is marked above."
  };
}

/* Revisits the game right before the two closing checks, in the room's own
   words, not a summary I wrote. Same fields as the "The game" screen earlier
   in the module — this is a recap, not new material. */
function screenRecap(s) {
  const body = [{ kind: 'lead', text: s.gameText }];
  if (s.gameNote) body.push({ kind: 'paragraph', text: s.gameNote });

  return {
    id: `s${pad(s.n)}-recap`,
    type: 'reveal',
    eyebrow: 'Quick recap',
    title: `Before you go: ${gameTitle(s.gameName)}`,
    body,
    reveals: [
      {
        id: 'win-again',
        label: 'How you win it, again',
        content: [{ kind: 'paragraph', text: s.gameWin }]
      },
      {
        id: 'tap-again',
        label: 'And the rule under all of it',
        content: [
          { kind: 'list', ordered: true, items: ["Tap your partner's body", 'Tap the mat', 'Say stop'] },
          { kind: 'paragraph', text: 'Any of the three ends the round immediately. When your partner taps, you stop. Not after you finish the move. Immediately.' }
        ]
      }
    ]
  };
}

function screenReflection(s) {
  const slide = {
    id: `s${pad(s.n)}-reflection`,
    type: 'reflection',
    eyebrow: 'Reflection',
    title: 'Your answer',
    prompt: s.probingQuestion,
    hint: 'Nothing here is graded. A few words is plenty.',
    placeholder: 'Whatever comes to mind…'
  };
  if (s.privateOk) {
    slide.hint = 'You do not have to write anything here. Looking at it yourself is the whole task.';
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
    submit: true,
    sendLabel: 'Send it',
    reflectionFrom: `s${pad(s.n)}-reflection`,
    body: next
      ? [{ kind: 'callout', label: 'Next session', text: next }]
      : [{ kind: 'callout', label: 'Last session', text: 'That is all 36.' }],
    _note: 'Unit 4: the IRF is the last screen of the module and no student leaves before completing it. Where this lands is set once in courses/_curriculum/irf.json — see docs/IRF-BACKEND.md. With no destination configured the screen still works and the answers stay on the device.'
  };
}

/* ------------------------------------------------------------------- course */

function buildCourse(s, stage, sessions, hasAudio, allSessions) {
  // allSessions is the whole 36, not just this stage's file — the last
  // session of a stage (12, 24) has to look across that boundary to find
  // session 13 or 25, or it wrongly reads as the end of the program.
  const nextEntry = allSessions[s.n + 1];
  const next = nextEntry
    ? `Session ${nextEntry.session.n}: ${nextEntry.session.probingQuestion}`
    : null;

  const lookbackN = lookbackFor(s.n);
  const lookbackEntry = lookbackN ? allSessions[lookbackN] : null;

  const today = [
    screenQuestion(s, stage, hasAudio),
    lookbackEntry ? screenLookback(s, lookbackEntry.session, lookbackEntry.stage) : null,
    screenGame(s),
    screenCheck(s, stage)
  ].filter(Boolean);

  const lesson = [
    screenGrappling(s),
    screenCasel(s),
    screenConnection(s, stage)
  ].filter(Boolean);

  const close = [
    screenRecap(s),
    screenSummative(s, stage, sessions),
    screenReflection(s),
    screenIRF(s, next)
  ].filter(Boolean);

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
      gameName: s.gameName,
      probingQuestion: s.probingQuestion,
      grapplingTlo: s.grapplingTlo,
      looksBackAt: lookbackN,
      grapplingElos: s.grapplingElos,
      caselTlo: s.caselTlo,
      caselElos: s.caselElos,
      connection: s.connection,
      takeaway: s.takeaway,
      _source: `GWMS Curriculum Guide — Session ${s.n} Lesson and Intervention Guide (Unit 7), GWMS Technical Map, Unit 4 (Block 4 structure), Unit 6 (stage objectives).`
    },
    _generated: 'Written by tools/build-sessions.js from courses/_curriculum/. Re-running overwrites this file.',
    scenes
  };

  if (s._todo) course.meta._todo = s._todo;
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

// Pass 1 — index every session across all stages, so a module in The Return
// can look back into The Descent.
const allSessions = {};
for (const file of stageFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(CURRICULUM, file), 'utf8'));
  for (const s of data.sessions) allSessions[s.n] = { session: s, stage: data.stage };
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

    const hasAudio = fs.existsSync(path.join(dir, 'assets', 'probing-question.m4a'));
    const course = buildCourse(s, stage, data.sessions, hasAudio, allSessions);

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
