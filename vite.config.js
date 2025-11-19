import { defineConfig } from 'vite';
import { copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Plugin para copiar HTMLs adicionales a dist/ e inyectar assets
function copyHtmlFiles() {
  return {
    name: 'copy-html-files',
    writeBundle() {
      const htmlFiles = ['index.html', 'about.html', 'privacy-policy.html', 'terms-conditions.html'];
      
      // Leer index.html para extraer las referencias a los assets
      const indexPath = join(process.cwd(), 'dist', 'index.html');
      let cssAsset = '';
      let jsAsset = '';
      let logoAsset = '';
      
      // Mapeo de imágenes: nombre original -> ruta procesada en assets
      const imageMap = new Map();
      
      try {
        const indexContent = readFileSync(indexPath, 'utf-8');
        // Extraer CSS y JS del index.html procesado
        const cssMatch = indexContent.match(/<link rel="stylesheet" href="([^"]+)">/);
        const jsMatch = indexContent.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
        // Extraer logo procesado
        const logoMatch = indexContent.match(/src="([^"]*logo-header-new[^"]+)"/);
        
        if (cssMatch) cssAsset = cssMatch[1];
        if (jsMatch) jsAsset = jsMatch[1];
        if (logoMatch) logoAsset = logoMatch[1];
        
        // Crear mapeo de imágenes desde los assets procesados
        const assetsDir = join(process.cwd(), 'dist', 'assets');
        const publicImgDir = join(process.cwd(), 'public', 'img');
        const fs = require('fs');
        
        if (fs.existsSync(assetsDir)) {
          const assetFiles = fs.readdirSync(assetsDir);
          assetFiles.forEach(file => {
            // Extraer el nombre base antes del hash (ej: slider-img1.100566aa.png -> slider-img1.png)
            const baseMatch = file.match(/^(.+?)\.[a-f0-9]+\.(png|jpg|jpeg|svg|gif|webp)$/i);
            if (baseMatch) {
              const baseName = `${baseMatch[1]}.${baseMatch[2]}`;
              imageMap.set(baseName, `/assets/${file}`);
            }
          });
        }
        
        // Para imágenes que no fueron procesadas por Vite, usar la ruta de public/img
        // Esto asegura que todas las imágenes funcionen
        // IMPORTANTE: Solo agregar si no está ya en el mapa (las procesadas tienen prioridad)
        if (fs.existsSync(publicImgDir)) {
          const publicFiles = fs.readdirSync(publicImgDir);
          publicFiles.forEach(file => {
            // Solo agregar si no está ya en el mapa (no fue procesada por Vite)
            if (!imageMap.has(file)) {
              imageMap.set(file, `/img/${file}`);
            }
          });
        }
        
        // Debug: mostrar mapeo de imágenes
        if (imageMap.size > 0) {
          console.log(`📸 Mapped ${imageMap.size} images`);
        }
      } catch (error) {
        console.warn('⚠️  Could not read index.html to extract assets:', error.message);
      }
      
      htmlFiles.forEach(file => {
        try {
          const sourcePath = join(process.cwd(), file);
          const destPath = join(process.cwd(), 'dist', file);
          
          // Leer el contenido del HTML generado
          let htmlContent = readFileSync(sourcePath, 'utf-8');
          
          // Reemplazar las referencias a los assets si existen
          if (cssAsset && jsAsset) {
            // Reemplazar el script de main.js con el asset procesado
            htmlContent = htmlContent.replace(
              /<script type="module" src="\/main\.js"><\/script>/,
              `<script type="module" crossorigin src="${jsAsset}"></script>`
            );
            
            // Agregar el CSS si no existe
            if (!htmlContent.includes('<link rel="stylesheet"')) {
              // Insertar antes del cierre de </head>
              htmlContent = htmlContent.replace(
                '</head>',
                `    <link rel="stylesheet" href="${cssAsset}">\n  </head>`
              );
            } else {
              // Reemplazar si existe una referencia incorrecta
              htmlContent = htmlContent.replace(
                /<link rel="stylesheet" href="[^"]+">/,
                `<link rel="stylesheet" href="${cssAsset}">`
              );
            }
          }
          
          // Reemplazar la ruta del logo si existe
          if (logoAsset) {
            htmlContent = htmlContent.replace(
              /src="\.\/public\/img\/logo-header-new\.png"/g,
              `src="${logoAsset}"`
            );
            htmlContent = htmlContent.replace(
              /src="{{LOGO_SRC}}"/g,
              `src="${logoAsset}"`
            );
          }
          
          // Reemplazar todas las rutas de imágenes con las versiones procesadas
          // IMPORTANTE: Primero aplicar el mapeo (imágenes procesadas tienen prioridad)
          if (imageMap.size > 0) {
            imageMap.forEach((processedPath, originalName) => {
              // Escapar caracteres especiales para regex
              const escapedName = originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              
              // Contar reemplazos para debug
              let replacements = 0;
              
              // Reemplazar en atributos src (con comillas simples o dobles)
              const srcBefore = htmlContent;
              htmlContent = htmlContent.replace(
                new RegExp(`src=["']\\./public/img/${escapedName}["']`, 'g'),
                (match) => {
                  replacements++;
                  return `src="${processedPath}"`;
                }
              );
              
              // Reemplazar en background-image (url) - múltiples variaciones
              htmlContent = htmlContent.replace(
                new RegExp(`url\\(["']?\\./public/img/${escapedName}["']?\\)`, 'g'),
                (match) => {
                  replacements++;
                  return `url(${processedPath})`;
                }
              );
              
              // Reemplazar cualquier ocurrencia de ./public/img/nombre (sin comillas, para casos edge)
              htmlContent = htmlContent.replace(
                new RegExp(`\\./public/img/${escapedName}(?![a-zA-Z0-9])`, 'g'),
                (match) => {
                  replacements++;
                  return processedPath;
                }
              );
              
              if (replacements > 0 && originalName === 'slider-img1.png') {
                console.log(`  🔄 Replaced ${replacements} occurrences of ${originalName} -> ${processedPath}`);
              }
            });
          }
          
          // También reemplazar cualquier ruta ./public/img/ restante con /img/ (fallback)
          // Esto solo afecta imágenes que no fueron procesadas por Vite
          htmlContent = htmlContent.replace(/\.\/public\/img\//g, '/img/');
          
          writeFileSync(destPath, htmlContent, 'utf-8');
          console.log(`✅ Copied and updated ${file} to dist/`);
        } catch (error) {
          console.warn(`⚠️  Could not copy ${file}:`, error.message);
        }
      });
    }
  };
}

// Plugin para manejar rutas limpias en dev y preview
function cleanUrls() {
  const routeMap = {
    '/about': '/about.html',
    '/privacy-policy': '/privacy-policy.html',
    '/terms-and-conditions': '/terms-conditions.html',
  };

  const handleRequest = (req, res, next) => {
    // Manejar rutas exactas
    if (routeMap[req.url]) {
      console.log(`🔄 Redirecting ${req.url} to ${routeMap[req.url]}`);
      req.url = routeMap[req.url];
      return next();
    }
    // Manejar rutas con trailing slash
    const urlWithoutSlash = req.url.replace(/\/$/, '');
    if (routeMap[urlWithoutSlash]) {
      console.log(`🔄 Redirecting ${req.url} to ${routeMap[urlWithoutSlash]}`);
      req.url = routeMap[urlWithoutSlash];
      return next();
    }
    next();
  };

  return {
    name: 'clean-urls',
    configureServer(server) {
      server.middlewares.use(handleRequest);
    },
    configurePreviewServer(server) {
      // En preview, el middleware se ejecuta antes de servir archivos estáticos
      server.middlewares.use(handleRequest);
    }
  };
}

export default defineConfig({
  plugins: [copyHtmlFiles(), cleanUrls()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        about: './about.html',
        'privacy-policy': './privacy-policy.html',
        'terms-conditions': './terms-conditions.html',
      },
    },
  },
});

