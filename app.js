// Shared data-loading, filtering, and rendering logic for index.html and questions.html.
// Requires js-yaml to be loaded first (window.jsyaml).

const DOMAIN_FILES = [
  { file: "data/mental-health.yaml", domain: "mental-health", label: "Mental health" },
  { file: "data/demographics.yaml", domain: "demographics", label: "Demographics" },
  { file: "data/referral-identifiers.yaml", domain: "referral-identifiers", label: "Referral & safeguarding identifiers" },
];

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
};

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// Renders one entry as a card. `options.heading` overrides the h2/h3 text (defaults to
// entry.label); when it differs from the label, the label is shown in the meta line instead
// so the standard/source is still identifiable. `options.headingTag` lets callers nest this
// under a domain heading without breaking heading-level hierarchy (defaults to "h2").
function renderEntryCard(entry, options = {}) {
  const heading = options.heading ?? entry.label;
  const headingTag = options.headingTag ?? "h2";
  const showLabelInMeta = heading !== entry.label;

  const status = entry.status || "";
  const badgeLabel = STATUS_LABELS[status] || status;
  const lastReviewed = entry.last_reviewed || "unknown";
  const published = entry.source_published || "unknown";
  const appliesTo = entry.applies_to || [];
  const useCase = entry.use_case || [];

  const populationTags = appliesTo.length
    ? appliesTo.map((p) => `<span class="tag">${escapeHtml(POPULATION_LABELS[p] || p)}</span>`).join("")
    : '<span class="tag unspecified">Population not confirmed</span>';

  const useCaseTags = useCase
    .map((u) => `<span class="tag${u === "no-standard-gap" ? " gap" : ""}">${escapeHtml(USE_CASE_LABELS[u] || u)}</span>`)
    .join("");

  const questionHtml = !showLabelInMeta && entry.question
    ? `<p class="question">“${escapeHtml(entry.question)}”</p>`
    : "";

  const valuesHtml = entry.values && entry.values.length
    ? `
      <div class="values-block">
        <div class="values-head">
          <strong>Response options</strong>
          <button type="button" class="copy-btn" data-copy-id="${escapeHtml(entry.id)}">Copy</button>
        </div>
        <ul>${entry.values.map((v) => `<li>${escapeHtml(v)}</li>`).join("")}</ul>
      </div>
    `
    : `<p class="no-values">No compact value set published by the source — see notes and primary source.</p>`;

  return `
    <article class="entry">
      <div class="entry-head">
        <${headingTag}>${escapeHtml(heading)}</${headingTag}>
        <span class="badge ${escapeHtml(status)}">${escapeHtml(badgeLabel)}</span>
      </div>
      <p class="meta">${showLabelInMeta ? `<strong>${escapeHtml(entry.label)}</strong> · ` : ""}${escapeHtml(entry.source)} · last reviewed ${escapeHtml(lastReviewed)} · source published ${escapeHtml(published)}</p>
      <div class="tags">${populationTags}${useCaseTags}</div>
      ${questionHtml}
      ${valuesHtml}
      <p class="notes">${escapeHtml(entry.notes)}</p>
      <div class="entry-foot">
        <code>${escapeHtml(entry.source_type)}</code>
        <a href="${escapeHtml(entry.source_url)}" target="_blank" rel="noopener">View primary source →</a>
      </div>
    </article>
  `;
}

// filters: { search (lowercased), status, population, useCase }
function matchesFilters(entry, filters) {
  if (filters.status && entry.status !== filters.status) return false;

  if (filters.population === "unspecified") {
    if ((entry.applies_to || []).length > 0) return false;
  } else if (filters.population) {
    if (!(entry.applies_to || []).includes(filters.population)) return false;
  }

  if (filters.useCase && !(entry.use_case || []).includes(filters.useCase)) return false;

  if (filters.search) {
    const haystack = `${entry.label} ${entry.source} ${entry.notes} ${entry.question || ""}`.toLowerCase();
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
      return entries.map((e) => ({ ...e, _domain: meta.domain, _domainLabel: meta.label }));
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
    if (!entry || !entry.values) return;
    try {
      await navigator.clipboard.writeText(entry.values.join("\n"));
      const original = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => { btn.textContent = original; }, 1500);
    } catch {
      btn.textContent = "Copy failed";
    }
  });
}
