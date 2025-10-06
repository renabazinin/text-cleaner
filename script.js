function cleanText(str, { downcase = true, minLen = 4 } = {}) {
  // 1) Replace line breaks (CRLF, LF, CR) with a single space.
  let result = str.replace(/\r?\n|\r/g, " ");

  // 2) Optionally convert ALL-CAPS words of length >= minLen to lower case.
  if (downcase) {
    const rx = new RegExp("\\b[A-Z]{" + Math.max(1, Math.floor(minLen)) + ",}\\b", "g");
    result = result.replace(rx, m => m.toLowerCase());
  }

  // collapse multiple spaces created by replacements and trim
  return result.replace(/ {2,}/g, " ").trim();
}

const input  = document.getElementById("input");
const output = document.getElementById("output");
const cleanBtn = document.getElementById("cleanBtn");
const copyBtn  = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

// Downcase UI (toggle button)
const downcaseToggle = document.getElementById('downcaseToggle');
const downcaseMin = document.getElementById('downcaseMin');
const downcaseVal = document.getElementById('downcaseVal');
const downcaseValHint = document.getElementById('downcaseValHint');
downcaseVal.textContent = downcaseMin.value;
if (downcaseValHint) downcaseValHint.textContent = downcaseMin.value;
downcaseMin.addEventListener('input', () => {
  downcaseVal.textContent = downcaseMin.value;
  if (downcaseValHint) downcaseValHint.textContent = downcaseMin.value;
});

// Toggle behavior for downcase and remove toggles
if (downcaseToggle) {
  downcaseToggle.addEventListener('click', () => {
    const pressed = downcaseToggle.getAttribute('aria-pressed') === 'true';
    setToggleState(downcaseToggle, !pressed);
  });
}

copyBtn.addEventListener("click", async () => {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy Output"), 900);
  } catch {
    // Fallback: select so user can Ctrl/Cmd+C
    output.focus();
    output.select();
    alert("Clipboard not available. Text selected—press Ctrl/Cmd+C to copy.");
  }
});

clearBtn.addEventListener("click", () => {
  input.value = "";
  output.value = "";
  input.focus();
});

// Optional removals UI (per-row inputs)
// Note: removals are now automatic when any non-empty remove-row exists.
const suggestBtn = document.getElementById("suggestBtn");
const removeRowsContainer = document.getElementById("removeRowsContainer");
const addRemoveRowBtn = document.getElementById("addRemoveRowBtn");

// (no manual toggle — presence of rows controls behavior)

function setToggleState(btn, state) {
  btn.setAttribute('aria-pressed', state ? 'true' : 'false');
  const label = btn.querySelector('.switch-label');
  if (label) label.textContent = state ? 'On' : 'Off';
  
  // Add icon to knob for better visual feedback
  const knob = btn.querySelector('.switch-knob');
  if (knob) {
    knob.textContent = state ? '✓' : '×';
    knob.setAttribute('aria-label', state ? 'Enabled' : 'Disabled');
  }
}

function createRemoveRow(value = "", caseChecked = false) {
  const row = document.createElement("div");
  row.className = "remove-row";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "remove-input";
  input.placeholder = "Enter sentence or phrase to remove...";
  input.value = value;

  // per-row case toggle (button)
  const caseBtn = document.createElement('button');
  caseBtn.type = 'button';
  caseBtn.className = 'row-toggle-case toggle switch small';
  caseBtn.setAttribute('aria-pressed', caseChecked ? 'true' : 'false');
  caseBtn.title = 'Case sensitive';
  
  // Build switch structure: track > knob + label
  const track = document.createElement('span');
  track.className = 'switch-track';
  const knob = document.createElement('span');
  knob.className = 'switch-knob';
  knob.textContent = caseChecked ? '✓' : '×';
  knob.setAttribute('aria-label', caseChecked ? 'Enabled' : 'Disabled');
  track.appendChild(knob);
  
  const label = document.createElement('span');
  label.className = 'switch-label';
  label.textContent = caseChecked ? 'On' : 'Off';
  
  caseBtn.appendChild(track);
  caseBtn.appendChild(label);
  
  caseBtn.addEventListener('click', () => {
    const pressed = caseBtn.getAttribute('aria-pressed') === 'true';
    setToggleState(caseBtn, !pressed);
  });

  const del = document.createElement("button");
  del.type = "button";
  del.className = "remove-row-delete";
  del.title = "Remove this rule";
  del.textContent = "Remove";
  del.addEventListener("click", () => {
    row.remove();
    updateAutoEnable();
  });

  // when user types, auto-enable removals
  input.addEventListener("input", () => updateAutoEnable());

  row.appendChild(input);
  row.appendChild(caseBtn);
  row.appendChild(del);
  return row;
}

// Start with one empty row already present in HTML; convert it to a managed row if needed
(function normalizeInitialRows(){
  // Convert any static markup rows into managed rows created by createRemoveRow
  const existing = Array.from(removeRowsContainer.querySelectorAll('.remove-row'));
  const rowsData = existing.map(r => {
    const inputEl = r.querySelector('.remove-input');
    const btn = r.querySelector('.row-toggle-case');
    const text = inputEl ? (inputEl.value || '').trim() : '';
    const casePressed = btn && btn.getAttribute('aria-pressed') === 'true';
    return { text, casePressed };
  });

  // Clear and rebuild using the managed constructor so event handlers are attached
  removeRowsContainer.innerHTML = '';
  if (rowsData.length === 0) {
    removeRowsContainer.appendChild(createRemoveRow());
  } else {
    for (const rd of rowsData) {
      removeRowsContainer.appendChild(createRemoveRow(rd.text, rd.casePressed));
    }
  }
})();

// make sure toggle reflects initial rows
updateAutoEnable();

// make sure switch labels show correct state on load
if (downcaseToggle) setToggleState(downcaseToggle, downcaseToggle.getAttribute('aria-pressed') === 'true');

addRemoveRowBtn.addEventListener('click', () => {
  removeRowsContainer.appendChild(createRemoveRow());
});

function getRemoveRows() {
  return Array.from(removeRowsContainer.querySelectorAll('.remove-row')).map(r => {
    const input = r.querySelector('.remove-input');
    const btn = r.querySelector('.row-toggle-case');
    const pressed = btn && btn.getAttribute('aria-pressed') === 'true';
    return { text: (input && input.value || '').trim(), caseSensitive: !!pressed };
  }).filter(x => x.text);
}

function updateAutoEnable() {
  // Keep the remove-rows UI tidy:
  // - Don't auto-create rows when the user deletes the last one (allow zero rows).
  // - Remove fully-empty rows when there are multiple to avoid clutter.
  const all = Array.from(removeRowsContainer.querySelectorAll('.remove-row'));
  const nonEmpty = all.filter(r => (r.querySelector('.remove-input').value || '').trim());
  if (all.length > 1 && nonEmpty.length === 0) {
    // keep a single empty row
    for (let i = 1; i < all.length; i++) all[i].remove();
  }
}

// Suggest repeated sentences or lines to remove using a simple heuristic:
// find lines (split by punctuation or line breaks) that repeat 2+ times.
suggestBtn.addEventListener("click", () => {
  const text = input.value || "";
  if (!text) return alert("Paste or enter text in the Input area first to get suggestions.");

  const candidates = text.split(/[\.\!\?\n]+/).map(s => s.trim()).filter(Boolean);
  const counts = Object.create(null);
  for (const s of candidates) {
    const key = s.toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
  }

  const suggested = Object.keys(counts).filter(k => counts[k] >= 3);
  if (!suggested.length) return alert("No repeated sentences found to suggest.");

  // Append suggestions without overriding existing rows. Avoid duplicates.
  const existing = new Set(getRemoveRows().map(r => r.text.toLowerCase()));
  for (const s of suggested) {
    if (existing.has(s)) continue;
    const found = candidates.find(c => c.toLowerCase() === s) || s;
    removeRowsContainer.appendChild(createRemoveRow(found, false));
  }
  updateAutoEnable();
});

// Update the Clean button flow to remove any listed sentences when enabled
cleanBtn.addEventListener("click", () => {
  const options = { downcase: (downcaseToggle && downcaseToggle.getAttribute('aria-pressed') === 'true'), minLen: Number(downcaseMin.value || 4) };
  let result = cleanText(input.value || "", options);

  // Apply removals automatically when there are non-empty remove rows
  const rows = getRemoveRows();
  if (rows.length) {
    for (const r of rows) {
      const phrase = r.text;
      if (!phrase) continue;
      const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const flags = r.caseSensitive ? 'g' : 'gi';
      result = result.replace(new RegExp(esc, flags), "");
    }
    result = result.replace(/ {2,}/g, " ").trim();
  }

  output.value = result;
  output.focus();
  output.select();
});
