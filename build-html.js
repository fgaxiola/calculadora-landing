#!/usr/bin/env node

/**
 * Script para generar páginas HTML desde componentes reutilizables
 * Uso: node build-html.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de páginas
const pages = {
  index: {
    title:
      "ROOTS - Rules Of Origin Trade Solutions | Origin Calculation & Certification Software",
    canonical: "https://roots.trade/",
    metaDescription:
      "ROOTS - Rules Of Origin Trade Solutions. Reliable, comprehensive, and robust intra-company management of rules of origin. Calculate, validate, and certify origin for multiple Free Trade Agreements.",
    ogTitle: "ROOTS - Rules Of Origin Trade Solutions",
    ogDescription:
      "Reliable, comprehensive, and robust intra-company management of rules of origin. Calculate, validate, and certify origin for multiple Free Trade Agreements.",
    navLinks:
      '<a class="" href="#main-pillars" aria-label="Navigate to Main Pillars section">Main Pillars</a><a class="" href="#system-features" aria-label="Navigate to System Features section">System Features</a><a class="" href="#benefits" aria-label="Navigate to Benefits section">Benefits</a><a class="" href="#usage" aria-label="Navigate to Usage section">Usage</a><a class="" href="#contact" aria-label="Navigate to Contact us section">Contact us</a><a class="" href="/about" aria-label="Navigate to About us page">About us</a>',
    contentFile: "pages/index-content.html",
    isFullPage: true, // Indica que tiene contenido completo HTML, no solo texto
    schemaType: "SoftwareApplication",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "ROOTS - Rules Of Origin Trade Solutions",
      description:
        "Reliable, comprehensive, and robust intra-company management of rules of origin. Calculate, validate, and certify origin for multiple Free Trade Agreements.",
      url: "https://roots.trade",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.5",
      },
    },
  },
  "privacy-policy": {
    title: "Privacy Policy | ROOTS - Rules Of Origin Trade Solutions",
    canonical: "https://roots.trade/privacy-policy",
    metaDescription:
      "Privacy Policy for ROOTS - Rules Of Origin Trade Solutions. Learn how we collect, use, and protect your information.",
    ogTitle: "Privacy Policy - ROOTS",
    ogDescription: "Privacy Policy for ROOTS - Rules Of Origin Trade Solutions",
    navLinks:
      '<a class="" href="/#main-pillars" aria-label="Navigate to Main Pillars section">Main Pillars</a><a class="" href="/#system-features" aria-label="Navigate to System Features section">System Features</a><a class="" href="/#benefits" aria-label="Navigate to Benefits section">Benefits</a><a class="" href="/#usage" aria-label="Navigate to Usage section">Usage</a><a class="" href="/#contact" aria-label="Navigate to Contact us section">Contact us</a><a class="" href="/about" aria-label="Navigate to About us page">About us</a>',
    contentFile: "pages/privacy-policy-content.html",
  },
  "terms-conditions": {
    title: "Terms and Conditions | ROOTS - Rules Of Origin Trade Solutions",
    canonical: "https://roots.trade/terms-and-conditions",
    metaDescription:
      "Terms and Conditions for ROOTS - Rules Of Origin Trade Solutions. Read our terms of service and usage policies.",
    ogTitle: "Terms and Conditions - ROOTS",
    ogDescription:
      "Terms and Conditions for ROOTS - Rules Of Origin Trade Solutions",
    navLinks:
      '<a class="" href="/#main-pillars" aria-label="Navigate to Main Pillars section">Main Pillars</a><a class="" href="/#system-features" aria-label="Navigate to System Features section">System Features</a><a class="" href="/#benefits" aria-label="Navigate to Benefits section">Benefits</a><a class="" href="/#usage" aria-label="Navigate to Usage section">Usage</a><a class="" href="/#contact" aria-label="Navigate to Contact us section">Contact us</a><a class="" href="/about" aria-label="Navigate to About us page">About us</a>',
    contentFile: "pages/terms-conditions-content.html",
  },
  about: {
    title: "About Us | ROOTS - Rules Of Origin Trade Solutions",
    canonical: "https://roots.trade/about",
    metaDescription:
      "Learn about ROOTS - Rules Of Origin Trade Solutions. Our mission, vision, and commitment to simplifying rules of origin management.",
    ogTitle: "About ROOTS - Rules Of Origin Trade Solutions",
    ogDescription:
      "Learn about ROOTS and how we help companies manage rules of origin efficiently.",
    navLinks:
      '<a class="" href="/#main-pillars" aria-label="Navigate to Main Pillars section">Main Pillars</a><a class="" href="/#system-features" aria-label="Navigate to System Features section">System Features</a><a class="" href="/#benefits" aria-label="Navigate to Benefits section">Benefits</a><a class="" href="/#usage" aria-label="Navigate to Usage section">Usage</a><a class="" href="/#contact" aria-label="Navigate to Contact us section">Contact us</a><a class="" href="/about" aria-label="Navigate to About us page">About us</a>',
    contentFile: "pages/about-content.html",
  },
};

// Leer componentes
function readComponent(name) {
  const filePath = path.join(__dirname, "components", `${name}.html`);
  return fs.readFileSync(filePath, "utf-8");
}

// Reemplazar placeholders
function replacePlaceholders(template, data) {
  let result = template;
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, data[key]);
  });
  return result;
}

// Generar HTML completo
function generateHTML(pageConfig) {
  const headTemplate = readComponent("head");
  const headerTemplate = readComponent("header");
  const footerTemplate = readComponent("footer");

  // Leer contenido específico de la página
  const contentPath = path.join(__dirname, pageConfig.contentFile);
  let pageContent = "";
  if (fs.existsSync(contentPath)) {
    pageContent = fs.readFileSync(contentPath, "utf-8");
  } else {
    console.warn(`⚠️  Content file not found: ${pageConfig.contentFile}`);
    pageContent = '<div class="container"><h1>Content not found</h1></div>';
  }

  // Reemplazar placeholders en componentes
  const head = replacePlaceholders(headTemplate, {
    CANONICAL_URL: pageConfig.canonical,
    PAGE_TITLE: pageConfig.title,
    META_DESCRIPTION: pageConfig.metaDescription,
    OG_TITLE: pageConfig.ogTitle,
    OG_DESCRIPTION: pageConfig.ogDescription,
  }).trim();

  const header = replacePlaceholders(headerTemplate, {
    NAV_LINKS: pageConfig.navLinks,
    LOGO_SRC: "./public/img/logo-header-new.png", // Se reemplazará después del build por Vite
  });

  // Determinar el tipo de contenido y structured data
  const isFullPage = pageConfig.isFullPage || false;
  const schemaType = pageConfig.schemaType || "WebPage";
  const schemaData = pageConfig.schemaData || {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: pageConfig.ogTitle,
    description: pageConfig.metaDescription,
    url: pageConfig.canonical,
  };

  // Construir el contenido del main según el tipo
  let mainContent;
  if (isFullPage) {
    // Contenido completo HTML (como index.html)
    mainContent = pageContent;
  } else {
    // Contenido de texto plano con wrapper
    mainContent = `<section class="wrapper-fw" id="main-content">
          <div class="container grid-split-rows pp p-min">
            <div class="flex p-big plain-text-content">
              ${pageContent}
            </div>
          </div>
        </section>`;
  }

  // Script inline para showSlide (debe estar disponible antes de que se ejecuten los onclick)
  const inlineSliderScript = isFullPage
    ? `
    <script>
      // Función showSlide debe estar disponible inmediatamente para los onclick inline
      window.showSlide = function (slide) {
        // Verificar que el DOM esté listo
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", function () {
            window.showSlide(slide);
          });
          return;
        }
        
        // Ocultar todas las slides
        document.querySelectorAll(".slide-content").forEach((item) => {
          item.style.display = "none";
        });
        
        // Mostrar la slide seleccionada
        const targetSlide = document.querySelector("#slide-" + slide);
        if (targetSlide) {
          targetSlide.style.display = "block";
        }
        
        // Actualizar clase active en los tabs
        document.querySelectorAll(".slider-pager-item").forEach((item) => {
          item.classList.remove("active");
        });
        
        // Buscar el tab correspondiente y activarlo
        const tabs = document.querySelectorAll(".slider-pager-item");
        if (tabs[slide - 1]) {
          tabs[slide - 1].classList.add("active");
        }
      };
    </script>`
    : "";

  // Construir HTML completo
  return `<!DOCTYPE html>
<html lang="en-US">
  <head>
    ${head}
    <script type="application/ld+json">
      ${JSON.stringify(schemaData, null, 6)}
    </script>
  </head>
  <body>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <div id="app">
      <main id="main-content">
        ${mainContent}
        ${footerTemplate}
      </main>
      ${header}
    </div>
    ${inlineSliderScript}
    <script type="module" src="/main.js" defer></script>
    ${
      isFullPage
        ? ""
        : `<style>
      .plain-text-content h1 {
        margin-bottom: 30px;
      }
      .plain-text-content h2 {
        margin-top: 40px;
        margin-bottom: 20px;
      }
      .plain-text-content h3 {
        margin-top: 25px;
        margin-bottom: 15px;
        text-align: left;
      }
      .plain-text-content p {
        margin-bottom: 15px;
        line-height: 1.6;
      }
      .plain-text-content ul {
        margin-bottom: 15px;
        padding-left: 20px;
      }
      .plain-text-content li {
        margin-bottom: 10px;
      }
      .plain-text-content a {
        color: inherit;
        text-decoration: underline;
      }
    </style>`
    }
  </body>
</html>`;
}

// Generar todas las páginas
function buildAll() {
  console.log("🏗️  Building HTML pages...\n");

  Object.keys(pages).forEach((pageName) => {
    const config = pages[pageName];
    const html = generateHTML(config);
    const outputPath = path.join(__dirname, `${pageName}.html`);

    fs.writeFileSync(outputPath, html, "utf-8");
    console.log(`✅ Generated: ${pageName}.html`);
  });

  console.log("\n✨ Build complete!");
}

// Ejecutar
buildAll();
