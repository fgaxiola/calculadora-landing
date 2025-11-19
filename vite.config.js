import { defineConfig } from 'vite';
import { copyFileSync } from 'fs';
import { join } from 'path';

// Plugin para copiar HTMLs adicionales a dist/
function copyHtmlFiles() {
  return {
    name: 'copy-html-files',
    writeBundle() {
      const htmlFiles = ['about.html', 'privacy-policy.html', 'terms-conditions.html'];
      htmlFiles.forEach(file => {
        try {
          copyFileSync(
            join(process.cwd(), file),
            join(process.cwd(), 'dist', file)
          );
          console.log(`✅ Copied ${file} to dist/`);
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

