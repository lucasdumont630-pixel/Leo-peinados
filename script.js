/* =========================================================
   DATOS DEL NEGOCIO — cambia estos valores por los reales
   ========================================================= */
const CONFIG = {
  // Número con prefijo de país, sin espacios ni "+" (ej. España: 34600000000)
  whatsapp: "34600000000",
  telefono: "600 000 000",
  direccion: "Calle Ejemplo 1, Ciudad",
  instagram: "https://instagram.com/",
  // Horario para el indicador "Abierto ahora". 0 = domingo ... 6 = sábado
  horario: {
    0: [],
    1: [],
    2: [["10:00", "14:00"], ["16:30", "20:30"]],
    3: [["10:00", "14:00"], ["16:30", "20:30"]],
    4: [["10:00", "14:00"], ["16:30", "20:30"]],
    5: [["10:00", "14:00"], ["16:30", "20:30"]],
    6: [["09:30", "14:30"]],
  },
};

document.documentElement.classList.remove("no-js");

/* Rellenar datos de contacto */
const telHref = "tel:" + CONFIG.telefono.replace(/\s+/g, "");
const waBase = "https://wa.me/" + CONFIG.whatsapp;
document.querySelectorAll("[data-phone-link]").forEach((a) => (a.href = telHref));
document.querySelectorAll("[data-phone-text]").forEach((el) => (el.textContent = CONFIG.telefono));
document.querySelectorAll("[data-address-text]").forEach((el) => (el.textContent = CONFIG.direccion));
document.querySelectorAll("[data-instagram-link]").forEach((a) => (a.href = CONFIG.instagram));
document.querySelectorAll("[data-whatsapp-link]").forEach(
  (a) => (a.href = waBase + "?text=" + encodeURIComponent("¡Hola Leo! Me gustaría pedir cita."))
);
document.querySelectorAll("[data-map-link]").forEach(
  (a) => (a.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.direccion))
);
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* Cabecera con sombra al hacer scroll */
const header = document.querySelector(".header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* Menú móvil */
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("nav");
const setMenu = (open) => {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  nav.classList.toggle("is-open", open);
};
toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

/* Enlace activo según la sección visible */
const links = [...nav.querySelectorAll('a[href^="#"]:not(.btn)')];
const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => spy.observe(s));

/* Animación al aparecer */
const revealer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => revealer.observe(el));

/* Filtro de servicios */
const tabs = document.querySelectorAll(".tabs [data-filter]");
const services = document.querySelectorAll(".service");
tabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
    const f = tab.dataset.filter;
    services.forEach((s) => {
      const show = f === "all" || s.dataset.cat === f;
      s.classList.toggle("is-hidden", !show);
      if (show) s.classList.add("is-visible");
    });
  })
);

/* Indicador "Abierto ahora" */
const statusEl = document.querySelector("[data-open-status]");
if (statusEl) {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const toMin = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const tramos = CONFIG.horario[now.getDay()] || [];
  const abierto = tramos.find(([a, b]) => mins >= toMin(a) && mins < toMin(b));
  if (abierto) {
    statusEl.textContent = `Abierto ahora · cierra a las ${abierto[1]}`;
    statusEl.classList.add("is-open");
  } else {
    const siguiente = tramos.find(([a]) => toMin(a) > mins);
    statusEl.textContent = siguiente ? `Cerrado ahora · abre a las ${siguiente[0]}` : "Cerrado ahora";
    statusEl.classList.add("is-closed");
  }
}

/* Formulario de reserva → WhatsApp */
const form = document.getElementById("booking-form");
const fecha = form.querySelector('[name="fecha"]');
fecha.min = new Date().toISOString().slice(0, 10);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const error = form.querySelector(".form__error");
  const required = [...form.querySelectorAll("[required]")];
  let ok = true;
  required.forEach((field) => {
    const valid = field.value.trim() !== "";
    field.setAttribute("aria-invalid", String(!valid));
    if (!valid) ok = false;
  });
  error.hidden = ok;
  if (!ok) {
    required.find((f) => f.getAttribute("aria-invalid") === "true").focus();
    return;
  }

  const d = Object.fromEntries(new FormData(form));
  const fechaTxt = new Date(d.fecha + "T12:00").toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  let msg = `¡Hola Leo! Soy ${d.nombre.trim()}. Me gustaría pedir cita para *${d.servicio}* el ${fechaTxt} (${d.franja.toLowerCase()}).`;
  if (d.comentarios.trim()) msg += `\n\n${d.comentarios.trim()}`;
  window.open(waBase + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
});
