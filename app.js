alert("LIVE JS LOADED ✅");
// ===== Drew’s Fitness Tracker =====
// Full save + export + universal +/- stepper support

const STORAGE_KEY = "drews_fitness_entries_v2";

const el = (id) => document.getElementById(id);

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function renderEntries() {
  const tbody = el("entriesTbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  const entries = loadEntries();

  entries.forEach((entry, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${entry.date || ""}</td>
      <td>${entry.type || ""}</td>
      <td>${entry.title || ""}</td>
      <td>${entry.reps || ""}</td>
      <td>${entry.weight || ""}</td>
      <td>${entry.distance || ""}</td>
      <td>${entry.duration || ""}</td>
      <td>${entry.notes || ""}</td>
      <td><button type="button" data-delete="${index}">Delete</button></td>
    `;

    tbody.appendChild(row);
  });
}

function addEntry() {
  const entry = {
    date: el("dateInput")?.value || todayISO(),
    type: el("typeInput")?.value || "",
    title: el("titleInput")?.value || "",
    reps: el("repsInput")?.value || "",
    weight: el("weightInput")?.value || "",
    distance: el("distanceInput")?.value || "",
    duration: el("durationInput")?.value || "",
    notes: el("notesInput")?.value || ""
  };

  if (!entry.title && !entry.reps && !entry.notes) {
    alert("Add at least a title, reps, or notes.");
    return;
  }

  const entries = loadEntries();
  entries.push(entry);
  saveEntries(entries);
  renderEntries();
}

function deleteEntry(index) {
  const entries = loadEntries();
  entries.splice(index, 1);
  saveEntries(entries);
  renderEntries();
}

function generateExport() {
  const entries = loadEntries();

  let text = "Drew’s Fitness Tracker Export\n";
  text += "Generated: " + todayISO() + "\n";
  text += "Total Entries: " + entries.length + "\n\n";

  entries.forEach((e, i) => {
    text += `Entry ${i + 1}\n`;
    text += `Date: ${e.date}\n`;
    text += `Type: ${e.type}\n`;
    text += `Title: ${e.title}\n`;
    text += `Reps: ${e.reps}\n`;
    text += `Weight: ${e.weight}\n`;
    text += `Distance: ${e.distance}\n`;
    text += `Duration: ${e.duration}\n`;
    text += `Notes: ${e.notes}\n`;
    text += "--------------------------\n";
  });

  el("exportBox").value = text;
}

function copyExport() {
  const box = el("exportBox");
  box.select();
  document.execCommand("copy");
  alert("Copied! Now paste into ChatGPT.");
}

// ===== UNIVERSAL +/- STEPPER SUPPORT =====
// Works with buttons like:
// <button class="step-btn" data-target="repsInput" data-step="1">+</button>
// <button class="step-btn" data-target="repsInput" data-step="-1">-</button>

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".step-btn");
  if (btn) {
    const targetId = btn.getAttribute("data-target");
    const step = parseFloat(btn.getAttribute("data-step") || "0");
    const input = document.getElementById(targetId);
    if (!input || !Number.isFinite(step)) return;

    const current = parseFloat(input.value);
    const val = Number.isFinite(current) ? current : 0;

    const min = input.min !== "" ? parseFloat(input.min) : -Infinity;
    const next = Math.max(min, val + step);

    const stepAttr = parseFloat(input.step || "1");
    const decimals = stepAttr < 1 ? (String(stepAttr).split(".")[1]?.length || 0) : 0;

    input.value = decimals ? next.toFixed(decimals) : Math.round(next);
    return;
  }

  // Delete handler
  if (e.target.dataset.delete !== undefined) {
    deleteEntry(parseInt(e.target.dataset.delete));
  }
});

document.addEventListener("DOMContentLoaded", () => {
  renderEntries();

  el("addBtn")?.addEventListener("click", addEntry);
  el("exportBtn")?.addEventListener("click", generateExport);
  el("copyBtn")?.addEventListener("click", copyExport);
});

