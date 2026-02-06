# Purple Heal Entertainment - Website

Una aplicación web premium para Purple Heal Entertainment, inspirada en HYBE Labels pero con la identidad visual única de Purple Heal.

## 🎵 Características

- **Diseño Premium**: Glassmorphism, gradientes púrpuras, y animaciones suaves
- **Identidad de Marca**: Colores (#61397C), tipografías (Square One, Oxanium) y logos oficiales
- **Páginas Principales**:
  - `index.html` - Página de inicio con hero section y artistas destacados
  - `artists.html` - Grid completo de artistas
  - `artist-profile.html` - Perfil detallado con discografía y merchandising
- **Responsivo**: Diseño mobile-first que se adapta a cualquier pantalla
- **Interactivo**: Animaciones al scroll, hover effects, y navegación suave

## 🚀 Cómo usar

### Opción 1: Servidor local simple (recomendado)
```bash
npx -y serve .
```
Luego abre http://localhost:3000 en tu navegador

### Opción 2: Live Server (VS Code)
1. Instala la extensión "Live Server" en VS Code
2. Click derecho en `index.html` → "Open with Live Server"

### Opción 3: Abrir directamente
Doble click en `index.html` (algunas funciones pueden no trabajar correctamente)

## 📁 Estructura del Proyecto

```
purple-heal-website/
├── index.html              # Página principal
├── artists.html            # Listado de artistas
├── artist-profile.html     # Perfil de artista
├── css/
│   ├── reset.css          # Reset CSS
│   ├── variables.css      # Variables de diseño
│   ├── global.css         # Estilos globales
│   └── components.css     # Componentes reutilizables
├── js/
│   ├── main.js           # JavaScript principal
│   └── artists-data.js   # Datos de artistas
└── assets/
    ├── images/           # Imágenes del sitio
    ├── logos/            # Logos Purple Heal
    └── fonts/            # Fuentes (Square One, Oxanium)
```

## 🎨 Paleta de Colores

- **Purple Principal**: `#61397C`
- **Gold Accent**: `#d4af37`
- **Backgrounds**: Gradientes oscuros con púrpura

## 🔧 Personalización

Para agregar nuevos artistas, edita `js/artists-data.js` y agrega la información del artista en el objeto `artistsData`.

## 📝 Notas

- Las fuentes Square One y Oxanium están incluidas en `/assets/fonts/`
- Los logos y patrones de marca están en `/assets/logos/` y `/assets/images/`
- El diseño es completamente responsivo (mobile, tablet, desktop)

---

**Purple Heal Entertainment** - Creando el futuro de la música 🎵
