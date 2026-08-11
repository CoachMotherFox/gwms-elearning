#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   GWMS eLearning Engine — check.js

   Runs the same accessibility and integrity check the engine runs at load
   time, but over every course folder at once, from the command line.

     node tools/check.js              # all courses
     node tools/check.js session-01   # one course

   Exits non-zero if any course has an error, so it can gate a hand-off.
   Requires nothing but Node. There is no build step and no dependency.
   --------------------------------------------------------------------------- */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const COURSES = path.join(ROOT, 'courses');

// Load the browser module by evaluating it against a stub global.
global.window = {};
// eslint-disable-next-line no-eval
eval(fs.readFileSync(path.join(ROOT, 'engine', 'js', 'validate.js'), 'utf8'));
const validate = global.window.GWMS.validate;

const only = process.argv[2];
const ids = fs.readdirSync(COURSES)
  .filter((d) => fs.existsSync(path.join(COURSES, d, 'course.json')))
  .filter((d) => !only || d === only)
  .sort();

if (!ids.length) {
  console.error(only ? `No course folder named "${only}".` : 'No course folders found.');
  process.exit(2);
}

const RED = '[31m', YEL = '[33m', GRN = '[32m', DIM = '[2m', OFF = '[0m';
let totalErrors = 0;

for (const id of ids) {
  const file = path.join(COURSES, id, 'course.json');
  let course;
  try {
    course = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.log(`${RED}✗${OFF} ${id} — course.json is not valid JSON: ${e.message}`);
    totalErrors += 1;
    continue;
  }

  const issues = validate.course(course);
  const errors = issues.filter((i) => i.level === 'error');
  const warns = issues.filter((i) => i.level === 'warn');
  totalErrors += errors.length;

  const mark = errors.length ? `${RED}✗${OFF}` : (warns.length ? `${YEL}!${OFF}` : `${GRN}✓${OFF}`);
  console.log(`\n${mark} ${id} ${DIM}— ${errors.length} error(s), ${warns.length} warning(s)${OFF}`);

  for (const i of errors.concat(warns)) {
    const tag = i.level === 'error' ? `${RED}error${OFF}` : `${YEL}warn ${OFF}`;
    console.log(`    ${tag} ${DIM}${i.where}${i.wcag ? ' · ' + i.wcag : ''}${OFF}`);
    console.log(`          ${i.message}`);
  }
}

// Check that any bundles on disk are not stale.
const stale = ids.filter((id) => {
  const b = path.join(COURSES, id, 'course.bundle.js');
  if (!fs.existsSync(b)) return false;
  return fs.statSync(b).mtimeMs < fs.statSync(path.join(COURSES, id, 'course.json')).mtimeMs;
});
if (stale.length) {
  console.log(`\n${YEL}!${OFF} Stale bundle(s): ${stale.join(', ')}`);
  console.log(`  ${DIM}course.json changed after course.bundle.js was written.`);
  console.log(`  Re-run: sh tools/bundle.sh  (only matters for opening index.html from disk)${OFF}`);
}

console.log(`\n${totalErrors ? RED + totalErrors + ' error(s)' + OFF : GRN + 'No errors.' + OFF}`);
process.exit(totalErrors ? 1 : 0);
