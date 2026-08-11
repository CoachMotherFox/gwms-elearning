window.GWMS_COURSE_BUNDLE = window.GWMS_COURSE_BUNDLE || {};
window.GWMS_COURSE_BUNDLE["engine-demo"] =
{
  "id": "engine-demo",
  "title": "Engine demo — every slide type",
  "lang": "en",
  "rightsHolder": "Grappling With My Self (GWMS)",

  "_scope": "NOT COURSE CONTENT. This folder is a test harness: it exercises every slide type, every assessment strategy, the gating rule, branching, and the credits panel. It exists so those code paths are demonstrably working without inventing GWMS curriculum. Delete it before handing the engine over if you want, nothing depends on it.",

  "meta": {
    "neighborhood": "Engine",
    "theme": "Test harness"
  },

  "scenes": [
    {
      "id": "types",
      "title": "Slide types",
      "slides": [

        {
          "id": "intro",
          "type": "text-image",
          "eyebrow": "Test harness",
          "title": "This is not course content",
          "body": [
            {
              "kind": "lead",
              "text": "This course exists to prove the engine works. Every slide type, every assessment strategy, and the gating rule are exercised here so that no code path in the engine is untested."
            },
            {
              "kind": "paragraph",
              "text": "Real session content lives in `courses/session-01`. Nothing here is curriculum."
            }
          ],
          "alternates": [
            {
              "mode": "video",
              "label": "Watch",
              "src": "assets/sample-cc0-flower.mp4",
              "captions": "assets/sample-cc0-flower.vtt",
              "credit": {
                "holder": "Mozilla Developer Network",
                "title": "flower.mp4 (shared assets)",
                "licence": "CC0 1.0 Public Domain Dedication",
                "url": "https://github.com/mdn/shared-assets"
              },
              "transcript": [
                { "kind": "paragraph", "text": "Demonstration clip with no spoken audio. A closed flower bud opens in time-lapse." }
              ]
            }
          ],
          "reveals": [
            {
              "label": "What a reveal looks like",
              "content": [
                { "kind": "paragraph", "text": "A reveal is a button with `aria-expanded`, so it works with a mouse, a keyboard, and a screen reader without any special handling. Opening one is recorded, which is what lets a slide require that everything has been opened before Next unlocks." }
              ]
            }
          ]
        },

        {
          "id": "video-slide",
          "type": "video",
          "eyebrow": "Slide type",
          "title": "Video with captions and a transcript",
          "video": {
            "src": "assets/sample-cc0-flower.mp4",
            "mime": "video/mp4",
            "captions": "assets/sample-cc0-flower.vtt",
            "captionsLang": "en",
            "captionsLabel": "English captions",
            "title": "CC0 sample clip",
            "credit": {
              "holder": "Mozilla Developer Network",
              "title": "flower.mp4 (shared assets)",
              "licence": "CC0 1.0 Public Domain Dedication",
              "url": "https://github.com/mdn/shared-assets"
            },
            "transcript": [
              { "kind": "paragraph", "text": "Demonstration clip with no spoken audio. A closed flower bud is held in centre frame, then opens fully in time-lapse." }
            ]
          },
          "body": [
            {
              "kind": "paragraph",
              "text": "The same slide type takes a hosted embed instead — set `embed` rather than `src`. YouTube URLs are rewritten to the no-cookie host automatically. Either way the engine refuses to accept a video slide with no transcript."
            }
          ]
        },

        {
          "id": "branch",
          "type": "branch",
          "eyebrow": "Slide type",
          "title": "A branching decision point",
          "body": [
            { "kind": "paragraph", "text": "The learner's choice decides which slide comes next. Both paths rejoin further on." }
          ],
          "question": "Which path should this demo take?",
          "options": [
            {
              "id": "short",
              "text": "The short way",
              "sub": "Jumps straight to the outcome slide for path A.",
              "target": "outcome-a",
              "feedback": "Taking path A."
            },
            {
              "id": "long",
              "text": "The other way",
              "sub": "Goes to a different slide entirely.",
              "target": "outcome-b",
              "feedback": "Taking path B."
            }
          ]
        },

        {
          "id": "outcome-a",
          "type": "text-image",
          "eyebrow": "Path A",
          "title": "You chose the short way",
          "next": "reflect",
          "body": [
            { "kind": "paragraph", "text": "Path B was never shown. Press Back — you return to the decision point you came from, not to whichever slide happens to sit before this one in the file." }
          ]
        },

        {
          "id": "outcome-b",
          "type": "text-image",
          "eyebrow": "Path B",
          "title": "You chose the other way",
          "next": "reflect",
          "body": [
            { "kind": "paragraph", "text": "Path A was never shown. Both paths rejoin at the next slide." }
          ]
        },

        {
          "id": "reflect",
          "type": "reflection",
          "eyebrow": "Assessment strategy 1 of 3",
          "title": "Open response",
          "required": true,
          "prompt": "Write anything at all here, then try to move on.",
          "hint": "This slide is set to `required`, so Next stays locked until the box has something in it. Reflections are captured, never scored.",
          "placeholder": "Type a few words…",
          "body": [
            { "kind": "paragraph", "text": "Nothing typed here leaves the device, and it is gone when the tab closes." }
          ]
        }
      ]
    },

    {
      "id": "assessment",
      "title": "Assessment strategies",
      "slides": [
        {
          "id": "check-multi",
          "type": "quiz",
          "eyebrow": "Assessment strategy 2 of 3",
          "title": "Mid-scene knowledge check",
          "assessment": { "role": "formative", "scored": false },
          "question": "Which of these does the engine check on every course load?",
          "select": "multiple",
          "retry": true,
          "options": [
            { "text": "Alt text on every graphic", "correct": true, "feedback": "Missing or empty-but-not-declared alt text is a hard error." },
            { "text": "Captions or a transcript on every video", "correct": true, "feedback": "A video slide with no transcript will not pass." },
            { "text": "That branch targets resolve to real slides", "correct": true, "feedback": "A dead branch target is a hard error, not a runtime surprise." },
            { "text": "Colour contrast of the learner's chosen theme", "feedback": "Contrast is handled in the stylesheet, not at runtime. Both themes were measured against WCAG AA when the palette was set." }
          ]
        },
        {
          "id": "check-summative",
          "type": "quiz",
          "eyebrow": "Assessment strategy 3 of 3",
          "title": "End-of-scene check",
          "assessment": { "role": "summative", "scored": true },
          "question": "Where does a learner's work go?",
          "select": "single",
          "retry": true,
          "options": [
            { "text": "Into the browser tab, and nowhere else", "correct": true, "feedback": "No server, no account, no analytics. It clears when the tab closes." },
            { "text": "To a course database", "feedback": "There is no database. That is a deliberate choice, not a missing feature." },
            { "text": "To the facilitator's dashboard", "feedback": "There is no dashboard. Ratings are collected separately on the IRF." }
          ],
          "correctText": "That is the whole data story.",
          "incorrectText": "Check the Contents menu, then 'Your data'."
        }
      ]
    }
  ]
}
;
