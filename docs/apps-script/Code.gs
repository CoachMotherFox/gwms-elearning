/**
 * GWMS IRF receiver — paste this whole file into the Apps Script editor.
 *
 * Generated from courses/_curriculum/irf.json, so TOKEN below already
 * matches the engine. Do not retype it.
 *
 * Deploy -> Manage deployments -> pencil on the EXISTING deployment ->
 * Version: New version -> Deploy. That keeps the same /exec URL.
 */

const SHEET_NAME = 'IRF';
const TOKEN = '0bcbeb58-380e-426f-9736-b0e54c686992';   // matches courses/_curriculum/irf.json
const HEADERS = ['Received', 'Submitted', 'Session', 'Stage', 'Week', 'Theme',
                 'Probing question', 'Reflection',
                 'What happened on the mat', 'What worked', 'What did not work',
                 'Code', 'Submission id'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);                   // serialise concurrent writes
  try {
    const d = JSON.parse(e.postData.contents);
    if (TOKEN && d.token !== TOKEN) return out_({ ok: false, error: 'bad token' });

    const sh = sheet_();

    // A retry after a lost reply must not write the row twice. The client
    // keeps submissionId stable across retries, so drop anything already seen.
    if (d.submissionId && seen_(sh, d.submissionId)) {
      return out_({ ok: true, duplicate: true });
    }

    const a = d.answers || {};
    sh.appendRow([
      new Date(), d.submittedAt || '', d.session || '', d.stage || '',
      d.week || '', d.theme || '', d.probingQuestion || '', d.reflection || '',
      a.mat || '', a.worked || '', a.didnt || '', d.participantCode || '',
      d.submissionId || ''
    ]);
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
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

function seen_(sh, id) {
  const last = sh.getLastRow();
  if (last < 2) return false;
  const col = HEADERS.indexOf('Submission id') + 1;
  const ids = sh.getRange(2, col, last - 1, 1).getValues();
  return ids.some(function (r) { return r[0] === id; });
}
