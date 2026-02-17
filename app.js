const STORAGE_KEY = "drews_fitness_v10";
const el = (id) => document.getElementById(id);

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function load() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function render() {
  const tbody = el("entriesTbody");
  const data = load();
  tbody.innerHTML = "";

  data.forEach(entry => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.type}</td>
      <td>${entry.title}</td>
      <td>${entry.reps || ""}</td>
      <td>${entry.weight || ""}</td>
      <td>${entry.distance || ""}</td>
      <td>${entry.minutes || ""}</td>
      <td>${entry.notes || ""}</td>
    `;
    tbody.appendChild(row);
  });
}

function addEntry(entry) {
  const data = load();
  data.push(entry);
  save(data);
  render();
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("step-btn")) {
    const target = e.target.dataset.target;
    const step = parseFloat(e.target.dataset.step);
    const input = el(target);
    const current = parseFloat(input.value) || 0;
    let next = current + step;
    if (next < 0) next = 0;
    input.value = next.toFixed(input.step.includes(".") ? 1 : 0);
  }
});

function saveWorkout() {
  const date = el("workoutDate").value || todayISO();
  document.querySelectorAll("input[data-ex]").forEach(input => {
    const reps = parseInt(input.value) || 0;
    if (reps > 0) {
      addEntry({
        date,
        type: "Calisthenics",
        title: input.dataset.ex,
        reps
      });
    }
  });
}

function saveCardio() {
  addEntry({
    date: el("cardioDate").value || todayISO(),
    type: "Cardio",
    title: "Walk",
    minutes: el("cardioMinutes").value,
    distance: el("cardioMiles").value,
    notes: el("cardioNotes").value
  });
}

function saveFastedWeight() {
  addEntry({
    date: el("fwDate").value || todayISO(),
    type: "Fasted Weight",
    title: "Morning Weight",
    weight: el("fwWeight").value
  });
}

function exportData() {
  const data = load();
  let text = "Drew's Fitness Tracker Export\n\n";
  data.forEach((e, i) => {
    text += `Entry ${i+1}\nDate: ${e.date}\nType: ${e.type}\nTitle: ${e.title}\n`;
    if (e.reps) text += `Reps: ${e.reps}\n`;
    if (e.weight) text += `Weight: ${e.weight}\n`;
    if (e.minutes) text += `Minutes: ${e.minutes}\n`;
    if (e.distance) text += `Distance: ${e.distance}\n`;
    if (e.notes) text += `Notes: ${e.notes}\n`;
    text += "------------------\n";
  });
  el("exportBox").value = text;
}

function copyExport() {
  const box = el("exportBox");
  box.select();
  document.execCommand("copy");
  alert("Copied! Paste into ChatGPT.");
}

document.addEventListener("DOMContentLoaded", () => {
  el("fwDate").value = todayISO();
  el("cardioDate").value = todayISO();
  el("workoutDate").value = todayISO();

  el("saveWorkoutBtn").onclick = saveWorkout;
  el("saveCardioBtn").onclick = saveCardio;
  el("saveFastedWeightBtn").onclick = saveFastedWeight;
  el("exportBtn").onclick = exportData;
  el("copyBtn").onclick = copyExport;

  render();
});
