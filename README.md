# Kleber Producer - Tienda Virtual de Beats

Una aplicación web completa para comprar y vender beats musicales con estilo urbano/hip-hop, integrada con Firebase para autenticación y almacenamiento.

## 🎵 Características Principales

### 🔐 Sistema de Autenticación
- Registro e inicio de sesión con Firebase Authentication
- Validación de formularios (email, contraseña)
- Detección automática de sesión activa
- Cierre de sesión funcional
- Mensajes de error claros y notificaciones visuales

### 🎨 Diseño y Experiencia
- **Estilo Urbano/Hip-Hop** con colores negro, amarillo y morado
- **Modo Oscuro/Claro** funcional con persistencia en localStorage
- **Diseño Responsive** para móviles, tablets y PC
- **Animaciones suaves** y efectos glow
- **Menú hamburguesa** animado para dispositivos móviles

### 🛒 Sistema de E-Commerce
- **Catálogo de Beats** en grid responsive
- **Reproductor de Audio** integrado con controles
- **Carrito de Compras** con localStorage
- **Sistema de Subida** de beats con Firebase Storage
- **Proceso de Compra** simulado

### 🔥 Integración con Firebase
- **Firestore** para guardar datos de beats
- **Storage** para audios e imágenes
- **Authentication** para gestión de usuarios
- **Tiempo Real** para actualización de beats

## 📁 Estructura de Archivos

```
cepo/
├── index.html          # Estructura HTML principal
├── styles.css          # Estilos CSS con diseño urbano
├── app.js             # Lógica JavaScript completa
└── README.md          # Este archivo
```

## 🚀 Cómo Usar

### 1. Configuración Inicial
La aplicación ya está configurada con Firebase usando las credenciales proporcionadas:
- Project ID: kleber-producer
- Authentication, Firestore y Storage habilitados

### 2. Abrir la Aplicación
1. Abre `index.html` en tu navegador web
2. La aplicación cargará automáticamente

### 3. Flujo de Usuario

#### Para Compradores:
1. **Registro/Login**: Crea una cuenta o inicia sesión
2. **Explorar Beats**: Navega por el catálogo disponible
3. **Reproducir**: Escucha previews de los beats
4. **Añadir al Carrito**: Selecciona los beats que quieres comprar
5. **Comprar**: Procesa tu compra (simulado)

#### Para Productores:
1. **Iniciar Sesión**: Accede con tu cuenta
2. **Ver Perfil**: Accede a "Mi Perfil" para gestionar tus beats
3. **Subir Beat**: Usa el formulario para subir nuevos beats
4. **Completar Datos**: Nombre, precio, archivo de audio e imagen
5. **Publicar**: Tu beat aparecerá automáticamente en el catálogo
6. **Gestionar Beats**: Elimina beats subidos desde tu perfil

### Perfil de Usuario:
1. **Acceso**: Al iniciar sesión, aparece "Mi Perfil" en el menú
2. **Información Personal**: Muestra tu email y estadísticas
3. **Beats Comprados**: Visualiza todos tus beats adquiridos
4. **Mis Beats**: Gestiona los beats que has subido
5. **Estadísticas**: Número de beats comprados y total gastado

## 🎨 Características de Diseño

### Paleta de Colores
- **Principal**: Negro (#000000)
- **Secundario**: Amarillo (#FFD700)
- **Terciario**: Morado (#8000FF)

### Tipografía
- **Bebas Neue**: Para títulos y encabezados
- **Roboto**: Para contenido general

### Efectos Visuales
- Sombras y efectos glow en amarillo/morado
- Animaciones hover en botones y tarjetas
- Transiciones suaves en todo el diseño
- Indicadores de carga animados

## 📱 Responsive Design

### Desktop (1200px+)
- Grid de beats: 4 columnas
- Navegación horizontal completa
- Player de audio fijo en bottom

### Tablet (768px - 1199px)
- Grid de beats: 2-3 columnas
- Menú hamburguesa opcional
- Layout adaptado

### Móvil (< 768px)
- Grid de beats: 1 columna
- Menú hamburguesa obligatorio
- Interfaz táctil optimizada

## 🔧 Funcionalidades Técnicas

### JavaScript Features
- **ES6+**: Arrow functions, destructuring, template literals
- **Firebase SDK v9**: Modular y compatible
- **LocalStorage**: Persistencia de carrito y tema
- **Event Delegation**: Manejo eficiente de eventos
- **Async/Await**: Operaciones asíncronas limpias

### Firebase Integration
```javascript
// Configuración automática
const firebaseConfig = {
    apiKey: "AIzaSyCb_n1TtORgF07jI6FV4EopZuu_2jLwFbY",
    authDomain: "kleber-producer.firebaseapp.com",
    projectId: "kleber-producer",
    storageBucket: "kleber-producer.firebasestorage.app",
    messagingSenderId: "743475981821",
    appId: "1:743475981821:web:728e40eecae7c6c3d93d94"
};
```

### Validaciones
- **Email**: Formato válido requerido
- **Contraseña**: Mínimo 6 caracteres
- **Archivos**: Validación de tipos (audio/imagen)
- **Formularios**: Campos obligatorios

## 🎯 Puntos Clave de Implementación

### Autenticación
- ✅ Registro con validación
- ✅ Inicio de sesión con manejo de errores
- ✅ Detección de sesión activa
- ✅ Cierre de sesión con redirección
- ✅ Mensajes visuales de éxito/error

### Gestión de Beats
- ✅ Carga desde Firestore en tiempo real
- ✅ Subida de archivos a Storage
- ✅ Reproductor de audio integrado
- ✅ Sistema de calificación/compra

### UI/UX
- ✅ Modo oscuro/claro persistente
- ✅ Navegación suave con scroll
- ✅ Notificaciones no intrusivas
- ✅ Loading states y feedback visual
- ✅ Perfil de usuario con tabs
- ✅ Estadísticas de compras
- ✅ Gestión de beats subidos

## 🌐 Navegación

- **Inicio**: Hero section con llamada a la acción
- **Beats**: Catálogo principal con filtros
- **Subir Beat**: Formulario para productores
- **Carrito**: Gestión de compras
- **Mi Perfil**: Perfil de usuario con beats comprados y subidos
- **Login/Registro**: Sistema de autenticación

## 📝 Notas Adicionales

- La aplicación es **100% funcional** sin frameworks externos
- Todo el código está **comentado** y organizado
- El diseño es **accesible** y semántico
- Las animaciones son **optimizadas** para rendimiento
- El código sigue **buenas prácticas** de desarrollo

## 🎶 ¡Listo para Usar!

La aplicación está completamente funcional y lista para ser desplegada. Solo necesitas abrir `index.html` en tu navegador y comenzar a usar Kleber Producer para comprar y vender beats profesionales.
