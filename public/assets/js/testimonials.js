document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("testimonialsSlider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".slide"));
  const prevBtn = slider.querySelector(".slider-btn.prev");
  const nextBtn = slider.querySelector(".slider-btn.next");
  const dotsWrap = slider.querySelector(".slider-dots");

  if (slides.length === 0) return;

  let current = slides.findIndex(s => s.classList.contains("active"));
  if (current < 0) current = 0;

  // Si solo hay 1 slide, ocultamos controles
  if (slides.length === 1) {
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    if (dotsWrap) dotsWrap.style.display = "none";
    slides[0].classList.add("active");
    return;
  }

  // Crear dots
  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "slider-dot" + (i === current ? " active" : "");
    b.setAttribute("aria-label", `Ir a opinión ${i + 1}`);
    b.addEventListener("click", () => {
      goTo(i);
      restartAuto();
    });
    dotsWrap.appendChild(b);
    return b;
  });

  function render() {
    slides.forEach((s, i) => s.classList.toggle("active", i === current));
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    render();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  if (nextBtn) nextBtn.addEventListener("click", () => { next(); restartAuto(); });
  if (prevBtn) prevBtn.addEventListener("click", () => { prev(); restartAuto(); });

  // Auto-play + pausa al pasar el ratón
  const INTERVAL_MS = 4500;
  let timer = setInterval(next, INTERVAL_MS);

  function restartAuto() {
    clearInterval(timer);
    timer = setInterval(next, INTERVAL_MS);
  }

  slider.addEventListener("mouseenter", () => clearInterval(timer));
  slider.addEventListener("mouseleave", restartAuto);

  // Inicial
  render();
});
