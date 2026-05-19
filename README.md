# GymManager — Frontend

> Interfaz de usuario de GymManager, una plataforma completa de gestión de gimnasios.
> Desarrollada con **Vue 3 + Vite**.

![Estado](https://img.shields.io/badge/estado-en%20producción-brightgreen)
![Deploy](https://img.shields.io/badge/deploy-https%3A%2F%2Fmy--gym--manager.com-blue)
![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)

---

## Descripción

GymManager Frontend es la capa de presentación de un sistema de gestión de gimnasios. Permite a los clientes consultar sus rutinas semanales, registrar asistencia diaria y hacer seguimiento de su racha de entrenamiento. Los entrenadores pueden asignar y editar rutinas de sus clientes. Los administradores gestionan usuarios y organizaciones desde paneles dedicados.

La app es completamente **responsive**, soporta **dos idiomas** (español / inglés) y tiene opciones de **accesibilidad** (tamaño de fuente y contraste alto).

---

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| [Vue 3](https://vuejs.org/) | 3.x | Framework reactivo — Composition API |
| [Vite](https://vitejs.dev/) | 6.x | Bundler y servidor de desarrollo |
| [Vue Router](https://router.vuejs.org/) | 4.x | Enrutamiento SPA con guards por rol |
| [Pinia](https://pinia.vuejs.org/) | 2.x | State management (auth + UI) |
| [Vue i18n](https://vue-i18n.intlify.dev/) | 9.x | Internacionalización (ES / EN) |
| Fetch API | — | Comunicación con la API REST |

---

## Roles y funcionalidades

La aplicación tiene cuatro roles, cada uno con su propio layout y navegación:

| Rol | Funcionalidades |
|---|---|
| `superadmin` | Gestión completa de usuarios y organizaciones, exportación CSV |
| `administrador` | Gestión de usuarios de su organización, exportación CSV |
| `entrenador` | Visualización de clientes, asignación y edición de rutinas semanales |
| `cliente` | Dashboard diario, rutinas (semana / mes / año), racha, protectores, objetivos |

---

## Estructura de carpetas

```
src/
├── components/          # Componentes reutilizables
│   ├── Modal.vue
│   ├── DataTable.vue
│   ├── Pagination.vue
│   ├── PasswordInput.vue
│   ├── DropdownMenu.vue
│   └── …
├── composables/
│   └── useUserTable.js  # Lógica de tabla de usuarios (búsqueda, paginación, CRUD)
├── i18n/
│   ├── index.js         # Configuración Vue i18n con idioma persistido en localStorage
│   ├── es.json          # Traducciones en español
│   └── en.json          # Traducciones en inglés
├── layouts/             # Layouts por rol
│   ├── SuperadminLayout.vue
│   ├── AdminLayout.vue
│   ├── TrainerLayout.vue
│   └── ClientLayout.vue
├── pages/
│   ├── auth/            # Login, ForgotPassword, SetupPassword
│   ├── shared/          # Profile, Language, Accessibility (todos los roles)
│   ├── superadmin/      # Dashboard, Users, Organizations
│   ├── admin/           # Dashboard, Users
│   ├── trainer/         # Dashboard, Clients, ClientRoutine
│   └── client/          # Dashboard, Routine, Racha, Goals
├── router/
│   └── index.js         # Rutas + guard global de autenticación y rol
├── services/
│   ├── api.js           # Wrapper base (apiGet, apiPost, apiPut, apiDelete, apiDownload)
│   ├── auth.js          # Login, logout, usuario actual, recuperación de contraseña
│   ├── rutinas.js       # Rutinas semanales y rango
│   ├── rutinasFavoritas.js
│   ├── asistencias.js
│   ├── objetivos.js
│   ├── usuarios.js
│   ├── organizaciones.js
│   └── dashboard.js
├── stores/
│   ├── auth.js          # Token, usuario autenticado, rol activo
│   └── ui.js            # Idioma, tamaño de fuente, contraste alto
└── style.css            # Estilos globales (tema oscuro con CSS custom properties)
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8000/api
```

> Si la variable no está definida, el servicio usa `http://localhost:8000/api` por defecto.

---

## Instalación y ejecución

### Requisitos

- Node.js >= 18
- El backend de GymManager corriendo en local (ver [gymmanager-backend](https://github.com/unai5665/gymmanager-backend))

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/unai5665/gymmanager-frontend.git
cd gymmanager-frontend

# 2. Instalar dependencias
npm install

# 3. Configurar el entorno
cp .env.example .env
# Editar VITE_API_URL si el backend no corre en :8000

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

### Otros comandos

```bash
npm run build    # Compilar para producción → dist/
npm run preview  # Previsualizar el build localmente
```

---

## Autenticación

La autenticación se gestiona con **Laravel Sanctum** (tokens Bearer stateless).

1. El usuario hace login → el backend devuelve un token.
2. El token se persiste en `localStorage` a través del store de Pinia `auth.js`.
3. Todas las peticiones incluyen la cabecera `Authorization: Bearer <token>`.
4. Vue Router tiene un **guard global** que redirige a `/login` si no hay sesión activa.
5. El guard también verifica el **rol del usuario** para proteger rutas específicas.

### Recuperación de contraseña

1. El usuario solicita un enlace en `/forgot-password`.
2. El backend genera un token de un solo uso (24 h) y envía un email.
3. El usuario accede al enlace y establece su nueva contraseña en `/setup-password`.

---

## Sistema de rutinas

El componente `client/Routine.vue` ofrece tres vistas de la rutina:

| Vista | Descripción |
|---|---|
| **Semana** | Edición completa del plan semanal. Los días pasados y los días con asistencia registrada quedan bloqueados. |
| **Mes** | Calendario mensual con indicadores de asistencia por día y tipo de semana (predeterminada / personalizada / entrenador). |
| **Año** | Heatmap anual con 5 estados visuales (ver tabla abajo). |

### Estados visuales del heatmap anual

| Color | Estado |
|---|---|
| 🟢 Verde | Día de entrenamiento asistido |
| 🔴 Rojo | Día de entrenamiento fallado (o sin registro) |
| ⬛ Gris oscuro | Día de descanso |
| ⬜ Transparente | Día futuro (aún no ha llegado) |
| Invisible | Anterior a la creación del usuario |

---

## Internacionalización

La app soporta **español** e **inglés**. El idioma activo se persiste en `localStorage` y se restaura al recargar la página.

- Los nombres de ejercicios y grupos musculares se traducen dinámicamente.
- El idioma se cambia desde `Ajustes → Idioma`.

---

## Conexión con el backend

```
Frontend (Vue 3)          API REST (Laravel 12)         MySQL
:5173          ←──────→   :8000/api             ←──→   :3306
```

Toda la comunicación pasa por `src/services/api.js`, que gestiona las cabeceras de autenticación y los errores de red de forma centralizada.

---

## Deploy

La app está desplegada en **https://my-gym-manager.com** como contenedor Docker servido por Nginx, parte del stack definido en el `docker-compose.yml` del backend.

### Actualizar producción

```bash
# Desde el directorio del backend en el VPS
./deploy.sh
```

El script hace `git pull` en ambos repos y rebuilds solo los contenedores modificados.

### Build manual

```bash
npm run build
```

El contenido de `dist/` se puede servir con cualquier servidor estático (Nginx, Apache, Vercel, Netlify…).

> Configura el servidor para redirigir todas las rutas a `index.html` (requerido por Vue Router en modo `history`).

**Ejemplo Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Autor

**Unai Perez** — [github.com/unai5665](https://github.com/unai5665)

---

## Estado del proyecto

🟢 **En producción** — https://my-gym-manager.com

- [x] Autenticación completa (login, logout, recuperación de contraseña)
- [x] Dashboard por rol
- [x] Sistema de rutinas semanales (semana / mes / año)
- [x] Registro de asistencia diaria
- [x] Sistema de racha con protectores
- [x] Objetivos personales
- [x] Diseño responsive
- [x] Internacionalización ES / EN
- [x] Accesibilidad (tamaño de fuente, contraste alto)
- [ ] Tests unitarios / e2e
- [ ] PWA / notificaciones push
