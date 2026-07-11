// ---------- Data ----------
const PHASES = [
  { key: "menstrual",  label: "Menstrual",  hex: "#E85D75", getStart: (p) => 0,                                   getSpan: (p) => p.periodLen, blurb: "The uterine lining sheds. Energy is often lower — rest is productive, not lazy." },
  { key: "follicular", label: "Follicular", hex: "#E8A94A", getStart: (p) => p.periodLen,                          getSpan: (p) => Math.max(p.ovulationDay - p.periodLen, 1), blurb: "Estrogen rises, energy builds back up. A good window for starting new things." },
  { key: "ovulation",  label: "Ovulation",  hex: "#7C9885", getStart: (p) => Math.max(p.ovulationDay - 2, p.periodLen), getSpan: (p) => 4, blurb: "The fertile window, roughly ±2 days around ovulation. Confidence often peaks here." },
  { key: "luteal",     label: "Luteal",     hex: "#8C6BAE", getStart: (p) => Math.max(p.ovulationDay + 2, p.periodLen + 4), getSpan: (p) => p.cycleLen - Math.max(p.ovulationDay + 2, p.periodLen + 4), blurb: "Progesterone rises then dips. PMS symptoms can show up in the last few days." },
];

const MYTHS = [
  { tag: "Myth", q: "Periods are dirty or impure.", tag2: "Fact", a: "Menstrual blood is just tissue, blood, and mucus. The idea of impurity is a cultural belief, not a biological one — and it's the exact stigma Menstrupedia's comics are built to undo." },
  { tag: "Myth", q: "You shouldn't exercise while on your period.", tag2: "Fact", a: "Light to moderate movement (walking, yoga, stretching) can actually ease cramps by improving blood flow. Listen to your energy, but rest isn't mandatory." },
  { tag: "Myth", q: "The cycle is always exactly 28 days.", tag2: "Fact", a: "28 is just an average. Healthy cycles commonly range 21–35 days, and can vary month to month for the same person." },
  { tag: "Myth", q: "PMS is 'just in your head'.", tag2: "Fact", a: "PMS is driven by real hormonal shifts (estrogen and progesterone) in the luteal phase — it's physiological, not imagined." },
  { tag: "Myth", q: "Talking about periods with kids is awkward or unnecessary.", tag2: "Fact", a: "Age-appropriate, early conversations reduce fear and shame later. This is the whole premise behind Menstrupedia Comic reaching 37,000+ schools." },
  { tag: "Myth", q: "Irregular periods always mean something is wrong.", tag2: "Fact", a: "Stress, travel, sleep, and weight changes can shift a cycle temporarily. Persistent irregularity is worth a doctor's opinion, but occasional shifts are normal." },
];

// ---------- Helpers ----------
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function fmt(date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function resolvePhaseGeometry(cycleLen, periodLen, ovulationDay) {
  const p = { cycleLen, periodLen, ovulationDay };
  return PHASES.map(ph => ({
    ...ph,
    start: ph.getStart(p),
    span: ph.getSpan(p),
  }));
}

// ---------- Wheel rendering ----------
const svg = document.getElementById("wheelSvg");
const CX = 120, CY = 120, R = 100, STROKE = 26;
const CIRC = 2 * Math.PI * R;
let hoveredPhase = null;

function renderWheel(cycleLen, periodLen, ovulationDay, cycleDay, activeKey) {
  // clear previously drawn arcs/marker (keep the first base circle)
  svg.querySelectorAll(".arc, .marker").forEach(el => el.remove());

  const geo = resolvePhaseGeometry(cycleLen, periodLen, ovulationDay);

  geo.forEach(ph => {
    const startFrac = ph.start / cycleLen;
    const spanFrac = ph.span / cycleLen;
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", CX);
    circle.setAttribute("cy", CY);
    circle.setAttribute("r", R);
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", ph.hex);
    circle.setAttribute("stroke-width", STROKE);
    circle.setAttribute("stroke-dasharray", `${spanFrac * CIRC} ${CIRC}`);
    circle.setAttribute("stroke-dashoffset", -startFrac * CIRC);
    circle.setAttribute("transform", `rotate(-90 ${CX} ${CY})`);
    circle.classList.add("arc");
    if (activeKey && activeKey !== ph.key) circle.classList.add("dim");

    circle.addEventListener("mouseenter", () => {
      hoveredPhase = ph.key;
      renderWheel(cycleLen, periodLen, ovulationDay, cycleDay, hoveredPhase);
    });
    circle.addEventListener("mouseleave", () => {
      hoveredPhase = null;
      renderWheel(cycleLen, periodLen, ovulationDay, cycleDay, getCurrentPhase().key);
    });

    svg.appendChild(circle);
  });

  const todayFrac = (cycleDay / cycleLen) % 1;
  const angle = todayFrac * 360 - 90;
  const markerX = CX + R * Math.cos(angle * Math.PI / 180);
  const markerY = CY + R * Math.sin(angle * Math.PI / 180);
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  marker.setAttribute("cx", markerX);
  marker.setAttribute("cy", markerY);
  marker.setAttribute("r", 7);
  marker.setAttribute("fill", "#402036");
  marker.setAttribute("stroke", "#fff");
  marker.setAttribute("stroke-width", 2.5);
  marker.classList.add("marker");
  svg.appendChild(marker);
}

function renderLegend(cycleLen, periodLen, ovulationDay, activeKey) {
  const legend = document.getElementById("legend");
  legend.innerHTML = "";
  const geo = resolvePhaseGeometry(cycleLen, periodLen, ovulationDay);
  geo.forEach(ph => {
    const item = document.createElement("div");
    item.className = "legend-item" + (activeKey === ph.key ? " active" : "");
    item.innerHTML = `<span class="legend-dot" style="background:${ph.hex}"></span>${ph.label}`;
    item.addEventListener("mouseenter", () => {
      hoveredPhase = ph.key;
      update(true);
    });
    item.addEventListener("mouseleave", () => {
      hoveredPhase = null;
      update(true);
    });
    legend.appendChild(item);
  });
}

// ---------- Myth cards ----------
function renderMyths() {
  const grid = document.getElementById("mythGrid");
  grid.innerHTML = "";
  MYTHS.forEach(m => {
    const card = document.createElement("div");
    card.className = "myth-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.innerHTML = `
      <div class="myth-inner">
        <div class="myth-face myth-front">
          <span class="tag">${m.tag}</span>
          <span class="q">${m.q}</span>
          <span class="flip-hint">tap to flip ↻</span>
        </div>
        <div class="myth-face myth-back">
          <span class="tag">${m.tag2}</span>
          <span>${m.a}</span>
        </div>
      </div>
    `;
    const toggle = () => card.classList.toggle("flipped");
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
    grid.appendChild(card);
  });
}

// ---------- State + calculation ----------
let currentPhase = PHASES[0];

function getCurrentPhase() {
  return currentPhase;
}

function getInputs() {
  const lastPeriod = document.getElementById("lastPeriod").value;
  const cycleLenRaw = Number(document.getElementById("cycleLen").value) || 28;
  const periodLenRaw = Number(document.getElementById("periodLen").value) || 5;
  const cycleLen = Math.min(Math.max(cycleLenRaw, 15), 45);
  const periodLen = Math.min(Math.max(periodLenRaw, 1), 10);
  return { lastPeriod, cycleLen, periodLen };
}

function update(skipRecalc) {
  const { lastPeriod, cycleLen, periodLen } = getInputs();
  const ovulationDay = Math.max(cycleLen - 14, periodLen + 1);
  const today = new Date();
  const start = lastPeriod ? new Date(lastPeriod) : addDays(today, -12);

  const diffMs = today - start;
  const rawDay = Math.floor(diffMs / 86400000);
  const day = ((rawDay % cycleLen) + cycleLen) % cycleLen; // 0-indexed

  const geo = resolvePhaseGeometry(cycleLen, periodLen, ovulationDay);
  currentPhase = geo.find(ph => day >= ph.start && day < ph.start + ph.span) || geo[0];

  const cyclesElapsed = Math.floor(rawDay / cycleLen);
  const nextPeriod = addDays(start, (cyclesElapsed + 1) * cycleLen);
  const fertileStart = addDays(start, cyclesElapsed * cycleLen + Math.max(ovulationDay - 2, periodLen));
  const fertileEnd = addDays(fertileStart, 4);
  const daysToNext = Math.max(Math.ceil((nextPeriod - today) / 86400000), 0);

  const cycleDay = day + 1;
  const activeKey = hoveredPhase || currentPhase.key;

  // Wheel + legend
  renderWheel(cycleLen, periodLen, ovulationDay, cycleDay, activeKey);
  renderLegend(cycleLen, periodLen, ovulationDay, activeKey);
  document.getElementById("cycleDayNum").textContent = cycleDay;
  const activePhaseForTag = geo.find(p => p.key === activeKey) || currentPhase;
  document.getElementById("phaseNameTag").textContent = activePhaseForTag.label;
  document.getElementById("phaseNameTag").style.background = activePhaseForTag.hex + "22";
  document.getElementById("phaseNameTag").style.color = activePhaseForTag.hex;

  // Insight cards
  document.getElementById("insightPhase").textContent = currentPhase.label;
  document.getElementById("insightPhaseBlurb").textContent = currentPhase.blurb;
  document.getElementById("insightNext").textContent = fmt(nextPeriod);
  document.getElementById("insightNextDetail").textContent = `in ${daysToNext} day${daysToNext === 1 ? "" : "s"}`;
  document.getElementById("insightFertile").textContent = `${fmt(fertileStart)}–${fmt(fertileEnd)}`;
}

// ---------- Init ----------
function init() {
  const today = new Date();
  const defaultLastPeriod = addDays(today, -12).toISOString().slice(0, 10);
  const lastPeriodInput = document.getElementById("lastPeriod");
  lastPeriodInput.value = defaultLastPeriod;
  lastPeriodInput.max = today.toISOString().slice(0, 10);

  document.getElementById("lastPeriod").addEventListener("input", () => update());
  document.getElementById("cycleLen").addEventListener("input", () => update());
  document.getElementById("periodLen").addEventListener("input", () => update());

  document.getElementById("scrollToTracker").addEventListener("click", () => {
    document.getElementById("tracker").scrollIntoView({ behavior: "smooth" });
  });
  document.getElementById("scrollToMyths").addEventListener("click", () => {
    document.getElementById("myths").scrollIntoView({ behavior: "smooth" });
  });

  renderMyths();
  update();
}

document.addEventListener("DOMContentLoaded", init);
