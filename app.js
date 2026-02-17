// Drew’s Fitness Tracker — app.js
// Persists entries in localStorage + Export/Copy for paste-to-chat

const STORAGE_KEY = "drews_fitness_entries_v1";

const el = (id) => document.getElementById(id);

const dateInput = el("dateInput");
const typeInput = el("typeInput");
const titleInput = el("titleInput");
const repsInput = el("repsInput");
const weightInput = el("weightInput");
const distanceInput = el("distanceInput");
const durationInput = el("durationInput");
const notesInput = el("notesInput");

const addBtn = el("addBtn");
const clearBtn = el("clearBtn");
const statusMsg = el("statusMsg");

const entriesTbody = el("entriesTbody");
const deleteAllBtn = el("deleteAllBtn");

const exportBtn = el("exportBtn");
const copyBtn = el("copyBtn");
const exportBox = el("exportBox");
const copyMsg = el("copyMsg");

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function escapeText(s) {
  return String(s ?? "").replace(/[<>&]/g, (c) => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;" }[c]));
}

function setStatus(msg) {
  if (!statusMsg) return;
  statusMsg.textContent = msg;
  setTimeout(() => {
    if (statusMsg.textContent === msg) statusMsg.textContent = "";
  }, 2500);
}

function setCopyMsg(msg) {
  if (!copyMsg) return;
  copyMsg.textContent = msg;
  setTimeout(() => {
    if (copyMsg.textContent === msg) copyMsg.textContent = "";
  }, 2500);
}

function renderEntries() {
  const entries = loadEntries()
    .slice()
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.createdAt || 0) - (a.createdAt || 0));

  if (!entriesTbody) return;
  entriesTbody.innerHTML = "";

  for (const entry of entries) {
    const tr = document.createElement("tr");

    const cells = [
      entry.date || "",
      entry.type || "",
      entry.title || "",
      entry.reps ?? "",
      entry.weight ?? "",
      entry.distance ?? "",
      entry.duration ?? "",
      entry.notes || ""
    ];

    for (const v of cells) {
      const td = document.createElement("td");
      td.innerHTML = escapeText(v);
      tr.appendChild(td);
    }

    const tdDelete = document.createElement("td");
    const btn = document.createElement("button");
    btn.textContent = "Delete";
    btn.className = "ghost";
    btn.addEventListener("click", () => {
      const all = loadEntries();
      const next = all.filter((x) => x.id !== entry.id);
      saveEntries(next);
      renderEntries();
      setStatus("Entry deleted.");
    });
    tdDelete.appendChild(btn);
    tr.appendChild(tdDelete);

    entriesTbody.appendChild(tr);
  }
}

function clearForm() {
  typeInput && (typeInput.value = "Fasted Weight");
  titleInput && (titleInput.value = "");
  repsInput && (repsInput.value = "");
  weightInput && (weightInput.value = "");
  distanceInput && (distanceInput.value = "");
  durationInput && (durationInput.value = "");
  notesInput && (notesInput.value = "");
}

function addEntry() {
  const date = dateInput?.value || todayISO();
  const type = typeInput?.value || "Note";
  const title = (titleInput?.value || "").trim();

  const repsVal = repsInput?.value;
  const weightVal = weightInput?.value;
  const distanceVal = distanceInput?.value;
  const durationVal = durationInput?.value;
  const notes = (notesInput?.value || "").trim();

  // Basic validation: require at least a title OR notes OR some numeric field
  const hasNumeric = [repsVal, weightVal, distanceVal, durationVal].some((v) => v !== "" && v != null);
  if (!title && !notes && !hasNumeric) {
    setStatus("Add at least a Title, Notes, or a number (reps/weight/distance/minutes).");
    return;
  }

  const entry = {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2),
    createdAt: Date.now(),
    date,
    type,
    title,
    reps: repsVal === "" ? null : Number(repsVal),
    weight: weightVal === "" ? null : Number(weightVal),
    distance: distanceVal === "" ? null : Number(distanceVal),
    duration: durationVal === "" ? null : Number(durationVal),
    notes
  };

  const entries = loadEntries();
  entries.push(entry);
  saveEntries(entries);

  renderEntries();
  clearForm();
  setStatus("Saved ✅");
}

function generateExportText() {
  const entries = loadEntries()
    .slice()
    .sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.createdAt || 0) - (b.createdAt || 0));

  const lines = [];
  lines.push("Drew’s Fitness Tracker — Export");
  lines.push(`Generated: ${todayISO()}`);
  lines.push(`Entries: ${entries.length}`);
  lines.push("");

  for (const e of entries) {
    const parts = [];
    parts.push(`Date: ${e.date || ""}`);
    parts.push(`Type: ${e.type || ""}`);
    if (e.title) parts.push(`Title: ${e.title}`);
    if (e.reps != null) parts.push(`Reps: ${e.reps}`);
    if (e.weight != null) parts.push(`Weight(lbs): ${e.weight}`);
    if (e.distance != null) parts.push(`Distance(mi): ${e.distance}`);
    if (e.duration != null) parts.push(`Minutes: ${e.duration}`);
    if (e.notes) parts.push(`Notes: ${e.notes}`);
    lines.push(parts.join(" | "));
  }

  return lines.join("\n");
}

async function copyExport() {
  const text = exportBox?.value || "";
  if (!text.trim()) {
    setCopyMsg("Nothing to copy. Tap Generate Export first.");
    return;
  }

  // Prefer clipboard API
  try {
    await navigator.clipboard.writeText(text);
    setCopyMsg("Copied ✅ Now paste into chat.");
    return;
  } catch {
    // Fallback
    exportBox.focus();
    exportBox.select();
    const ok = document.execCommand("copy");
    setCopyMsg(ok ? "Copied ✅ Now paste into chat." : "Copy failed — press and hold → Copy.");
  }
}

function deleteAll() {
  const ok = confirm("Delete ALL entries? This cannot be undone.");
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  renderEntries();
  if (exportBox) exportBox.value = "";
  setStatus("All entries deleted.");
}

// Wire up
document.addEventListener("DOMContentLoaded", () => {
  if (dateInput) dateInput.value = todayISO();

  addBtn?.addEventListener("click", addEntry);
  clearBtn?.addEventListener("click", () => {
    clearForm();
    setStatus("Cleared.");
  });

  deleteAllBtn?.addEventListener("click", deleteAll);

  exportBtn?.addEventListener("click", () => {
    const txt = generateExportText();
    if (exportBox) exportBox.value = txt;
    setCopyMsg("Export generated. Tap Copy Export.");
  });

  copyBtn?.addEventListener("click", copyExport);

  // Initial render from storage
  renderEntries();
});





