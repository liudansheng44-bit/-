const currentHkaInput = document.getElementById("currentHka");
const targetHkaInput = document.getElementById("targetHka");
const hingeDistanceInput = document.getElementById("hingeDistance");
const cutLengthInput = document.getElementById("cutLength");
const calculateBtn = document.getElementById("calculateBtn");
const resultBox = document.getElementById("result");

const noteForm = document.getElementById("noteForm");
const patientIdInput = document.getElementById("patientId");
const noteTextInput = document.getElementById("noteText");
const notesList = document.getElementById("notesList");

function toRad(angle) {
  return (angle * Math.PI) / 180;
}

function calcOpenWedgeGap(deltaDeg, hingeDistanceMm) {
  return 2 * hingeDistanceMm * Math.sin(toRad(Math.abs(deltaDeg) / 2));
}

function calcCorticalOffset(deltaDeg, cutLengthMm) {
  return cutLengthMm * Math.tan(toRad(Math.abs(deltaDeg)));
}

function format(value, unit = "") {
  return `${value.toFixed(2)}${unit}`;
}

calculateBtn.addEventListener("click", () => {
  const current = Number(currentHkaInput.value);
  const target = Number(targetHkaInput.value);
  const hingeDistance = Number(hingeDistanceInput.value);
  const cutLength = Number(cutLengthInput.value);

  if ([current, target, hingeDistance].some((n) => Number.isNaN(n) || n <= 0)) {
    resultBox.classList.remove("muted");
    resultBox.textContent = "参数无效：请填写大于 0 的数字。";
    return;
  }

  const delta = target - current;
  const absDelta = Math.abs(delta);
  const direction = delta > 0 ? "外翻矫正倾向" : delta < 0 ? "内翻矫正倾向" : "无需矫正";

  const wedgeGap = calcOpenWedgeGap(delta, hingeDistance);

  let output = `矫正角度差：${format(absDelta, "°")}\n`;
  output += `方向建议：${direction}\n`;
  output += `预计开口间隙：${format(wedgeGap, " mm")}（基于铰链距离 ${hingeDistance} mm）\n`;

  if (!Number.isNaN(cutLength) && cutLength > 0) {
    const offset = calcCorticalOffset(delta, cutLength);
    output += `远端皮质理论位移：${format(offset, " mm")}（基于截骨面长度 ${cutLength} mm）\n`;
  }

  output += "\n注意：仅为几何估算，请结合全长负重位片、术前模板与临床标准流程。";

  resultBox.classList.remove("muted");
  resultBox.textContent = output;
});

function loadNotes() {
  const notes = JSON.parse(localStorage.getItem("osteotomy-notes") || "[]");
  notesList.innerHTML = "";

  notes.forEach((note) => {
    const li = document.createElement("li");
    li.textContent = `${note.date} | ${note.patientId} | ${note.text}`;
    notesList.appendChild(li);
  });
}

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const patientId = patientIdInput.value.trim();
  const text = noteTextInput.value.trim();
  if (!patientId || !text) return;

  const record = {
    patientId,
    text,
    date: new Date().toLocaleDateString("zh-CN"),
  };

  const existing = JSON.parse(localStorage.getItem("osteotomy-notes") || "[]");
  existing.unshift(record);
  localStorage.setItem("osteotomy-notes", JSON.stringify(existing.slice(0, 20)));

  noteForm.reset();
  loadNotes();
});

loadNotes();
