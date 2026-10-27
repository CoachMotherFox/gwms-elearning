# What a session module contains

Every screen exists because a field in the GWMS Curriculum Guide calls for it. Nothing is authored beyond plain framing lines; every fact comes from that session's Grappling Class Guide or Lesson and Intervention Guide in Notion (Unit 7).

This file describes the modules as they ship today (October 2026). It replaces the eight-screen design from August 2026, which was cut on September 27, 2026 on instructor direction: a boy reading at a 5th grade level, who still has four answers to type, has to clear the whole module in five minutes.

## What the guide specifies

**Unit 4, Class Structure and Session Flow** governs Block 4:

> Block 4: Cleanup, eLearning, IRF (30 min). Room reset, the eLearning module, and the IRF. **The IRF is the last screen of the module. No student leaves before completing it.** The coach completes the Reflection Log during the eLearning window.

So: one module per session, phone-first, IRF last and mandatory. The Grappling Class Guides give the eLearning slot one round on the timer, with the recap done in pairs and the IRF done alone.

**Unit 7** holds the 36 Grappling Class Guides and the 36 Lesson and Intervention Guides. The games, the win lines, and the "What it is" lines come from the Class Guides. The probing question, connection line, and takeaway come from the Lesson and Intervention Guides.

## The screens

Six screens, in the guide's own order.

| Scene | Screen | Type | Comes from |
|---|---|---|---|
| Today | Today's question | `text-image` | the session's probing question |
| Today | The three games | `text-image` | each game's "What it is" line and its win lines, from the Grappling Class Guide |
| Today | What made it work? | `quiz`, formative, required | the night's lesson: tonight's thread plus the three Conceptualize lines, one per game |
| Before you go | What tonight was really about | `text-image` | the takeaway |
| Before you go | Your answer | `reflection` | the probing question, not graded |
| Before you go | Instruction Rating Form | `reflection`, 3 fields, all required, sends | Unit 4 |

**Session 1** is orientation night with no games, so its second screen is a GOLMEST recap (what tonight was, what you are here to learn, the tap) instead of the games screen. Since October 14, 2026 it has the same concept check as every other session, asking what you do the second your partner taps.

### The games screen

Each game gets a plain label, the three words the Class Guide itself uses for the CVP section headers: **Game 1: Standing**, **Game 2: Guarded**, **Game 3: Pinned**. Under the label: the game's "What it is" line (8 words or fewer), then one win line per role.

Only "What it is" and "Wins" are player-facing. How it works, Scale it, Ask them, and Watch for are coach-only and never appear in a module. The KB game title (for example "Mount: Stay Under Both Elbows") is kept in the curriculum data for the coach and for `courses/index.json`, but it does not render on the screen.

Win lines use plain words a first-timer can picture. No guard recovery, reversal, pass, or outsides. A continuous game says so in the win line ("holds as long as his chest stays on his back"; "keep scoring all round").

### The concept check

One quiz per session. It asks about a physical thing that night's games taught, built from tonight's thread and the three Conceptualize lines. Three answers of about the same length, one right. Each wrong answer carries a one-line note.

The right answer has no feedback of its own. Instead the check carries a **bridge**: one line that ties the lesson to the night's probing question. Since October 14, 2026 every learner sees the bridge once the answer is settled. Right the first time: bridge. Wrong the first time: the note under the chosen answer, then one more try, then the right answer and the bridge either way. The screen is `required`, so Next waits for that.

Example, Session 20 ("What breaks first in you?"):

> Tonight you broke his balance, his lock, and his defense. What made each break work?
> - You did it in order and stopped at the win. (right)
> - You went as hard as you could.
> - You waited for him to make a mistake.
>
> Bridge: A break you control can be fixed. A break you leave is the real problem.

## The word budget

Count what one kid reads on one pass: every screen's text, each question and all its options, plus one feedback line per question (the longest). The cap is 280 words. A session still over 280 after the takeaway cap may run up to 300. Takeaways are capped at 50 words. Win lines are never thinned to make room.

As of October 2026 every session is at or under 300 on the right-first-try path. A kid who misses once reads one wrong note plus the bridge, which puts 17 sessions at 302 to 310; that is accepted under the one-feedback-line rule.

## Two standing design rules

From instructor feedback on the Session 1 prototype, kept through every rebuild:

- **No "click".** Use choose, select, follow, go to, use. Many learners have no mouse and it reads less technical.
- **Persistent navigation on every screen**, not just a route back to the start. The Contents button sits in the app bar on every screen and jumps directly to any slide in the module.

Two more, from the September and October 2026 rounds:

- **5th grade reading level, no em or en dashes** in anything a learner can see. That includes module titles, the browser tab, and the "All sessions" list.
- **Never guess a game rule.** If the Class Guide does not say it, the module does not say it. Source flags in the Class Guides record where the KB left a gap and what rule was set.

## Building

Sessions are generated, not hand-written:

```bash
node tools/build-sessions.js
sh tools/bundle.sh
node tools/check.js
```

`build-sessions.js` reads `courses/_curriculum/*.json` and writes one `courses/session-NN/course.json` each, plus `courses/index.json`. `bundle.sh` wraps each `course.json` as `course.bundle.js` for `file://` use. `check.js` runs the accessibility and integrity checker over every module. Hand-edits to a generated `course.json` are overwritten on the next run.

To change what every module contains, change the generator. To change what one session says, change the curriculum data.

### Curriculum data

One file per stage: `descent.json` (Sessions 1 to 12), `initiation.json` (13 to 24), `return.json` (25 to 36). Each has a `stage` block and a `sessions` array. A session carries:

| Field | Used for |
|---|---|
| `n`, `week`, `theme`, `probingQuestion` | the question screen, titles, and `index.json` |
| `games[]` | the games screen. Each game: `skill`, `title` (KB title, data only), `whatItIs`, `start`, `text`, `win[]` (`role` + `text`), `reset`, optional `note` |
| `concept` | the concept check: `lesson`, `question`, `options[]` (`text`, `correct`, `feedback`), `bridge` |
| `takeaway` | the takeaway screen, 50 words or fewer |
| `connection`, `note` | coach context from the Lesson and Intervention Guide; not rendered |
| `golmest` | Session 1 only: the orientation recap |

`courses/_curriculum/irf.json` sets where the IRF posts. See [IRF-BACKEND.md](IRF-BACKEND.md).

## Open against the guide

- **Unit 4 and Unit 5 disagree on IRF timing.** Unit 4 puts it in the module, Unit 5 puts the tablet out in the last three minutes of Block 3. The module follows Unit 4, which is the section that defines the eLearning artifact.
- **No images yet.** The engine supports them (alt text and credits are enforced). None of the 21 starting positions has a still.
