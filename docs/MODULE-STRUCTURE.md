# What a session module contains

Nothing here is a design proposal. Every screen exists because the GWMS Curriculum Guide has a field for it.

## What the guide specifies

**Unit 4, Class Structure and Session Flow** governs Block 4:

> Block 4: Cleanup, eLearning, IRF (30 min). Room reset, the eLearning module, and the IRF. **The IRF is the last screen of the module. No student leaves before completing it.** The coach completes the Reflection Log during the eLearning window.
>
> eLearning Delivery System. Students access each session's eLearning module by scanning a session-specific QR code on their personal smartphone… Articulate hosts the module. IRF responses log through a Google Form backend or basic LMS.

So: one module per session, phone-first, IRF last and mandatory.

**Unit 7** holds the 36 Lesson and Intervention Guides. Each carries the fields the module is built from — probing question, the game, Grappling TLO and ELOs, CASEL TLO and ELOs, and the connection line. **The GWMS Technical Map** supplies the card, domain, and key condition. **Unit 6** holds the stage-level objectives and the stage connection.

## The screens

One screen per curriculum field, in the guide's own order.

| Scene | Screen | Type | Comes from |
|---|---|---|---|
| Today | Probing question | `text-image` | stage question page (+ audio path) |
| Today | Look back | `reveal` | an earlier session's probing question and connection line (omitted for Session 1) |
| Today | The game | `text-image` | L&I Guide → the game; reveals carry the Technical Map key condition and the tap |
| Today | How you win it | `quiz` formative | the game's win condition |
| The lesson | What you were working on | `text-image` | Grappling TLO + ELOs |
| The lesson | The part that was not grappling | `text-image` | CASEL TLO + ELOs |
| The lesson | Where those two meet | `reveal` | the connection line; reveal carries the Unit 6 stage connection |
| Before you go | Your answer | `reflection` | the probing question |
| Before you go | Instruction Rating Form | `reflection`, 3 fields, all required | Unit 4 |

## Spaced retrieval

The program runs three sessions a week, so lags of 3, 6 and 12 sessions are one week, two weeks and four weeks. Each session takes the next lag in turn, so callbacks expand rather than always reaching back the same distance. Sessions 2 and 3 can only reach Session 1; Session 1 has no look-back screen at all.

Across the 36 sessions that produces 13 one-week callbacks, 12 two-week, and 8 four-week — and **14 callbacks that cross a stage boundary**, so The Return keeps pulling on The Descent.

It is retrieval, not review. The earlier probing question is shown, the learner is asked to remember their own answer *before* reading on, and what that session was driving at sits behind a reveal they have to choose to open. Nothing is authored for it: the question and the connection line are that session's own.

`meta.looksBackAt` on every course records the target session.

## Two standing design rules

From instructor feedback on the Session 1 prototype, marked to carry into this build:

- **No "click".** Use choose, select, follow, go to, use. Many learners have no mouse and it reads less technical. Verified: zero instances in any learner-facing text across all 36 modules.
- **Persistent navigation on every screen**, not just a route back to the start. The Contents button sits in the app bar on every screen and jumps directly to any slide in the module.

**A session with no field gets no screen.** Session 1's Lesson and Intervention Guide has only the game paragraph — no TLOs, no ELOs, no connection — so Session 1 is five screens, not eight, and states none of the objectives it does not have.

The two wrong answers on the check are program rules, not invention, and they are set per stage because the rules differ:

| Stage | Wrong answers |
|---|---|
| The Descent | Submitting your partner (the Roads carry no finish) · Putting your partner down hard |
| The Initiation | Holding the finish after the tap · Overpowering instead of adjusting |
| The Return | Holding the finish after the tap · Hurting your partner because you can |

A session's `note` field — the guides' explicit caveats, like *staying is the skill but leaving a harmful situation is not failure* (Sessions 17, 23) or *costly giving is not self-erasure* (Session 29) — renders as a callout on the connection screen rather than being dropped.

## Building

Sessions are generated, not hand-written:

```bash
node tools/build-sessions.js
```

It reads `courses/_curriculum/*.json` — the transcribed curriculum fields — and writes one `courses/session-NN/course.json` each, plus `courses/index.json`. To change what every module contains, change the generator. To change what one session says, change the curriculum data. Hand-edits to a generated `course.json` are overwritten on the next run.

## Open against the guide

- **IRF has no backend.** Unit 4 routes IRF responses through a Google Form or basic LMS. This engine has none, so answers stay on the device. Recorded as a `_todo` on every IRF screen.
- **Unit 4 and Unit 5 disagree on IRF timing** — Unit 4 puts it in the module, Unit 5 puts the tablet out in the last three minutes of Block 3. The module follows Unit 4, which is the section that defines the eLearning artifact.
- **Session 1's guide is incomplete.** Six fields missing that every other session has.
