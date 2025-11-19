#!/usr/bin/env node

/**
 * Script para generar páginas HTML desde componentes reutilizables
 * Uso: node build-html.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de páginas
const pages = {
  'privacy-policy': {
    title: 'Privacy Policy | ROOTS - Rules Of Origin Trade Solutions',
    canonical: 'https://roots.trade/privacy-policy.html',
    metaDescription: 'Privacy Policy for ROOTS - Rules Of Origin Trade Solutions. Learn how we collect, use, and protect your information.',
    ogTitle: 'Privacy Policy - ROOTS',
    ogDescription: 'Privacy Policy for ROOTS - Rules Of Origin Trade Solutions',
    navLinks: '<a class="" href="/">Home</a><a class="" href="/about.html">About</a>',
    contentFile: 'pages/privacy-policy-content.html'
  },
  'terms-conditions': {
    title: 'Terms and Conditions | ROOTS - Rules Of Origin Trade Solutions',
    canonical: 'https://roots.trade/terms-conditions.html',
    metaDescription: 'Terms and Conditions for ROOTS - Rules Of Origin Trade Solutions. Read our terms of service and usage policies.',
    ogTitle: 'Terms and Conditions - ROOTS',
    ogDescription: 'Terms and Conditions for ROOTS - Rules Of Origin Trade Solutions',
    navLinks: '<a class="" href="/">Home</a><a class="" href="/about.html">About</a>',
    contentFile: 'pages/terms-conditions-content.html'
  },
  'about': {
    title: 'About Us | ROOTS - Rules Of Origin Trade Solutions',
    canonical: 'https://roots.trade/about.html',
    metaDescription: 'Learn about ROOTS - Rules Of Origin Trade Solutions. Our mission, vision, and commitment to simplifying rules of origin management.',
    ogTitle: 'About ROOTS - Rules Of Origin Trade Solutions',
    ogDescription: 'Learn about ROOTS and how we help companies manage rules of origin efficiently.',
    navLinks: '<a class="" href="/">Home</a><a class="" href="/privacy-policy.html">Privacy Policy</a><a class="" href="/terms-conditions.html">Terms</a>',
    contentFile: 'pages/about-content.html'
  }
};

// Leer componentes
function readComponent(name) {
  const filePath = path.join(__dirname, 'components', `${name}.html`);
  return fs.readFileSync(filePath, 'utf-8');
}

// Reemplazar placeholders
function replacePlaceholders(template, data) {
  let result = template;
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, data[key]);
  });
  return result;
}

// Generar HTML completo
function generateHTML(pageConfig) {
  const headTemplate = readComponent('head');
  const headerTemplate = readComponent('header');
  const footerTemplate = readComponent('footer');
  
  // Leer contenido específico de la página
  const contentPath = path.join(__dirname, pageConfig.contentFile);
  let pageContent = '';
  if (fs.existsSync(contentPath)) {
    pageContent = fs.readFileSync(contentPath, 'utf-8');
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
    OG_DESCRIPTION: pageConfig.ogDescription
  }).trim();
  
  const header = replacePlaceholders(headerTemplate, {
    NAV_LINKS: pageConfig.navLinks
  });
  
  // Construir HTML completo
  return `<!DOCTYPE html>
<html lang="en-US">
  <head>
    ${head}
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "${pageConfig.ogTitle}",
        "description": "${pageConfig.metaDescription}",
        "url": "${pageConfig.canonical}"
      }
    </script>
  </head>
  <body>
    <div id="app">
      <main>
        <section class="wrapper-fw" id="main-content">
          <div class="container grid-split-rows pp p-min">
            <div class="flex p-big plain-text-content">
              ${pageContent}
            </div>
          </div>
        </section>
        ${footerTemplate}
      </main>
      ${header}
    </div>
    <script type="module" src="/main.js"></script>
    <style>
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
    </style>
  </body>
</html>`;
}

// Generar todas las páginas
function buildAll() {
  console.log('🏗️  Building HTML pages...\n');
  
  Object.keys(pages).forEach(pageName => {
    const config = pages[pageName];
    const html = generateHTML(config);
    const outputPath = path.join(__dirname, `${pageName}.html`);
    
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`✅ Generated: ${pageName}.html`);
  });
  
  console.log('\n✨ Build complete!');
}

// Ejecutar
buildAll();

