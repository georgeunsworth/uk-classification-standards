# Contributing

Corrections and additions are welcome, especially from people who've hit the same
problem in service or system design work.

## Adding or amending an entry

1. Edit the relevant file in `data/` (or create a new domain file if none fits).
2. Follow the schema in the [README](README.md#structure) — every field is required,
   `source_type` and `status` must use one of the allowed values.
3. Always cite a primary source in `source_url`. Secondary summaries (news articles,
   blog posts) aren't sufficient — link directly to the publishing body's page. This
   includes research done for you (by an AI agent, a colleague, or your own notes from
   memory) — re-check the specific claim against the live page yourself before writing
   it into an entry. One "being superseded" claim in this repo's own history came from
   initial research and didn't hold up when the live page was checked directly.
4. For `applies_to`, only add a population tag if the source itself confirms
   applicability — quote or closely paraphrase the source's own language in `notes`.
   If the source is silent on a population, leave `applies_to` empty rather than
   guessing; an empty list is a legitimate, useful signal, not a placeholder to fill in.
5. For `values`, quote the source's response options verbatim, and only include options
   meant to actually appear on a form — if the source marks some as "spontaneous only"
   (recorded if volunteered, not offered as a choice), leave those out of `values` and
   explain the distinction in `notes` instead, so nobody copies a spontaneous-only option
   straight into a live form. If the source doesn't publish a compact list at all (e.g. a
   clinical dataset that points to a separate code list document), set `values` to `null`
   and say in `notes` where the real one lives — don't invent or partially reconstruct one.
6. If a standard is out of date, superseded, or silent on something (as with the
   archived ONS mental health harmonisation review), say so plainly in `notes` rather
   than omitting the entry. Gaps in official guidance are exactly what this tracker
   should surface — use the `no-standard-gap` use-case tag for entries like this.
7. Every entry needs `licence_status` and `licence_notes`, not just non-OGL ones. For
   OGL/government content this is mechanical; for anything else, find and quote the
   rights holder's own permission statement before setting `licence_status` to
   `public-domain` — don't infer it from the fact that a tool is "commonly used" or
   "free to download" (a free download can still be copyrighted with real restrictions
   on reproduction). If you can't confirm free reproduction, use `restricted` and add
   the entry as reference-only (name + `source_url` link) with `items`/`values` left
   `null`, rather than reproducing content you're not sure you're allowed to.
8. If an entry is a multi-item instrument (several statements sharing one response
   scale, like PHQ-9) rather than a single question, use `items`/`response_scale`/
   `scoring` instead of `question`/`values` (both of which stay `null`) — see the
   README's schema section. Verify the scoring bands against the same primary source as
   the items themselves; don't assume a commonly-cited cutoff is correct without
   checking it against the original validation paper or an official scoring guide.
9. Run the validator locally before opening a PR:
   ```
   pip install pyyaml
   python3 scripts/validate.py
   ```
10. Add a line to `CHANGELOG.md` under `## Unreleased` describing what changed and why.

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
- Reproduced content (`items`/`values`) for anything without a confirmed, cited
  `public-domain` or `ogl` licence — if reproduction rights aren't confirmed, it goes
  in as `restricted` and reference-only (name + link), not as an assumption
