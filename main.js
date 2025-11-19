import "./main.css";
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

  // Manejar clicks en enlaces del menú
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      scroll(targetId);
    });
  });

  // Inicializar slider
  document.querySelectorAll(".slide-content").forEach((item) => {
    item.style.display = "none";
  });
  const slide1 = document.querySelector("#slide-1");
  if (slide1) {
    slide1.style.display = "block";
  }

  // Función showSlide (debe estar en el scope global para los onclick)
  window.showSlide = function (slide) {
    document.querySelectorAll(".slide-content").forEach((item) => {
      item.style.display = "none";
    });
    if (slide != 3) {
      const targetSlide = document.querySelector("#slide-" + slide);
      if (targetSlide) {
        targetSlide.style.display = "block";
      }
    } else {
      const slide3 = document.querySelector("#slide-3");
      if (slide3) {
        slide3.style.display = "block";
      }
    }
  };

  // Pager active onclick
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
