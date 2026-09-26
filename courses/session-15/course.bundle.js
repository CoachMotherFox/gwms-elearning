window.GWMS_COURSE_BUNDLE = window.GWMS_COURSE_BUNDLE || {};
window.GWMS_COURSE_BUNDLE["session-15"] =
{
  "id": "session-15",
  "title": "Session 15 — Contact",
  "lang": "en",
  "rightsHolder": "Jamey Phoenix Bethea, Conceptual Combat Academy",
  "meta": {
    "session": 15,
    "sessionOf": 36,
    "stage": "The Initiation",
    "week": 5,
    "theme": "Contact",
    "neighborhood": "Chest Pin",
    "block": "Block 4 — Cleanup, eLearning, IRF",
    "casel": [
      "Social Awareness",
      "Relationship Skills"
    ],
    "bloom": "Apply",
    "probingQuestion": "Who are you with other people, now that you've met yourself?",
    "games": [
      {
        "skill": "Entering",
        "title": "Hand Fight to Connection Game"
      },
      {
        "skill": "Arriving",
        "title": "Closed Guard, Post to Underhook to Locked Hands"
      },
      {
        "skill": "Controlling",
        "title": "Mount, Stay Under Both Elbows"
      }
    ],
    "connection": "The Descent found the real you. Now it goes to the mat with a partner. Rolling as the real you, instead of a mask, is the same as showing up honest in a relationship instead of performing one.",
    "takeaway": "The real you is in the room now, and other people are in it too.",
    "_source": "GWMS Curriculum Guide — Session 15 Grappling Class Guide and Lesson and Intervention Guide (Unit 7), GWMS Game Rulings, GWMS 90-Minute Class: Locked Decisions."
  },
  "_generated": "Written by tools/build-sessions.js from courses/_curriculum/. Re-running overwrites this file.",
  "scenes": [
    {
      "id": "today",
      "title": "Today",
      "slides": [
        {
          "id": "s15-question",
          "type": "text-image",
          "eyebrow": "Session 15 · Today's question",
          "title": "Who are you with other people, now that you've met yourself?",
          "body": []
        },
        {
          "id": "s15-games",
          "type": "text-image",
          "eyebrow": "Tonight on the mat",
          "title": "The three games",
          "body": [
            {
              "kind": "heading",
              "level": 3,
              "text": "Hand Fight to Connection Game"
            },
            {
              "kind": "list",
              "items": [
                "Whoever reaches a connection first wins. The same rule applies to both players."
              ]
            },
            {
              "kind": "heading",
              "level": 3,
              "text": "Closed Guard, Post to Underhook to Locked Hands"
            },
            {
              "kind": "list",
              "items": [
                "The bottom player wins by locking his hands with an underhook after a post.",
                "The top player wins by standing and opening the guard."
              ]
            },
            {
              "kind": "heading",
              "level": 3,
              "text": "Mount, Stay Under Both Elbows"
            },
            {
              "kind": "list",
              "items": [
                "The top player holds as long as he keeps at least one elbow covered.",
                "The bottom player wins by touching both elbows to his body, or by making the top player fall."
              ]
            }
          ]
        },
        {
          "id": "s15-check",
          "type": "quiz",
          "eyebrow": "Quick check",
          "title": "How you win it",
          "assessment": {
            "role": "formative",
            "scored": false
          },
          "question": "Mount, Stay Under Both Elbows: what wins it for the top player?",
          "select": "single",
          "retry": true,
          "options": [
            {
              "text": "The top player holds as long as he keeps at least one elbow covered.",
              "correct": true,
              "feedback": "That's it."
            },
            {
              "text": "Holding the finish after your partner taps",
              "feedback": "Never. Let go the instant he taps."
            },
            {
              "text": "Overpowering your partner with force",
              "feedback": "Staying calm beats forcing harder."
            }
          ]
        }
      ]
    },
    {
      "id": "close",
      "title": "Before you go",
      "slides": [
        {
          "id": "s15-takeaway",
          "type": "text-image",
          "eyebrow": "The takeaway",
          "title": "What tonight was really about",
          "body": [
            {
              "kind": "lead",
              "text": "The real you is in the room now, and other people are in it too."
            }
          ]
        },
        {
          "id": "s15-reflection",
          "type": "reflection",
          "eyebrow": "On your own",
          "title": "Your answer",
          "prompt": "Who are you with other people, now that you've met yourself?",
          "hint": "On your own. Not graded.",
          "placeholder": "Whatever comes to mind…"
        },
        {
          "id": "s15-irf",
          "type": "reflection",
          "eyebrow": "On your own",
          "title": "Instruction Rating Form",
          "kindLabel": "IRF, on your own",
          "fields": [
            {
              "id": "mat",
              "prompt": "What happened today on the mat?"
            },
            {
              "id": "worked",
              "prompt": "What worked?"
            },
            {
              "id": "didnt",
              "prompt": "What did not work?"
            }
          ],
          "requireAll": true,
          "required": true,
          "submit": true,
          "sendLabel": "Send it",
          "reflectionFrom": "s15-reflection",
          "body": [],
          "_note": "Unit 4: the IRF is the last screen of the module and no student leaves before completing it. Where this lands is set once in courses/_curriculum/irf.json — see docs/IRF-BACKEND.md. With no destination configured the screen still works and the answers stay on the device."
        }
      ]
    }
  ]
}
;
