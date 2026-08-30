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

## Update cadence

v1: manually reviewed against source publications on an ad hoc basis, logged in `CHANGELOG.md`. No automation yet — see [Roadmap](#roadmap).

## Sources & licensing

Government content referenced here is published under the [Open Government Licence](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). Each entry links back to its primary source — always verify against that source before use in a live service. This repo's own structure, schema, and code are [MIT licensed](LICENSE).

## Roadmap

- [x] Additional domains (disability, ethnicity, long-term health conditions) — added as the
  `demographics` domain
- [x] Lightweight lookup/search interface — two static pages at the GitHub Pages links above
  (by standard, by question), both filterable by status, population (`applies_to`), and use case
- [ ] Clinical screening/outcome tools (PHQ-9, GAD-7, SDQ, ORS/SRS, WEMWBS, RCADS) commonly
  embedded in referral forms — deliberately deferred: only PHQ-9 and GAD-7 are confirmed freely
  reproducible (public domain since 2010); the others carry real copyright/licensing restrictions
  (paid licences, no-digital-reproduction clauses, or "free but check permissions" caveats) that
  need more careful, individual handling before anything is added
- [ ] Automated change-detection against source publication pages
- [ ] Structured diffing between standard revisions

## Contributing

Corrections and additions welcome, especially from anyone who's hit this same problem in service design work. Please cite the primary source for any new or amended entry.
