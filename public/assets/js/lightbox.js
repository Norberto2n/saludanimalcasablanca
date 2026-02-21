document.addEventListener("DOMContentLoaded", () => {
  const links = Array.from(document.querySelectorAll(".lightbox-link"));
  if (!links.length) return;

  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const lbCaption = document.getElementById("lightboxCaption");
  const btnClose = document.getElementById("lightboxClose");
  const btnPrev = document.getElementById("lightboxPrev");
  const btnNext = document.getElementById("lightboxNext");

  let index = 0;

  function openAt(i) {
    index = (i + links.length) % links.length;
    const link = links[index];
    const href = link.getAttribute("href");
    const caption = link.getAttribute("data-caption") || "";

    lbImg.src = href;
    lbImg.alt = caption || "Imagen";
    lbCaption.textContent = caption;

    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lbImg.src = "";
  }

  function next() { openAt(index + 1); }
  function prev() { openAt(index - 1); }

  // Click en miniaturas
  links.forEach((a, i) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openAt(i);
    });
  });

  // Controles
  btnClose.addEventListener("click", close);
  btnNext.addEventListener("click", next);
  btnPrev.addEventListener("click", prev);

  // Cerrar clic fuera (overlay)
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });

  // Teclado
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });
});

