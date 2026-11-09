/* =========================================================
   DATOS DEL NEGOCIO — cambia estos valores por los reales
   ========================================================= */
const CONFIG = {
  // Número con prefijo de país, sin espacios ni "+" (España: 34 + número)
  whatsapp: "34600000000",
  telefono: "600 000 000",
  direccion: "Calle Ejemplo 1, Ciudad",
  instagram: "https://www.instagram.com/leo_corizzo/",
  instagramTexto: "@leo_corizzo",
  // Fotos del carrusel: pon los archivos en la carpeta img/ y añádelos aquí.
  // Mientras "src" esté vacío se muestra un hueco de color con el texto.
  fotos: [
    { src: "", texto: "Balayage miel sobre castaño" },
    { src: "", texto: "Recogido de novia" },
    { src: "", texto: "Bob a la mandíbula" },
    { src: "", texto: "Ondas al agua" },
    { src: "", texto: "Degradado bajo" },
    { src: "", texto: "Trenzas de raíz" },
  ],
  segundosPorFoto: 4,
  // Horario. 0 = domingo, 1 = lunes … 6 = sábado. [] = cerrado
  horario: {
    1: [],
    2: [["10:00", "14:00"], ["16:30", "20:30"]],
    3: [["10:00", "14:00"], ["16:30", "20:30"]],
    4: [["10:00", "14:00"], ["16:30", "20:30"]],
    5: [["10:00", "14:00"], ["16:30", "20:30"]],
    6: [["09:30", "14:30"]],
    0: [],
  },
  diasReservables: 14, // cuántos días hacia delante se pueden elegir
};

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const DIAS_CORTO = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES_LARGO = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const toHHMM = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const tramosDe = (d) => CONFIG.horario[d.getDay()] || [];
const sameDay = (a, b) => a.toDateString() === b.toDateString();
const waLink = (txt) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(txt)}`;

document.documentElement.classList.remove("no-js");

const toastEl = $("#toast");
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.hidden = true), 2200);
}
async function copyText(text, okMsg) {
  try {
    await navigator.clipboard.writeText(text);
    toast(okMsg);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch {}
    ta.remove();
    toast(ok ? okMsg : "No se pudo copiar. Selecciona el texto y cópialo a mano.");
  }
}

/* ---------- datos de contacto ---------- */
$$("[data-phone-text]").forEach((el) => (el.textContent = CONFIG.telefono));
$$("[data-address-text]").forEach((el) => (el.textContent = CONFIG.direccion));
$$("[data-instagram-link]").forEach((a) => (a.href = CONFIG.instagram));
$$("[data-instagram-text]").forEach((el) => (el.textContent = CONFIG.instagramTexto));
$$("[data-whatsapp-link]").forEach((a) => (a.href = waLink("¡Hola Leo! Me gustaría pedir cita.")));
$$("[data-map-link]").forEach((a) => (a.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.direccion)));
$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
$$("[data-copy-phone]").forEach((b) => b.addEventListener("click", () => copyText(CONFIG.telefono, "Teléfono copiado")));

/* ---------- cabecera y menú ---------- */
const header = $(".header");
const onScroll = () => header.classList.toggle("is-scrolled", scrollY > 8);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

const toggle = $("#nav-toggle");
const nav = $("#nav");
const setMenu = (open) => {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  nav.classList.toggle("is-open", open);
};
toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
$$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

const navLinks = $$('a[href^="#"]:not(.btn)', nav);
const spy = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle("is-active", a.hash === "#" + en.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
navLinks.forEach((a) => { const s = $(a.hash); if (s) spy.observe(s); });

/* ---------- abierto / cerrado ---------- */
function estado(now = new Date()) {
  const mins = now.getHours() * 60 + now.getMinutes();
  const hoy = tramosDe(now);
  const abierto = hoy.find(([a, b]) => mins >= toMin(a) && mins < toMin(b));
  if (abierto) {
    const resto = hoy.find(([a]) => toMin(a) > mins);
    return { open: true, hasta: abierto[1], despues: resto };
  }
  for (let i = 0; i < 8; i++) {
    const d = new Date(now); d.setDate(now.getDate() + i);
    const t = tramosDe(d).find(([a]) => i > 0 || toMin(a) > mins);
    if (t) return { open: false, dia: i, fecha: d, a: t[0] };
  }
  return { open: false };
}

function pintarEstado() {
  const e = estado();
  const big = $("#hero-next"), sub = $("#hero-sub"), st = $("#hero-status"), hs = $("#hours-status");
  [st, hs].forEach((el) => { el.classList.toggle("is-open", e.open); el.classList.toggle("is-closed", !e.open); el.textContent = e.open ? "Abierto" : "Cerrado"; });
  if (e.open) {
    big.textContent = `Abierto hasta las ${e.hasta}`;
    sub.textContent = e.despues ? `Por la tarde, de ${e.despues[0]} a ${e.despues[1]}.` : "Último tramo del día.";
  } else if (e.a) {
    const cuando = e.dia === 0 ? "hoy" : e.dia === 1 ? "mañana" : `el ${DIAS[e.fecha.getDay()]}`;
    big.textContent = `Abrimos ${cuando} a las ${e.a}`;
    sub.textContent = "Puedes dejar tu cita pedida ya por WhatsApp.";
  }
}

function pintarHorario() {
  const orden = [1, 2, 3, 4, 5, 6, 0];
  const hoy = new Date().getDay();
  $("#hours-list").innerHTML = orden.map((d) => {
    const t = CONFIG.horario[d] || [];
    const txt = t.length ? t.map(([a, b]) => `${a}–${b}`).join(" · ") : "Cerrado";
    const nombre = DIAS[d][0].toUpperCase() + DIAS[d].slice(1);
    return `<div class="${d === hoy ? "is-today" : ""}"><dt>${nombre}${d === hoy ? " · hoy" : ""}</dt><dd>${txt}</dd></div>`;
  }).join("");
}
pintarEstado();
pintarHorario();
setInterval(pintarEstado, 60000);

/* ---------- filtro de servicios ---------- */
const chips = $$(".chips .chip");
const items = $$("#menu li");
chips.forEach((c) => c.addEventListener("click", () => {
  chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
  items.forEach((li) => (li.hidden = !(c.dataset.filter === "all" || li.dataset.cat === c.dataset.filter)));
}));

/* ---------- reserva ---------- */
const form = $("#booking-form");
const fServicio = $("#f-servicio");
const fDias = $("#f-dias");
const fHoras = $("#f-horas");
const fPreview = $("#f-preview");
const fError = $("#f-error");
const fSend = $("#f-send");
const sel = { dia: null, hora: null };

items.forEach((li) => {
  const o = document.createElement("option");
  o.textContent = $("h3", li).textContent;
  fServicio.appendChild(o);
});

function horasDe(d) {
  const now = new Date();
  const minNow = sameDay(d, now) ? now.getHours() * 60 + now.getMinutes() + 30 : -1;
  const out = [];
  tramosDe(d).forEach(([a, b]) => {
    for (let m = toMin(a); m <= toMin(b) - 45; m += 60) if (m > minNow) out.push(m);
  });
  return out;
}

function pintarDias() {
  const hoy = new Date(); hoy.setHours(12, 0, 0, 0);
  const dias = [];
  for (let i = 0; i < CONFIG.diasReservables; i++) {
    const d = new Date(hoy); d.setDate(hoy.getDate() + i);
    if (horasDe(d).length) dias.push(d);
  }
  fDias.innerHTML = "";
  dias.forEach((d) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "slot";
    b.setAttribute("aria-pressed", "false");
    const diff = Math.round((d - hoy) / 864e5);
    const etiqueta = diff === 0 ? "hoy" : diff === 1 ? "mañana" : DIAS_CORTO[d.getDay()];
    b.innerHTML = `<small>${etiqueta}</small>${d.getDate()} ${MESES[d.getMonth()]}`;
    b.setAttribute("aria-label", `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES_LARGO[d.getMonth()]}`);
    b.addEventListener("click", () => {
      sel.dia = d; sel.hora = null;
      $$(".slot", fDias).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      fDias.classList.remove("is-invalid");
      pintarHoras();
      actualizar();
    });
    fDias.appendChild(b);
  });
}

function pintarHoras() {
  fHoras.innerHTML = "";
  if (!sel.dia) { fHoras.innerHTML = '<p class="hint">Elige primero un día.</p>'; return; }
  const all = [...horasDe(sel.dia).map(toHHMM), "Me da igual"];
  all.forEach((h) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "slot slot--time";
    b.textContent = h;
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => {
      sel.hora = h;
      $$(".slot", fHoras).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      fHoras.classList.remove("is-invalid");
      actualizar();
    });
    fHoras.appendChild(b);
  });
}

function mensaje() {
  const nombre = $("#f-nombre").value.trim();
  const servicio = fServicio.value;
  const notas = $("#f-notas").value.trim();
  const partes = ["¡Hola Leo!"];
  partes.push(nombre ? ` Soy ${nombre}.` : "");
  partes.push(` Me gustaría pedir cita${servicio ? ` para *${servicio}*` : ""}`);
  if (sel.dia) partes.push(` el ${DIAS[sel.dia.getDay()]} ${sel.dia.getDate()} de ${MESES_LARGO[sel.dia.getMonth()]}`);
  if (sel.hora) partes.push(sel.hora === "Me da igual" ? ", a cualquier hora" : ` a las ${sel.hora}`);
  partes.push(".");
  let txt = partes.join("");
  if (notas) txt += `\n\n${notas}`;
  return txt;
}

function faltan() {
  const f = [];
  if (!$("#f-nombre").value.trim()) f.push(["nombre", $("#f-nombre")]);
  if (!fServicio.value) f.push(["servicio", fServicio]);
  if (!sel.dia) f.push(["día", fDias]);
  if (!sel.hora) f.push(["hora", fHoras]);
  return f;
}

function actualizar() {
  const txt = mensaje();
  fPreview.textContent = txt;
  fSend.href = waLink(txt);
  $("#f-nombre").removeAttribute("aria-invalid");
  if (fServicio.value) fServicio.removeAttribute("aria-invalid");
  if (!fError.hidden && !faltan().length) fError.hidden = true;
}

function validar() {
  const f = faltan();
  $("#f-nombre").toggleAttribute("aria-invalid", !$("#f-nombre").value.trim());
  fServicio.toggleAttribute("aria-invalid", !fServicio.value);
  fDias.classList.toggle("is-invalid", !sel.dia);
  fHoras.classList.toggle("is-invalid", !sel.hora);
  if (f.length) {
    fError.textContent = `Falta: ${f.map((x) => x[0]).join(", ")}.`;
    fError.hidden = false;
    const el = f[0][1];
    (el.matches("input,select") ? el : $(".slot", el) || el).focus();
    return false;
  }
  fError.hidden = true;
  return true;
}

form.addEventListener("input", actualizar);
form.addEventListener("submit", (e) => e.preventDefault());
fSend.addEventListener("click", (e) => { if (!validar()) e.preventDefault(); });
$("#f-copy").addEventListener("click", () => { if (validar()) copyText(mensaje(), "Mensaje copiado"); });

// Preseleccionar servicio al pulsar uno de la carta
items.forEach((li) => {
  li.style.cursor = "pointer";
  li.title = "Reservar este servicio";
  li.addEventListener("click", () => {
    fServicio.value = $("h3", li).textContent;
    actualizar();
    $("#reservar").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
});

pintarDias();
pintarHoras();
actualizar();

/* ---------- carrusel de fotos ---------- */
(function carousel() {
  const track = $("#carousel-track");
  if (!track) return;
  const dots = $("#carousel-dots");
  const playBtn = $("#carousel-play");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  CONFIG.fotos.forEach((f, i) => {
    const fig = document.createElement("figure");
    fig.className = "slide" + (f.src ? "" : " slide--empty");
    fig.dataset.tone = String((i % 6) + 1);
    fig.setAttribute("aria-roledescription", "foto");
    fig.setAttribute("aria-label", `${i + 1} de ${CONFIG.fotos.length}`);
    if (f.src) {
      const img = new Image();
      img.src = f.src;
      img.alt = f.texto || "Trabajo de Leo";
      img.loading = "lazy";
      img.decoding = "async";
      fig.appendChild(img);
    }
    if (f.texto) {
      const c = document.createElement("figcaption");
      c.textContent = f.texto;
      fig.appendChild(c);
    }
    track.appendChild(fig);
    const d = document.createElement("button");
    d.type = "button";
    d.setAttribute("aria-label", `Ir a la foto ${i + 1}`);
    d.addEventListener("click", () => { go(i); stop(); });
    dots.appendChild(d);
  });

  const slides = $$(".slide", track);
  const step = () => (slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth);
  const perView = () => Math.max(1, Math.round(track.clientWidth / step()));
  const maxIndex = () => Math.max(0, slides.length - perView());
  let idx = 0;
  function go(i) {
    idx = i > maxIndex() ? 0 : i < 0 ? maxIndex() : i;
    track.scrollTo({ left: slides[idx].offsetLeft - slides[0].offsetLeft, behavior: reduce ? "auto" : "smooth" });
  }
  function syncDots() {
    idx = Math.min(Math.round(track.scrollLeft / step()), maxIndex());
    $$("button", dots).forEach((d, j) => d.setAttribute("aria-current", String(j >= idx && j < idx + perView())));
  }
  track.addEventListener("scroll", () => requestAnimationFrame(syncDots), { passive: true });
  addEventListener("resize", syncDots);
  syncDots();

  let timer = null, paused = reduce, hover = false;
  const tick = () => { if (!hover && !document.hidden) go(idx + 1); };
  function render() {
    playBtn.textContent = paused ? "▶" : "❚❚";
    playBtn.setAttribute("aria-label", paused ? "Reanudar el pase de fotos" : "Pausar el pase de fotos");
  }
  function start() { clearInterval(timer); if (!paused) timer = setInterval(tick, CONFIG.segundosPorFoto * 1000); render(); }
  function stop() { paused = true; start(); }
  playBtn.addEventListener("click", () => { paused = !paused; start(); });
  $("#carousel-prev").addEventListener("click", () => { go(idx - 1); stop(); });
  $("#carousel-next").addEventListener("click", () => { go(idx + 1); stop(); });
  const car = $("#carousel");
  car.addEventListener("pointerenter", () => (hover = true));
  car.addEventListener("pointerleave", () => (hover = false));
  car.addEventListener("focusin", () => (hover = true));
  car.addEventListener("focusout", () => (hover = false));
  track.addEventListener("touchstart", stop, { passive: true });
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); stop(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); stop(); }
  });
  start();
})();

/* ---------- mechones animados del portada ---------- */
(function strands() {
  const cv = $("#strands");
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let w = 0, h = 0, colors = {}, running = true, raf = 0;
  const N = 38;
  const seeds = Array.from({ length: N }, (_, i) => ({
    x: i / (N - 1), ph: Math.random() * Math.PI * 2, sp: 0.5 + Math.random() * 0.6,
    lw: 0.8 + Math.random() * 1.8, al: 0.25 + Math.random() * 0.55, amp: 30 + Math.random() * 60,
  }));
  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    colors = { a: cs.getPropertyValue("--accent").trim(), b: cs.getPropertyValue("--brass").trim() };
  }
  function resize() {
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(performance.now());
  }
  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, colors.b); g.addColorStop(1, colors.a);
    ctx.strokeStyle = g;
    const time = reduce.matches ? 0 : t / 1000;
    seeds.forEach((s) => {
      const x0 = w * (0.1 + s.x * 0.95);
      const sw = Math.sin(time * s.sp + s.ph);
      const sw2 = Math.cos(time * s.sp * 0.7 + s.ph);
      ctx.globalAlpha = s.al;
      ctx.lineWidth = s.lw;
      ctx.beginPath();
      ctx.moveTo(x0 - w * 0.05, -10);
      ctx.bezierCurveTo(
        x0 + sw * s.amp, h * 0.3,
        x0 - w * 0.12 + sw2 * s.amp * 1.4, h * 0.65,
        x0 - w * 0.2 + sw * s.amp * 0.6, h + 10
      );
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }
  function loop(t) {
    draw(t);
    if (running && !reduce.matches) raf = requestAnimationFrame(loop);
  }
  function start() { cancelAnimationFrame(raf); if (running && !reduce.matches) raf = requestAnimationFrame(loop); else draw(0); }
  readColors();
  new ResizeObserver(resize).observe(cv);
  new IntersectionObserver(([e]) => { running = e.isIntersecting && !document.hidden; start(); }).observe(cv);
  document.addEventListener("visibilitychange", () => { running = !document.hidden; start(); });
  reduce.addEventListener?.("change", start);
  const recolor = () => { readColors(); draw(performance.now()); };
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", recolor);
  new MutationObserver(recolor).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
})();
