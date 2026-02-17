const STORAGE_KEY = "drews_fitness_entries_v3";

const el = (id) => document.getElementById(id);

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function loadEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function renderEntries() {
  const tbody = el("entriesTbody");
  tbody.innerHTML = "";
  const entries = loadEntries();

  entries.forEach((entry, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.type}</td>
      <td>${entry.title}</td>
      <td>${entry.reps}</td>
      <td>${entry.weight}</td>
      <td>${entry.distance}</td>
      <td>${entry.duration}</td>
      <td>${entry.notes}</td>
      <td><button onclick="deleteEntry(${index})">X</button></td>
    `;
    tbody.appendChild(row);
  });
}

function addEntry() {
  const entry = {
    date: el("dateInput").value || todayISO(),
    type: el("typeInput").value,
    title: el("titleInput").value,
    reps: el("repsInput").value,
    weight: el("weightInput").value,
    distance: el("distanceInput").value,
    duration: el("durationInput").value,
    notes: el("notesInput").value
  };

  if (!entry.title && !entry.reps && !entry.notes) {
    alert("Add a title, reps, or notes.");
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
  text += "Date: " + todayISO() + "\n";
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
    text += "----------------------\n";
  });

  el("exportBox").value = text;
}

function copyExport() {
  const box = el("exportBox");
  box.select();
  document.execCommand("copy");
  alert("Copied! Paste into ChatGPT.");
}

// UNIVERSAL + / - BUTTON HANDLER
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("step-btn")) {
    const targetId = e.target.getAttribute("data-target");
    const step = parseFloat(e.target.getAttribute("data-step"));
    const input = el(targetId);
    if (!input) return;

    const current = parseFloat(input.value) || 0;
    const min = parseFloat(input.min) || 0;
    let next = current + step;
    if (next < min) next = min;

    input.value = next.toFixed(
      input.step && input.step.includes(".")
        ? input.step.split(".")[1].length
        : 0
    );
  }
});

document.addEventListener("DOMContentLoaded", () => {
  el("dateInput").value = todayISO();
  el("addBtn").addEventListener("click", addEntry);
  el("exportBtn").addEventListener("click", generateExport);
  el("copyBtn").addEventListener("click", copyExport);
  renderEntries();
});
