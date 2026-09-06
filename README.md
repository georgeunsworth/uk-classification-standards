# UK Classification Standards Tracker

*A versioned, maintained reference of current UK official classification standards used in service and system design, grouped by domain, with source, currency, and licence shown for each; and a browsable list of their  published questions or items.*

Maintained by George Unsworth ([@georgeunsworth](https://github.com/georgeunsworth)) at [Mortar Works](https://mortar.works).

**Browsable by standard:** https://georgeunsworth.github.io/uk-classification-standards/

**Browsable by question:** https://georgeunsworth.github.io/uk-classification-standards/questions.html 

## The problem

When designing an onboarding or referral form, a data model, or a reporting field for a UK public-facing service, you need to know: 
**what's the current official category set for this field, and where did it come from?**

That answer is scattered across ONS harmonisation guidance, NHS data dictionaries, and legacy survey instruments. Some of it is contradictory, some of it is explicitly marked as under review with no replacement yet published. This repo tracks official classifications, flags their currency, and notes known gaps. It is designed to be browsable, as well as to provide the exact questions, response options, reproduction rights and population confirmations as structured data to support the production of services and products. Read the YAML to assemble forms, citing provenance for the fields used. 

## What this is

- A structured, versioned dataset of UK official classification standards, organised by domain
- A changelog tracking when source standards are reviewed, revised, or archived
- A place to record known gaps or ambiguities in the official guidance itself (eg. "no preferred standard currently exists for X")

## What this is not

- This is not an official government product, and not affiliated with ONS, NHS, or GDS
- This is not a replacement for checking the primary source before using a classification in a live service (sources are provided to be checked)
- This is not a UI/accessibility pattern library (for this please see the [GOV.UK Design System](https://design-system.service.gov.uk/))
- This is not attempting new classification design, this only tracks what already exists officially

## Structure

```
data/
  demographics.yaml                    # GSS harmonised demographic standards
  mental-health.yaml                   # v1 domain
  screening-tools.yaml                 # validated clinical screening instruments (not OGL — see below)
  referral-identifiers.yaml            # NHS/safeguarding referral-data standards
  access-and-support-needs.yaml        # accessibility, communication, and vulnerability/support-need standards
  official-classifications.yaml        # ONS/DfE geography, occupational, and deprivation classifications
index.html / questions.html            # the two views, sharing app.js + style.css
CHANGELOG.md                           # dated log of source revisions we've caught
```

Domains are grouped into categories for navigation (see [Domains](#domains) below) — this is
UI-level grouping metadata in `app.js`'s `DOMAIN_FILES`, not a field on individual entries.

Each domain file is a list of entries with this shape:

```yaml
- id: string                # stable slug for this entry
  label: string              # the category/field name as published
  source: string              # publishing body + standard name
  source_type: enum           # harmonised-standard | clinical-dataset | survey-instrument |
                                # official-classification | cross-government-taxonomy |
                                # regulatory-framework | sector-eligibility-framework |
                                # international-standard — see below
  status: enum                 # current | under-review | archived | superseded
  last_reviewed: date          # date this repo last checked the source
  source_published: date       # date the source itself was last published/revised
  source_url: string
  applies_to: [enum]           # populations the source *confirms* this covers — see below.
                                # empty list means not confirmed either way, not "no"
  use_case: [enum]              # design context(s) this entry fits — see below
  question: string | null      # exact wording used to elicit this classification, quoted
                                # verbatim from source. null if not a single-question standard
                                # (e.g. a clinical dataset) or if no standard exists
  values: [string] | null       # the actual selectable response options, verbatim from
                                # source. null if the source doesn't publish a compact,
                                # embeddable list — see notes for where the real one lives
  licence_status: enum          # ogl | public-domain | restricted — see below
  licence_notes: string          # the specific basis for that status, cited, not asserted
  items: [{id, text}] | null    # a multi-item instrument's individually addressable
                                # statements (e.g. PHQ-9's 9 items). null for everything
                                # except multi-item instruments — see below
  response_scale: {instruction, options: [{label, score}]} | null   # the shared response
                                # scale across all items. null unless items is set
  scoring: {method, bands: [{min, max, label}], clinical_note} | null   # how to sum and
                                # interpret an instrument's score. null unless items is set
  notes: string                # gaps, caveats, "no preferred standard exists" etc.
```

### `applies_to` — population tags

- `adults` — source confirms direct applicability to adults
- `children-young-people` — source confirms applicability to children/young people
  (directly or via a documented mechanism, e.g. proxy response)

An entry can list both, one, or neither. **An empty list is a meaningful gap, not an
oversight** — it means the source doesn't state either way. 

### `use_case` — design-context tags

- `demographic-survey` — population-level self-report category (census/survey style)
- `clinical-record` — patient/service-user-level clinical or administrative dataset
- `no-standard-gap` — flags that no usable standard currently exists for this scenario
- `screening-instrument` — a validated clinical screening/outcome tool (eg. PHQ-9)
- `support-needs-identification` — self-declared or flagged accessibility, communication,
  vulnerability, or digital-inclusion support needs (eg. the Washington Group functioning
  questions, the GOV.UK Vulnerability Risk Factors taxonomy)
- `official-classification` — a statistical/administrative classification used for
  targeting, eligibility, or reporting rather than asked as a survey question (eg. SOC,
  the Indices of Multiple Deprivation)

### `source_type` — who publishes it, and how authoritative is it

- `harmonised-standard` — a GSS/ONS harmonised standard, agreed across government surveys
- `clinical-dataset` — an NHS data standard or coded dataset
- `survey-instrument` — a named, validated clinical screening/outcome tool
- `official-classification` — an ONS/DfE statistical or administrative classification
  that isn't a GSS harmonised standard (eg. SOC, SIC, the Indices of Multiple Deprivation,
  Rural Urban Classification, Output Area Classification, geography codes, school type)
- `cross-government-taxonomy` — an actively-governed, multi-department taxonomy
  (eg. the GOV.UK Taxonomy of Vulnerability Risk Factors)
- `regulatory-framework` — a regulator's own published framework or guidance
  (eg. the FCA's FG21/1 vulnerability drivers)
- `sector-eligibility-framework` — an industry-run eligibility scheme with defined
  categories (eg. the energy/water Priority Services Register)
- `international-standard` — an internationally maintained instrument used in UK contexts
  (eg. the Washington Group Short Set on Functioning)

### `licence_status` — can this content actually be reproduced?

Most of this repo is UK government/NHS content published under the OGL and safe to reproduce
with attribution, but not all of it — several `access-and-support-needs` entries come from
non-government bodies (the Washington Group, the FCA) whose own terms turned out, on direct
verification, to restrict reproduction despite being commonly assumed reusable. Users should be
able to ask 'what am I actually allowed to put in front of a user' as one consistent query across
the whole dataset:

- `ogl` — UK Open Government Licence / Crown copyright government or NHS content
- `public-domain` — explicitly released without copyright restriction by a non-government
  rights holder (e.g. PHQ-9/GAD-7, released by Pfizer with "no permission required")
- `restricted` — copyrighted with real reproduction restrictions (a paid licence, a
  no-digital-reproduction clause, or an unclear "free but check permissions" status) — such
  entries are added as reference-only (name + link), with `question`/`values`/`items`/
  `response_scale`/`scoring` all left `null` — never reproduced content (`scripts/validate.py`
  enforces this).

`licence_notes` must cite the *specific* basis for the status (quote the source's own
permission language), not just assert it — same discipline as `applies_to`.

### `items` / `response_scale` / `scoring` — multi-item instruments

Every entry assumes one question with a list of response options. 
For scales like PHQ-9 `question` and `values` are both `null`, and the real content lives here instead:

- `items` — the individual statements, each with a stable per-item `id` (eg.
  `phq-9-item-1`) so they can be addressed independently, not just as part of the whole
  instrument
- `response_scale` — the shared instruction text and response options (each option carries
  its numeric `score`, since that's what makes scoring possible at all)
- `scoring` — the summing `method`, severity `bands` (each a `min`/`max`/`label`), and an
  optional `clinical_note` for anything a band alone doesn't capture (eg. PHQ-9 item 9's
  self-harm follow-up requirement, which applies regardless of total score)

These three fields are either all present together or all `null` — an entry doesn't have
some but not others (`scripts/validate.py` enforces this).

## Domains

Grouped below by category (the grouping used for navigation in the site — see
[Structure](#structure)).

**Demographics & population characteristics**

- **Demographics** (`data/demographics.yaml`, 28 entries) — ethnicity, disability (Equality Act
  2010), sex, gender identity, sexual orientation, religion, national identity, tenure, language,
  economic activity status, NS-SEC (socio-economic classification), qualifications, income,
  marital and civil partnership status, household relationships, unpaid care, general health,
  personal wellbeing (ONS4), pregnancy and maternity, migration/country of birth/citizenship,
  armed forces veteran status, socio-economic background, internet access, loneliness, social
  capital, Welsh language skills, cohabitation, and crime/fear of crime. Several of these are
  recorded as confirmed gaps (sex, language, income, pregnancy and maternity — no GSS-wide
  standard currently exists), gender identity is archived with nothing yet superseding it, and
  several more are `under-review` with explicit caveats from their own source (unpaid care,
  armed forces veteran status, internet access, loneliness, social capital) — check `status`
  before relying on any entry. Economic activity status, NS-SEC, qualifications, and
  socio-economic background are each derived from a battery of questions rather than one, so
  `question` is left `null` and `values` holds the official output classification instead;
  personal wellbeing (ONS4) is a 4-item instrument (`items`/`response_scale`/`scoring`, like
  PHQ-9); migration/citizenship, social capital, and crime/fear of crime are composite
  concept-groups with no single fixed question — see each entry's `notes` for the full input
  question set or battery.

**Health & clinical**

- **Mental health** (`data/mental-health.yaml`, 4 entries) — Covers ONS GSS Harmonisation
  standards (long-lasting health conditions, impairment, mental health) and the NHS Mental Health
  Services Data Set (MHSDS).
- **Screening tools** (`data/screening-tools.yaml`, 7 entries) — validated clinical screening
  instruments commonly embedded in referral/intake forms: PHQ-9 (depression) and GAD-7 (anxiety),
  both confirmed public domain, added in full with items/scoring/severity bands. SDQ, ORS, SRS,
  WEMWBS, and RCADS are also included, but each carries real copyright/licensing restrictions (a
  paid licence, a no-digital-reproduction clause, or an unclear "free but check permissions"
  status), so they're `licence_status: restricted` reference-only entries — name, source, and
  link, with no reproduced content.

**Referral & safeguarding**

- **Referral & safeguarding identifiers** (`data/referral-identifiers.yaml`, 5 entries) — NHS
  administrative/safeguarding data standards needed on a referral form rather than survey
  questions: NHS Number, GP practice registration, two safeguarding data elements, and a recorded
  gap for consent (no single official coded consent standard exists — only per-dataset indicators).

**Access & support needs**

- **Access & support needs** (`data/access-and-support-needs.yaml`, 9 entries) — standards for
  identifying accessibility, communication, and vulnerability/support needs when a person is
  trying to access a service, distinct from the disability-status question (demographics) and
  impairment-type question (mental health) already tracked elsewhere. Started as an NHS-only
  domain (the Accessible Information Standard DAPB1605, the Reasonable Adjustment Digital Flag
  DAPB4019, and that flag's ~94 granular answer codes — all coded flags with `question: null`)
  and has been broadened with: the Washington Group Short Set on Functioning (`restricted`
  reference-only — its own terms require prior written consent, despite being commonly assumed
  freely reusable); the GOV.UK Taxonomy of Vulnerability Risk Factors (`ogl`, 11 top-level
  categories, still alpha-stage per its own source); the FCA's vulnerability drivers, FG21/1
  (`restricted` reference-only — FCA copyright, reproduction limited to personal/individual-firm
  use); the energy and water sectors' Priority Services Register eligibility criteria, added as
  two entries since Ofgem's and Ofwat's published category lists meaningfully differ; and the
  Essential Digital Skills framework (published by DfE, not DCMS as sometimes assumed). UKAAF's
  accessible-format standards were researched but deliberately left out: licensing is unconfirmed
  and no `source_type` in this schema fits a charity-run technical format standard well, so it's
  a documented gap rather than a forced-in entry — see Roadmap.

**Geography & official classifications**

- **Official classifications** (`data/official-classifications.yaml`, 11 entries) — ONS/DfE
  statistical and administrative classifications used constantly in eligibility logic, targeting,
  and reporting but which aren't GSS harmonised standards: SOC 2020, SIC 2007 (with a flagged
  currency note — UK SIC 2026 has been published but isn't yet the operational classification),
  the Indices of (Multiple) Deprivation for each UK nation (England IoD2025, Scotland SIMD2020,
  Wales WIMD2025, Northern Ireland NIMDM2017 — each with its own methodology and date, so kept as
  separate entries), the Rural Urban Classification (2021), the Output Area Classification
  (2021/2), the ONS geography/GSS coding hierarchy, DfE's school-type classification, and ONS's
  local authority type classification. None of these publish a single fixed question — they're
  derived/administrative classifications — so they surface on the by-standard view only, not the
  by-question view.

## Update cadence

v1: manually reviewed against source publications on an bi-monthly basis, logged in `CHANGELOG.md`. No automation yet — see [Roadmap](#roadmap).

## Sources & licensing

Government content referenced here is published under the [Open Government Licence](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). `screening-tools` and parts of `access-and-support-needs` are the exceptions — third-party, non-government content, not OGL. In `screening-tools`, PHQ-9 and GAD-7 are confirmed public domain and reproduced in full; SDQ, ORS, SRS, WEMWBS, and RCADS carry real reproduction restrictions and are `restricted`/reference-only. In `access-and-support-needs`, the Washington Group Short Set on Functioning and the FCA's vulnerability drivers (FG21/1) were both checked directly against their own terms and turned out to be `restricted`/reference-only too, despite being commonly assumed freely reusable — see each entry's `licence_status`/`licence_notes` for the specific permission language found (or not found). UKAAF's accessible-format standards were researched but left out entirely: their licensing is unconfirmed and no `source_type` in this schema fits a charity-run technical format standard well, so it was left as a documented gap rather than forced in. Each entry links back to its primary source — always verify against that source before use in a live service. This repo's own structure, schema, and code are [MIT licensed](LICENSE).

## Roadmap

- [x] Additional domains (disability, ethnicity, long-term health conditions) — added as the
  `demographics` domain
- [x] Lightweight lookup/search interface — two static pages at the GitHub Pages links above
  (by standard, by question), both filterable by status, population (`applies_to`), and use case
- [x] Clinical screening/outcome tools — PHQ-9 and GAD-7 added as the `screening-tools`
  domain (both confirmed public domain, with full items/scoring/severity bands, not just a
  citation link). SDQ, ORS, SRS, WEMWBS, and RCADS were also researched: each carries real
  copyright/licensing restrictions (a paid licence, a no-digital-reproduction clause, or an
  unclear "free but check permissions" status), individually cited in each entry's
  `licence_notes` — so they're added as `licence_status: restricted` reference-only entries
  (name, source, and link, no reproduced content)
- [x] Access needs / reasonable adjustments domain — added as `access-needs.yaml`: the NHS
  Accessible Information Standard (DAPB1605), the Reasonable Adjustment Digital Flag (DAPB4019),
  and that flag's granular communication/access-need answer codes
- [x] Broadened access-needs into `access-and-support-needs.yaml`: added the Washington Group
  Short Set on Functioning, the GOV.UK Taxonomy of Vulnerability Risk Factors, FCA vulnerability
  drivers (FG21/1), Priority Services Register eligibility categories (Ofgem and Ofwat), and the
  Essential Digital Skills framework. UKAAF accessible-format standards researched but left out —
  see [Domains](#domains)
- [x] Filled known gaps in `demographics.yaml` against the current GSS harmonised-standards list:
  general health, personal wellbeing (ONS4), pregnancy and maternity (a confirmed gap), migration/
  country of birth/citizenship, armed forces veteran status, socio-economic background, internet
  access, loneliness, social capital, Welsh language skills, cohabitation, crime and fear of crime
- [x] New `official-classifications.yaml` domain: SOC 2020, SIC 2007, the Indices of Multiple
  Deprivation (per nation), Rural Urban Classification, Output Area Classification, ONS geography
  codes, school type, and local authority type
- [ ] UKAAF accessible-format standards — licensing needs a definitive answer, and this schema's
  `source_type` enum has no clean fit for a charity-run technical format standard yet
- [ ] Automated change-detection against source publication pages
- [ ] Structured diffing between standard revisions

## Contributing

Corrections and additions welcome. Please cite the primary source for any new or amended entry.
