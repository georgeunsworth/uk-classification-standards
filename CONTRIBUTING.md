# Contributing

Corrections and additions are welcome, especially from people who've hit the same
problem in service or system design work.

## Adding or amending an entry

1. Edit the relevant file in `data/` (or create a new domain file if none fits).
2. Follow the schema in the [README](README.md#structure) — every field is required,
   `source_type` and `status` must use one of the allowed values.
3. Always cite a primary source in `source_url`. Secondary summaries (news articles,
   blog posts) aren't sufficient — link directly to the publishing body's page.
4. If a standard is out of date, superseded, or silent on something (as with the
   archived ONS mental health harmonisation review), say so plainly in `notes` rather
   than omitting the entry. Gaps in official guidance are exactly what this tracker
   should surface.
5. Run the validator locally before opening a PR:
   ```
   pip install pyyaml
   python3 scripts/validate.py
   ```
6. Add a line to `CHANGELOG.md` under `## Unreleased` describing what changed and why.

## Adding a new domain

Open an issue first to discuss scope — domains should map to a genuine, recurring
pain point in service design (like mental health classifications), not just any
UK data taxonomy that exists.

## What won't be merged

- Entries without a working `source_url`
- New classifications invented for this repo (this tracks what's official, it
  doesn't propose alternatives)
- Anything that duplicates ONS/CDDO's Taxonomy Oversight Group's role — this repo
  is a practitioner-facing mirror of official standards, not a governance body
