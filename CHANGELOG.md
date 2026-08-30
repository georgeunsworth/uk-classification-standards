# Changelog

All notable changes to the tracked standards (not just this repo's code) are logged here,
dated by when the change was caught, not necessarily when the source changed.

## Unreleased

### Added
- Initial `mental-health.yaml` domain with 4 entries: ONS long-lasting health conditions
  standard, ONS impairment standard, ONS mental health harmonisation review (archived,
  no preferred standard), NHS MHSDS ICD-10 value sets.
- Static lookup page (`index.html`, served via GitHub Pages) for browsing entries.
- `applies_to` (population) and `use_case` (design-context) fields added to the schema,
  so entries can be found by who/what they're for, not just by name. Backfilled on all
  4 existing entries after checking each source directly: the ONS harmonisation
  standards specify direct response for 16+ with proxy response under 16; the archived
  mental health review defines no age scope but names children/young people as an
  under-represented group it identified a need for; the NHS MHSDS explicitly covers
  "children and adults."
- `question` and `values` fields added so entries carry the actual, form-ready content —
  not just a pointer to go find it. Verified against source for both ONS standards
  (exact question wording and selectable response options, with spontaneous-only options
  like "Don't know"/"Refusal" deliberately excluded from `values` and explained in
  `notes` instead so they aren't mistaken for choices to offer). Left `null` for the
  archived review (no standard exists) and the NHS MHSDS (the standards.nhs.uk page
  doesn't publish a compact ICD-10 code list itself — it points to a separate Technical
  Output Specification / NHS Data Model and Dictionary instead).
