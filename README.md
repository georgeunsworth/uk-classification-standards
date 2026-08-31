# UK Classification Standards Tracker

*A maintained, versioned reference of current UK official classification standards used in service design — starting with mental health.*

> Working title — rename freely before you publish.

Maintained by George Unsworth ([@georgeunsworth](https://github.com/georgeunsworth)) at [Mortar Works](https://mortar.works).

**Browse it:** https://georgeunsworth.github.io/uk-classification-standards/ (by standard) or
https://georgeunsworth.github.io/uk-classification-standards/questions.html (by question, grouped
by domain — administrative identifiers and coded flags without a survey question live only on the
by-standard view)


## The problem

When you're designing an intake form, a data model, or a reporting field for a UK public-facing service, you need to know: **what's the current official category set for this field, and where did it come from?**

That answer is scattered across ONS harmonisation guidance, NHS data dictionaries, and legacy survey instruments — some of it contradictory, some of it explicitly marked as under review with no replacement yet published. There's no single place that tells you, as of today, which classification to use and whether it's stale.

This repo is that place. It doesn't invent new classifications — it tracks the official ones, flags their currency, and notes known gaps.

Service and system designers working to actually deliver services — not just those producing statistics — are the people who feel this gap most directly. When a referral pathway, an intake form, or a directory schema has to reconcile categories across multiple organisations, the absence of a single current answer becomes a live delivery problem, not just a data quality footnote.

**A design note on structure:** the schema is deliberately built to be *consumed*, not just browsed — every field a form-builder would need (the exact question, the response options, licensing/reproduction rights, population confirmed) is structured data, not prose buried in a paragraph. The two static pages here are one consumer of that data; the intent is that another project could read the same YAML directly to assemble a real form, citing provenance for every field it uses.

## What this is

- A structured, versioned dataset of UK official classification standards, organised by domain
- A changelog tracking when source standards are reviewed, revised, or archived
- A place to record known gaps or ambiguities in the official guidance itself (e.g. "no preferred standard currently exists for X")

## What this isn't

- Not an official government product, and not affiliated with ONS, NHS, or GDS
- Not a replacement for checking the primary source before using a classification in a live service — always link back to source
- Not a UI/accessibility pattern library (see the [GOV.UK Design System](https://design-system.service.gov.uk/) for that)
- Not attempting new classification design — this only tracks what already exists officially

## Structure

```
data/
  mental-health.yaml          # v1 domain
  demographics.yaml            # GSS harmonised demographic standards
  referral-identifiers.yaml     # NHS/safeguarding referral-data standards
  screening-tools.yaml           # validated clinical screening instruments (not OGL — see below)
  access-needs.yaml               # NHS access/communication-need and reasonable-adjustment flags
index.html / questions.html     # the two views, sharing app.js + style.css
CHANGELOG.md                     # dated log of source revisions we've caught
```

Each domain file is a list of entries with this shape:

```yaml
- id: string                # stable slug for this entry
  label: string              # the category/field name as published
  source: string              # publishing body + standard name
  source_type: enum           # harmonised-standard | clinical-dataset | survey-instrument
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
oversight** — it means the source doesn't state either way, which is exactly the kind
of ambiguity this tracker exists to surface rather than paper over. Don't infer or
guess applicability to fill this in; cite what the source itself says (quote it in
`notes` if it clarifies the tag), and leave it empty if the source is silent.

### `use_case` — design-context tags

- `demographic-survey` — population-level self-report category (census/survey style)
- `clinical-record` — patient/service-user-level clinical or administrative dataset
- `no-standard-gap` — flags that no usable standard currently exists for this scenario
  (used instead of inventing one — see the archived mental health harmonisation entry)
- `screening-instrument` — a validated clinical screening/outcome tool (e.g. PHQ-9)

### `licence_status` — can this content actually be reproduced?

Everything in this repo up to the `screening-tools` domain has been UK government/NHS
content published under the OGL — safe to reproduce with attribution, which is why every
entry (regardless of domain) carries this field rather than just the two OGL-sourced ones
having it as an afterthought. A future consumer (a form-builder, say) should be able to ask
"what am I actually allowed to put in front of a user" as one consistent query across the
whole dataset:

- `ogl` — UK Open Government Licence / Crown copyright government or NHS content
- `public-domain` — explicitly released without copyright restriction by a non-government
  rights holder (e.g. PHQ-9/GAD-7, released by Pfizer with "no permission required")
- `restricted` — copyrighted with real reproduction restrictions (a paid licence, a
  no-digital-reproduction clause, or an unclear "free but check permissions" status) — such
  entries would only ever be added as reference-only (name + link, no reproduced content),
  never with `items`/`values` populated

`licence_notes` must cite the *specific* basis for the status (quote the source's own
permission language), not just assert it — same discipline as `applies_to`.

### `items` / `response_scale` / `scoring` — multi-item instruments

Every entry so far has assumed one question with a list of response options. That doesn't
fit a scale like PHQ-9, which is 9 separate statements all rated on one shared scale, summed
into a score with clinical severity bands. For those entries, `question` and `values` are
both `null`, and the real content lives here instead:

- `items` — the individual statements, each with a stable per-item `id` (e.g.
  `phq-9-item-1`) so they can be addressed independently, not just as part of the whole
  instrument
- `response_scale` — the shared instruction text and response options (each option carries
  its numeric `score`, since that's what makes scoring possible at all)
- `scoring` — the summing `method`, severity `bands` (each a `min`/`max`/`label`), and an
  optional `clinical_note` for anything a band alone doesn't capture (e.g. PHQ-9 item 9's
  self-harm follow-up requirement, which applies regardless of total score)

These three fields are either all present together or all `null` — an entry doesn't have
some but not others (`scripts/validate.py` enforces this).

## Domains

- **Mental health** (`data/mental-health.yaml`) — the first domain, chosen deliberately because
  it's the messiest: the ONS mental-health-specific harmonisation review was archived without a
  preferred standard being adopted, which is exactly the kind of thing a static gov PDF won't
  surface but this tracker should. Covers ONS GSS Harmonisation standards (long-lasting health
  conditions, impairment, mental health) and the NHS Mental Health Services Data Set (MHSDS).
- **Demographics** (`data/demographics.yaml`) — the sibling GSS Harmonised Standards commonly
  asked on referral/intake forms: ethnicity, disability (Equality Act 2010), sex, gender identity,
  sexual orientation, religion, national identity, tenure, and language. Two of these (sex,
  language) are recorded as confirmed gaps — no GSS-wide standard currently exists — and gender
  identity is archived with nothing yet superseding it, so check `status` before relying on any of
  the three.
- **Referral & safeguarding identifiers** (`data/referral-identifiers.yaml`) — NHS
  administrative/safeguarding data standards needed on a referral form rather than survey
  questions: NHS Number, GP practice registration, two safeguarding data elements, and a recorded
  gap for consent (no single official coded consent standard exists — only per-dataset indicators).
- **Screening tools** (`data/screening-tools.yaml`) — validated clinical screening instruments
  commonly embedded in referral/intake forms: PHQ-9 (depression) and GAD-7 (anxiety), both
  confirmed public domain, added in full with items/scoring/severity bands. The only non-OGL
  domain in this repo — see `licence_status` above. SDQ, ORS, SRS, WEMWBS, and RCADS are also
  included, but each carries real copyright/licensing restrictions (a paid licence, a
  no-digital-reproduction clause, or an unclear "free but check permissions" status), so
  they're `licence_status: restricted` reference-only entries — name, source, and link, with
  no reproduced content; see Roadmap.
- **Access needs** (`data/access-needs.yaml`, 3 entries) — NHS standards for identifying, coding,
  and sharing a person's information/communication support needs and reasonable adjustments,
  distinct from the disability-status question (demographics) and impairment-type question (mental
  health) already tracked elsewhere: the Accessible Information Standard (DAPB1605), the Reasonable
  Adjustment Digital Flag (DAPB4019) at category level, and that flag's ~94 granular, form-ready
  answer codes (BSL interpreter, Easyread, contact by email, etc.) for the "if so, what" half of an
  access-needs question. None publishes one fixed survey question — all are coded flags — so
  `question` is `null` throughout; population scope (`applies_to`) is left empty on all three
  because no source explicitly confirms whether it covers children as well as adults.

## Update cadence

v1: manually reviewed against source publications on an ad hoc basis, logged in `CHANGELOG.md`. No automation yet — see [Roadmap](#roadmap).

## Sources & licensing

Government content referenced here is published under the [Open Government Licence](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). The `screening-tools` domain is the one exception — third-party clinical content, not OGL. Two entries (PHQ-9, GAD-7) are confirmed public domain and reproduced in full; the rest (SDQ, ORS, SRS, WEMWBS, RCADS) carry real reproduction restrictions and are `restricted`/reference-only (see each entry's `licence_status`/`licence_notes`). Each entry links back to its primary source — always verify against that source before use in a live service. This repo's own structure, schema, and code are [MIT licensed](LICENSE).

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
- [ ] Automated change-detection against source publication pages
- [ ] Structured diffing between standard revisions

## Contributing

Corrections and additions welcome, especially from anyone who's hit this same problem in service design work. Please cite the primary source for any new or amended entry.
