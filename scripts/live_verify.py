#!/usr/bin/env python3
"""Monthly deep check: fetch each entry's source_url and ask an LLM whether the
live page still looks consistent with what this repo has recorded.

This is deliberately conservative. CONTRIBUTING.md records a real incident where an
unverified "being superseded" claim didn't hold up once someone checked the live
page directly — so this script never asserts that a standard has changed. It only
ever produces `possible_drift`, meaning "a human should re-check this," never a
final verdict. Nothing in data/*.yaml is touched here; the only output is an
append to data/audit-log.json.

Requires: pyyaml, requests, beautifulsoup4, pypdf, anthropic
Requires env var: ANTHROPIC_API_KEY
"""
import datetime
import glob
import io
import json
import os
import sys
import time

import requests
import yaml
from bs4 import BeautifulSoup
from pypdf import PdfReader
from anthropic import Anthropic

MODEL = os.environ.get("LIVE_VERIFY_MODEL", "claude-haiku-4-5-20251001")
AUDIT_LOG_PATH = "data/audit-log.json"
REQUEST_TIMEOUT = 20
FETCH_DELAY_SECONDS = 1
MAX_PAGE_CHARS = 6000
USER_AGENT = (
    "Mozilla/5.0 (compatible; uk-classification-standards-audit/1.0; "
    "+https://github.com/georgeunsworth/uk-classification-standards)"
)

VERDICT_TOOL = {
    "name": "record_verdict",
    "description": "Record the currency-check verdict for one classification standard entry.",
    "input_schema": {
        "type": "object",
        "properties": {
            "verdict": {
                "type": "string",
                "enum": ["unchanged", "possible_drift", "fetch_failed"],
                "description": (
                    "'unchanged' if the live page still supports the recorded status/"
                    "source_published/summary. 'possible_drift' if something on the "
                    "live page looks inconsistent with what's recorded and a human "
                    "should re-check it directly — never assert the standard has "
                    "actually changed, only that it's worth a human look. "
                    "'fetch_failed' if the page text provided isn't usable."
                ),
            },
            "reasoning": {
                "type": "string",
                "description": "One or two sentences a human can act on. Cite what you saw, don't conclude.",
            },
        },
        "required": ["verdict", "reasoning"],
    },
}


def load_entries():
    entries = []
    for path in sorted(glob.glob("data/*.yaml")):
        with open(path) as f:
            for entry in yaml.safe_load(f) or []:
                entry["_file"] = path
                entries.append(entry)
    return entries


def is_pdf(url, resp):
    return "pdf" in resp.headers.get("Content-Type", "").lower() or url.lower().endswith(".pdf")


def extract_pdf_text(content):
    reader = PdfReader(io.BytesIO(content))
    parts = []
    total_chars = 0
    for page in reader.pages:
        text = page.extract_text() or ""
        parts.append(text)
        total_chars += len(text)
        if total_chars >= MAX_PAGE_CHARS:
            break
    return " ".join(parts)


def fetch_page_text(url):
    resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()
    if is_pdf(url, resp):
        text = " ".join(extract_pdf_text(resp.content).split())
    else:
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style", "nav", "footer"]):
            tag.decompose()
        text = " ".join(soup.get_text(separator=" ").split())
    return text[:MAX_PAGE_CHARS], resp.status_code


def entry_summary(entry):
    return {
        "label": entry.get("label"),
        "source": entry.get("source"),
        "status": entry.get("status"),
        "source_published": str(entry.get("source_published")),
        "last_reviewed": str(entry.get("last_reviewed")),
        "notes": entry.get("notes"),
        "values_or_items_summary": entry.get("values") or [i.get("text") for i in (entry.get("items") or [])],
    }


def verify_entry(client, entry):
    entry_id = entry.get("id", "<missing id>")
    source_url = entry.get("source_url", "")

    try:
        page_text, http_status = fetch_page_text(source_url)
    except requests.RequestException as exc:
        return {
            "entry_id": entry_id,
            "file": entry["_file"],
            "source_url": source_url,
            "verdict": "fetch_failed",
            "reasoning": f"Could not fetch source_url: {exc}",
            "http_status": None,
        }
    except Exception as exc:
        # Malformed/encrypted PDFs and other unexpected parsing failures shouldn't
        # abort the whole run — flag this one entry and move on.
        return {
            "entry_id": entry_id,
            "file": entry["_file"],
            "source_url": source_url,
            "verdict": "fetch_failed",
            "reasoning": f"Could not extract readable text from source_url: {exc}",
            "http_status": None,
        }

    if not page_text.strip():
        return {
            "entry_id": entry_id,
            "file": entry["_file"],
            "source_url": source_url,
            "verdict": "fetch_failed",
            "reasoning": "Fetched the page but extracted no readable text.",
            "http_status": http_status,
        }

    prompt = (
        "Here is what this repo has recorded for one UK classification standard, "
        "followed by the visible text of its live source page. Decide whether the "
        "live page still looks consistent with what's recorded, or whether "
        "something looks different enough that a human should re-check it "
        "directly. Do not assert the standard has changed — only flag it for "
        "review if warranted.\n\n"
        f"Recorded:\n{json.dumps(entry_summary(entry), indent=2)}\n\n"
        f"Live page text (truncated):\n{page_text}"
    )

    message = client.messages.create(
        model=MODEL,
        max_tokens=500,
        tools=[VERDICT_TOOL],
        tool_choice={"type": "tool", "name": "record_verdict"},
        messages=[{"role": "user", "content": prompt}],
    )

    tool_use = next(b for b in message.content if b.type == "tool_use")
    return {
        "entry_id": entry_id,
        "file": entry["_file"],
        "source_url": source_url,
        "verdict": tool_use.input["verdict"],
        "reasoning": tool_use.input["reasoning"],
        "http_status": http_status,
    }


def append_run(results):
    run = {
        "run_date": datetime.date.today().isoformat(),
        "results": results,
    }
    if os.path.exists(AUDIT_LOG_PATH):
        with open(AUDIT_LOG_PATH) as f:
            log = json.load(f)
    else:
        log = []
    log.append(run)
    with open(AUDIT_LOG_PATH, "w") as f:
        json.dump(log, f, indent=2)
        f.write("\n")


def main():
    entries = load_entries()
    client = Anthropic()

    results = []
    for i, entry in enumerate(entries):
        result = verify_entry(client, entry)
        results.append(result)
        print(f"[{i + 1}/{len(entries)}] {result['entry_id']}: {result['verdict']}")
        time.sleep(FETCH_DELAY_SECONDS)

    append_run(results)

    flagged = [r for r in results if r["verdict"] != "unchanged"]
    print(f"\n{len(results)} entries checked, {len(flagged)} flagged "
          f"(possible_drift or fetch_failed). See {AUDIT_LOG_PATH}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
