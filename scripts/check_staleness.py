#!/usr/bin/env python3
"""Flag entries whose own record of currency has gone stale.

This is a fast, local, network-free check — it never touches source_url. It only
asks: "we said this entry is `current`, but have we actually re-checked it against
its source recently?" That's a different question from whether the source itself
has changed (see live_verify.py for that, run monthly).

Non-blocking: always exits 0. Findings are surfaced as GitHub Actions warning
annotations and a step summary table, not a failing check — time passing isn't
itself a defect, and bumping `last_reviewed` isn't always warranted just because
STALE_DAYS has elapsed.
"""
import datetime
import glob
import os
import sys

import yaml

STALE_DAYS = 365


def find_stale_entries(files):
    stale = []
    today = datetime.date.today()
    for path in files:
        with open(path) as f:
            entries = yaml.safe_load(f) or []
        for entry in entries:
            if entry.get("status") != "current":
                continue
            last_reviewed = entry.get("last_reviewed")
            if not isinstance(last_reviewed, datetime.date):
                continue
            age_days = (today - last_reviewed).days
            if age_days > STALE_DAYS:
                stale.append((path, entry.get("id", "<missing id>"), last_reviewed, age_days))
    return stale


def main():
    files = sorted(glob.glob("data/*.yaml"))
    stale = find_stale_entries(files)

    if not stale:
        print("OK — no entries marked `current` have gone unreviewed for over "
              f"{STALE_DAYS} days.")
        return 0

    print(f"{len(stale)} entr{'y is' if len(stale) == 1 else 'ies are'} marked `current` "
          f"but last reviewed over {STALE_DAYS} days ago:\n")
    lines = ["| Entry | File | Last reviewed | Days ago |", "| --- | --- | --- | --- |"]
    for path, entry_id, last_reviewed, age_days in stale:
        print(f"  - {entry_id} ({path}): last reviewed {last_reviewed} ({age_days} days ago)")
        print(f"::warning file={path}::`{entry_id}` is marked current but was last reviewed "
              f"{last_reviewed} ({age_days} days ago) — consider re-checking its source")
        lines.append(f"| {entry_id} | {path} | {last_reviewed} | {age_days} |")

    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_path:
        with open(summary_path, "a") as f:
            f.write("## Staleness check\n\n")
            f.write("\n".join(lines) + "\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
