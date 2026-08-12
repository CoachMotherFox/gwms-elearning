#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   GWMS eLearning Engine — palette-check.js

   Verifies the color tokens in engine/css/engine.css against WCAG AA before
   they ship. Same relative-luminance / contrast formula as the live audit in
   engine/js/validate.js, run offline against the actual hex values rather
   than a rendered page.

     node tools/palette-check.js

   Edit the D (dark) and L (light) objects below to match engine.css exactly
   whenever a token changes, then re-run. A hand-tweaked hex that "looks
   about right" is exactly the kind of change that passes a glance and fails
   the live contrast audit a learner's actual browser runs.
   --------------------------------------------------------------------------- */

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}
function relLum(rgb) {
  const c = rgb.map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(hexA, hexB) {
  const l1 = relLum(hexToRgb(hexA)), l2 = relLum(hexToRgb(hexB));
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
function check(label, fg, bg, need) {
  const r = ratio(fg, bg);
  const ok = r >= need;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(28)} ${fg} on ${bg}  ${r.toFixed(2)}:1  (need ${need})`);
  return ok;
}

console.log('=== DARK THEME ===');
const D = {
  bg: '#121412', surface: '#1B1D18', surface2: '#242822',
  ink: '#F1F2ED', inkMuted: '#A7AC9E',
  line: '#2C2F27', lineStrong: '#666C58',
  accent: '#8CB93A', accentInk: '#12140D',
  ok: '#5FD37A', okSoft: '#132A18',
  no: '#F0645A', noSoft: '#2C1613',
  highlight: '#E8B93A'
};
check('body text (ink/bg)', D.ink, D.bg, 4.5);
check('muted text (ink-muted/bg)', D.inkMuted, D.bg, 4.5);
check('UI boundary (line-strong/bg)', D.lineStrong, D.bg, 3.0);
check('accent as link/border text (accent/bg)', D.accent, D.bg, 4.5);
check('button label (accent-ink/accent)', D.accentInk, D.accent, 4.5);
check('ok text (ok/bg)', D.ok, D.bg, 4.5);
check('ok text on ok-soft card (ok/ok-soft)', D.ok, D.okSoft, 4.5);
check('no text (no/bg)', D.no, D.bg, 4.5);
check('no text on no-soft card (no/no-soft)', D.no, D.noSoft, 4.5);
check('highlight text (highlight/bg)', D.highlight, D.bg, 4.5);
check('surface-2 vs bg is visibly distinct (UI only)', D.surface2, D.bg, 1.15);

console.log('\n=== LIGHT THEME ===');
const L = {
  bg: '#FAFAF6', surface: '#FFFFFF', surface2: '#EFF1E8',
  ink: '#15170F', inkMuted: '#565A4C',
  line: '#E1E4D8', lineStrong: '#8C9280',
  accent: '#4E6B1B', accentInk: '#FFFFFF',
  ok: '#1D7A3D', okSoft: '#E3F3E7',
  no: '#A32E24', noSoft: '#FBE7E4',
  highlight: '#7A5E00'
};
check('body text (ink/bg)', L.ink, L.bg, 4.5);
check('muted text (ink-muted/bg)', L.inkMuted, L.bg, 4.5);
check('UI boundary (line-strong/bg)', L.lineStrong, L.bg, 3.0);
check('accent as link/border text (accent/bg)', L.accent, L.bg, 4.5);
check('button label (accent-ink/accent)', L.accentInk, L.accent, 4.5);
check('ok text (ok/bg)', L.ok, L.bg, 4.5);
check('ok text on ok-soft card (ok/ok-soft)', L.ok, L.okSoft, 4.5);
check('no text (no/bg)', L.no, L.bg, 4.5);
check('no text on no-soft card (no/no-soft)', L.no, L.noSoft, 4.5);
check('highlight text (highlight/bg)', L.highlight, L.bg, 4.5);
