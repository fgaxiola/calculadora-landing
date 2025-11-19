# Arquitectura del Sistema de Páginas

## Justificación de la Solución

Se implementó un **sistema de componentes HTML reutilizables con script de build** para generar las páginas estáticas. Esta solución fue elegida por las siguientes razones:

### ✅ Ventajas de esta Solución

#### 1. **SEO Optimizado**

- Cada página es un archivo HTML estático independiente
- URLs indexables por Google (`/about`, `/privacy-policy`, `/terms-and-conditions`)
- Meta tags específicos por página (title, description, Open Graph)
- Structured Data (JSON-LD) por página
- Mejor rendimiento que SPAs para contenido estático

#### 2. **Mantenibilidad**

- **DRY (Don't Repeat Yourself)**: Header y footer centralizados
- Cambios en navegación o footer se aplican a todas las páginas automáticamente
- Contenido separado de la estructura (fácil de editar)
- Un solo lugar para actualizar meta tags comunes

#### 3. **Simplicidad**

- No requiere frameworks complejos (React, Vue, etc.)
- No necesita servidor Node.js en producción
- Archivos HTML estándar que cualquier desarrollador puede entender
- Script de build simple y transparente

#### 4. **Consistencia**

- Misma estructura en todas las páginas
- Mismo header y footer en todas las páginas
- Estilos consistentes aplicados automáticamente
- Comportamiento uniforme

#### 5. **Flexibilidad**

- Fácil agregar nuevas páginas (solo crear contenido y configurar)
- Fácil modificar componentes sin tocar cada página individual
- Compatible con el sistema de build de Vite existente

### 🔄 Flujo de Trabajo

```
1. Editar contenido → pages/[nombre]-content.html
2. Editar componentes → components/[componente].html
3. Ejecutar build → npm run build:html
4. Generar HTMLs → [nombre].html
5. Compilar con Vite → npm run build
```

### 📊 Comparación con Otras Soluciones

| Solución                    | SEO        | Mantenibilidad | Complejidad | Rendimiento |
| --------------------------- | ---------- | -------------- | ----------- | ----------- |
| **HTML Estático (Actual)**  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐       | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐  |
| SPA con React/Vue           | ⭐⭐⭐     | ⭐⭐⭐⭐⭐     | ⭐⭐        | ⭐⭐⭐⭐    |
| Server-Side Rendering       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐         | ⭐⭐        | ⭐⭐⭐      |
| Template Engine (PHP/Jinja) | ⭐⭐⭐⭐   | ⭐⭐⭐⭐       | ⭐⭐⭐      | ⭐⭐⭐⭐    |

### 🎯 Casos de Uso Ideales

Esta solución es perfecta para:

- ✅ Landing pages estáticas
- ✅ Sitios corporativos simples
- ✅ Páginas de términos y políticas
- ✅ Sitios que priorizan SEO
- ✅ Proyectos sin necesidad de interactividad compleja

### 📝 Estructura de Archivos

```
components/
├── head.html          # Meta tags configurables
├── header.html        # Navegación reutilizable
└── footer.html        # Footer con formulario

pages/
├── about-content.html              # Contenido editable
├── privacy-policy-content.html     # Contenido editable
└── terms-conditions-content.html  # Contenido editable

build-html.js          # Script que combina componentes + contenido
```

### 🔧 Cómo Agregar una Nueva Página

1. Crear archivo de contenido en `pages/nueva-pagina-content.html`
2. Agregar configuración en `build-html.js`:

```javascript
'nueva-pagina': {
  title: 'Título | ROOTS',
  canonical: 'https://roots.trade/nueva-pagina.html',
  metaDescription: 'Descripción...',
  // ... más config
  contentFile: 'pages/nueva-pagina-content.html'
}
```

3. Ejecutar `npm run build:html`
4. Agregar ruta en `.htaccess` si quieres URL limpia

### 🚀 Próximos Pasos (Opcionales)

Si el proyecto crece, se podría considerar:

- Migrar a un sistema de templates más robusto (Nunjucks, Handlebars)
- Implementar hot-reload durante desarrollo
- Agregar validación de HTML generado
- Integrar con sistema de CMS headless

Pero para el caso actual, esta solución es la más adecuada.
