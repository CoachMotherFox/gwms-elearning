window.GWMS_COURSE_BUNDLE = window.GWMS_COURSE_BUNDLE || {};
window.GWMS_COURSE_BUNDLE["session-01"] =
{
  "id": "session-01",
  "title": "Session 1 — Arrival",
  "lang": "en",
  "rightsHolder": "Jamey Phoenix Bethea, Conceptual Combat Academy",

  "meta": {
    "session": 1,
    "sessionOf": 36,
    "stage": "The Descent",
    "week": 1,
    "theme": "Arrival",
    "neighborhood": "The Roads",
    "block": "Block 4 — Cleanup, eLearning, IRF",
    "casel": ["Self-Awareness", "Self-Management"],
    "card": "Foundations (safety)",
    "keyCondition": "Safe contact, the tap is understood.",
    "probingQuestion": "What makes a place feel safe to you?",
    "grapplingTlo": null,
    "grapplingElos": [],
    "caselTlo": null,
    "caselElos": [],
    "connection": null,
    "_source": "Notion — 'Session 1: Lesson and Intervention Guide'; 'GWMS Technical Map: First Hours, All 36 Sessions'; 'GWMS Etiquette Reference'; 'Unit 7: Curriculum'.",
    "_todo": "Session 1's Lesson and Intervention Guide carries only the game paragraph. Grappling TLO/ELOs, CASEL TLO/ELOs and the connection line are missing there, so they stay null here and this module never states them. Every other session's guide has all six (see Session 2). Fill the guide, then fill these.",
    "_conflict": "The L&I Guide says Dirty Feet has NO fixed win condition (coach calls the switch). The Technical Map says 'win: touch the sole of your partner's foot while protecting your own'. Learner-facing content below follows the L&I Guide. Resolve upstream, then correct screens 2, 3 and 5 if needed."
  },

  "_template": "14-Screen Template, per Notion 'EDUC 685 Multimedia Project: 14-Screen Template (Session 1 / Dirty Feet)'. Screen 1 of that page was written; screens 2-14 are this build's proposed structure. See docs/MODULE-TEMPLATE.md.",

  "scenes": [
    {
      "id": "today",
      "title": "Today",
      "slides": [

        {
          "id": "s01-question",
          "type": "text-image",
          "eyebrow": "Session 1 · Probing question",
          "title": "What makes a place feel safe to you?",
          "alternates": [
            {
              "mode": "audio",
              "label": "Listen",
              "src": "assets/probing-question.m4a",
              "transcriptIsBody": true,
              "own": true,
              "_todo": "Placeholder narration, machine-generated. Replace with the facilitator's voice."
            }
          ],
          "body": [
            {
              "kind": "lead",
              "text": "That is the probing question for Session 1. It runs through the whole session: the grappling class, rolling and recovery, and the lesson."
            },
            {
              "kind": "callout",
              "label": "Where this sits",
              "text": "Session 1 of 36. The Descent, Week 1, Arrival. On the mat that stage runs The Roads."
            }
          ]
        },

        {
          "id": "s02-game",
          "type": "text-image",
          "eyebrow": "Screen 2 · The game",
          "title": "Dirty Feet",
          "body": [
            {
              "kind": "lead",
              "text": "Dirty Feet is a guard-passing game. One player stands. One player is on the ground."
            },
            {
              "kind": "paragraph",
              "text": "The ground player keeps their feet on the standing player, controlling distance and preventing entry. The standing player works to beat the feet and close to chest-to-chest."
            }
          ],
          "image": {
            "src": "assets/dirty-feet-placeholder.svg",
            "alt": "Diagram of Dirty Feet: a player on the ground with both feet planted on a standing player, holding a gap between them. The standing player reaches in, working to close that distance.",
            "caption": "Placeholder diagram — to be replaced with the Session 1 source image.",
            "own": true
          },
          "imagePosition": "after",
          "reveals": [
            {
              "id": "switch",
              "label": "How the roles switch",
              "content": [
                { "kind": "paragraph", "text": "There is no fixed win condition. The coach calls the switch, and the roles swap." }
              ]
            },
            {
              "id": "trains",
              "label": "What this game trains",
              "content": [
                { "kind": "list", "items": ["Distance management", "Framing", "Closing the gap under pressure"] },
                { "kind": "paragraph", "text": "Nobody gets put on their back hard. That is why it is day one material." }
              ]
            }
          ]
        },

        {
          "id": "s03-check-game",
          "type": "quiz",
          "eyebrow": "Screen 3 · Quick check",
          "title": "The ground player's job",
          "assessment": { "role": "formative", "scored": false },
          "question": "In Dirty Feet, what is the ground player's job?",
          "select": "single",
          "retry": true,
          "options": [
            {
              "text": "Keep their feet on the standing player and control the distance",
              "correct": true,
              "feedback": "The feet are the tool. They hold the gap and stop the standing player entering."
            },
            {
              "text": "Sweep the standing player onto their back as fast as possible",
              "feedback": "Not in this game. Dirty Feet has no fixed win condition, and nobody gets put on their back hard — that is exactly why it works on day one."
            },
            {
              "text": "Stand up before the standing player closes the distance",
              "feedback": "The other way round. The ground player stays on the ground; it is the standing player who works to close the gap."
            }
          ],
          "correctHead": "That's it.",
          "correctText": "Feet on, distance controlled, entry denied.",
          "incorrectHead": "Not quite.",
          "incorrectText": "Read the note under your choice, then try again.",
          "revealText": "The right answer is marked above, with the reason."
        },

        {
          "id": "s04-condition",
          "type": "reveal",
          "eyebrow": "Screen 4 · The key condition",
          "title": "What had to be true first",
          "body": [
            {
              "kind": "lead",
              "text": "Every GWMS session is built around one key condition — the one thing that has to be true before anything else gets built."
            },
            {
              "kind": "callout",
              "label": "Session 1 key condition",
              "text": "Safe contact. The tap is understood."
            },
            {
              "kind": "paragraph",
              "text": "Safe falling and the tap were taught first. They are the safety layer under the game. The room learns that stop means stop before anything else runs."
            }
          ],
          "reveals": [
            {
              "id": "three-ways",
              "label": "The three ways to tap",
              "content": [
                {
                  "kind": "list",
                  "ordered": true,
                  "items": [
                    "Tap your partner's body",
                    "Tap the mat",
                    "Say stop"
                  ]
                },
                { "kind": "paragraph", "text": "Any of the three ends the round immediately." }
              ]
            },
            {
              "id": "what-tap-means",
              "label": "What the tap actually means",
              "content": [
                { "kind": "paragraph", "text": "When your partner taps, you stop. Not after you finish the move. Immediately." },
                {
                  "kind": "quote",
                  "text": "The tap is not losing. The tap is not weakness. It is the agreement that makes everything else possible.",
                  "attribution": "GWMS Etiquette Reference"
                }
              ]
            }
          ]
        },

        {
          "id": "s05-check-tap",
          "type": "quiz",
          "eyebrow": "Screen 5 · Quick check",
          "title": "The tap",
          "assessment": { "role": "formative", "scored": false },
          "question": "Which of these ends the round?",
          "select": "multiple",
          "retry": true,
          "options": [
            { "text": "Tapping your partner's body", "correct": true, "feedback": "Two quick taps, anywhere you can reach." },
            { "text": "Tapping the mat", "correct": true, "feedback": "Works when you can't reach your partner." },
            { "text": "Saying stop", "correct": true, "feedback": "Out loud counts, every time." },
            { "text": "Only the coach calling time", "feedback": "No. You do not need permission and you do not need to wait. Any of the other three ends it immediately." }
          ],
          "correctHead": "All three.",
          "correctText": "Any one of them ends the round immediately, and your partner stops right then.",
          "incorrectHead": "Check again.",
          "incorrectText": "There is more than one right answer here.",
          "revealText": "All three ways are marked above. Any one of them ends the round immediately."
        }
      ]
    },

    {
      "id": "bridge",
      "title": "The bridge",
      "slides": [

        {
          "id": "s06-mat",
          "type": "text-image",
          "eyebrow": "Screen 6 · From the mat",
          "title": "What today actually tested",
          "body": [
            {
              "kind": "lead",
              "text": "Dirty Feet is about distance. How close you let someone get, and what you do when they start closing in."
            },
            {
              "kind": "paragraph",
              "text": "The whole time you were managing that distance, one thing was underneath it: you both knew the round could stop. That is what made it possible to play at all."
            }
          ]
        },

        {
          "id": "s07-connection",
          "type": "reveal",
          "eyebrow": "Screen 7 · The connection",
          "title": "Back to the question",
          "body": [
            {
              "kind": "lead",
              "text": "So — what makes a place feel safe to you?"
            },
            {
              "kind": "paragraph",
              "text": "You don't have to have an answer yet. Today the room ran on one agreement, and it is worth looking at before you answer."
            }
          ],
          "reveals": [
            {
              "id": "agreement",
              "label": "The agreement the room ran on",
              "content": [
                { "kind": "paragraph", "text": "Stop means stop. Anyone can call it, at any time, for any reason, and it is honored immediately." },
                { "kind": "paragraph", "text": "Nobody had to earn that. It was true from the first minute, for everybody in the room." }
              ]
            },
            {
              "id": "speaking",
              "label": "How we speak to each other here",
              "content": [
                {
                  "kind": "list",
                  "items": [
                    "Use names. If you don't know someone's name, ask.",
                    "No trash-talk. Not joking trash-talk, not real trash-talk.",
                    "If something is too rough, too hard, or uncomfortable, say so. The other person adjusts. No argument.",
                    "If something bothers you, bring it to the coach directly."
                  ]
                }
              ]
            }
          ]
        },

        {
          "id": "s08-decision",
          "type": "branch",
          "eyebrow": "Screen 8 · Your call",
          "title": "It's going too hard",
          "body": [
            {
              "kind": "paragraph",
              "text": "You're rolling. Your partner is going harder than you want. Nothing hurts yet, but you don't like it."
            }
          ],
          "question": "What do you do?",
          "options": [
            {
              "id": "say",
              "text": "Say something to them",
              "sub": "Tell your partner it's too hard.",
              "target": "s09-handled",
              "feedback": "Good. That's the standard here."
            },
            {
              "id": "tap",
              "text": "Tap",
              "sub": "End the round right now.",
              "target": "s09-handled",
              "feedback": "Good. You never need a reason."
            },
            {
              "id": "coach",
              "text": "Take it to the coach",
              "sub": "Bring it to them directly.",
              "target": "s10-coach",
              "feedback": "Good. That's the standard here too."
            }
          ]
        },

        {
          "id": "s09-handled",
          "type": "text-image",
          "eyebrow": "Screen 9",
          "title": "You handled it on the mat",
          "next": "s11-reflection",
          "body": [
            {
              "kind": "lead",
              "text": "Both of those are right, and you don't need anyone's permission for either one."
            },
            {
              "kind": "paragraph",
              "text": "If something is too rough, too hard, or uncomfortable, you say so — and the other person adjusts. No argument. And the tap needs no reason at all: tap your partner, tap the mat, or say stop. Any of the three ends the round immediately."
            },
            {
              "kind": "callout",
              "label": "Worth noticing",
              "text": "There was no wrong answer on that screen. All three options are the standard. That is the point."
            }
          ]
        },

        {
          "id": "s10-coach",
          "type": "text-image",
          "eyebrow": "Screen 10",
          "title": "You took it to the coach",
          "next": "s11-reflection",
          "body": [
            {
              "kind": "lead",
              "text": "That's right too. If something bothers you, you bring it to the coach directly."
            },
            {
              "kind": "paragraph",
              "text": "Not to the group, not online, not through someone else. Direct."
            },
            {
              "kind": "callout",
              "label": "Worth noticing",
              "text": "There was no wrong answer on that screen. Saying something, tapping, and going to the coach are all the standard. That is the point."
            }
          ]
        }
      ]
    },

    {
      "id": "your-turn",
      "title": "Your turn",
      "slides": [

        {
          "id": "s11-reflection",
          "type": "reflection",
          "eyebrow": "Screen 11 · Reflection",
          "title": "Your answer",
          "prompt": "What makes a place feel safe to you?",
          "hint": "There is no right answer and nobody is grading this. A few words is enough. It can be about this room or anywhere else.",
          "placeholder": "Whatever comes to mind…",
          "body": [
            {
              "kind": "paragraph",
              "text": "Take a second with it before you type."
            }
          ]
        },

        {
          "id": "s12-summative",
          "type": "quiz",
          "eyebrow": "Screen 12 · End-of-session check",
          "title": "The one thing from today",
          "assessment": { "role": "summative", "scored": true },
          "question": "Someone taps while you're rolling. When do you stop?",
          "select": "single",
          "retry": true,
          "options": [
            {
              "text": "Immediately",
              "correct": true,
              "feedback": "Right. Not after you finish the move. Right then."
            },
            {
              "text": "After you finish the move you started",
              "feedback": "No. The move does not get finished. You stop the moment they tap."
            },
            {
              "text": "When the coach calls time",
              "feedback": "No. The tap does not wait for the coach."
            },
            {
              "text": "If you agree they had a good reason",
              "feedback": "No. The tap never needs a reason, and it is not yours to judge."
            }
          ],
          "correctHead": "That's the whole thing.",
          "correctText": "Immediately, every time, no reason required. It is the agreement that makes everything else possible.",
          "incorrectHead": "This one matters.",
          "incorrectText": "Read the note under your choice and try again — this is the rule the whole program runs on.",
          "revealText": "The answer is marked above. Immediately, every time, no reason required."
        },

        {
          "id": "s13-next",
          "type": "text-image",
          "eyebrow": "Screen 13 · Next time",
          "title": "Session 2",
          "body": [
            {
              "kind": "lead",
              "text": "Next session's question: How do you show up when nobody here knows you yet?"
            },
            {
              "kind": "paragraph",
              "text": "Today asked what safety is. Next time asks what you do when you walk into a room where nobody knows you."
            }
          ]
        },

        {
          "id": "s14-close",
          "type": "text-image",
          "eyebrow": "Screen 14 · Before you go",
          "title": "One more thing",
          "body": [
            {
              "kind": "lead",
              "text": "That's the eLearning for Session 1."
            },
            {
              "kind": "callout",
              "label": "The IRF",
              "text": "Three questions on the tablet, then you're out the door. Everybody does it, every session."
            },
            {
              "kind": "list",
              "items": [
                "What happened today on the mat?",
                "What worked?",
                "What did not work?"
              ]
            }
          ]
        }
      ]
    }
  ]
}
;
