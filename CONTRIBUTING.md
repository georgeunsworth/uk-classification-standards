# Contributing

Corrections and additions are welcome, especially from people who've hit the same
problem in service or system design work.

## Adding or amending an entry

1. Edit the relevant file in `data/` (or create a new domain file if none fits).
2. Follow the schema in the [README](README.md#structure) — every field is required,
   `source_type` and `status` must use one of the allowed values.
3. Always cite a primary source in `source_url`. Secondary summaries (news articles,
   blog posts) aren't sufficient — link directly to the publishing body's page.
4. For `applies_to`, only add a population tag if the source itself confirms
   applicability — quote or closely paraphrase the source's own language in `notes`.
   If the source is silent on a population, leave `applies_to` empty rather than
   guessing; an empty list is a legitimate, useful signal, not a placeholder to fill in.
5. If a standard is out of date, superseded, or silent on something (as with the
   archived ONS mental health harmonisation review), say so plainly in `notes` rather
   than omitting the entry. Gaps in official guidance are exactly what this tracker
   should surface — use the `no-standard-gap` use-case tag for entries like this.
6. Run the validator locally before opening a PR:
   ```
   pip install pyyaml
   python3 scripts/validate.py
   ```
7. Add a line to `CHANGELOG.md` under `## Unreleased` describing what changed and why.

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
