document.addEventListener("DOMContentLoaded", () => {
  cargar("/public/partials/header.html", "header", () => {
    activarMenuMovil();
    activarHeaderScroll();
    activarLinkActivo();
    activarBackToTop();
  });

  cargar("/public/partials/footer.html", "footer", () => {
    ponerAnioActual();
  });
});

function cargar(url, targetId, onDone) {
  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error(url + " -> " + r.status);
      return r.text();
    })
    .then(html => {
      const host = document.getElementById(targetId);
      if (!host) throw new Error("Falta <div id='" + targetId + "'></div>");
      host.innerHTML = html;
      if (onDone) onDone();
    })
    .catch(err => console.error("Error cargando:", err));
}

// ===== MENÚ MÓVIL =====
function activarMenuMovil() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");
  const headerWrap = document.getElementById("header");

  console.log("[menu] toggle:", !!toggle, "nav:", !!nav);
  if (!toggle || !nav) return;

  function setOpen(isOpen) {
    nav.classList.toggle("active", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    if (headerWrap) headerWrap.classList.toggle("menu-open", isOpen);
  }

  setOpen(false);

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    setOpen(!nav.classList.contains("active"));
  });

  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

// ===== HEADER SCROLL =====
function activarHeaderScroll() {
  const headerWrap = document.getElementById("header");
  if (!headerWrap) return;

  const SHOW_AT = 60;

  function update() {
    if (headerWrap.classList.contains("menu-open")) return;
    const y = window.scrollY || 0;

    headerWrap.classList.remove("is-top", "is-scrolled");
    if (y < SHOW_AT) headerWrap.classList.add("is-top");
    else headerWrap.classList.add("is-scrolled");
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
}

// ===== LINK ACTIVO =====
function activarLinkActivo() {
  const nav = document.querySelector(".main-nav");
  if (!nav) return;

  const links = nav.querySelectorAll("a[href]");
  if (!links.length) return;

  let current = window.location.pathname.split("/").pop();
  current = decodeURIComponent(current || "");
  if (!current || current === "/") current = "index.html";

  links.forEach(a => a.classList.remove("active"));

  links.forEach(a => {
    const href = a.getAttribute("href") || "";
    const target = href.split("#")[0].split("?")[0].split("/").pop();
    const normalized = (!target || target === "/") ? "index.html" : target;
    if (normalized === current) a.classList.add("active");
  });
}

// ===== AÑO FOOTER =====
function ponerAnioActual() {
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
}

// ===== BACK TO TOP =====
function activarBackToTop() {
  const backToTop = document.getElementById("backToTop");
  if (!backToTop) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) backToTop.classList.add("show");
    else backToTop.classList.remove("show");
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
