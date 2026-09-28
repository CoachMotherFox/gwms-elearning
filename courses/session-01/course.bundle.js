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
    "neighborhood": "The Paths",
    "block": "Block 4 — Cleanup, eLearning, IRF",
    "casel": [
      "Self-Awareness",
      "Self-Management"
    ],
    "bloom": "Apply",
    "probingQuestion": "What makes a place feel safe to you?",
    "games": null,
    "connection": "Tonight the room agreed on the rules together, out loud. That is what makes a place feel safe: everyone knows the rules will hold, and everyone had a hand in making them.",
    "takeaway": "Tonight you learned the standing rules, the tap, and how to stop a round right away. Those rules work because everyone agreed to them out loud, together. You helped build them, not just follow them. A safe place is one you get to build, not just enter.",
    "_source": "GWMS Curriculum Guide — Session 1 Grappling Class Guide and Lesson and Intervention Guide (Unit 7), GWMS Game Rulings, GWMS 90-Minute Class: Locked Decisions."
  },
  "_generated": "Written by tools/build-sessions.js from courses/_curriculum/. Re-running overwrites this file.",
  "scenes": [
    {
      "id": "today",
      "title": "Today",
      "slides": [
        {
          "id": "s01-question",
          "type": "text-image",
          "eyebrow": "Session 1 · Today's question",
          "title": "What makes a place feel safe to you?",
          "body": []
        },
        {
          "id": "s01-golmest",
          "type": "text-image",
          "eyebrow": "Tonight on the mat",
          "title": "What tonight was",
          "body": [
            {
              "kind": "lead",
              "text": "Orientation night. From now on: warm up, three games, lesson, this phone, cleanup."
            },
            {
              "kind": "heading",
              "level": 3,
              "text": "What you are here to learn"
            },
            {
              "kind": "list",
              "items": [
                "Take him down.",
                "Get past his legs.",
                "Hold him down.",
                "Set up the finish.",
                "Get out from under."
              ]
            },
            {
              "kind": "heading",
              "level": 3,
              "text": "The tap"
            },
            {
              "kind": "list",
              "ordered": true,
              "items": [
                "Tap your partner's body.",
                "Tap the mat.",
                "Say stop."
              ]
            }
          ]
        },
        {
          "id": "s01-check",
          "type": "quiz",
          "eyebrow": "Quick check",
          "title": "What you just learned",
          "assessment": {
            "role": "formative",
            "scored": false
          },
          "question": "What ends a round right away?",
          "select": "single",
          "retry": true,
          "options": [
            {
              "text": "Tapping your partner, tapping the mat, or saying stop.",
              "correct": true,
              "feedback": "That's it, every session."
            },
            {
              "text": "Stop right away, don't wait.",
              "feedback": "Too slow. Stop right away."
            },
            {
              "text": "Stop right away, don't wait.",
              "feedback": "Too slow. Stop right away."
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
          "id": "s01-takeaway",
          "type": "text-image",
          "eyebrow": "The takeaway",
          "title": "What tonight was really about",
          "body": [
            {
              "kind": "lead",
              "text": "Tonight you learned the standing rules, the tap, and how to stop a round right away. Those rules work because everyone agreed to them out loud, together. You helped build them, not just follow them. A safe place is one you get to build, not just enter."
            }
          ]
        },
        {
          "id": "s01-reflection",
          "type": "reflection",
          "eyebrow": "On your own",
          "title": "Your answer",
          "prompt": "What makes a place feel safe to you?",
          "hint": "Not graded.",
          "placeholder": "Whatever comes to mind…"
        },
        {
          "id": "s01-irf",
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
          "reflectionFrom": "s01-reflection",
          "body": [],
          "_note": "Unit 4: the IRF is the last screen of the module and no student leaves before completing it. Where this lands is set once in courses/_curriculum/irf.json — see docs/IRF-BACKEND.md. With no destination configured the screen still works and the answers stay on the device."
        }
      ]
    }
  ]
}
;
