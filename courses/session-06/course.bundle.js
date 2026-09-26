window.GWMS_COURSE_BUNDLE = window.GWMS_COURSE_BUNDLE || {};
window.GWMS_COURSE_BUNDLE["session-06"] =
{
  "id": "session-06",
  "title": "Session 6 — Mask",
  "lang": "en",
  "rightsHolder": "Jamey Phoenix Bethea, Conceptual Combat Academy",
  "meta": {
    "session": 6,
    "sessionOf": 36,
    "stage": "The Descent",
    "week": 2,
    "theme": "Mask",
    "neighborhood": "The Paths",
    "block": "Block 4 — Cleanup, eLearning, IRF",
    "casel": [
      "Self-Awareness",
      "Self-Management"
    ],
    "bloom": "Apply",
    "probingQuestion": "What does your mask protect you from?",
    "games": [
      {
        "skill": "Entering",
        "title": "Consecutive Touches with Clinch Counter"
      },
      {
        "skill": "Arriving",
        "title": "Knee Pit Touchdown Game"
      },
      {
        "skill": "Controlling",
        "title": "Mount, Stay Under Both Elbows"
      }
    ],
    "connection": "Your guard protects the space behind your legs. Your mask protects something too. Naming what the guard defends is the same as naming what the mask hides.",
    "takeaway": "The mask has a job. Next week we find out what happens to it under pressure.",
    "_source": "GWMS Curriculum Guide — Session 6 Grappling Class Guide and Lesson and Intervention Guide (Unit 7), GWMS Game Rulings, GWMS 90-Minute Class: Locked Decisions."
  },
  "_generated": "Written by tools/build-sessions.js from courses/_curriculum/. Re-running overwrites this file.",
  "scenes": [
    {
      "id": "today",
      "title": "Today",
      "slides": [
        {
          "id": "s06-question",
          "type": "text-image",
          "eyebrow": "Session 6 · Today's question",
          "title": "What does your mask protect you from?",
          "body": []
        },
        {
          "id": "s06-games",
          "type": "text-image",
          "eyebrow": "Tonight on the mat",
          "title": "The three games",
          "body": [
            {
              "kind": "heading",
              "level": 3,
              "text": "Consecutive Touches with Clinch Counter"
            },
            {
              "kind": "list",
              "items": [
                "The touch player wins with three sets of two touches in a row.",
                "The clinch player wins by closing his hands under both elbows or chest to back."
              ]
            },
            {
              "kind": "heading",
              "level": 3,
              "text": "Knee Pit Touchdown Game"
            },
            {
              "kind": "list",
              "items": [
                "The top player wins by touching both knee pits with his leg while keeping his feet off.",
                "The bottom player wins by sitting up."
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
          "id": "s06-check",
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
              "text": "Submitting your partner",
              "feedback": "Not tonight. These games end in a pin, not a finish."
            },
            {
              "text": "Putting your partner down hard",
              "feedback": "Never. Everyone goes light."
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
          "id": "s06-takeaway",
          "type": "text-image",
          "eyebrow": "The takeaway",
          "title": "What tonight was really about",
          "body": [
            {
              "kind": "lead",
              "text": "The mask has a job. Next week we find out what happens to it under pressure."
            }
          ]
        },
        {
          "id": "s06-reflection",
          "type": "reflection",
          "eyebrow": "On your own",
          "title": "Your answer",
          "prompt": "What does your mask protect you from?",
          "hint": "On your own. Not graded.",
          "placeholder": "Whatever comes to mind…"
        },
        {
          "id": "s06-irf",
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
          "reflectionFrom": "s06-reflection",
          "body": [],
          "_note": "Unit 4: the IRF is the last screen of the module and no student leaves before completing it. Where this lands is set once in courses/_curriculum/irf.json — see docs/IRF-BACKEND.md. With no destination configured the screen still works and the answers stay on the device."
        }
      ]
    }
  ]
}
;
