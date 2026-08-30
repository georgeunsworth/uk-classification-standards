# UK Classification Standards Tracker

*A maintained, versioned reference of current UK official classification standards used in service design — starting with mental health.*

> Working title — rename freely before you publish.

Maintained by George Unsworth ([@georgeunsworth](https://github.com/georgeunsworth)) at [Mortar Works](https://mortar.works).


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
  mental-health.yaml    # v1 domain
CHANGELOG.md             # dated log of source revisions we've caught
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
  notes: string                # gaps, caveats, "no preferred standard exists" etc.
```

## v1 scope: mental health

The first domain covers UK classification standards relevant to mental health as used in service design and reporting:

- ONS GSS Harmonisation standards (long-lasting health conditions, impairment, mental health)
- NHS Mental Health Services Data Set (MHSDS) coded value sets

This domain was chosen deliberately because it's the messiest — the ONS mental-health-specific harmonisation review was archived without a preferred standard being adopted, which is exactly the kind of thing a static gov PDF won't surface but this tracker should.

## Update cadence

v1: manually reviewed against source publications on an ad hoc basis, logged in `CHANGELOG.md`. No automation yet — see [Roadmap](#roadmap).

## Sources & licensing

Government content referenced here is published under the [Open Government Licence](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). Each entry links back to its primary source — always verify against that source before use in a live service. This repo's own structure, schema, and code are [MIT licensed](LICENSE).

## Roadmap

- [ ] Additional domains (disability, ethnicity, long-term health conditions)
- [ ] Lightweight lookup/search interface
- [ ] Automated change-detection against source publication pages
- [ ] Structured diffing between standard revisions

## Contributing

Corrections and additions welcome, especially from anyone who's hit this same problem in service design work. Please cite the primary source for any new or amended entry.
