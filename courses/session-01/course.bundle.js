window.GWMS_COURSE_BUNDLE = window.GWMS_COURSE_BUNDLE || {};
window.GWMS_COURSE_BUNDLE["session-01"] =
{
  "id": "session-01",
  "title": "Session 1 — Arrival",
  "lang": "en",
  "rightsHolder": "Grappling With My Self (GWMS)",

  "meta": {
    "session": 1,
    "neighborhood": "The Descent",
    "week": 1,
    "theme": "Arrival",
    "block": "Block 4 — Cleanup, eLearning, IRF",
    "probingQuestion": "What makes a place feel safe to you?",
    "tlo": null,
    "elos": [],
    "_todo": "TLO and ELOs come from the Session 1 source document. The engine renders nothing for null/empty values, so no placeholder text reaches a learner."
  },

  "_scope": "Phase 1 test scene. Three slides, proving the engine end to end with real Session 1 content only. The full Session 1 build (60+ pages, from the Google Sites prototype) is not represented here.",

  "scenes": [
    {
      "id": "arrival",
      "title": "Arrival",
      "slides": [

        {
          "id": "probing-question",
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
              "_todo": "Placeholder narration, machine-generated. Replace with a recording of the facilitator's voice."
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
              "text": "Session 1 sits in The Descent, Week 1. The theme is Arrival."
            }
          ]
        },

        {
          "id": "dirty-feet",
          "type": "text-image",
          "eyebrow": "Opening game",
          "title": "Dirty Feet",
          "body": [
            {
              "kind": "lead",
              "text": "Dirty Feet is a guard-passing game. One player stands. One player is on the ground."
            },
            {
              "kind": "paragraph",
              "text": "The ground player keeps their feet on the standing player, controlling the distance and preventing entry. The standing player works to beat the feet and close to chest-to-chest."
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
                {
                  "kind": "paragraph",
                  "text": "There is no fixed win condition. The coach calls the switch, and the roles swap."
                }
              ]
            },
            {
              "id": "trains",
              "label": "What this game trains",
              "content": [
                {
                  "kind": "list",
                  "items": [
                    "Distance management",
                    "Framing",
                    "Closing the gap under pressure"
                  ]
                },
                {
                  "kind": "paragraph",
                  "text": "Nobody gets put on their back hard. That is why it is day one material."
                }
              ]
            }
          ]
        },

        {
          "id": "check-ground-player",
          "type": "quiz",
          "eyebrow": "Knowledge check",
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
        }

      ]
    }
  ]
}
;
