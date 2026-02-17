const STORAGE_KEY = "drews_fitness_entries_v5";
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

function decimalsFromStep(stepStr) {
  if (!stepStr || !stepStr.includes(".")) return 0;
  return stepStr.split(".")[1].length;
}

function renderEntries() {
  const tbody = el("entriesTbody");
  if (!tbody) return;

  const entries = loadEntries();
  tbody.innerHTML = "";

  entries.forEach((entry, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${entry.date || ""}</td>
      <td>${entry.type || ""}</td>
      <td>${entry.title || ""}</td>
      <td>${entry.reps ?? ""}</td>
      <td>${entry.weight ?? ""}</td>
      <td>${entry.distance ?? ""}</td>
      <td>${entry.minutes ?? ""}</td>
      <td>${entry.notes || ""}</td>
      <td><button type="button" data-delete="${index}">X</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function addLog(entry) {
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
  let text = "Drew’s Fitness Tracker — Export\n";
  text += "Generated: " + todayISO() + "\n";
  text += "Total Entries: " + entries.length + "\n\n";

  entries.forEach((e, i) => {
    text += `Entry ${i + 1}\n`;
    text += `Date: ${e.date}\n`;
    text += `Type: ${e.type}\n`;
    text += `Title: ${e.title}\n`;
    if (e.reps != null && e.reps !== "") text += `Reps: ${e.reps}\n`;
    if (e.weight != null && e.weight !== "") text += `Weight: ${e.weight}\n`;
    if (e.distance != null && e.distance !== "") text += `Distance: ${e.distance}\n`;
    if (e.minutes != null && e.minutes !== "") text += `Minutes: ${e.minutes}\n`;
    if (e.notes) text += `Notes: ${e.notes}\n`;
    text += "----------------------\n";
  });

  el("exportBox").value = text;
}

function copyExport() {
  const box = el("exportBox");
  box.focus();
  box.select();
  document.execCommand("copy");
  alert("Copied! Now paste into ChatGPT.");
}

// UNIVERSAL + / - HANDLER (buttons already working)
document.addEventListener("click", (e) => {
  const stepBtn = e.target.closest(".step-btn");
  if (stepBtn) {
    const targetId = stepBtn.getAttribute("data-target");
    const step = parseFloat(stepBtn.getAttribute("data-step") || "0");
    const input = el(targetId);
    if (!input || !Number.isFinite(step)) return;

    const current = parseFloat(input.value);
    const val = Number.isFinite(current) ? current : 0;

    const min = input.min !== "" ? parseFloat(input.min) : 0;
    let next = val + step;
    if (next < min) next = min;

    const dec = decimalsFromStep(input.step || "1");
    input.value = dec ? next.toFixed(dec) : String(Math.round(next));
    return;
  }

  if (e.target.dataset.delete !== undefined) {
    deleteEntry(parseInt(e.target.dataset.delete, 10));
  }
});

function saveFastedWeight() {
  const date = el("fwDate").value || todayISO();
  const weight = parseFloat(el("fwWeight").value || "0");
  if (!weight || weight <= 0) {
    alert("Enter a fasted weight > 0");
    return;
  }
  addLog({
    date,
    type: "Fasted Weight",
    title: "Fasted Weight",
    reps: "",
    weight: weight,
    distance: "",
    minutes: "",
    notes: ""
  });
}

function saveCardio() {
  const date = el("cardioDate").value || todayISO();
  const minutes = parseInt(el("cardioMinutes").value || "0", 10);
  const miles = parseFloat(el("cardioMiles").value || "0");
  const incline = (el("cardioIncline").value || "").trim();
  const speed = (el("cardioSpeed").value || "").trim();
  const notes = (el("cardioNotes").value || "").trim();

  if ((!minutes || minutes <= 0) && (!miles || miles <= 0)) {
    alert("Enter cardio minutes and/or miles > 0");
    return;
  }

  const noteParts = [];
  if (incline) noteParts.push(`Incline: ${incline}`);
  if (speed) noteParts.push(`Speed: ${speed}`);
  if (notes) noteParts.push(notes);

  addLog({
    date,
    type: "Cardio",
    title: "Cardio Walk",
    reps: "",
    weight: "",
    distance: miles > 0 ? miles : "",
    minutes: minutes > 0 ? minutes : "",
    notes: noteParts.join(" | ")
  });
}

function saveRuck() {
  const date = el("ruckDate").value || todayISO();
  const ruckW = parseInt(el("ruckWeight").value || "0", 10);
  const minutes = parseInt(el("ruckMinutes").value || "0", 10);
  const miles = parseFloat(el("ruckMiles").value || "0");
  const notes = (el("ruckNotes").value || "").trim();

  if ((!minutes || minutes <= 0) && (!miles || miles <= 0)) {
    alert("Enter ruck minutes and/or miles > 0");
    return;
  }

  addLog({
    date,
    type: "Cardio",
    title: "Ruck",
    reps: "",
    weight: ruckW > 0 ? ruckW : "",
    distance: miles > 0 ? miles : "",
    minutes: minutes > 0 ? minutes : "",
    notes
  });
}

function saveWorkout() {
  const date = el("workoutDate").value || todayISO();
  const sessionNotes = (el("sessionNotes").value || "").trim();

  // Collect all inputs with data-exname
  const exerciseInputs = document.querySelectorAll("input[data-exname]");
  let savedAny = false;

  exerciseInputs.forEach((inp) => {
    const exName = inp.getAttribute("data-exname");
    const reps = parseInt(inp.value || "0", 10);
    if (!reps || reps <= 0) return;

    const notesEl = el(inp.id + "_notes");
    const exNotes = (notesEl?.value || "").trim();

    const notesParts = [];
    if (exNotes) notesParts.push(exNotes);
    if (sessionNotes) notesParts.push(`Session: ${sessionNotes}`);

    addLog({
      date,
      type: "Calisthenics",
      title: exName,
      reps: reps,
      weight: "",
      distance: "",
      minutes: "",
      notes: notesParts.join(" | ")
    });

    savedAny = true;
  });

  if (!savedAny) {
    alert("Set at least one exercise reps > 0 before saving.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Set default dates
  ["fwDate", "cardioDate", "ruckDate", "workoutDate"].forEach((id) => {
    const input = el(id);
    if (input) input.value = todayISO();
  });

  el("saveFastedWeightBtn")?.addEventListener("click", saveFastedWeight);
  el("saveCardioBtn")?.addEventListener("click", saveCardio);
  el("saveRuckBtn")?.addEventListener("click", saveRuck);
  el("saveWorkoutBtn")?.addEventListener("click", saveWorkout);

  el("exportBtn")?.addEventListener("click", generateExport);
  el("copyBtn")?.addEventListener("click", copyExport);

  renderEntries();
});
