window.GWMS_COURSE_BUNDLE = window.GWMS_COURSE_BUNDLE || {};
window.GWMS_COURSE_BUNDLE["session-03"] =
{
  "id": "session-03",
  "title": "Session 3 — Arrival",
  "lang": "en",
  "rightsHolder": "Jamey Phoenix Bethea, Conceptual Combat Academy",
  "meta": {
    "session": 3,
    "sessionOf": 36,
    "stage": "The Descent",
    "week": 1,
    "theme": "Arrival",
    "neighborhood": "The Paths",
    "block": "Block 4 — Cleanup, eLearning, IRF",
    "casel": [
      "Self-Awareness",
      "Self-Management"
    ],
    "bloom": "Apply",
    "probingQuestion": "What are you like before you trust the room?",
    "games": [
      {
        "skill": "Entering",
        "title": "Hand Touch / Knee Touch Collection Game"
      },
      {
        "skill": "Arriving",
        "title": "Belly-Up Open Guard Connection Foundation"
      },
      {
        "skill": "Controlling",
        "title": "Introductory Pin Game"
      }
    ],
    "connection": "Staying safe and guarded on the mat before you trust a partner is the same guard you use before you trust a room. Both are smart. Naming it is the work.",
    "takeaway": "Tonight you worked from the hand fight, open guard, and a chest-to-chest pin. Staying guarded before you trust a partner is smart, the same way it is before you trust a room. You get to decide how much guard to keep, and when to drop it.",
    "_source": "GWMS Curriculum Guide — Session 3 Grappling Class Guide and Lesson and Intervention Guide (Unit 7), GWMS Game Rulings, GWMS 90-Minute Class: Locked Decisions."
  },
  "_generated": "Written by tools/build-sessions.js from courses/_curriculum/. Re-running overwrites this file.",
  "scenes": [
    {
      "id": "today",
      "title": "Today",
      "slides": [
        {
          "id": "s03-question",
          "type": "text-image",
          "eyebrow": "Session 3 · Today's question",
          "title": "What are you like before you trust the room?",
          "body": []
        },
        {
          "id": "s03-games",
          "type": "text-image",
          "eyebrow": "Tonight on the mat",
          "title": "The three games",
          "body": [
            {
              "kind": "heading",
              "level": 3,
              "text": "Game 1: Standing"
            },
            {
              "kind": "lead",
              "text": "This is scoring touches while standing."
            },
            {
              "kind": "list",
              "items": [
                "Whoever gets three touches first wins the round. The same rule applies to both players."
              ]
            },
            {
              "kind": "heading",
              "level": 3,
              "text": "Game 2: Guarded"
            },
            {
              "kind": "lead",
              "text": "This is getting past his legs and feet."
            },
            {
              "kind": "list",
              "items": [
                "The bottom player holds as long as he keeps a foot and a hand on the top player.",
                "The top player wins by getting free of the bottom player's feet and hands, going around his legs, and touching his body with a shin."
              ]
            },
            {
              "kind": "heading",
              "level": 3,
              "text": "Game 3: Pinned"
            },
            {
              "kind": "lead",
              "text": "This is holding someone down, then escaping."
            },
            {
              "kind": "list",
              "items": [
                "The top player holds the pin.",
                "The bottom player wins by pushing the top player off and getting his legs back in front."
              ]
            }
          ]
        },
        {
          "id": "s03-concept",
          "type": "quiz",
          "eyebrow": "Tonight's lesson",
          "title": "What made it work?",
          "assessment": {
            "role": "formative",
            "scored": false
          },
          "question": "Tonight you scored touches on his hands and knees. Where did each touch start?",
          "select": "single",
          "retry": true,
          "options": [
            {
              "text": "From a grip you already had.",
              "correct": true,
              "feedback": "Before you trust someone, you start small, from what you already have."
            },
            {
              "text": "From a wild grab at anything.",
              "feedback": "Wild grabs leave you open."
            },
            {
              "text": "From diving in close to him.",
              "feedback": "Diving in skips reading him first."
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
          "id": "s03-takeaway",
          "type": "text-image",
          "eyebrow": "The takeaway",
          "title": "What tonight was really about",
          "body": [
            {
              "kind": "lead",
              "text": "Tonight you worked from the hand fight, open guard, and a chest-to-chest pin. Staying guarded before you trust a partner is smart, the same way it is before you trust a room. You get to decide how much guard to keep, and when to drop it."
            }
          ]
        },
        {
          "id": "s03-reflection",
          "type": "reflection",
          "eyebrow": "On your own",
          "title": "Your answer",
          "prompt": "What are you like before you trust the room?",
          "hint": "Not graded.",
          "placeholder": "Whatever comes to mind…"
        },
        {
          "id": "s03-irf",
          "type": "reflection",
          "eyebrow": "On your own",
          "title": "Instruction Rating Form",
          "kindLabel": "IRF",
          "fields": [
            {
              "id": "liked",
              "prompt": "What did you like?"
            },
            {
              "id": "disliked",
              "prompt": "What did you not like?"
            },
            {
              "id": "change",
              "prompt": "What would you change?"
            },
            {
              "id": "keep",
              "prompt": "What would you keep?"
            }
          ],
          "requireAll": true,
          "required": true,
          "submit": true,
          "sendLabel": "Send it",
          "reflectionFrom": "s03-reflection",
          "body": [],
          "_note": "Unit 4: the IRF is the last screen of the module and no student leaves before completing it. Where this lands is set once in courses/_curriculum/irf.json — see docs/IRF-BACKEND.md. With no destination configured the screen still works and the answers stay on the device."
        }
      ]
    }
  ]
}
;
