/**
 * ==========================================================
 * MAIN.JS – SaludAnimalCasablanca (MENÚ MÓVIL DEDICADO)
 * ----------------------------------------------------------
 * - Carga dinámica del header y footer (fetch)
 * - Menú móvil DEDICADO (overlay + panel) ✅ estable
 * - Link activo (desktop + móvil)
 * - Header scroll (top / scrolled) ✅ no se queda fijo
 * - Año automático en footer
 * - Botón volver arriba
 * - Efecto PawFriends (hover trapecio 3 piezas) (desktop)
 * ==========================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  // ===== CARGAR HEADER =====
  cargar("partials/header.html", "header", () => {
    prepararMenuMovilDedicado(); // ✅ nuevo sistema (NO toca #mainNav)
    activarHeaderScroll();
    activarLinkActivo();         // marca activo en #mainNav + panel móvil
    activarPawHover();
    activarBackToTop();          // por si el botón está en header
  });

  // ===== CARGAR FOOTER =====
  cargar("partials/footer.html", "footer", () => {
    ponerAnioActual();
    activarBackToTop();
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
// MENÚ MÓVIL DEDICADO (como Puerta de Terrer)
// Requisitos HTML en header.html:
// - botón:   #menuToggle
// - overlay: .mnav-mask
// - panel:   #mnavPanel.mnav-panel
// - cierre:  .mnav-close (opcional)
// Nota: NO usa body.nav-open ni toca #mainNav (desktop).
// ==========================================================
function prepararMenuMovilDedicado() {
  const body   = document.body;
  const toggle = document.getElementById("menuToggle");
  const mask   = document.querySelector(".mnav-mask");
  const panel  = document.getElementById("mnavPanel");
  const closeX = document.querySelector(".mnav-close");

  if (!toggle || !mask || !panel) {
    // Si aún no existe el panel (no lo has pegado en header.html), no rompe nada.
    return;
  }

    // ✅ Evita recortes: si el panel está dentro del header (con transform/animación),
  // lo movemos al final del <body> para que el fixed sea realmente viewport-fixed.
  if (panel.parentElement !== document.body) document.body.appendChild(panel);
  if (mask.parentElement !== document.body) document.body.appendChild(mask);

  // Evita duplicar listeners si el header se vuelve a inyectar
  if (document.body.dataset.mnavBound === "1") return;
  document.body.dataset.mnavBound = "1";

  const mq = window.matchMedia("(max-width: 992px)");

  function onTransitionEndOnce(el, prop, cb) {
    const handler = (e) => {
      if (e.target === el && e.propertyName === prop) {
        el.removeEventListener("transitionend", handler);
        cb();
      }
    };
    el.addEventListener("transitionend", handler);
  }

  function isOpen() {
    return panel.classList.contains("is-active");
  }

  function openMenu() {
    // Solo tiene sentido en móvil/tablet
    if (!mq.matches) return;

    if (panel.hidden) panel.hidden = false;
    if (mask.hidden)  mask.hidden  = false;

    requestAnimationFrame(() => {
      panel.classList.add("is-active");
      mask.classList.add("is-active");
      toggle.setAttribute("aria-expanded", "true");
      panel.setAttribute("aria-hidden", "false");
      body.style.overflow = "hidden";
    });

    // Evita estados raros del header sticky mientras esté abierto
    const headerWrap = document.getElementById("header");
    if (headerWrap) headerWrap.classList.add("menu-open");
  }

  function closeMenu() {
    panel.classList.remove("is-active");
    mask.classList.remove("is-active");
    toggle.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
    body.style.overflow = "";

    onTransitionEndOnce(panel, "transform", () => {
      panel.hidden = true;
      mask.hidden = true;
    });

    // Al cerrar, recalcula sticky correctamente
    const headerWrap = document.getElementById("header");
    if (headerWrap) headerWrap.classList.remove("menu-open");
    syncHeaderStickyNow();
  }

  function syncHeaderStickyNow() {
    const headerWrap = document.getElementById("header");
    if (!headerWrap) return;

    // misma lógica que activarHeaderScroll
    const STICKY_AT = 800;
    const y = window.scrollY || 0;

    if (y >= STICKY_AT) {
      headerWrap.classList.add("is-sticky");
      requestAnimationFrame(() => headerWrap.classList.add("is-sticky-show"));
    } else {
      headerWrap.classList.remove("is-sticky-show");
      headerWrap.classList.remove("is-sticky");
    }
  }

  // Listeners
  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    if (isOpen()) closeMenu();
    else openMenu();
  });

  if (closeX) {
    closeX.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenu();
    });
  }

  mask.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) closeMenu();
  });

  // Cierra al navegar por un enlace del panel
  panel.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (a) closeMenu();
  });

  // Si pasas a desktop, fuerza cierre y limpia overflow
  mq.addEventListener("change", () => {
    if (!mq.matches && isOpen()) closeMenu();
  });

  // Estado inicial limpio
  panel.hidden = true;
  mask.hidden = true;
  panel.classList.remove("is-active");
  mask.classList.remove("is-active");
  toggle.setAttribute("aria-expanded", "false");
  panel.setAttribute("aria-hidden", "true");
  body.style.overflow = "";
}


// ==========================================================
// EFECTO PAWFRIENDS (desktop) – inserta .pf-hover dentro de cada <a>
// ==========================================================
function activarPawHover() {
  const nav = document.querySelector("nav.main-nav#mainNav");
  if (!nav) return;

  if (nav.dataset.pawBound === "1") return;
  nav.dataset.pawBound = "1";

  const links = nav.querySelectorAll("ul > li > a");
  links.forEach(a => {
    const hovers = a.querySelectorAll(":scope > .pf-hover");
    if (hovers.length > 1) {
      for (let i = 1; i < hovers.length; i++) hovers[i].remove();
    }

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

    const textSpan = a.querySelector(":scope > span");
    if (textSpan) textSpan.classList.add("pf-text");
  });
}


// ==========================================================
// HEADER SCROLL (sticky animado)
// - Se pausa cuando el menú móvil está abierto (headerWrap.menu-open)
// ==========================================================
function activarHeaderScroll() {
  const headerWrap = document.getElementById("header");
  if (!headerWrap) return;

  const STICKY_AT = 800;
  const ANIM_MS = 260;

  if (headerWrap.dataset.scrollBound === "1") return;
  headerWrap.dataset.scrollBound = "1";

  let stickyOn = false;
  let t = null;

  function setSticky(on) {
    if (on === stickyOn) return;
    stickyOn = on;

    clearTimeout(t);

    if (on) {
      headerWrap.classList.add("is-sticky");
      requestAnimationFrame(() => headerWrap.classList.add("is-sticky-show"));
    } else {
      headerWrap.classList.remove("is-sticky-show");
      t = setTimeout(() => headerWrap.classList.remove("is-sticky"), ANIM_MS);
    }
  }

  function update() {
    // Si el panel móvil está abierto, no tocamos sticky
    if (headerWrap.classList.contains("menu-open")) return;

    const y = window.scrollY || 0;
    setSticky(y >= STICKY_AT);
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
}


// ==========================================================
// LINK ACTIVO (desktop + móvil dedicado)
// - Desktop: nav#mainNav a.active
// - Móvil:   #mnavPanel .mnav-list a.is-active + aria-current
// ==========================================================
function activarLinkActivo() {
  const currentPath = (window.location.pathname.split("/").pop() || "index.html").split("?")[0].split("#")[0];
  const current = decodeURIComponent(currentPath || "index.html");

  // ----- Desktop -----
  const navDesktop = document.querySelector("nav.main-nav#mainNav");
  if (navDesktop) {
    const links = navDesktop.querySelectorAll("a[href]");
    links.forEach(a => a.classList.remove("active"));

    links.forEach(a => {
      const href = (a.getAttribute("href") || "").split("?")[0].split("#")[0];
      const target = (href.split("/").pop() || "index.html");
      if (target === current) a.classList.add("active");
    });
  }

  // ----- Móvil dedicado -----
  const panel = document.getElementById("mnavPanel");
  if (panel) {
    const links = panel.querySelectorAll("a[href]");
    links.forEach(a => {
      a.classList.remove("is-active");
      a.removeAttribute("aria-current");
    });

    // marca el primero que coincida
    for (const a of links) {
      const href = (a.getAttribute("href") || "").split("?")[0].split("#")[0];
      const target = (href.split("/").pop() || "index.html");
      if (target === current) {
        a.classList.add("is-active");
        a.setAttribute("aria-current", "page");
        break;
      }
    }
  }
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

  if (backToTop.dataset.bound === "1") return true;
  backToTop.dataset.bound = "1";

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) backToTop.classList.add("show");
    else backToTop.classList.remove("show");
  }, { passive: true });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  return true;
}

// Si el footer entra más tarde, lo detectamos
document.addEventListener("DOMContentLoaded", () => {
  if (activarBackToTop()) return;

  const mo = new MutationObserver(() => {
    if (activarBackToTop()) mo.disconnect();
  });

  mo.observe(document.body, { childList: true, subtree: true });
});