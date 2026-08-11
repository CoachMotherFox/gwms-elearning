# Where the IRF lands

Unit 4 of the curriculum guide:

> The IRF is the last screen of the module. No student leaves before completing it… IRF responses log through a Google Form backend or basic LMS.

The engine has no server of its own, so it posts straight from the page. Two ways, both configured in one file: **`courses/_curriculum/irf.json`**. Re-run `node tools/build-sessions.js` after editing it — that copies the settings into `courses/index.json`, which is what the engine reads.

Shipped set to `"transport": "none"`, which means everything stays on the device. Nothing leaves until you point it somewhere.

---

## What gets sent

One payload, on one deliberate press of **Send it**, from the last screen only.

```json
{
  "courseId": "session-07",
  "session": 7, "stage": "The Descent", "week": 3, "theme": "Crack",
  "submittedAt": "2026-08-11T01:50:28.176Z",
  "answers": {
    "mat": "got passed a lot",
    "worked": "my frames",
    "didnt": "staying calm when losing"
  },
  "probingQuestion": "What happens to your mask when you're losing?",
  "reflection": "i go quiet and stop trying"
}
```

No name, no login, no device id, nothing that links two sessions to one boy. Set `"includeReflection": false` to send only the three IRF answers.

If the send fails — no wifi, dead hotspot — it goes into a queue in `localStorage` and retries on the next load, keeping its original timestamp. **A failed send never blocks a participant from finishing.** Holding a boy at the door over the site's wifi is not a thing this program does.

---

## Option A — Apps Script (recommended)

More setup, but delivery is confirmed, the columns are yours, and it writes into a Sheet you already own.

1. New Google Sheet. **Extensions → Apps Script**.
2. Replace `Code.gs` with this, set `TOKEN` to any random string:

```javascript
const SHEET_NAME = 'IRF';
const TOKEN = 'change-me';               // must match irf.json
const HEADERS = ['Received', 'Submitted', 'Session', 'Stage', 'Week', 'Theme',
                 'Probing question', 'Reflection',
                 'What happened on the mat', 'What worked', 'What did not work', 'Code'];

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (TOKEN && d.token !== TOKEN) return out_({ ok: false, error: 'bad token' });
    const a = d.answers || {};
    sheet_().appendRow([
      new Date(), d.submittedAt || '', d.session || '', d.stage || '',
      d.week || '', d.theme || '', d.probingQuestion || '', d.reflection || '',
      a.mat || '', a.worked || '', a.didnt || '', d.participantCode || ''
    ]);
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}

function doGet() { return out_({ ok: true, service: 'GWMS IRF' }); }

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); sh.setFrozenRows(1); }
  return sh;
}
```

3. **Deploy → New deployment → Web app.** Execute as **Me**. Who has access: **Anyone**. Copy the `/exec` URL.
4. Put it in `courses/_curriculum/irf.json`:

```json
{
  "transport": "appsScript",
  "url": "https://script.google.com/macros/s/AKfy…/exec",
  "token": "change-me",
  "includeReflection": true
}
```

5. `node tools/build-sessions.js && sh tools/bundle.sh`

"Anyone" means anyone with the URL can post. The token is the floor, not a lock — it ships inside the page. Nothing sensitive is readable through the endpoint either way; `doGet` returns a health check and nothing else.

---

## Option B — Google Form

Zero setup beyond the Form, and the Form already writes to a Sheet. The trade: the browser gets an opaque response back, so the engine can report "handed to the network" but never "landed". For an instrument that documents participation, prefer Option A.

1. Build a Form with one short-answer question per field you want.
2. Open the live form, **View source**, and search for `entry.` — each question has an `entry.1234567890` id.
3. Take the form's `/viewform` URL and change the last segment to `formResponse`.
4. Fill in `irf.json`:

```json
{
  "transport": "googleForm",
  "url": "https://docs.google.com/forms/d/e/1FAIpQL…/formResponse",
  "includeReflection": true,
  "fields": {
    "session": "entry.111111111",
    "submittedAt": "entry.222222222",
    "mat": "entry.333333333",
    "worked": "entry.444444444",
    "didnt": "entry.555555555",
    "probingQuestion": "entry.666666666",
    "reflection": "entry.777777777"
  }
}
```

---

## Participant codes

`"participantCode"` is `null` and should usually stay that way. Unit 1 records the pilot as *program-level tracking only, no identifying data*.

Unit 1 also says IRF data serves as documentation of participation for the juvenile-diversion lane, which needs to know who attended. Those two pull in opposite directions and it is a program decision, not an engineering one. If a site needs it, put a site-assigned code — never a name — in `irf.json`, and know that it makes every row linkable across all 36 sessions.

---

## Testing without Google

Any endpoint that accepts a POST and answers `{"ok":true}` works. Point `url` at it, run a session, and watch the rows arrive. That is how the transport, the offline queue, and the boot-time retry in this repo were verified.
