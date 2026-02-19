document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("testimonialsSlider");
  if (!slider) return;

  const track = slider.querySelector(".slides");
  const slides = Array.from(slider.querySelectorAll(".slide"));
  const prevBtn = slider.querySelector(".slider-btn.prev");
  const nextBtn = slider.querySelector(".slider-btn.next");
  const dotsWrap = slider.querySelector(".slider-dots");

  if (!track || slides.length === 0) return;

  let current = 0;
  let dots = [];
  let timer = null;

  const INTERVAL_MS = 5000;

  function slidesPerView() {
    return window.innerWidth <= 900 ? 1 : 2;
  }

  function maxIndex() {
    // número de "posiciones" posibles
    return Math.max(0, slides.length - slidesPerView());
  }

  function getGapPx() {
    // gap real del track (flex-gap)
    const cs = window.getComputedStyle(track);
    const gap = parseFloat(cs.columnGap || cs.gap || "0");
    return Number.isFinite(gap) ? gap : 0;
  }

  function stepPx() {
    // paso = ancho real de un slide + gap
    const w = slides[0].getBoundingClientRect().width;
    return w + getGapPx();
  }

  function render() {
    const x = current * stepPx();
    track.style.transform = `translateX(-${x}px)`;
    updateDots();
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    render();
  }

  function next() {
    current = (current >= maxIndex()) ? 0 : current + 1;
    render();
  }

  function prev() {
    current = (current <= 0) ? maxIndex() : current - 1;
    render();
  }

  /* ===== DOTS ===== */
  function buildDots() {
    if (!dotsWrap) return;

    dotsWrap.innerHTML = "";
    dots = [];

    // cantidad de posiciones posibles (incluye 0)
    const count = maxIndex() + 1;

    for (let i = 0; i < count; i++) {
      const b = document.createElement("button");
      b.className = "slider-dot";
      b.type = "button";
      b.setAttribute("aria-label", `Ir al testimonio ${i + 1}`);
      b.addEventListener("click", () => {
        goTo(i);
        restartAuto();
      });
      dotsWrap.appendChild(b);
      dots.push(b);
    }

    updateDots();
  }

  function updateDots() {
    if (!dots.length) return;
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  /* ===== AUTOPLAY ===== */
  function startAuto() {
    stopAuto();
    timer = setInterval(next, INTERVAL_MS);
  }

  function stopAuto() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function restartAuto() {
    startAuto();
  }

  /* ===== EVENTS ===== */
  nextBtn && nextBtn.addEventListener("click", () => { next(); restartAuto(); });
  prevBtn && prevBtn.addEventListener("click", () => { prev(); restartAuto(); });

  slider.addEventListener("mouseenter", stopAuto);
  slider.addEventListener("mouseleave", startAuto);

  // Si cambias de 2->1 (o al revés), recalculamos todo
  let lastSPV = slidesPerView();
  window.addEventListener("resize", () => {
    const spv = slidesPerView();
    // reajusta current dentro del nuevo rango
    current = Math.min(current, Math.max(0, slides.length - spv));
    // si cambió el modo (1/2 visibles), reconstruye dots
    if (spv !== lastSPV) {
      lastSPV = spv;
      buildDots();
    }
    render();
  });

  // Init
 
  render();
  startAuto();
});
