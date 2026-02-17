let logs = [];

window.onload = function () {
  document.getElementById("status").textContent = "App Loaded Successfully ✅";
  document.getElementById("date").valueAsDate = new Date();

  // Wire main buttons
  document.getElementById("gtgBtn").onclick = addGTG;
  document.getElementById("cardioBtn").onclick = addCardio;
  document.getElementById("ruckBtn").onclick = addRuck;
  document.getElementById("calisBtn").onclick = addCalisthenics;
  document.getElementById("weightBtn").onclick = addWeight;
  document.getElementById("exportBtn").onclick = exportLog;

  // Stepper buttons
  document.querySelectorAll("[data-step-target]").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-step-target");
      const step = parseFloat(btn.getAttribute("data-step"));
      stepValue(targetId, step);
    });
  });

  // Weighted checkbox toggles (show/hide weight steppers)
  document.querySelectorAll(".wCheck").forEach(cb => {
    cb.addEventListener("change", () => {
      const wtarget = cb.getAttribute("data-wtarget"); // e.g. cal_dips_w
      const box = document.getElementById(wtarget + "_box");
      if (box) box.style.display = cb.checked ? "flex" : "none";
      // If unchecked, reset weight to 0
      if (!cb.checked) {
        const wEl = document.getElementById(wtarget);
        if (wEl) wEl.textContent = "0";
      }
    });
  });

  // DB curl weight chip buttons
  document.querySelectorAll("[data-set='cal_curls_w']").forEach(btn => {
    btn.addEventListener("click", () => {
      const v = btn.getAttribute("data-value");
      document.getElementById("cal_curls_w").textContent = v;
    });
  });

  renderLogs();
};

function getNum(id) {
  return parseFloat(document.getElementById(id).textContent);
}

function stepValue(id, step) {
  const el = document.getElementById(id);
  if (!el) return;

  let v = parseFloat(el.textContent);
  if (isNaN(v)) v = 0;
  v = v + step;

  // Guardrails
  if (id.includes("Incline") || id.includes("Speed")) {
    v = Math.max(0, Math.min(15, v));
    v = Math.round(v * 2) / 2; // keep .5
    el.textContent = v.toFixed(1);
    return;
  }

  if (id.includes("Dist")) {
    v = Math.max(0, v);
    el.textContent = v.toFixed(2);
    return;
  }

  if (id === "fastedWeight") {
    v = Math.max(0, v);
    el.textContent = v.toFixed(1);
    return;
  }

  // reps / minutes / load (integers mostly)
  if (id.includes("Load")) {
    v = Math.max(0, v);
    el.textContent = Math.round(v).toString();
    return;
  }

  v = Math.max(0, v);
  el.textContent = Math.round(v).toString();
}

function addGTG() {
  const reps = getNum("gtgDefault");
  const feel = document.getElementById("gtgFeel").value;

  logs.push(`GTG Chin-ups: ${reps} reps (dead hang, chest-to-bar, controlled) | Feel: ${feel}`);
  renderLogs();
}

function addCardio() {
  const min = getNum("cardioMin");
  const incline = getNum("cardioIncline").toFixed(1);
  const speed = getNum("cardioSpeed").toFixed(1);
  const dist = getNum("cardioDist").toFixed(2);
  const cooldown = document.getElementById("cardioCooldown").checked;

  logs.push(
    `Cardio Walk: ${min} min | Incline ${incline}${cooldown ? " (cooldown ramp-down)" : ""} | Speed ${speed}${cooldown ? " (ramp-down)" : ""} | Distance ${dist} mi | Hands Free`
  );
  renderLogs();
}

function addRuck() {
  const min = getNum("ruckMin");
  const incline = getNum("ruckIncline").toFixed(1);
  const speed = getNum("ruckSpeed").toFixed(1);
  const dist = getNum("ruckDist").toFixed(2);
  const load = getNum("ruckLoad");

  logs.push(
    `Ruck Walk: ${min} min | Incline ${incline} | Speed ${speed} | Distance ${dist} mi | Load ${load} lb Backpack | Hands Free`
  );
  renderLogs();
}

function addCalisthenics() {
  const toFailure = document.getElementById("calToFailure").checked ? "Yes" : "No";

  const lines = [];

  function addLine(name, repsId, wId) {
    const reps = getNum(repsId);
    const w = getNum(wId);
    if (w > 0) lines.push(`${name}: ${reps} reps (+${w} lb)`);
    else lines.push(`${name}: ${reps} reps`);
  }

  addLine("Chin-ups", "cal_chins", "cal_chins_w");
  addLine("Dips", "cal_dips", "cal_dips_w");
  addLine("Parallette push-ups", "cal_ppush", "cal_ppush_w");
  addLine("Incline parallette push-ups", "cal_ippush", "cal_ippush_w");
  addLine("Rows (feet elevated)", "cal_rows_e", "cal_rows_e_w");
  addLine("Rows (feet on floor)", "cal_rows_f", "cal_rows_f_w");
  addLine("Squats", "cal_squats", "cal_squats_w");
  addLine("Hanging knee raises", "cal_knees", "cal_knees_w");

  const curlsReps = getNum("cal_curls");
  const curlsW = document.getElementById("cal_curls_w").textContent;
  lines.push(`DB curls: ${curlsReps} reps (${curlsW} lb, mixed hammer + alternating)`);

  const session = `Calisthenics Session (to failure: ${toFailure}):\n- ` + lines.join("\n- ");
  logs.push(session);

  renderLogs();
}

function addWeight() {
  const w = getNum("fastedWeight").toFixed(1);
  logs.push(`Fasted Weight: ${w} lb`);
  renderLogs();
}

function renderLogs() {
  const list = document.getElementById("entries");
  list.innerHTML = "";
  logs.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = entry;
    list.appendChild(li);
  });
}

function exportLog() {
  const date = document.getElementById("date").value;
  const exportText = `Workout Log Export\nDate: ${date}\n\n` + logs.join("\n\n");
  document.getElementById("exportBox").value = exportText;
}




