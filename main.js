// Footer clock location
const HOME = { city: "Islamabad", tz: "Asia/Karachi" };
const STEPS = [
  { k: "Education · 2021 – 2025", t: "FAST NUCES", d: "Bachelor's in Computer Science at FAST National University of Computer and Emerging Sciences, Islamabad.", tags: ["Software Engineering", "Generative AI", "Data Structures", "MLOps", "Operating Systems", "Computer Networks"], icon: '<svg viewBox="0 0 100 100"><path d="M10 40 L50 22 L90 40 L50 58Z"/><path d="M26 48 V66 C26 72 74 72 74 66 V48 M90 40 V62"/></svg>' },
  { k: "Achievement", t: "100% Merit Scholarship", d: "Awarded a full merit scholarship for HSSC at Punjab College of Science, Blue Area, Islamabad.", tags: [], icon: '<svg viewBox="0 0 100 100"><circle cx="50" cy="40" r="22"/><path d="M38 58 L32 88 L50 78 L68 88 L62 58"/><path d="M42 40 L48 46 L60 34"/></svg>' },
  { k: "Organisation · 2022 – 2025", t: "FAST Literary Society", d: "Started as PR Manager, then served as Information Secretary.", tags: [], icon: '<svg viewBox="0 0 100 100"><path d="M18 22 H62 C70 22 74 26 74 34 V80 H30 C22 80 18 76 18 68Z"/><path d="M30 38 H62 M30 50 H62 M30 62 H50"/><path d="M74 34 H84 V70"/></svg>' },
  { k: "Languages & interests", t: "Four languages", d: "English (full professional), Urdu and Shina (native), Turkish (elementary). Outside work: language learning, geopolitics and hiking.", tags: ["Language Learning", "Geopolitics", "Hiking"], icon: '<svg viewBox="0 0 100 100"><path d="M10 82 L38 34 L52 56 L64 40 L90 82Z"/><path d="M32 44 L38 34 L44 44"/><circle cx="74" cy="22" r="8"/></svg>' },
];

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---- Header state + menu ----
const header = $(".site-header");
const menu = $("#menu");
const openBtn = $("#menuOpen");
function setMenu(open) {
  menu.classList.toggle("open", open);
  menu.setAttribute("aria-hidden", String(!open));
  openBtn.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
}
openBtn.addEventListener("click", () => setMenu(true));
$("#menuClose").addEventListener("click", () => setMenu(false));
$$("#menu a").forEach(a => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

// ---- Scroll-driven effects: header, marquee words, sticker parallax ----
const rows = $$(".hero-words .row");
const stage = $("#stage");
const stickers = $$(".sticker");
let marquee = 0;
let lastY = scrollY;
let velocity = 0;

function frame() {
  const y = scrollY;
  header.classList.toggle("scrolled", y > 20);
  velocity += ((y - lastY) - velocity) * 0.15;
  lastY = y;

  if (!reduced) {
    // Words drift constantly; scrolling speeds them up.
    marquee += 0.35 + Math.abs(velocity) * 0.25;
    rows.forEach(row => {
      const dir = Number(row.dataset.dir);
      const w = row.firstElementChild.offsetWidth;
      const x = ((marquee % w) + w) % w;
      row.style.transform = `translateX(${dir < 0 ? -x : x - w}px)`;
    });

    const r = stage.getBoundingClientRect();
    const off = r.top + r.height / 2 - innerHeight / 2;
    stickers.forEach(s => { s.style.transform = `translateY(${(off * Number(s.dataset.depth)).toFixed(1)}px)`; });
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---- Reveal on scroll (each kind of element gets its own entrance, no fades) + count-up ----
const FX = [
  [".hero-hi", "none"],                  // pops in with the tags
  [".h2, .hero-title, h2.reveal", "squeeze"],
  [".hero-ctas, .stat", "rubber"],
  [".hero-sub, .lede, .about-copy", "wipe"],
  [".pr", "squeeze"],
  [".cert, .xp-card, .proc-card, .vs-card, .project.featured", "flip"],
  [".engine, .project", "stretch"],
];
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    $$(".count", e.target).forEach(countUp);
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });
$$(".reveal").forEach((el, i) => {
  const fx = (FX.find(([sel]) => el.matches(sel)) || [, "wipe"])[1];
  el.dataset.fx = fx;
  if (fx === "stretch") {
    const r = el.getBoundingClientRect();
    const cx = (r.left + r.right) / 2 / innerWidth;
    el.style.setProperty("--origin", cx < 0.45 ? "0% 50%" : cx > 0.55 ? "100% 50%" : "50% 50%");
  }
  if (fx !== "none") el.style.animationDelay = `${(i % 4) * 40}ms`;
  io.observe(el);
});
$$(".tag").forEach(el => io.observe(el));
// Once an entrance finishes, drop it so hover/tilt transforms work normally again
document.addEventListener("animationend", e => {
  const el = e.target;
  if (!e.animationName.startsWith("fx-") || !el.classList.contains("reveal")) return;
  el.classList.add("done");
  el.style.animationDelay = "";
});

function countUp(el) {
  const to = Number(el.dataset.to);
  if (reduced) { el.textContent = to.toLocaleString(); return; }
  const start = performance.now();
  const dur = 1600;
  (function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - t, 4))).toLocaleString();
    if (t < 1) requestAnimationFrame(tick);
  })(start);
}

// ---- Wavy tech tiles: stagger so they form a travelling wave ----
$$(".tile").forEach((t, i) => { t.style.animationDelay = `${-i * 0.28}s`; });

// ---- 3D tilt on cards ----
if (!reduced && matchMedia("(hover: hover)").matches) {
  $$(".tilt").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
}

// ---- Star shapes (process burst + versus badge) ----
function star(points, outer, inner, c = 50) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = (Math.PI * i) / points - Math.PI / 2;
    pts.push(`${(c + r * Math.cos(a)).toFixed(2)},${(c + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}
$("#burstPoly").setAttribute("points", star(28, 98, 74, 100));
$(".vs-badge polygon").setAttribute("points", star(9, 50, 38));

// ---- Process tabs (auto-advance) ----
const tabs = $$(".proc-tabs button");
const body = $(".proc-body");
const bar = $("#procBar");
let step = 0;
let timer;
function showStep(i) {
  step = i;
  tabs.forEach((b, j) => { b.classList.toggle("active", j === i); b.setAttribute("aria-selected", String(j === i)); });
  $("#procKicker").textContent = STEPS[i].k;
  $("#procTitle").textContent = STEPS[i].t;
  $("#procText").textContent = STEPS[i].d;
  $("#procTags").innerHTML = STEPS[i].tags.map(t => `<span>${t}</span>`).join("");
  $("#procIco").innerHTML = STEPS[i].icon;
  body.classList.remove("swap"); void body.offsetWidth; body.classList.add("swap");
  bar.style.transition = "none"; bar.style.width = "0";
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (!reduced) { bar.style.transition = "width 5s linear"; bar.style.width = "100%"; }
  }));
  clearTimeout(timer);
  if (!reduced) timer = setTimeout(() => showStep((step + 1) % STEPS.length), 5000);
}
tabs.forEach(b => b.addEventListener("click", () => showStep(Number(b.dataset.i))));
showStep(0);

// ---- FAQ accordion (one open at a time) ----
$$(".qa button").forEach(btn => {
  btn.setAttribute("aria-expanded", "false");
  btn.addEventListener("click", () => {
    const qa = btn.parentElement;
    const open = !qa.classList.contains("open");
    $$(".qa").forEach(q => { q.classList.remove("open"); $("button", q).setAttribute("aria-expanded", "false"); });
    qa.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
  });
});

// ---- Footer clock ----
const clock = $("#clock");
$("#clockCity").textContent = `${HOME.city} (PKT)`;
function tickClock() {
  clock.textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: HOME.tz });
}
tickClock();
setInterval(tickClock, 15000);
$("#year").textContent = new Date().getFullYear();

// ---- Lean by position: left half leans left, right half leans right, centre stands upright ----
const LEANERS = ".tag, .hero-hi, .sticker, .cert-badge, .chips span, .thumb-art, .xp-item, .pr-ico";
function applyLean() {
  const w = innerWidth;
  $$(LEANERS).forEach(el => {
    if (el.closest(".menu")) return;
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    const cx = (r.left + r.right) / 2 / w;
    const dir = cx < 0.42 ? -1 : cx > 0.58 ? 1 : 0;
    el.style.setProperty("--dir", dir);
    el.classList.toggle("is-center", dir === 0 && (el.matches(".tag, .hero-hi")));
  });
}
let leanTimer;
addEventListener("resize", () => { clearTimeout(leanTimer); leanTimer = setTimeout(applyLean, 150); });
document.fonts.ready.then(applyLean);
applyLean();

// ---- Hover sway: while hovered, slowly lean right then left; ease back to the resting lean on leave ----
const SWAY = [
  [".tag, .hero-hi, .sticker, .cert-badge, .chips span, .ptags span, .btn, .menu-pill, .tile, .xp-item, .xp-num, .xp-date, .portrait, .engine, .cert, .stat, .proc-tabs button"],
  [".project", ".thumb-art"],
  [".pr", ".pr-ico"],
];
if (!reduced) {
  SWAY.forEach(([trigger, target]) => $$(trigger).forEach(t => {
    const el = target ? $(target, t) : t;
    if (!el) return;
    t.addEventListener("pointerenter", () => el.classList.add("swaying"));
    t.addEventListener("pointerleave", () => {
      const from = getComputedStyle(el).rotate;
      el.classList.remove("swaying");
      const to = getComputedStyle(el).rotate;
      if (from !== to) el.animate([{ rotate: from === "none" ? "0deg" : from }, { rotate: to === "none" ? "0deg" : to }], { duration: 500, easing: "cubic-bezier(.34,1.56,.64,1)" });
    });
  }));
}
