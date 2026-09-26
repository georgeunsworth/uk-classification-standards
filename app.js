// Shared data-loading, filtering, and rendering logic for index.html and questions.html.
// Requires js-yaml to be loaded first (window.jsyaml).

const DOMAIN_FILES = [
  { file: "data/demographics.yaml", domain: "demographics", label: "Demographics", category: "Demographics & population characteristics" },
  { file: "data/mental-health.yaml", domain: "mental-health", label: "Mental health", category: "Health & clinical" },
  { file: "data/screening-tools.yaml", domain: "screening-tools", label: "Screening tools", category: "Health & clinical" },
  { file: "data/referral-identifiers.yaml", domain: "referral-identifiers", label: "Referral & safeguarding identifiers", category: "Referral & safeguarding" },
  { file: "data/access-and-support-needs.yaml", domain: "access-and-support-needs", label: "Access & support needs", category: "Access & support needs" },
  { file: "data/official-classifications.yaml", domain: "official-classifications", label: "Official classifications", category: "Geography & official classifications" },
];

// Ordered list of categories, derived from DOMAIN_FILES so the UI and the data can't drift apart.
const CATEGORIES = [...new Set(DOMAIN_FILES.map((d) => d.category))];

const STATUS_LABELS = {
  current: "Current",
  "under-review": "Under review",
  archived: "Archived",
  superseded: "Superseded",
};

const POPULATION_LABELS = {
  adults: "Adults",
  "children-young-people": "Children & young people",
};

const USE_CASE_LABELS = {
  "demographic-survey": "Demographic survey",
  "clinical-record": "Clinical record",
  "no-standard-gap": "No standard exists — gap",
  "screening-instrument": "Screening instrument",
  "support-needs-identification": "Support needs identification",
  "official-classification": "Official classification",
};

const LICENCE_LABELS = {
  ogl: "OGL",
  "public-domain": "Public domain",
  restricted: "Restricted — reference only",
};

const SOURCE_TYPE_LABELS = {
  "harmonised-standard": "Harmonised standard",
  "clinical-dataset": "Clinical dataset",
  "survey-instrument": "Survey instrument",
  "official-classification": "Official classification",
  "cross-government-taxonomy": "Cross-government taxonomy",
  "regulatory-framework": "Regulatory framework",
  "sector-eligibility-framework": "Sector eligibility framework",
  "international-standard": "International standard",
};

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// The copyable content for an entry: its response `values`, or (for a multi-item
// instrument) its item statements. Null if there's nothing copyable.
function copyableText(entry) {
  if (entry.values && entry.values.length) return entry.values.join("\n");
  if (entry.items && entry.items.length) return entry.items.map((i) => i.text).join("\n");
  return null;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// js-yaml turns unquoted YYYY-MM-DD values into Date objects (at UTC midnight), so read the
// UTC parts back out; anything else is shown as-is.
function formatDate(value) {
  if (value == null || value === "") return "unknown";
  if (value instanceof Date && !isNaN(value)) {
    return `${value.getUTCDate()} ${MONTHS[value.getUTCMonth()]} ${value.getUTCFullYear()}`;
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : String(value);
}

// One collapsible row of a card, always rendered closed. The copy button sits beside the
// <details> rather than inside its <summary>, which must not contain interactive content.
function renderSection(entry, { title, count, body, copyLabel }) {
  return `
    <div class="section-row">
      <details class="section">
        <summary>
          <span class="section-title">${escapeHtml(title)}</span>
          ${count != null ? `<span class="section-count">${count}</span>` : ""}
        </summary>
        <div class="section-body">${body}</div>
      </details>
      ${copyLabel ? `<button type="button" class="copy-btn" data-copy-id="${escapeHtml(entry.id)}">${escapeHtml(copyLabel)}</button>` : ""}
    </div>
  `;
}

function renderInstrumentContent(entry) {
  const itemsHtml = `<ol class="items-list">${entry.items.map((i) => `<li>${escapeHtml(i.text)}</li>`).join("")}</ol>`;

  const scaleHtml = `
    <div class="scale-block">
      <strong>Shared response scale</strong>
      <ul class="scale-list">${entry.response_scale.options.map((o) => `<li>${escapeHtml(o.label)} <span class="score">= ${o.score}</span></li>`).join("")}</ul>
    </div>
  `;

  const bandsHtml = entry.scoring
    ? `
      <div class="scoring-block">
        <strong>Scoring</strong>
        <p class="scoring-method">${escapeHtml(entry.scoring.method)}</p>
        <table class="bands-table">
          <tbody>
            ${entry.scoring.bands.map((b) => `<tr><td>${escapeHtml(b.min)}–${escapeHtml(b.max)}</td><td>${escapeHtml(b.label)}</td></tr>`).join("")}
          </tbody>
        </table>
        ${entry.scoring.clinical_note ? `<p class="clinical-note">${escapeHtml(entry.scoring.clinical_note)}</p>` : ""}
      </div>
    `
    : "";

  return itemsHtml + scaleHtml + bandsHtml;
}

// Renders one entry as a card, in fixed rows: title + status, source line (publisher, dates,
// primary source link), tags, the question, then collapsible response options/items and notes.
// `options.heading` overrides the heading text (defaults to entry.label); when it differs from
// the label, the label is shown in the source line instead so the standard is still
// identifiable. `options.headingTag` lets callers nest this under a domain heading without
// breaking heading-level hierarchy (defaults to "h2").
function renderEntryCard(entry, options = {}) {
  const heading = options.heading ?? entry.label;
  const headingTag = options.headingTag ?? "h2";
  const showLabelInMeta = heading !== entry.label;
  const isInstrument = Boolean(entry.items);

  const status = entry.status || "";
  const badgeLabel = STATUS_LABELS[status] || status;
  const appliesTo = entry.applies_to || [];
  const useCase = entry.use_case || [];

  const populationTags = appliesTo.length
    ? appliesTo.map((p) => `<span class="tag">${escapeHtml(POPULATION_LABELS[p] || p)}</span>`).join("")
    : '<span class="tag unspecified">Population not confirmed</span>';

  const useCaseTags = useCase
    .map((u) => `<span class="tag${u === "no-standard-gap" ? " gap" : ""}">${escapeHtml(USE_CASE_LABELS[u] || u)}</span>`)
    .join("");

  const licenceTag = `<span class="tag licence-${escapeHtml(entry.licence_status)}">${escapeHtml(LICENCE_LABELS[entry.licence_status] || entry.licence_status)}</span>`;
  const sourceTypeTag = `<span class="tag source-type">${escapeHtml(SOURCE_TYPE_LABELS[entry.source_type] || entry.source_type)}</span>`;

  const questionHtml = !showLabelInMeta && !isInstrument && entry.question
    ? `<p class="question">“${escapeHtml(entry.question)}”</p>`
    : "";

  let contentHtml;
  if (isInstrument) {
    contentHtml = renderSection(entry, {
      title: "Items",
      count: entry.items.length,
      body: renderInstrumentContent(entry),
      copyLabel: "Copy items",
    });
  } else if (entry.values && entry.values.length) {
    contentHtml = renderSection(entry, {
      title: "Response options",
      count: entry.values.length,
      body: `<ul class="values-list${entry.values.length > 6 ? " values-list--cols" : ""}">${entry.values.map((v) => `<li>${escapeHtml(v)}</li>`).join("")}</ul>`,
      copyLabel: "Copy",
    });
  } else if (entry.licence_status === "restricted") {
    contentHtml = `<p class="no-values">Reference only — this instrument is copyrighted with reproduction restrictions; see the notes and primary source before using it.</p>`;
  } else {
    contentHtml = `<p class="no-values">No compact value set published by the source — see notes and primary source.</p>`;
  }

  const notesHtml = entry.notes
    ? renderSection(entry, {
      title: "Notes",
      // A blank line in the YAML's folded `notes: >` block comes through as "\n": a paragraph break.
      body: entry.notes.split("\n").filter((p) => p.trim()).map((p) => `<p class="notes">${escapeHtml(p)}</p>`).join(""),
    })
    : "";

  return `
    <article class="entry entry--rows">
      <div class="entry-head">
        <${headingTag}>${escapeHtml(heading)}</${headingTag}>
        <span class="badge ${escapeHtml(status)}">${escapeHtml(badgeLabel)}</span>
      </div>
      <div class="meta-row">
        <p class="meta">
          ${showLabelInMeta ? `<strong>${escapeHtml(entry.label)}</strong> · ` : ""}${escapeHtml(entry.source)}
          · <span class="nowrap">Published ${escapeHtml(formatDate(entry.source_published))}</span>
          · <span class="nowrap">Reviewed ${escapeHtml(formatDate(entry.last_reviewed))}</span>
        </p>
        <a class="source-link" href="${escapeHtml(entry.source_url)}" target="_blank" rel="noopener">View source<span aria-hidden="true"> ↗</span><span class="visually-hidden"> (opens in a new tab)</span></a>
      </div>
      <div class="tags">${populationTags}${useCaseTags}${licenceTag}${sourceTypeTag}</div>
      ${questionHtml}
      <div class="entry-sections">
        ${contentHtml}
        ${notesHtml}
      </div>
    </article>
  `;
}

// Wires the card sections in containerEl to an "Expand all / Collapse all" button. Returns a
// sync() to call after each re-render so the button's label and visibility stay right.
function wireDisclosures(containerEl, toggleAllBtn) {
  const sectionsIn = () => Array.from(containerEl.querySelectorAll("details.section"));

  function sync() {
    const all = sectionsIn();
    toggleAllBtn.hidden = all.length === 0;
    toggleAllBtn.textContent = all.some((d) => !d.open) ? "Expand all" : "Collapse all";
  }

  // "toggle" doesn't bubble, so listen in the capture phase.
  containerEl.addEventListener("toggle", sync, true);

  toggleAllBtn.addEventListener("click", () => {
    const all = sectionsIn();
    const open = all.some((d) => !d.open);
    all.forEach((d) => { d.open = open; });
    sync();
  });

  return sync;
}

// The filter dropdowns shared by index.html and questions.html. `key` is the matchesFilters
// field; `param` is the URL query parameter it's saved under (kept stable so shared links
// keep working even if a label changes). `hint` is a short plain-English line under the label.
const FILTER_DEFS = [
  {
    key: "category", param: "category", label: "Topic", hint: "The subject area it covers",
    options: CATEGORIES.map((c) => [c, c]),
  },
  {
    key: "status", param: "status", label: "Status", hint: "Whether it's still in use",
    options: Object.entries(STATUS_LABELS),
  },
  {
    key: "population", param: "population", label: "Age group", hint: "Groups the source confirms it covers",
    options: [
      ["adults", "Adults"],
      ["children-young-people", "Children and young people"],
      ["unspecified", "Not confirmed by the source — gap"],
    ],
  },
  {
    key: "useCase", param: "use_case", label: "Purpose", hint: "What you're collecting data for",
    options: [
      ["demographic-survey", "Demographic survey"],
      ["clinical-record", "Clinical record"],
      ["screening-instrument", "Screening instrument"],
      ["support-needs-identification", "Support needs identification"],
      ["official-classification", "Official classification"],
      ["no-standard-gap", "No standard exists — gap"],
    ],
  },
  {
    key: "sourceType", param: "source_type", label: "Type of source", hint: "The kind of document it comes from",
    options: Object.entries(SOURCE_TYPE_LABELS),
  },
  {
    key: "licence", param: "licence", label: "Licence", hint: "Whether you can reuse the content",
    options: Object.entries(LICENCE_LABELS),
  },
];

// Renders the search box, labelled filter dropdowns and active-filter chips into containerEl,
// restoring any state from the URL and saving changes back to it. `omit` maps a filter key to
// option values this page shouldn't offer. onChange() runs after every change. Returns
// getFilters() (the matchesFilters argument) and updateCounts(pool), which labels each option
// with how many entries of `pool` it would leave given the other active filters.
function createFilterBar({ containerEl, searchPlaceholder, omit = {}, onChange }) {
  const defs = FILTER_DEFS.map((d) => ({
    ...d,
    options: d.options.filter(([value]) => !(omit[d.key] || []).includes(value)),
  }));
  const optionLabel = (d, value) => (d.options.find(([v]) => v === value) || [value, value])[1];
  const params = new URLSearchParams(location.search);

  containerEl.innerHTML = `
    <div class="search-field">
      <label class="field-label" for="search">Search</label>
      <p class="field-hint" id="search-hint">Names, questions, answer options and notes</p>
      <input type="search" id="search" aria-describedby="search-hint" placeholder="${escapeHtml(searchPlaceholder)}" value="${escapeHtml(params.get("q") || "")}">
    </div>
    <fieldset class="filter-grid">
      <legend class="visually-hidden">Filter entries</legend>
      ${defs.map((d) => `
        <div class="field">
          <label class="field-label" for="filter-${d.param}">${escapeHtml(d.label)}</label>
          <p class="field-hint" id="filter-${d.param}-hint">${escapeHtml(d.hint)}</p>
          <div class="select-wrap">
            <select id="filter-${d.param}" aria-describedby="filter-${d.param}-hint">
              <option value="">Any</option>
              ${d.options.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("")}
            </select>
          </div>
        </div>
      `).join("")}
    </fieldset>
    <div class="active-filters" hidden></div>
  `;

  const searchEl = containerEl.querySelector("#search");
  const chipsEl = containerEl.querySelector(".active-filters");
  const selects = Object.fromEntries(defs.map((d) => [d.key, containerEl.querySelector(`#filter-${d.param}`)]));

  // Ignore URL values this page doesn't offer (e.g. a use case omitted on questions.html).
  defs.forEach((d) => {
    const value = params.get(d.param);
    if (value && d.options.some(([v]) => v === value)) selects[d.key].value = value;
  });

  function getFilters() {
    const filters = { search: searchEl.value.trim().toLowerCase() };
    defs.forEach((d) => { filters[d.key] = selects[d.key].value; });
    return filters;
  }

  function syncUrl() {
    const next = new URLSearchParams();
    const q = searchEl.value.trim();
    if (q) next.set("q", q);
    defs.forEach((d) => { if (selects[d.key].value) next.set(d.param, selects[d.key].value); });
    const qs = next.toString();
    history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
  }

  function renderChips() {
    const chips = [];
    const q = searchEl.value.trim();
    if (q) chips.push({ key: "search", text: `Search: “${q}”` });
    defs.forEach((d) => {
      const value = selects[d.key].value;
      selects[d.key].classList.toggle("is-active", Boolean(value));
      if (value) chips.push({ key: d.key, text: `${d.label}: ${optionLabel(d, value)}` });
    });
    chipsEl.hidden = chips.length === 0;
    chipsEl.innerHTML = chips.length
      ? chips.map((c) => `<button type="button" class="chip" data-clear="${c.key}" aria-label="Remove filter ${escapeHtml(c.text)}">${escapeHtml(c.text)}<span aria-hidden="true">×</span></button>`).join("")
        + '<button type="button" class="clear-all" data-clear="all">Clear all</button>'
      : "";
  }

  function changed() {
    syncUrl();
    renderChips();
    onChange();
  }

  searchEl.addEventListener("input", changed);
  Object.values(selects).forEach((s) => s.addEventListener("change", changed));

  chipsEl.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-clear]");
    if (!btn) return;
    const key = btn.dataset.clear;
    if (key === "search" || key === "all") searchEl.value = "";
    if (key === "all") Object.values(selects).forEach((s) => { s.value = ""; });
    else if (selects[key]) selects[key].value = "";
    changed();
    // The clicked chip is gone after re-rendering, so hand focus to the control it cleared.
    (selects[key] || searchEl).focus();
  });

  // Options that would leave nothing are disabled, unless they're the current selection.
  function updateCounts(pool) {
    const filters = getFilters();
    defs.forEach((d) => {
      const select = selects[d.key];
      Array.from(select.options).forEach((opt) => {
        if (!opt.value) return;
        const n = pool.filter((e) => matchesFilters(e, { ...filters, [d.key]: opt.value })).length;
        opt.textContent = `${optionLabel(d, opt.value)} (${n})`;
        opt.disabled = n === 0 && opt.value !== select.value;
      });
    });
  }

  renderChips();
  return { getFilters, updateCounts };
}

// filters: { search (lowercased), status, population, useCase, licence, category, sourceType }
function matchesFilters(entry, filters) {
  if (filters.status && entry.status !== filters.status) return false;

  if (filters.population === "unspecified") {
    if ((entry.applies_to || []).length > 0) return false;
  } else if (filters.population) {
    if (!(entry.applies_to || []).includes(filters.population)) return false;
  }

  if (filters.useCase && !(entry.use_case || []).includes(filters.useCase)) return false;
  if (filters.licence && entry.licence_status !== filters.licence) return false;
  if (filters.category && entry._category !== filters.category) return false;
  if (filters.sourceType && entry.source_type !== filters.sourceType) return false;

  if (filters.search) {
    const itemsText = entry.items ? entry.items.map((i) => i.text).join(" ") : "";
    const valuesText = (entry.values || []).join(" ");
    const haystack = `${entry.label} ${entry.source} ${entry.notes} ${entry.question || ""} ${itemsText} ${valuesText}`.toLowerCase();
    if (!haystack.includes(filters.search)) return false;
  }

  return true;
}

async function loadAllEntries() {
  const results = await Promise.all(
    DOMAIN_FILES.map(async (meta) => {
      const res = await fetch(meta.file);
      if (!res.ok) throw new Error(`Failed to load ${meta.file}: ${res.status}`);
      const text = await res.text();
      const entries = jsyaml.load(text) || [];
      return entries.map((e) => ({ ...e, _domain: meta.domain, _domainLabel: meta.label, _category: meta.category }));
    })
  );
  return results.flat();
}

// Delegated click handler for any "Copy" buttons rendered by renderEntryCard.
// getEntries() should return the current full entry list (not just the filtered/visible one).
function wireCopyButtons(containerEl, getEntries) {
  containerEl.addEventListener("click", async (event) => {
    const btn = event.target.closest(".copy-btn");
    if (!btn) return;
    const entry = getEntries().find((e) => e.id === btn.dataset.copyId);
    const text = entry && copyableText(entry);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const original = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => { btn.textContent = original; }, 1500);
    } catch {
      btn.textContent = "Copy failed";
    }
  });
}
