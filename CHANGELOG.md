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
- New `demographics.yaml` domain (9 entries): the sibling GSS Harmonised Standards commonly
  needed on referral/intake forms — ethnicity, disability (Equality Act 2010), sexual
  orientation, religion, national identity, and tenure (all `current`); sex and language
  recorded as confirmed gaps (`no-standard-gap` — no GSS-wide standard currently exists for
  either); gender identity recorded as `archived` (retired following the December 2024
  GSS Harmonisation workplan, with nothing yet superseding it, so it's tagged as both a
  demographic-survey question and a no-standard-gap). Every question/value/age-scope claim
  re-verified directly against source (not taken from research summaries as-is) before writing.
- New `referral-identifiers.yaml` domain (5 entries): NHS Number, GP practice registration,
  two safeguarding data elements (SNOMED CT concern — adult and child; a narrower child-only
  vulnerability indicator), and a recorded gap for consent (no single official coded consent
  standard exists, only per-dataset indicators). One claim from initial research — that GP
  practice registration was "being superseded" — didn't hold up under direct verification of
  the live page, so it's recorded as `current` with the ambiguity noted instead.
- `questions.html`: a second view of the same data, grouped by domain, organised by the
  question you're trying to ask rather than by standard name — with a "Known gaps" section per
  domain so entries with no usable standard (sex, language, consent, the mental-health review)
  surface explicitly instead of just not appearing. Shared rendering/filtering logic extracted
  from `index.html` into `app.js` and `style.css` so both pages stay in sync.
- Screening/outcome tools (PHQ-9, GAD-7, SDQ, ORS/SRS, WEMWBS, RCADS) researched but
  deliberately not added yet — see the Roadmap in `README.md` for the licensing findings.
