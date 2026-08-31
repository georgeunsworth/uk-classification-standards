#!/usr/bin/env python3
"""Validate data/*.yaml files against the schema described in README.md.

Checks:
- valid YAML
- required fields present on every entry
- status/source_type values are within the allowed enum
- last_reviewed / source_published (where not null) are valid dates
- id values are unique within a file
- source_url is a plausible http(s) URL
- applies_to is a list drawn from the allowed population tags (may be empty —
  an empty list means the source doesn't confirm applicability either way)
- use_case is a non-empty list drawn from the allowed use-case tags
- question is a string or null
- values is a list of strings or null (null means no compact value set is
  published by the source — see notes for where the real one lives)
- licence_status is one of the allowed values; licence_notes is a string
  citing the specific basis for that status (not just "trust me")
- items (a multi-item instrument's individually addressable statements),
  response_scale (its shared response options), and scoring (summing rule +
  severity bands) are each either present together and well-formed, or all
  null — an entry shouldn't have some but not others
- a `restricted` entry has question/values/items/response_scale/scoring all
  null — restricted entries are reference-only, never reproduced content
"""
import sys
import glob
import datetime
import yaml

REQUIRED_FIELDS = {
    "id", "label", "source", "source_type", "status",
    "last_reviewed", "source_published", "source_url", "notes",
    "applies_to", "use_case", "question", "values",
    "licence_status", "licence_notes", "items", "response_scale", "scoring",
}
VALID_SOURCE_TYPES = {"harmonised-standard", "clinical-dataset", "survey-instrument"}
VALID_STATUSES = {"current", "under-review", "archived", "superseded"}
VALID_POPULATION_TAGS = {"adults", "children-young-people"}
VALID_USE_CASE_TAGS = {
    "demographic-survey", "clinical-record", "no-standard-gap", "screening-instrument",
}
VALID_LICENCE_STATUSES = {"ogl", "public-domain", "restricted"}


def check_tag_list(value, field, allowed, entry_id, errors, allow_empty):
    if not isinstance(value, list):
        errors.append(f"{entry_id}: {field} must be a list, got {value!r}")
        return
    if not allow_empty and not value:
        errors.append(f"{entry_id}: {field} must not be empty")
    unknown = set(value) - allowed
    if unknown:
        errors.append(f"{entry_id}: {field} has unknown tag(s) {sorted(unknown)}")


def check_optional_string(value, field, entry_id, errors):
    if value is not None and not isinstance(value, str):
        errors.append(f"{entry_id}: {field} must be a string or null, got {value!r}")


def check_optional_string_list(value, field, entry_id, errors):
    if value is None:
        return
    if not isinstance(value, list) or not all(isinstance(v, str) for v in value):
        errors.append(f"{entry_id}: {field} must be a list of strings or null, got {value!r}")


def check_items(value, entry_id, errors):
    if value is None:
        return
    if not isinstance(value, list) or not value:
        errors.append(f"{entry_id}: items must be a non-empty list or null, got {value!r}")
        return
    seen = set()
    for item in value:
        if not isinstance(item, dict) or "id" not in item or "text" not in item:
            errors.append(f"{entry_id}: each item needs id and text, got {item!r}")
            continue
        if item["id"] in seen:
            errors.append(f"{entry_id}: duplicate item id {item['id']!r}")
        seen.add(item["id"])
        if not isinstance(item["text"], str) or not item["text"]:
            errors.append(f"{entry_id}: item {item['id']!r} text must be a non-empty string")


def check_response_scale(value, entry_id, errors):
    if value is None:
        return
    if not isinstance(value, dict) or "instruction" not in value or "options" not in value:
        errors.append(f"{entry_id}: response_scale needs instruction and options, got {value!r}")
        return
    options = value["options"]
    if not isinstance(options, list) or not options:
        errors.append(f"{entry_id}: response_scale.options must be a non-empty list")
        return
    for opt in options:
        if not isinstance(opt, dict) or "label" not in opt or "score" not in opt:
            errors.append(f"{entry_id}: each response_scale option needs label and score, got {opt!r}")
        elif not isinstance(opt["score"], int):
            errors.append(f"{entry_id}: response_scale option {opt.get('label')!r} score must be an integer")


def check_scoring(value, entry_id, errors):
    if value is None:
        return
    if not isinstance(value, dict) or "method" not in value or "bands" not in value:
        errors.append(f"{entry_id}: scoring needs method and bands, got {value!r}")
        return
    bands = value["bands"]
    if not isinstance(bands, list) or not bands:
        errors.append(f"{entry_id}: scoring.bands must be a non-empty list")
        return
    for band in bands:
        required = {"min", "max", "label"}
        if not isinstance(band, dict) or not required.issubset(band.keys()):
            errors.append(f"{entry_id}: each scoring band needs min, max, label, got {band!r}")
        elif not isinstance(band["min"], int) or not isinstance(band["max"], int):
            errors.append(f"{entry_id}: scoring band {band.get('label')!r} min/max must be integers")


def check_instrument_shape(entry, entry_id, errors):
    fields = ("items", "response_scale", "scoring")
    present = [entry.get(f) is not None for f in fields]
    if any(present) and not all(present):
        errors.append(
            f"{entry_id}: items/response_scale/scoring must all be present or all null, "
            f"got {dict(zip(fields, present))}"
        )


def check_restricted_is_reference_only(entry, entry_id, errors):
    if entry.get("licence_status") != "restricted":
        return
    fields = ("question", "values", "items", "response_scale", "scoring")
    non_null = [f for f in fields if entry.get(f) is not None]
    if non_null:
        errors.append(
            f"{entry_id}: licence_status is restricted, so {non_null} must be null "
            f"— restricted entries are reference-only, no reproduced content"
        )


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

        check_tag_list(
            entry.get("applies_to"), "applies_to", VALID_POPULATION_TAGS,
            entry_id, errors, allow_empty=True,
        )
        check_tag_list(
            entry.get("use_case"), "use_case", VALID_USE_CASE_TAGS,
            entry_id, errors, allow_empty=False,
        )

        check_optional_string(entry.get("question"), "question", entry_id, errors)
        check_optional_string_list(entry.get("values"), "values", entry_id, errors)

        if entry.get("licence_status") not in VALID_LICENCE_STATUSES:
            errors.append(f"{entry_id}: invalid licence_status {entry.get('licence_status')!r}")
        if not isinstance(entry.get("licence_notes"), str) or not entry.get("licence_notes"):
            errors.append(f"{entry_id}: licence_notes must be a non-empty string")

        check_items(entry.get("items"), entry_id, errors)
        check_response_scale(entry.get("response_scale"), entry_id, errors)
        check_scoring(entry.get("scoring"), entry_id, errors)
        check_instrument_shape(entry, entry_id, errors)
        check_restricted_is_reference_only(entry, entry_id, errors)

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
