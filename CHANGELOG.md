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
- Removed the "Clinical record" filter option from `questions.html`: every clinical-record
  entry lacks a `question` and isn't tagged `no-standard-gap`, so the filter could never
  match anything on that page — it just looked like a real category while always returning
  empty. Still offered on `index.html`, where it's meaningful.
- `licence_status`/`licence_notes` fields added to every entry across every domain (not just
  new ones) — this repo's content has been safely OGL up to now, but as soon as one domain
  needed genuine copyright handling, "what am I allowed to reproduce" needed to be a
  consistent, queryable field across the whole dataset, not a special case for one domain.
  Backfilled `licence_status: ogl` on all 18 pre-existing entries.
- `items`/`response_scale`/`scoring` fields added for multi-item instruments (a single
  question + response list doesn't fit a scale like PHQ-9's 9 separate statements sharing
  one response scale and a summed, banded score). `null` on every existing entry;
  `scripts/validate.py` enforces the three fields being present together or not at all.
- New `screening-tools.yaml` domain (2 entries): PHQ-9 and GAD-7, the two clinical screening
  tools confirmed (directly against phqscreeners.com and the official PHQ/GAD-7 instruction
  manual) to be public domain — "No permission required to reproduce, translate, display or
  distribute." Full items, response scale, and severity-band scoring included, not just a
  citation link, since that's what makes an entry actually usable for building a form. Other
  commonly-used tools (SDQ, ORS/SRS, WEMWBS, RCADS) were researched but deliberately left
  out — each carries real copyright/licensing restrictions; see README roadmap.
