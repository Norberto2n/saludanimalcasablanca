(function () {
  var lb = document.getElementById('lightbox');
  if (!lb) return; // si no existe el modal, no hace nada

  var lbImg = document.getElementById('lbImg');
  var lbCaption = document.getElementById('lbCaption');
  var lbCounter = document.getElementById('lbCounter');

  var btnPrev = lb.querySelector('.lb-prev');
  var btnNext = lb.querySelector('.lb-next');

  var items = [];
  var index = 0;

  function collectGallery(name) {
    var links = document.querySelectorAll('a[data-gallery="' + name + '"]');
    items = Array.prototype.slice.call(links).map(function (a) {
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

    var pre = new Image();
    pre.onload = function () { lbImg.src = it.src; };
    pre.src = it.src;

    lbImg.alt = it.caption || 'Imagen de galería';
    lbCaption.textContent = it.caption || '';
    lbCounter.textContent = (index + 1) + ' / ' + items.length;
  }

  function openAt(i) {
    index = i;
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
    index = (index - 1 + items.length) % items.length;
    render();
  }

  function next() {
    index = (index + 1) % items.length;
    render();
  }

  // Click en imagen: abrir slider
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[data-gallery]') : null;
    if (!a) return;

    e.preventDefault();
    var name = a.getAttribute('data-gallery');
    collectGallery(name);

    var all = document.querySelectorAll('a[data-gallery="' + name + '"]');
    var arr = Array.prototype.slice.call(all);
    var i = arr.indexOf(a);

    openAt(Math.max(0, i));
  });

  // Cerrar por backdrop o botón
  lb.addEventListener('click', function (e) {
    if (e.target && e.target.matches && e.target.matches('[data-lb-close]')) close();
  });

  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);

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
    startX = e.touches[0].clientX;
  }, { passive: true });

  lb.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var endX = e.changedTouches[0].clientX;
    var dx = endX - startX;
    startX = null;
    if (Math.abs(dx) > 45) {
      if (dx > 0) prev(); else next();
    }
  }, { passive: true });
})();