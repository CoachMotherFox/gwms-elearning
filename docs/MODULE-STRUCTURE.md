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
| Today | The game | `text-image` | L&I Guide → the game; reveals carry the Technical Map key condition and the tap |
| Today | How you win it | `quiz` formative | the game's win condition |
| The lesson | What you were working on | `text-image` | Grappling TLO + ELOs |
| The lesson | The part that was not grappling | `text-image` | CASEL TLO + ELOs |
| The lesson | Where those two meet | `reveal` | the connection line; reveal carries the Unit 6 stage connection |
| Before you go | Your answer | `reflection` | the probing question |
| Before you go | Instruction Rating Form | `reflection`, 3 fields, all required | Unit 4 |

**A session with no field gets no screen.** Session 1's Lesson and Intervention Guide has only the game paragraph — no TLOs, no ELOs, no connection — so Session 1 is five screens, not eight, and states none of the objectives it does not have.

The two wrong answers on the check are the same every Descent session and are program rules, not invention: the Roads carry no finish (Unit 4: *"Two domains, no finish"*), and nothing is applied hard (*"the tap is honored instantly, every time"*).

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
