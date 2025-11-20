import "./main.css";

// showSlide ahora está definido inline en el HTML para estar disponible inmediatamente
// Solo verificamos si existe y la mejoramos si es necesario
if (!window.showSlide) {
  // Fallback si por alguna razón no se cargó el script inline
  window.showSlide = function (slide) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        window.showSlide(slide);
      });
      return;
    }

    document.querySelectorAll(".slide-content").forEach((item) => {
      item.style.display = "none";
    });

    const targetSlide = document.querySelector("#slide-" + slide);
    if (targetSlide) {
      targetSlide.style.display = "block";
    }

    document.querySelectorAll(".slider-pager-item").forEach((item) => {
      item.classList.remove("active");
    });

    const tabs = document.querySelectorAll(".slider-pager-item");
    if (tabs[slide - 1]) {
      tabs[slide - 1].classList.add("active");
    }
  };
}

document.addEventListener("DOMContentLoaded", function () {
  // Actualizar año
  const currentYearEl = document.getElementById("current-year");
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // Función scroll
  function scroll(id) {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        left: 0,
        behavior: "smooth",
      });
    }
  }

  // Manejar scroll automático cuando se carga la página con hash (desde otra página)
  function handleHashScroll() {
    const hash = window.location.hash;
    if (hash) {
      const targetId = hash.substring(1); // Remover el #

      // Función para intentar hacer scroll
      const attemptScroll = (retries = 0) => {
        const element = document.getElementById(targetId);
        if (element) {
          // Elemento encontrado, hacer scroll
          window.scrollTo({
            top: element.offsetTop - 80,
            left: 0,
            behavior: "smooth",
          });
        } else if (retries < 10) {
          // Elemento no encontrado aún, reintentar después de un breve delay
          setTimeout(() => attemptScroll(retries + 1), 50);
        }
      };

      // Esperar un poco para que la página termine de cargar
      setTimeout(() => {
        attemptScroll();
      }, 100);
    }
  }

  // Ejecutar scroll automático al cargar
  handleHashScroll();

  // También manejar cuando el hash cambia sin recargar la página
  window.addEventListener("hashchange", handleHashScroll);

  // Manejar clicks en enlaces del menú
  document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Si el enlace apunta a home con hash (/#seccion)
      if (href.startsWith("/#")) {
        const targetId = href.substring(2); // Remover /#
        // Si estamos en home, hacer scroll
        if (
          window.location.pathname === "/" ||
          window.location.pathname === "/index.html"
        ) {
          e.preventDefault();
          scroll(targetId);
        }
        // Si no estamos en home, dejar que el navegador navegue normalmente
        // El hash se manejará en handleHashScroll cuando se cargue la nueva página
      }
      // Si el enlace es solo hash (#seccion), hacer scroll en la misma página
      else if (href.startsWith("#")) {
        e.preventDefault();
        const targetId = href.substring(1);
        scroll(targetId);
      }
    });
  });

  // Inicializar slider - ocultar todas las imágenes excepto la primera
  document.querySelectorAll(".slide-content").forEach((item) => {
    item.style.display = "none";
  });
  const slide1 = document.querySelector("#slide-1");
  if (slide1) {
    slide1.style.display = "block";
  }

  // Pager active onclick - manejar clicks en los tabs
  document
    .querySelectorAll(".slider-pager-item:not(.no-hover)")
    .forEach((item) => {
      item.addEventListener("click", function (e) {
        document.querySelectorAll(".slider-pager-item").forEach((item) => {
          item.classList.remove("active");
        });
        item.classList.add("active");
      });
    });
});
