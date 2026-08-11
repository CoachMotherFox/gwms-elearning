# The 14-Screen Module Template

Every GWMS session's Block 4 eLearning uses the same fourteen screens. This is what makes 36 sessions a fill-in job rather than 36 design problems.

Screen 1 comes from Notion, [EDUC 685 Multimedia Project: 14-Screen Template (Session 1 / Dirty Feet)](https://app.notion.com/p/3a3ef5be8be28108b40af2fc82d4c285), which reads: *"The game. What we played today: Dirty Feet… We go over the game, not just name it."* Screens 2–14 are proposed here, extrapolated from that screen and from the shape of a complete Lesson and Intervention Guide. **Not yet approved.** Change it here and it changes everywhere.

Runs about 8–10 minutes on a tablet, which is what Block 4 has after room reset and before the IRF.

---

## The fourteen

### Scene 1 — Today (screens 1–5)
*Review what actually happened on the mat. Concrete, low demand, no reflection yet.*

| # | Type | Content | Source field |
|---|---|---|---|
| 1 | `text-image` | The probing question, plus stage/week/theme. Audio alternate. | Stage question page |
| 2 | `text-image` | The game: what we played, how it works, diagram, reveals | L&I Guide → "The game" |
| 3 | `quiz` formative | Check on the game's mechanics | derived from screen 2 |
| 4 | `reveal` | The key condition — what had to be true first | Technical Map → key condition |
| 5 | `quiz` formative | Check on the key condition or the safety layer | derived from screen 4 |

### Scene 2 — The bridge (screens 6–10)
*Move from the mat to the self. This is the screen range that carries the session's actual work.*

| # | Type | Content | Source field |
|---|---|---|---|
| 6 | `text-image` | What today tested — the bridge prompt | L&I Guide → "How this connects to the mat" |
| 7 | `reveal` | The connection: mat ↔ self | L&I Guide → "The connection" |
| 8 | `branch` | Decision point applying the connection | L&I Guide → bridge prompt / Mode C prompt |
| 9 | `text-image` | Branch outcome A → `next: screen 11` | — |
| 10 | `text-image` | Branch outcome B → `next: screen 11` | — |

A learner sees 13 of the 14; screens 9 and 10 are alternatives.

### Scene 3 — Your turn (screens 11–14)
*The learner's own answer, the takeaway, and the handoff.*

| # | Type | Content | Source field |
|---|---|---|---|
| 11 | `reflection` | The probing question, answered in writing. Not graded. | Stage question page |
| 12 | `quiz` summative | The session's one takeaway | L&I Guide → CASEL TLO |
| 13 | `text-image` | Preview of the next session | L&I Guide → "Integration and close" |
| 14 | `text-image` | Close and IRF handoff | L&I Guide → "IRF handoff" |

---

## Rules for filling it

**Screens 8–10 carry the trauma-informed load.** The branch is where a learner is asked something about themselves. Two rules, both from the guides: no option is wrong, and passing is always available. Session 1's branch has three correct answers. Session 2's has four, one of which is "I didn't notice." The 4R frame says *no penalty for passing, presence is participation* — the branch has to honor that or it shouldn't ship.

**Screen 12 tests the CASEL TLO, not recall.** The distractors should be the plausible misreadings of the session's intent — "fix how you come across," "work out if it's good or bad" — because those are the misreadings that actually cost a learner something.

**Never state an objective the guide doesn't have.** Session 1's L&I Guide has no TLOs, ELOs, or connection line. Its `meta` fields are `null` and the module works around the gap rather than filling it. `node tools/check.js` will not catch invented curriculum; only the author will.

**Clinical content is not the engine's job.** The Lesson and Intervention block runs in one of three modes and the clinician designs it. The eLearning reviews the session and captures a reflection. It does not intervene, interpret, or ask anything the guide didn't ask.

---

## Adding a session

1. `mkdir -p courses/session-NN/assets`
2. Copy `courses/session-02/course.json` — it is the reference build, with all six objective fields sourced.
3. Fill `meta` from the session's Lesson and Intervention Guide and its row in the Technical Map.
4. Fill the fourteen screens from the mapping above.
5. `sh tools/bundle.sh && node tools/check.js`
6. Add a line to `courses/index.json`.

Anything not in the source stays out, or goes in a `_todo` where the renderer ignores it.
