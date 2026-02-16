document.addEventListener("DOMContentLoaded", function () {

    // ===== CARGAR HEADER =====
    fetch("partials/header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header").innerHTML = data;
            activarMenuMovil();
            marcarEnlaceActivo();
        });

    // ===== CARGAR FOOTER =====
    fetch("partials/footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer").innerHTML = data;
            ponerAnioActual();
            activarBackToTop();
        });

});


// ===== MENÚ MÓVIL =====
function activarMenuMovil() {
    const toggle = document.getElementById("menuToggle");
    const nav = document.getElementById("mainNav");

    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            nav.classList.toggle("active");
        });
    }
}


// ===== AÑO AUTOMÁTICO FOOTER =====
function ponerAnioActual() {
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}


// ===== MARCAR ENLACE ACTIVO =====
function marcarEnlaceActivo() {
    const currentPage = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll(".main-nav a");

    links.forEach(link => {
        const linkPage = link.getAttribute("href");

        if (
            linkPage === currentPage ||
            (currentPage === "" && linkPage === "index.html")
        ) {
            link.classList.add("active");
        }
    });
}


// ===== BOTÓN SUBIR ARRIBA =====
function activarBackToTop() {

    const backToTop = document.getElementById("backToTop");
    if (!backToTop) return;

    window.addEventListener("scroll", function () {
        if (window.scrollY > 300) {
            backToTop.classList.add("show");
        } else {
            backToTop.classList.remove("show");
        }
    });

    backToTop.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

}
