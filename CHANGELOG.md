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
- Added the 5 previously-deferred screening tools as `licence_status: restricted`
  reference-only entries in `screening-tools.yaml`: SDQ (Youthinmind — free paper
  photocopying only, electronic reproduction requires a paid licence), ORS and SRS (Duncan &
  Miller — free individual paper-and-pencil use only, "NO ELECTRONIC OR DIGITAL USE OF THE
  SCALES IS PERMITTED," tiered paid licences for organisations/digital use), WEMWBS (NHS
  Health Scotland/Warwick/Edinburgh — tiered commercial/NHS/non-commercial licence portal),
  and RCADS (Chorpita & Spence — free for individual clinical/educational use, written
  permission required for translations, derivatives, or EHR/digital inclusion). Each entry
  has `question`/`values`/`items`/`response_scale`/`scoring` left null and cites the specific
  rights holder's language in `licence_notes`, per the CONTRIBUTING.md rule. Added a
  `scripts/validate.py` check enforcing that `restricted` entries stay reference-only (all
  five of those fields null), and gave `app.js` a distinct "reference only" message for
  restricted entries instead of the generic "no compact value set" text used for sources that
  simply don't publish a list.
- `questions.html`: added a "Licensed instruments — not reproduced here" subsection per
  domain (alongside the existing "Known gaps" one) so restricted entries are still visible on
  the by-question view — as name, source, licence tag, and link only, never as reproduced
  question/item content. Re-added the "Restricted" option to that page's licence filter, now
  that it's meaningful there.
- New `access-needs.yaml` domain (2 entries): the Accessible Information Standard (DAPB1605)
  and the Reasonable Adjustment Digital Flag (DAPB4019) — NHS standards for identifying, coding,
  and sharing a person's information/communication support needs and reasonable adjustments,
  filling a real gap this repo had: disability *status* (demographics.yaml) and impairment
  *type* (mental-health.yaml's ons-impairment-standard) were both tracked, but not the
  administrative flags a service uses once a communication/access need is identified. Neither
  source publishes one fixed survey question — both are coded flags recorded via SNOMED CT/Read
  v2/CTV3 — so `question` is `null` on both entries, matching the referral-identifiers.yaml
  pattern for administrative flags. `applies_to` left empty on both: DAPB1605's own scope
  language ("NHS and adult social care services") doesn't resolve whether "adult" restricts the
  whole standard or only its social-care leg, and DAPB4019's page states no explicit age scope
  either way — left as a recorded gap rather than guessed, per this repo's existing discipline.
- Added a third `access-needs.yaml` entry, `nhs-reasonable-adjustment-flag-need-codes`: the
  ~94 granular, form-ready answer options behind DAPB4019's 5 communication-relevant categories
  (BSL interpreter, Easyread, contact by email, hearing loop, etc.) — the actual "if so, what"
  values for an access-needs question, as opposed to the category-level names already captured
  in the DAPB4019 entry above. Extracted and cross-checked directly against the live page's raw
  HTML (not a summarised fetch) to avoid transcription error on a list this size. Deliberately
  excludes that same source's category 6 (~190 community-language-interpreter codes, left out
  for size, source_url points to the full list) and categories 7-11 (broader care/environment
  reasonable-adjustment categories, out of scope for "access needs" specifically). Licence note
  is more specific than this repo's usual OGL boilerplate: NHS England Digital's terms carve out
  "Information Standards" content as OGL-for-copying but not OGL-for-adaptation, which matters
  here because every value is a verbatim SNOMED CT description, not a paraphrase.
- Added 7 more GSS Harmonisation Team standards to `demographics.yaml`: economic activity status,
  NS-SEC (socio-economic classification), qualifications, marital and civil partnership status,
  household relationships, and unpaid care (all `current` or `under-review`), plus a recorded gap
  for income (`no-standard-gap` — the source page is a directory of 15 separate official
  income/earnings publications, not an operative question or set of bands). Economic activity
  status and NS-SEC share a single 2018 source document; `question` is left `null` on both, and on
  qualifications, because none of the three is asked as one question — economic activity needs
  ~15 routed questions, NS-SEC needs 8 more on top of that (3 on occupation, 5 on employment
  status/organisation size), and qualifications needs ~100 routed variables — so `values` holds
  each standard's official derived output classification instead (NS-SEC's 8-class list;
  qualifications' 7-category list), with the full input question sets preserved in `notes`. Also
  noted in `notes` rather than added as their own entries: the older, simpler "Educational
  attainment" standard (qualifications' interviewer-led fallback, its own development paused since
  2022) and the "Cohabitation" and "Household reference person" standards (related gaps/concepts
  to marital status and household relationships respectively) — added only where the source itself
  treats something as the primary standard for its topic, not every adjacent GSS page. `unpaid
  care` is recorded `under-review` rather than `current` since its own source page carries an
  explicit "awaiting an update" banner and states "No consistent question on unpaid care is
  currently used across the UK. A 2019 review identified 23 surveys collecting information on
  unpaid care" — the recommended question/values are reproduced anyway, same as the ethnicity
  entry's "under active review but keep using this standard" treatment. Every question, value,
  date, and caveat was re-verified directly against the live GSS Harmonisation Team pages (not
  taken from research summaries as-is) before writing.
