import { defineConfig } from "vite";
import {
  copyFileSync,
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
} from "fs";
import { join } from "path";
import { createReadStream } from "fs";

// Plugin para copiar HTMLs adicionales a dist/ e inyectar assets
function copyHtmlFiles() {
  return {
    name: "copy-html-files",
    writeBundle() {
      const htmlFiles = [
        "index.html",
        "about.html",
        "privacy-policy.html",
        "terms-conditions.html",
        "404.html",
      ];

      // Copiar sitemap.xml, robots.txt y .htaccess a dist/
      const publicDir = join(process.cwd(), "public");
      const distDir = join(process.cwd(), "dist");
      const rootDir = process.cwd();

      try {
        // Copiar sitemap.xml desde public/
        if (existsSync(join(publicDir, "sitemap.xml"))) {
          copyFileSync(
            join(publicDir, "sitemap.xml"),
            join(distDir, "sitemap.xml")
          );
          console.log("✅ Copied sitemap.xml to dist/");
        }
        // Copiar robots.txt desde public/
        if (existsSync(join(publicDir, "robots.txt"))) {
          copyFileSync(
            join(publicDir, "robots.txt"),
            join(distDir, "robots.txt")
          );
          console.log("✅ Copied robots.txt to dist/");
        }
        // Copiar .htaccess desde la raíz del proyecto
        if (existsSync(join(rootDir, ".htaccess"))) {
          copyFileSync(join(rootDir, ".htaccess"), join(distDir, ".htaccess"));
          console.log("✅ Copied .htaccess to dist/");
        }
      } catch (error) {
        console.warn(
          "⚠️  Could not copy sitemap.xml, robots.txt or .htaccess:",
          error.message
        );
      }

      // Leer index.html para extraer las referencias a los assets
      const indexPath = join(process.cwd(), "dist", "index.html");
      let cssAsset = "";
      let jsAsset = "";
      let logoAsset = "";

      // Mapeo de imágenes: nombre original -> ruta procesada en assets
      const imageMap = new Map();

      try {
        const indexContent = readFileSync(indexPath, "utf-8");
        // Extraer CSS y JS del index.html procesado
        const cssMatch = indexContent.match(
          /<link rel="stylesheet" href="([^"]+)">/
        );
        const jsMatch = indexContent.match(
          /<script type="module" crossorigin src="([^"]+)"><\/script>/
        );
        // Extraer logo procesado
        const logoMatch = indexContent.match(
          /src="([^"]*logo-header-new[^"]+)"/
        );

        if (cssMatch) cssAsset = cssMatch[1];
        if (jsMatch) jsAsset = jsMatch[1];
        if (logoMatch) logoAsset = logoMatch[1];

        // Crear mapeo de imágenes desde los assets procesados
        const assetsDir = join(process.cwd(), "dist", "assets");
        const publicImgDir = join(process.cwd(), "public", "img");

        if (existsSync(assetsDir)) {
          const assetFiles = readdirSync(assetsDir);
          assetFiles.forEach((file) => {
            // Extraer el nombre base antes del hash (ej: slider-img1.100566aa.png -> slider-img1.jpg)
            const baseMatch = file.match(
              /^(.+?)\.[a-f0-9]+\.(png|jpg|jpeg|svg|gif|webp)$/i
            );
            if (baseMatch) {
              const baseName = `${baseMatch[1]}.${baseMatch[2]}`;
              imageMap.set(baseName, `/assets/${file}`);
            }
          });
        }

        // Para imágenes que no fueron procesadas por Vite, usar la ruta de public/img
        // Esto asegura que todas las imágenes funcionen
        // IMPORTANTE: Solo agregar si no está ya en el mapa (las procesadas tienen prioridad)
        if (existsSync(publicImgDir)) {
          const publicFiles = readdirSync(publicImgDir);
          publicFiles.forEach((file) => {
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
        console.warn(
          "⚠️  Could not read index.html to extract assets:",
          error.message
        );
      }

      htmlFiles.forEach((file) => {
        try {
          const sourcePath = join(process.cwd(), file);
          const destPath = join(process.cwd(), "dist", file);

          // Leer el contenido del HTML generado
          let htmlContent = readFileSync(sourcePath, "utf-8");

          // Reemplazar las referencias a los assets si existen
          if (cssAsset && jsAsset) {
            // Reemplazar el script de main.js con el asset procesado (con o sin defer)
            htmlContent = htmlContent.replace(
              /<script type="module"[^>]*src="\/main\.js"[^>]*><\/script>/,
              `<script type="module" crossorigin src="${jsAsset}"></script>`
            );

            // Agregar el CSS si no existe
            if (!htmlContent.includes('<link rel="stylesheet"')) {
              // Insertar antes del cierre de </head>
              htmlContent = htmlContent.replace(
                "</head>",
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
              const escapedName = originalName.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
              );

              // Contar reemplazos para debug
              let replacements = 0;

              // Reemplazar en atributos src (con comillas simples o dobles)
              const srcBefore = htmlContent;
              htmlContent = htmlContent.replace(
                new RegExp(`src=["']\\./public/img/${escapedName}["']`, "g"),
                (match) => {
                  replacements++;
                  return `src="${processedPath}"`;
                }
              );

              // Reemplazar en background-image (url) - múltiples variaciones
              htmlContent = htmlContent.replace(
                new RegExp(
                  `url\\(["']?\\./public/img/${escapedName}["']?\\)`,
                  "g"
                ),
                (match) => {
                  replacements++;
                  return `url(${processedPath})`;
                }
              );

              // Reemplazar cualquier ocurrencia de ./public/img/nombre (sin comillas, para casos edge)
              htmlContent = htmlContent.replace(
                new RegExp(`\\./public/img/${escapedName}(?![a-zA-Z0-9])`, "g"),
                (match) => {
                  replacements++;
                  return processedPath;
                }
              );

              if (replacements > 0 && originalName === "slider-img1.jpg") {
                console.log(
                  `  🔄 Replaced ${replacements} occurrences of ${originalName} -> ${processedPath}`
                );
              }
            });
          }

          // También reemplazar cualquier ruta ./public/img/ restante con /img/ (fallback)
          // Esto solo afecta imágenes que no fueron procesadas por Vite
          htmlContent = htmlContent.replace(/\.\/public\/img\//g, "/img/");

          writeFileSync(destPath, htmlContent, "utf-8");
          console.log(`✅ Copied and updated ${file} to dist/`);
        } catch (error) {
          console.warn(`⚠️  Could not copy ${file}:`, error.message);
        }
      });
    },
  };
}

// Plugin para manejar rutas limpias en dev y preview
function cleanUrls() {
  const routeMap = {
    "/about": "/about.html",
    "/privacy-policy": "/privacy-policy.html",
    "/terms-and-conditions": "/terms-conditions.html",
    "/404": "/404.html",
  };

  // Rutas válidas que existen
  const validRoutes = ["/", "/about", "/privacy-policy", "/terms-and-conditions", "/404"];

  const handleRequest = (req, res, next) => {
    // Ignorar rutas especiales de Vite (HMR, client, etc.)
    if (req.url.startsWith("/@") || req.url.startsWith("/node_modules/")) {
      return next();
    }

    // Ignorar archivos estáticos reales (assets, img, etc.)
    const staticExtensions = [".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".json", ".xml", ".txt"];
    const isStaticFile = staticExtensions.some(ext => req.url.endsWith(ext)) ||
      req.url.startsWith("/assets/") ||
      req.url.startsWith("/img/") ||
      req.url.startsWith("/public/") ||
      req.url === "/robots.txt" ||
      req.url === "/sitemap.xml";

    if (isStaticFile) {
      return next();
    }

    // Si es la raíz, continuar normalmente
    if (req.url === "/" || req.url === "/index.html") {
      return next();
    }

    // Manejar rutas exactas del routeMap
    if (routeMap[req.url]) {
      console.log(`🔄 Redirecting ${req.url} to ${routeMap[req.url]}`);
      // Si es la ruta /404, establecer código de estado 404
      if (req.url === "/404") {
        res.statusCode = 404;
      }
      req.url = routeMap[req.url];
      return next();
    }
    
    // Manejar rutas con trailing slash
    const urlWithoutSlash = req.url.replace(/\/$/, "");
    if (routeMap[urlWithoutSlash]) {
      console.log(`🔄 Redirecting ${req.url} to ${routeMap[urlWithoutSlash]}`);
      // Si es la ruta /404, establecer código de estado 404
      if (urlWithoutSlash === "/404") {
        res.statusCode = 404;
      }
      req.url = routeMap[urlWithoutSlash];
      return next();
    }

    // Si la ruta no es válida y no es un archivo estático, redirigir a 404
    if (!validRoutes.includes(req.url) && !validRoutes.includes(urlWithoutSlash) && !req.url.endsWith(".html")) {
      console.log(`🔄 Route not found: ${req.url}, redirecting to /404.html`);
      // En preview mode, servir el archivo 404.html manualmente con código 404
      const distDir = join(process.cwd(), "dist");
      const filePath = join(distDir, "404.html");
      
      if (existsSync(filePath)) {
        const fileContent = readFileSync(filePath, "utf-8");
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(fileContent);
        return;
      } else {
        // Fallback: cambiar URL y marcar como 404
        req.originalUrl = req.url;
        req.url = "/404.html";
        req.is404 = true;
        return next();
      }
    }
    
    next();
  };

  // Middleware adicional para establecer código 404 en preview
  const set404Status = (req, res, next) => {
    // Si esta es una respuesta 404, interceptar writeHead para establecer el código correcto
    if (req.is404) {
      // Interceptar writeHead antes de que Vite lo llame
      const originalWriteHead = res.writeHead;
      const originalStatus = res.statusCode;
      
      // Guardar el estado original
      let statusCodeIntercepted = false;
      
      res.writeHead = function (statusCode, statusMessage, headers) {
        // Si Vite intenta escribir 200, cambiarlo a 404
        if (statusCode === 200 && !statusCodeIntercepted) {
          statusCodeIntercepted = true;
          console.log(`🔧 Changing status code from 200 to 404 for ${req.originalUrl || req.url}`);
          // Llamar al writeHead original con código 404
          if (typeof statusMessage === 'object') {
            // writeHead(statusCode, headers)
            return originalWriteHead.call(this, 404, statusMessage);
          } else if (statusMessage) {
            // writeHead(statusCode, statusMessage, headers)
            return originalWriteHead.call(this, 404, "Not Found", headers);
          } else {
            // writeHead(statusCode)
            return originalWriteHead.call(this, 404);
          }
        }
        return originalWriteHead.apply(this, arguments);
      };

      // También interceptar statusCode directamente
      Object.defineProperty(res, 'statusCode', {
        get: function() {
          return this._statusCode || 200;
        },
        set: function(code) {
          if (code === 200 && req.is404) {
            console.log(`🔧 Changing statusCode from 200 to 404 for ${req.originalUrl || req.url}`);
            this._statusCode = 404;
          } else {
            this._statusCode = code;
          }
        },
        configurable: true
      });
    }
    
    next();
  };

  return {
    name: "clean-urls",
    configureServer(server) {
      server.middlewares.use(handleRequest);
    },
    configurePreviewServer(server) {
      // En preview, usar ambos middlewares
      // Primero el que maneja las rutas, luego el que establece el código 404
      server.middlewares.use(handleRequest);
      server.middlewares.use(set404Status);
    },
  };
}

export default defineConfig({
  plugins: [copyHtmlFiles(), cleanUrls()],
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        about: "./about.html",
        "privacy-policy": "./privacy-policy.html",
        "terms-conditions": "./terms-conditions.html",
        "404": "./404.html",
      },
    },
  },
});
