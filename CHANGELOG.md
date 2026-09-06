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
- Schema/UI groundwork for two content batches landing next (broadening access needs beyond the
  NHS, and a new official-classifications domain): extended `source_type` with 5 new values
  (`official-classification`, `cross-government-taxonomy`, `regulatory-framework`,
  `sector-eligibility-framework`, `international-standard`) so non-ONS/NHS publishers — a
  cross-government taxonomy, a regulator, a sector eligibility scheme, an international body —
  are classified honestly instead of forced into the ONS/NHS-shaped enum; extended `use_case`
  with `support-needs-identification` and `official-classification`. Renamed `access-needs.yaml`
  to `access-and-support-needs.yaml` (3 existing entries unchanged) to reflect the broadened
  scope. Added a `category` grouping over domains in `app.js` (Demographics & population
  characteristics; Health & clinical; Referral & safeguarding; Access & support needs; Geography
  & official classifications) with a filter on both pages, and `questions.html` now groups its
  existing domain sections under category headings. Added a source-type filter to both pages.
  Created the (currently empty) `official-classifications.yaml` file so the new domain loads
  without erroring ahead of its first entries.
- Added 6 entries to `access-and-support-needs.yaml`. Two turned out `licence_status: restricted`
  on direct verification, contradicting the common assumption that they're freely reusable: the
  **Washington Group Short Set on Functioning** (WG's own terms require prior written consent and
  prohibit inclusion "in any other website" — no free-reuse statement was found anywhere else in
  their materials) and the **FCA's vulnerability drivers (FG21/1)** (FCA copyright, reproduction
  limited to "personal use or use within an individual firm"). Both are reference-only
  (name/source/link, all content fields null) with the specific rights-holder language quoted in
  `licence_notes`, per CONTRIBUTING.md. Added `ogl`-confirmed: the **GOV.UK Taxonomy of
  Vulnerability Risk Factors** (11 top-level categories reproduced; still alpha-stage per its own
  source, two categories explicitly marked incomplete); the **Priority Services Register**, as two
  separate entries (Ofgem/energy, Ofwat/water) since their published eligibility categories
  meaningfully differ (e.g. Ofwat's "poor sense of taste or smell" and "cognitive impairment... or
  dementia" have no Ofgem equivalent); and the **Essential Digital Skills framework** — published
  by DfE, not DCMS as commonly assumed (DCMS was one of several 2018 steering-group members, not
  the publisher of record). **UKAAF's accessible-format standards were researched but left out**:
  no explicit free-reproduction statement exists in UKAAF's own terms (only a generic "all rights
  reserved" notice), and no `source_type` enum value fits a charity-run technical format standard
  without forcing it — left as a documented roadmap gap rather than misclassified.
- Added 12 entries to `demographics.yaml`, filling gaps against the current GSS harmonised
  standards list: general health, personal wellbeing (ONS4, modelled as a 4-item instrument
  sharing one 0–10 scale, like PHQ-9 — the anxiety item's reversed scoring convention is
  documented in `scoring.clinical_note` rather than split into a separate entry), migration/
  country of birth/citizenship, armed forces veteran status (`under-review` — the source states
  the standard "is under development"), internet access (`under-review`), loneliness
  (`under-review`), Welsh language skills, and cohabitation. Three are recorded as composite/
  no-single-question entries rather than forced into a `question`/`values` shape: socio-economic
  background (a 2023 standard, distinct from NS-SEC, derived from a 2-question parental
  occupation/qualification battery — same pattern as the existing NS-SEC entry), social capital
  (a 6-question battery across 4 domains with heterogeneous response scales), and crime and fear
  of crime (a ~20-item, four-block battery with no single question — and a flagged staleness
  issue: the source document still names its lead survey "the British Crime Survey," a name
  retired in 2012). Pregnancy and maternity is recorded as a confirmed `no-standard-gap`: its GSS
  page is guidance/directory only, stating the team "would be interested in... developing
  harmonised questions." Cohabitation is a genuine correction to this repo's own prior record —
  the entry added when `marital-civil-partnership-status` was added treated cohabitation as "not
  its own standard," but it has (or by now is) a standalone harmonised standard in its own right
  (published Nov 2020); the existing marital-status entry was left untouched and this correction
  recorded in the new `ons-cohabitation-standard` entry's `notes` instead. Migration/country of
  birth/citizenship and crime/fear of crime both required reading the underlying Crown-copyright
  PDFs directly, since the HTML landing pages don't expose the actual question text.
- New `official-classifications.yaml` domain (11 entries): SOC 2020, SIC 2007, the Indices of
  (Multiple) Deprivation for each UK nation as separate entries (England IoD2025, Scotland
  SIMD2020, Wales WIMD2025, Northern Ireland NIMDM2017), the 2021 Rural Urban Classification, the
  2021/2 Output Area Classification, the ONS geography/GSS coding hierarchy, DfE's school-type
  classification (GIAS), and ONS's local authority type classification. All `question: null` —
  these are derived/administrative classifications, not survey questions, so this domain surfaces
  on the by-standard view only. Several currency assumptions from general research didn't survive
  direct verification and were corrected: Wales's WIMD2019 has been superseded by **WIMD2025**
  (published 27 November 2025, not still-current as assumed); England's **IoD2025** is genuinely
  live (confirmed directly, published 30 October 2025); SIC 2007 remains the operational
  classification for now, but **UK SIC 2026** has already been published (3 August 2026) and is
  flagged prominently in that entry's notes for future re-review, even though ONS doesn't mandate
  its use yet ("earliest anticipated use... in National Accounts is the 2031 Blue Book"). `values`
  is left `null` on SIC 2007 (615+ classes — too many to compactly list), the Output Area
  Classification (couldn't confirm the 8 supergroup names verbatim on the source page), and the
  school-type classification (GIAS's canonical list sits behind a JS-driven filter, not static
  text) — each documented in `notes` rather than guessed or partially reconstructed. Also updated
  the existing `ons-nssec-standard` entry in `demographics.yaml` (that one field only) to
  cross-reference the new SOC 2020 entry, since NS-SEC's harmonised documentation still derives it
  from SOC2010.
