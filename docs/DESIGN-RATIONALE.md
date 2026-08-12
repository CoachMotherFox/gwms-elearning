# Design rationale — AECT Performance 1

How the four Required Elements of the Multimedia eLearning Environment artifact are met by decisions made **at the start of the build**, not retrofitted. Each claim below points at something in the repository that can be opened and inspected.

---

## Required Element 1 — Rationale for tool choices

### Why a custom engine rather than Articulate Storyline, Rise, or an LMS

| Constraint | Consequence |
|---|---|
| 36 sessions, iterated over a full program cycle | Per-seat authoring licences and re-publishing 36 packages per revision is the wrong cost curve. Editing one JSON file and reloading is the right one. |
| Delivered on shared tablets at a training site, on whatever network exists that night | The whole course is static files. It works offline, off a USB stick, off a phone, off any static host. No runtime, no plugin, no login. |
| Block 4 is 30 minutes shared between room reset, eLearning, and the IRF | The eLearning slice is minutes long. Loading an LMS shell around it costs more than it delivers. |
| Trauma-informed program with adolescent minors | Building it means the data model is a choice, not a vendor default. Exactly one thing is collected, it is named on screen, and turning it off is one line. |
| Accessibility is scored (AECT 3.5, 3.6) | Owning the markup means alt text, captions, focus order, and contrast are enforced by the engine rather than hoped for in an exported package. |

### Why the Storyline content model anyway

**Course → Scenes → Slides → Interactions** is Storyline's structure, adopted deliberately. It is a proven organisation of e-learning content, it is what an instructional designer joining this project will already recognise, and it keeps a future migration to Storyline open — the tree maps across without a rethink.

### Why plain HTML, CSS and JavaScript

- **No build toolchain.** A build step is a future failure: it rots, it needs a specific Node version, and it stands between the author and a fix. `git clone` (or a copied folder) and open the file.
- **No framework.** The engine is roughly 1,200 lines. A framework would be larger than the thing it renders and would tie a 3-year program to a dependency tree.
- **Classic scripts, not ES modules.** Browsers block module loading over `file://`. Classic scripts mean a reviewer can double-click `index.html` and it works.
- **JSON as source of truth.** Content is data, not code. It diffs, it can be validated by machine, and Phase 2 can put a visual editor on top of it without touching the renderer.

### Why the two-path loader

`course.json` is the file the author writes. Served over HTTP the engine fetches it live — no build step while authoring. Opened from disk, browsers refuse `fetch()` on `file://`, so the engine falls back to `course.bundle.js`, a one-line wrapper `tools/bundle.sh` writes around the same JSON. Nothing is duplicated by hand, and an artifact handed over as a folder still opens by double-click.

---

## Required Element 2 — Multiple assessment strategies

Four distinct strategies are supported, and can be mixed within a single scene.

| Strategy | Slide type | How it behaves |
|---|---|---|
| **Formative knowledge check** (mid-scene) | `quiz` with `assessment.role: "formative"` | Single or multiple select. Immediate per-option feedback. On a wrong first attempt only the learner's own choice is annotated; the correct answer is withheld until they get it or exhaust `maxAttempts`, so a retry is a real second attempt rather than a copy of the revealed answer. |
| **Summative check** (end of scene) | `quiz` with `assessment.role: "summative"` | Same mechanics, labelled and reported separately in the completion summary. |
| **Reflection / open response** | `reflection` | Free text, autosaved, explicitly **not graded** and never scored. Sent with the IRF at the end, anonymously, and the screen says so. Can gate progression on *having written something*, never on *what* was written. |
| **Scenario / decision** | `branch` | The learner's choice changes which slide comes next. Assessment by consequence rather than by answer key — appropriate for material where the point is judgement under pressure, not recall. |

Two supporting mechanics:

- **Gating.** `"required": true` holds Next until the slide's own completion rule is met — a check answered, a reflection written, every reveal opened. Used sparingly and always with a visible reason, not a silent dead end.
- **The IRF closes every module.** Unit 4 puts all three IRF questions on the last screen with none of them optional, so the engine gates Finish on all three being answered and sent. It is the program's own instrument, not a fifth assessment strategy invented here.

The validator emits a warning when a course uses only one strategy — the rubric expectation is enforced by the tooling rather than left to memory across 36 sessions.

---

## Required Element 3 — Ethical use of educational technology

The population is adolescent boys in a trauma-informed program, often on shared devices, many court-referred. The data model is the ethics position.

**One thing leaves the device, and only one.** The IRF submission on the last screen. Unit 4 requires it — *"The IRF posts to a Google Sheet through an Apps Script Web App"* — and an instrument Unit 1 counts as participation documentation is worthless if it dies with the tab. It carries the session, the timestamp, the three IRF answers, and the learner's reflection. It carries no name, no login, no device id, and nothing that links two sessions to one boy.

**It leaves on a press, not on a keystroke.** Everything is sent from one screen, once, when the learner presses send. Nothing is shipped quietly while they are still typing, and nothing from the earlier screens goes anywhere on its own. The note under every writing box states what will happen to it — and the notes are generated from whether a destination is actually configured, so they cannot drift out of true. With no destination set, the engine says nothing is sent, and nothing is.

**A failed send never traps a learner.** No wifi means the response queues in `localStorage` and retries on the next load, keeping its original timestamp. The Finish button unlocks either way. Holding a boy at the door over the site's hotspot is not something this program does.

**Sending the reflection is a program decision, made by the program director, and it has a cost.** The reflection is the boy's own writing about the session's probing question. It is anonymous in the strict sense — nothing in the payload identifies anyone. But in a cohort of ten, a timestamped free-text answer about a hidden part of yourself is not always unrecognisable to the coach who was in the room, and the guides themselves lean on privacy as the mechanism that makes the honesty possible: Session 11 says *private acknowledgment is a complete success*, Session 20 that *privacy is what makes this level of honesty possible*. Collection is still defensible — it is exactly the data that shows whether the sessions land — but it is a trade, not a free win. `includeReflection: false` in `courses/_curriculum/irf.json` sends only the three IRF answers and nothing else, and it is one line.

**No accounts, no analytics, no third parties.** There is no login, no analytics beacon, no tracking pixel, no font CDN. The only network call the engine makes beyond loading its own course file is that single IRF post.

**Everything is disclosed to the learner, in plain language.** **Contents → Your data** lists what is sent, what is not, when, and what stays on the device, plus buttons to erase their answers and reset their display settings.

**Intellectual property is tracked at the asset level.** Every image, video, and audio file carries either `"own": true` or a `credit` block with holder, title, licence, and source URL. Credits render beside the asset and collect into **Contents → Credits & licences**. The validator warns on any asset with neither.

**No surveillance of learners by facilitators.** There is no dashboard, no completion report, no per-learner record. Instructional feedback is gathered by the IRF, which every student completes knowingly. The eLearning component does not watch anyone.

---

## Required Element 4 — Differentiated according to learner characteristics

Differentiation here is not one accommodation bolted on; it is four independent axes the learner controls.

### Format — the same content, more than one way in

Any slide can declare `alternates`. The learner gets a "Take this in" control offering, for example, **Read** or **Listen**. The written text stays on screen beneath the audio as its transcript, so choosing audio never costs access to the text. Session 1's probing question slide ships with both paths working.

This is the rubric's "alternate representations… a text path and an audio or video path for the same material, not one blanket format for every learner" — implemented as a per-slide capability rather than a course-wide format decision.

### Pace and route — the learner is not on rails

- Scene menu with per-slide status, so any slide is reachable directly; navigation is not next/back only.
- Branching decision points route different learners through different material.
- Back follows the learner's actual path, not file order — a learner who branched to slide 9 from slide 4 returns to slide 4.
- Reveals let a learner who already knows the material skip the elaboration, and a learner who doesn't open it.
- Retry on knowledge checks, with feedback that teaches rather than just scores.

### Presentation — controlled by the learner, persisted

**Display** offers text size (3 steps), line spacing, a high-legibility typeface, light/dark theme, and reduced motion. Choices are remembered on the device. Reading difficulty, low vision, light sensitivity, and vestibular sensitivity are each addressed by a control the learner sets themselves, without asking an adult.

### Input — no single required modality

Full keyboard operation (arrow keys, Tab, Enter, Escape) alongside touch and mouse. Touch targets meet the 44px minimum for use on a phone or tablet with cold hands after training. Native form controls throughout, so assistive technology and switch access behave as the learner already expects.

---

## Accessibility (AECT 3.5, 3.6) — built in, and enforced

| Requirement | How |
|---|---|
| Alt text on every graphic | Mandatory. Missing or undeclared-empty alt is a **hard error**, not a warning. Decorative images must say so. |
| Captions or transcripts on every video | File-based video requires a `.vtt` captions track; every video requires a transcript. Both are hard errors. Audio alternates require a transcript. |
| Full keyboard navigation | No mouse-only interaction anywhere. Arrow keys page through slides but yield to text fields and media controls. Focus moves to the new slide's heading on change, so keyboard and screen-reader users land in the content. Visible focus rings are never removed. |
| WCAG AA contrast | Palette measured when chosen; ratios recorded as comments beside the tokens in `engine.css`. A **live audit** re-measures the rendered page in the learner's actual theme and text size — verified passing in light and dark, at all three text sizes, with the high-legibility typeface. |
| Copyright / CC notice on borrowed assets | Per-asset `credit` block, rendered inline and collected in a credits panel. Warned on if absent. |
| Alternate representations | `alternates`, described above. |

Additional structure: skip link, landmark regions, one `<h1>` per slide, `aria-live` announcements on slide change and on assessment feedback, `role="progressbar"` with `aria-valuetext`, native radios and checkboxes in a `fieldset`/`legend`, `aria-expanded` disclosures, and `<dialog>` for sheets so focus trapping and Escape come from the platform rather than from hand-rolled code.

The point of putting the checker **inside the engine** rather than in a separate lint step: across 36 sessions the realistic failure is not "we never thought about alt text," it is "session 23 shipped without it." The check runs on every load, logs to the console, and is one tap away in the Contents menu.

---

## Phase 1 scope

Built: the display engine and content model, all six slide types, all four assessment strategies, the accessibility layer, and a working Session 1 test scene.

Deliberately not built: SCORM/xAPI export (add only if an LMS integration is ever actually needed), a visual authoring UI (Phase 2, only if hand-writing JSON becomes the bottleneck), accounts or any backend, and analytics beyond what a single learner sees in their own session.
