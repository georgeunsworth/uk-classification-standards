#!/usr/bin/env python3
"""Validate data/*.yaml files against the schema described in README.md.

Checks:
- valid YAML
- required fields present on every entry
- status/source_type values are within the allowed enum
- last_reviewed / source_published (where not null) are valid dates
- id values are unique within a file
- source_url is a plausible http(s) URL
"""
import sys
import glob
import datetime
import yaml

REQUIRED_FIELDS = {
    "id", "label", "source", "source_type", "status",
    "last_reviewed", "source_published", "source_url", "notes",
}
VALID_SOURCE_TYPES = {"harmonised-standard", "clinical-dataset", "survey-instrument"}
VALID_STATUSES = {"current", "under-review", "archived", "superseded"}


def check_date(value, field, entry_id, errors):
    if value is None:
        return
    if isinstance(value, datetime.date):
        return
    errors.append(f"{entry_id}: {field} is not a valid date: {value!r}")


def validate_file(path):
    errors = []
    with open(path) as f:
        entries = yaml.safe_load(f) or []

    if not isinstance(entries, list):
        return [f"{path}: top-level content must be a list"]

    seen_ids = set()
    for entry in entries:
        entry_id = entry.get("id", "<missing id>")

        missing = REQUIRED_FIELDS - entry.keys()
        if missing:
            errors.append(f"{entry_id}: missing fields {sorted(missing)}")

        if entry_id in seen_ids:
            errors.append(f"{entry_id}: duplicate id in {path}")
        seen_ids.add(entry_id)

        if entry.get("source_type") not in VALID_SOURCE_TYPES:
            errors.append(
                f"{entry_id}: invalid source_type {entry.get('source_type')!r}"
            )
        if entry.get("status") not in VALID_STATUSES:
            errors.append(f"{entry_id}: invalid status {entry.get('status')!r}")

        check_date(entry.get("last_reviewed"), "last_reviewed", entry_id, errors)
        check_date(entry.get("source_published"), "source_published", entry_id, errors)

        url = entry.get("source_url", "")
        if not (isinstance(url, str) and url.startswith("http")):
            errors.append(f"{entry_id}: source_url does not look like a URL: {url!r}")

    return errors


def main():
    files = sorted(glob.glob("data/*.yaml"))
    if not files:
        print("No data files found under data/ — nothing to validate.")
        return 0

    all_errors = []
    for path in files:
        all_errors.extend(validate_file(path))

    if all_errors:
        print(f"Validation failed with {len(all_errors)} error(s):\n")
        for err in all_errors:
            print(f"  - {err}")
        return 1

    total_entries = sum(len(yaml.safe_load(open(p)) or []) for p in files)
    print(f"OK — {len(files)} file(s), {total_entries} entries, no errors.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
