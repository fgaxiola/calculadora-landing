# ROOTS - Rules Of Origin Trade Solutions

Landing page para ROOTS, una plataforma especializada en la determinación, validación y certificación de reglas de origen.

## 🚀 Inicio Rápido

Necesitas los archivos /index.html, /about.html, etc. Para que funcione "npm run dev" y desarrollar con hot reload. Aunque el contenido se modifique en /pages/index-content.html y cuando se haga "npm run build" se compile a /dist/index.html.

Siempre que hagas un "npm run build" haz un "cp .htaccess dist"

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** versión 16 o superior
- **npm** (incluido con Node.js) o **yarn**

### Instalación desde cero

1. **Clonar el repositorio**

   ```bash
   git clone <url-del-repositorio>
   cd calculadora-landing
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

   O si prefieres usar yarn:

   ```bash
   yarn install
   ```

3. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```
   El proyecto estará disponible en `http://localhost:5173` (puerto por defecto de Vite)

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo con hot-reload
- `npm run build` - Compila el proyecto para producción en la carpeta `dist/` (incluye generación de HTML)
- `npm run build:html` - Genera las páginas HTML desde componentes (`privacy-policy.html`, `terms-conditions.html`, `about.html`)
- `npm run preview` - Previsualiza la versión compilada localmente

### ⚠️ Nota sobre Preview

Cuando ejecutes `npm run preview`, las rutas limpias funcionarán automáticamente:

- `/about` → muestra `about.html`
- `/privacy-policy` → muestra `privacy-policy.html`
- `/terms-and-conditions` → muestra `terms-conditions.html`

Si alguna ruta no funciona, también puedes acceder directamente a los archivos HTML:

- `/about.html`
- `/privacy-policy.html`
- `/terms-conditions.html`

## 🏗️ Compilación para Producción

Para generar los archivos optimizados para producción:

```bash
npm run build
```

Esto generará una carpeta `dist/` con todos los archivos optimizados, minificados y listos para desplegar.

### Estructura del build

```
dist/
├── index.html          # HTML optimizado
├── assets/            # CSS, JS e imágenes optimizadas
│   ├── index.[hash].css
│   ├── index.[hash].js
│   └── [imágenes con hash]
└── [otros archivos HTML]
```

## 🌐 Despliegue en Apache

### Configuración del .htaccess

El proyecto incluye un archivo `.htaccess` en la raíz que debe ser copiado a la carpeta `dist/` después de compilar, o configurado en el servidor Apache.

**Importante:** Después de compilar, copia el `.htaccess` a la carpeta `dist/`:

```bash
npm run build
cp .htaccess dist/
```

### Configuración del VirtualHost (opcional)

Si tienes acceso a la configuración de Apache, puedes configurar un VirtualHost:

```apache
<VirtualHost *:80>
    ServerName roots.trade
    DocumentRoot /ruta/a/calculadora-landing/dist

    <Directory /ruta/a/calculadora-landing/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/roots_error.log
    CustomLog ${APACHE_LOG_DIR}/roots_access.log combined
</VirtualHost>
```

## 📁 Estructura del Proyecto

```
calculadora-landing/
├── components/          # Componentes HTML reutilizables
│   ├── head.html        # Meta tags y head común
│   ├── header.html      # Header/navegación
│   └── footer.html      # Footer con formulario de contacto
├── pages/               # Contenido específico de cada página
│   ├── about-content.html
│   ├── privacy-policy-content.html
│   └── terms-conditions-content.html
├── public/              # Archivos estáticos (imágenes, etc.)
│   └── img/
├── dist/                # Build de producción (generado)
├── index.html           # HTML principal (home)
├── about.html           # Página About (generada)
├── privacy-policy.html  # Política de privacidad (generada)
├── terms-conditions.html # Términos y condiciones (generada)
├── main.js              # JavaScript principal
├── main.css             # CSS principal (importa otros CSS)
├── style.css            # Estilos generales
├── responsive.css       # Estilos responsive
├── color.css            # Variables de color
├── size.css             # Variables de tamaño
├── build-html.js        # Script para generar HTML desde componentes
├── package.json         # Dependencias y scripts
├── .gitignore          # Archivos ignorados por Git
├── .htaccess           # Configuración Apache
└── README.md           # Este archivo
```

## 🔧 Sistema de Componentes HTML

El proyecto utiliza un sistema de componentes reutilizables para mantener consistencia entre páginas:

### Componentes disponibles:

- **`components/head.html`** - Meta tags, Open Graph, Twitter Cards
- **`components/header.html`** - Navegación principal
- **`components/footer.html`** - Footer con formulario de contacto

### Páginas generadas:

- **`privacy-policy.html`** - Política de privacidad
- **`terms-conditions.html`** - Términos y condiciones
- **`about.html`** - Página Acerca de

### Cómo funciona:

1. **Editar contenido**: Modifica los archivos en `pages/` para cambiar el contenido de cada página
2. **Editar componentes**: Modifica `components/` para cambiar header, footer o meta tags
3. **Regenerar páginas**: Ejecuta `npm run build:html` para generar los HTML finales

### Rutas disponibles:

- `/` - Página principal
- `/about` o `/about.html` - Acerca de
- `/privacy-policy` o `/privacy-policy.html` - Política de privacidad
- `/terms-and-conditions` o `/terms-conditions.html` - Términos y condiciones

Las rutas limpias (sin `.html`) funcionan gracias a la configuración en `.htaccess`.

## 🛠️ Tecnologías Utilizadas

- **Vite** - Build tool y dev server
- **Vanilla JavaScript** - Sin frameworks
- **CSS** - Estilos personalizados

## 📝 Notas de Desarrollo

- El proyecto usa **ES Modules** (`type: "module"` en package.json)
- Los archivos CSS se importan desde `main.js`
- Las imágenes deben estar en la carpeta `public/img/`
- El año del copyright se actualiza automáticamente con JavaScript

## 🔧 Solución de Problemas

### El servidor no inicia

- Verifica que Node.js esté instalado: `node --version`
- Elimina `node_modules` y reinstala: `rm -rf node_modules && npm install`

### Los cambios no se reflejan

- Detén el servidor (Ctrl+C) y vuelve a iniciarlo
- Limpia la caché del navegador

### Error al compilar

- Asegúrate de tener todas las dependencias instaladas
- Verifica que no haya errores de sintaxis en los archivos

## 📄 Licencia

Copyright ROOTS 2025. All rights reserved.

## 👥 Contacto

Para más información, visita [roots.trade](https://roots.trade)
