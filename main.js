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

  // Función scroll mejorada que espera a que el contenido esté completamente renderizado
  function scroll(id) {
    const element = document.getElementById(id);
    if (element) {
      // Usar getBoundingClientRect para obtener posición precisa relativa al viewport
      // y sumar scrollY para obtener posición absoluta
      const headerOffset = 94; // Altura del header fijo (50px) + padding
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        left: 0,
        behavior: "smooth",
      });
    }
  }

  // Mobile menu functionality
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
  const mobileMenuClose = document.querySelector(".mobile-menu-close");

  if (mobileMenuToggle && mobileMenuOverlay) {
    function openMobileMenu() {
      mobileMenuOverlay.setAttribute("aria-hidden", "false");
      mobileMenuToggle.setAttribute("aria-expanded", "true");
      // Freeze scroll
      document.body.style.overflow = "hidden";
    }

    function closeMobileMenu() {
      mobileMenuOverlay.setAttribute("aria-hidden", "true");
      mobileMenuToggle.setAttribute("aria-expanded", "false");
      // Unfreeze scroll after transition
      setTimeout(() => {
        document.body.style.overflow = "";
      }, 300);
    }

    // Toggle mobile menu
    mobileMenuToggle.addEventListener("click", function () {
      const isOpen = mobileMenuOverlay.getAttribute("aria-hidden") === "false";

      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close menu button
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener("click", function () {
        closeMobileMenu();
      });
    }

    // Close menu when clicking on overlay background (not on links)
    mobileMenuOverlay.addEventListener("click", function (e) {
      if (e.target === mobileMenuOverlay) {
        closeMobileMenu();
      }
    });

    // Close menu when clicking on any link inside mobile menu
    const mobileMenuLinks = mobileMenuOverlay.querySelectorAll("a");
    mobileMenuLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        const href = this.getAttribute("href");

        // Si el enlace apunta a home con hash (/#seccion)
        if (href && href.startsWith("/#")) {
          const targetId = href.substring(2); // Remover /#
          // Si estamos en home, hacer scroll
          if (
            window.location.pathname === "/" ||
            window.location.pathname === "/index.html"
          ) {
            e.preventDefault();
            closeMobileMenu();
            // Small delay to allow fade-out animation, then scroll
            setTimeout(() => {
              scroll(targetId);
            }, 300);
          }
          // Si no estamos en home, dejar que el navegador navegue normalmente
          // El hash se manejará en handleHashScroll cuando se cargue la nueva página
          // Solo cerramos el menú
          else {
            closeMobileMenu();
          }
        }
        // Si el enlace es solo hash (#seccion), hacer scroll en la misma página
        else if (href && href.startsWith("#")) {
          e.preventDefault();
          closeMobileMenu();
          // Small delay to allow fade-out animation, then scroll
          setTimeout(() => {
            const targetId = href.substring(1);
            scroll(targetId);
          }, 300);
        } else {
          // For external links or page navigation, close menu immediately
          // Navigation will happen naturally
          closeMobileMenu();
        }
      });
    });
  }

  // Manejar scroll automático cuando se carga la página con hash (desde otra página)
  function handleHashScroll() {
    const hash = window.location.hash;
    if (hash) {
      const targetId = hash.substring(1); // Remover el #

      // Función para verificar si todas las imágenes están cargadas
      function waitForImages(callback) {
        const images = document.querySelectorAll("img");
        let loadedCount = 0;
        const totalImages = images.length;

        if (totalImages === 0) {
          callback();
          return;
        }

        images.forEach((img) => {
          if (img.complete) {
            loadedCount++;
            if (loadedCount === totalImages) {
              callback();
            }
          } else {
            img.addEventListener("load", () => {
              loadedCount++;
              if (loadedCount === totalImages) {
                callback();
              }
            });
            img.addEventListener("error", () => {
              loadedCount++;
              if (loadedCount === totalImages) {
                callback();
              }
            });
          }
        });
      }

      // Función para verificar si el layout está estable
      function waitForLayoutStable(callback, maxWait = 5000) {
        let lastHeight = document.body.scrollHeight;
        let stableCount = 0;
        const checkInterval = 100;
        const stableThreshold = 5; // Necesita estar estable por 5 checks consecutivos (500ms)

        const checkStability = () => {
          const currentHeight = document.body.scrollHeight;

          if (currentHeight === lastHeight) {
            stableCount++;
            if (stableCount >= stableThreshold) {
              callback();
              return;
            }
          } else {
            stableCount = 0;
            lastHeight = currentHeight;
          }

          maxWait -= checkInterval;
          if (maxWait > 0) {
            setTimeout(checkStability, checkInterval);
          } else {
            // Timeout, ejecutar callback de todas formas
            callback();
          }
        };

        checkStability();
      }

      // Función para intentar hacer scroll
      const attemptScroll = (retries = 0) => {
        const element = document.getElementById(targetId);
        if (element) {
          // Esperar a que las imágenes se carguen
          waitForImages(() => {
            // Esperar a que el layout esté estable
            waitForLayoutStable(() => {
              // Esperar frames adicionales y delay para asegurar renderizado completo
              setTimeout(() => {
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      // Usar getBoundingClientRect para posición precisa
                      const headerOffset = 94; // Altura del header fijo
                      const elementPosition =
                        element.getBoundingClientRect().top;
                      const offsetPosition =
                        elementPosition + window.pageYOffset - headerOffset;

                      window.scrollTo({
                        top: offsetPosition,
                        left: 0,
                        behavior: "smooth",
                      });
                    });
                  });
                });
              }, 300);
            });
          });
        } else if (retries < 30) {
          // Aumentar reintentos para dar más tiempo
          setTimeout(() => attemptScroll(retries + 1), 100);
        }
      };

      // Esperar a que la página esté completamente cargada
      // Usar window.load si aún no se ha disparado, o esperar un delay más largo
      if (document.readyState === "complete") {
        setTimeout(() => {
          attemptScroll();
        }, 1500);
      } else {
        window.addEventListener("load", () => {
          setTimeout(() => {
            attemptScroll();
          }, 1500);
        });
      }
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
