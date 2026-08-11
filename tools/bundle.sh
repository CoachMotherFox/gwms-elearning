#!/bin/sh
# ---------------------------------------------------------------------------
# GWMS eLearning Engine — bundle.sh
#
# course.json is the source of truth. You never need this script while you are
# authoring against a local server.
#
# Run it when you want the folder to work by double-clicking engine/index.html
# (for example, before zipping the project for a reviewer). Browsers block
# fetch() on file:// URLs, so the engine falls back to a <script> tag; this
# script writes that one-line wrapper around each course.json.
#
#   sh tools/bundle.sh
#
# Safe to re-run. It only ever writes *.bundle.js.
# ---------------------------------------------------------------------------
set -eu

ROOT=$(cd "$(dirname "$0")/.." && pwd)
COURSES="$ROOT/courses"
count=0

check_json() {
  if command -v python3 >/dev/null 2>&1; then
    python3 -c 'import json,sys; json.load(open(sys.argv[1]))' "$1" || {
      echo "  ✗ $1 is not valid JSON — not bundled." >&2
      return 1
    }
  fi
  return 0
}

# --- Each course folder ----------------------------------------------------
for dir in "$COURSES"/*/; do
  [ -f "${dir}course.json" ] || continue
  id=$(basename "$dir")
  check_json "${dir}course.json" || continue
  {
    printf 'window.GWMS_COURSE_BUNDLE = window.GWMS_COURSE_BUNDLE || {};\n'
    printf 'window.GWMS_COURSE_BUNDLE[%s] =\n' "\"$id\""
    cat "${dir}course.json"
    printf ';\n'
  } > "${dir}course.bundle.js"
  echo "  ✓ $id"
  count=$((count + 1))
done

# --- Course index ----------------------------------------------------------
if [ -f "$COURSES/index.json" ] && check_json "$COURSES/index.json"; then
  {
    printf 'window.GWMS_COURSE_INDEX =\n'
    cat "$COURSES/index.json"
    printf ';\n'
  } > "$COURSES/index.bundle.js"
  echo "  ✓ index"
fi

echo "Bundled $count course(s). engine/index.html will now open directly from disk."
