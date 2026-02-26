/**
 * ==========================================================
 * MAIN.JS – SaludAnimalCasablanca
 * ----------------------------------------------------------
 * - Carga dinámica del header y footer (fetch)
 * - Menú móvil
 * - Link activo
 * - Header scroll (top / scrolled)
 * - Año automático en footer
 * - Botón volver arriba
 * - Efecto PawFriends (hover trapecio 3 piezas)
 * ==========================================================
 */

document.addEventListener("DOMContentLoaded", () => {

  // ===== CARGAR HEADER =====
  cargar("partials/header.html", "header", () => {
    activarMenuMovil();
    activarHeaderScroll();
    activarLinkActivo();
    activarBackToTop();
    activarPawHover(); // ✅ EFECTO PAWFRIENDS
  });

  // ===== CARGAR FOOTER =====
  cargar("partials/footer.html", "footer", () => {
    ponerAnioActual();
  });

});


// ==========================================================
// FETCH HELPER
// ==========================================================
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
      if (typeof onDone === "function") onDone();
    })
    .catch(err => console.error("Error cargando:", err));
}


// ==========================================================
// EFECTO PAWFRIENDS (3 piezas) – inserta .pf-hover dentro de cada <a>
// ==========================================================
function activarPawHover() {
  const nav = document.querySelector("nav.main-nav#mainNav");
  if (!nav) {
    console.warn("[pawhover] #mainNav no existe (aún).");
    return;
  }

  // ✅ Evita ejecutar 2 veces en el mismo header inyectado
  if (nav.dataset.pawBound === "1") {
    console.log("[pawhover] ya estaba activado (skip)");
    return;
  }
  nav.dataset.pawBound = "1";

  const links = nav.querySelectorAll("ul > li > a");
  console.log("[pawhover] links:", links.length);

  links.forEach(a => {
    // ✅ Limpieza: si por lo que sea hubiera más de uno, deja solo 1
    const hovers = a.querySelectorAll(":scope > .pf-hover");
    if (hovers.length > 1) {
      for (let i = 1; i < hovers.length; i++) hovers[i].remove();
    }

    // Inserta solo si no existe
    if (!a.querySelector(":scope > .pf-hover")) {
      const hover = document.createElement("span");
      hover.className = "pf-hover";
      hover.setAttribute("aria-hidden", "true");

      hover.innerHTML = `
        <svg class="pf-hover-left" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="-0.5 -0.5 11 29">
          <path d="M2 0C0.9 0 0 0.9 0 2l2 23.8c0 1.1 0.9 2 2 2h3.9V0H2z"></path>
        </svg>
        <span class="pf-hover-middle"></span>
        <svg class="pf-hover-right" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="-0.5 -0.5 11 29">
          <path d="M5.9 0c1.1 0 2 0.9 2 2L5 25.8c-0.2 1.6-1.1 1.9-3 2H0V0H5.9"></path>
        </svg>
      `;

      a.insertBefore(hover, a.firstChild);
    }

    // Texto arriba (siempre)
    const textSpan = a.querySelector(":scope > span");
    if (textSpan) textSpan.classList.add("pf-text");
  });
}



// ==========================================================
// MENÚ MÓVIL
// ==========================================================
function activarMenuMovil() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");
  const headerWrap = document.getElementById("header");

  console.log("[menu] toggle:", !!toggle, "nav:", !!nav);
  if (!toggle || !nav) return;

  // ✅ Evita duplicar listeners si se llama más de una vez
  if (toggle.dataset.bound === "1") return;
  toggle.dataset.bound = "1";

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


// ==========================================================
// HEADER SCROLL (2 estados: is-top / is-scrolled)
// ==========================================================
function activarHeaderScroll() {
  const headerWrap = document.getElementById("header");
  if (!headerWrap) return;

  const STICKY_AT = 800; // ✅ aparece a partir de 500px
  const ANIM_MS = 260;   // debe casar con el CSS (~.25s)

  if (headerWrap.dataset.scrollBound === "1") return;
  headerWrap.dataset.scrollBound = "1";

  let stickyOn = false;
  let t = null;

  function setSticky(on) {
    if (on === stickyOn) return;
    stickyOn = on;

    clearTimeout(t);

    if (on) {
      // Activa sticky y en el siguiente frame lo “muestra” (para animar)
      headerWrap.classList.add("is-sticky");
      requestAnimationFrame(() => {
        headerWrap.classList.add("is-sticky-show");
      });
    } else {
      // Oculta sticky y al terminar animación vuelve a modo normal (absolute)
      headerWrap.classList.remove("is-sticky-show");
      t = setTimeout(() => {
        headerWrap.classList.remove("is-sticky");
      }, ANIM_MS);
    }
  }

  function update() {
    if (headerWrap.classList.contains("menu-open")) return;

    const y = window.scrollY || 0;

    if (y >= STICKY_AT) setSticky(true);
    else setSticky(false);
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
}


// ==========================================================
// LINK ACTIVO (marca el <a> que coincide con la página actual)
// ==========================================================
function activarLinkActivo() {
  const nav = document.querySelector("nav.main-nav#mainNav");
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


// ==========================================================
// AÑO AUTOMÁTICO FOOTER
// ==========================================================
function ponerAnioActual() {
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = String(new Date().getFullYear());
}


// ==========================================================
// BACK TO TOP (robusto: funciona aunque el footer se cargue por JS)
// ==========================================================
function activarBackToTop() {
  const backToTop = document.getElementById("backToTop");
  if (!backToTop) return false;

  // Evita duplicar listeners
  if (backToTop.dataset.bound === "1") return true;
  backToTop.dataset.bound = "1";

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 300) backToTop.classList.add("show");
      else backToTop.classList.remove("show");
    },
    { passive: true }
  );

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  return true;
}

// Espera a que exista (por si el footer se inyecta)
document.addEventListener("DOMContentLoaded", () => {
  if (activarBackToTop()) return;

  const mo = new MutationObserver(() => {
    if (activarBackToTop()) mo.disconnect();
  });

  mo.observe(document.body, { childList: true, subtree: true });
});
