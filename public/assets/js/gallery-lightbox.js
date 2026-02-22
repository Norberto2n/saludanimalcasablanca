(function () {
  var lb = document.getElementById('lightbox');
  if (!lb) return;

  var lbImg = document.getElementById('lbImg');
  var lbCaption = document.getElementById('lbCaption');
  var lbCounter = document.getElementById('lbCounter');

  var btnPrev = lb.querySelector('.lb-prev');
  var btnNext = lb.querySelector('.lb-next');

  var items = [];
  var index = 0;

  function qsa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function collectGallery(name) {
    items = qsa('a[data-gallery="' + name + '"]').map(function (a) {
      var img = a.querySelector('img');
      return {
        src: a.getAttribute('href'),
        caption: a.getAttribute('data-caption') || (img ? img.getAttribute('alt') : '') || ''
      };
    });
  }

  function render() {
    var it = items[index];
    if (!it) return;

    // precarga
    var pre = new Image();
    pre.onload = function () { lbImg.src = it.src; };
    pre.src = it.src;

    lbImg.alt = it.caption || 'Imagen de galería';
    lbCaption.textContent = it.caption || '';
    lbCounter.textContent = (index + 1) + ' / ' + items.length;
  }

  function openAt(i) {
    index = i || 0;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    render();
  }

  function close() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    lbImg.src = '';
  }

  function prev() {
    if (!items.length) return;
    index = (index - 1 + items.length) % items.length;
    render();
  }

  function next() {
    if (!items.length) return;
    index = (index + 1) % items.length;
    render();
  }

  // Click para abrir (delegado)
  document.addEventListener('click', function (e) {
    // Soporte para navegadores sin closest (muy raro hoy, pero por si acaso)
    var target = e.target;
    var a = target.closest ? target.closest('a[data-gallery]') : null;

    if (!a) return;

    e.preventDefault();

    var name = a.getAttribute('data-gallery');
    if (!name) return;

    collectGallery(name);

    var arr = qsa('a[data-gallery="' + name + '"]');
    var i = arr.indexOf(a);

    openAt(i >= 0 ? i : 0);
  });

  // Cerrar por backdrop o botón
  lb.addEventListener('click', function (e) {
    var t = e.target;
    if (t && t.matches && t.matches('[data-lb-close]')) close();
  });

  if (btnPrev) btnPrev.addEventListener('click', prev);
  if (btnNext) btnNext.addEventListener('click', next);

  // Teclado
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Swipe móvil
  var startX = null;

  lb.addEventListener('touchstart', function (e) {
    if (!lb.classList.contains('is-open')) return;
    startX = e.touches[0].clientX;
  }, { passive: true });

  lb.addEventListener('touchend', function (e) {
    if (!lb.classList.contains('is-open')) return;
    if (startX === null) return;

    var endX = e.changedTouches[0].clientX;
    var dx = endX - startX;
    startX = null;

    if (Math.abs(dx) > 45) {
      if (dx > 0) prev(); else next();
    }
  }, { passive: true });
})();