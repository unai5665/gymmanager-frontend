# GymManager — Frontend

> User interface for GymManager, a complete gym management platform.
> Built with **Vue 3 + Vite**.

![Status](https://img.shields.io/badge/status-production-brightgreen)
![Deploy](https://img.shields.io/badge/deploy-https%3A%2F%2Fmy--gym--manager.com-blue)
![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite\&logoColor=white)

---

## Overview

GymManager Frontend is the presentation layer of a gym management system. It allows clients to view their weekly workout routines, track daily attendance, and monitor their training streaks. Trainers can assign and edit their clients' routines, while administrators can manage users and organizations through dedicated dashboards.

The application is fully **responsive**, supports **two languages** (Spanish / English), and includes **accessibility options** such as font size adjustment and high-contrast mode.

---

## Technologies

| Technology                                | Version | Usage                                    |
| ----------------------------------------- | ------- | ---------------------------------------- |
| [Vue 3](https://vuejs.org/)               | 3.x     | Reactive framework — Composition API     |
| [Vite](https://vitejs.dev/)               | 6.x     | Build tool and development server        |
| [Vue Router](https://router.vuejs.org/)   | 4.x     | SPA routing with role-based route guards |
| [Pinia](https://pinia.vuejs.org/)         | 2.x     | State management (auth + UI)             |
| [Vue I18n](https://vue-i18n.intlify.dev/) | 9.x     | Internationalization (ES / EN)           |
| Fetch API                                 | —       | REST API communication                   |

---

## Roles & Features

The application has four roles, each with its own layout and navigation:

| Role            | Features                                                                           |
| --------------- | ---------------------------------------------------------------------------------- |
| `superadmin`    | Full user and organization management, CSV export                                  |
| `administrator` | User management within their organization, CSV export                              |
| `trainer`       | Client management, assignment and editing of weekly routines                       |
| `client`        | Daily dashboard, routines (week / month / year), streaks, streak protectors, goals |

---

## Project Structure

```text
src/
├── components/          # Reusable components
│   ├── Modal.vue
│   ├── DataTable.vue
│   ├── Pagination.vue
│   ├── PasswordInput.vue
│   ├── DropdownMenu.vue
│   └── …
├── composables/
│   └── useUserTable.js  # User table logic (search, pagination, CRUD)
├── i18n/
│   ├── index.js         # Vue I18n configuration with localStorage persistence
│   ├── es.json          # Spanish translations
│   └── en.json          # English translations
├── layouts/             # Role-specific layouts
│   ├── SuperadminLayout.vue
│   ├── AdminLayout.vue
│   ├── TrainerLayout.vue
│   └── ClientLayout.vue
├── pages/
│   ├── auth/            # Login, ForgotPassword, SetupPassword
│   ├── shared/          # Profile, Language, Accessibility (all roles)
│   ├── superadmin/      # Dashboard, Users, Organizations
│   ├── admin/           # Dashboard, Users
│   ├── trainer/         # Dashboard, Clients, ClientRoutine
│   └── client/          # Dashboard, Routine, Streak, Goals
├── router/
│   └── index.js         # Routes + global authentication and role guard
├── services/
│   ├── api.js           # Base wrapper (apiGet, apiPost, apiPut, apiDelete, apiDownload)
│   ├── auth.js          # Login, logout, current user, password recovery
│   ├── rutinas.js       # Weekly and date-range routines
│   ├── rutinasFavoritas.js
│   ├── asistencias.js
│   ├── objetivos.js
│   ├── usuarios.js
│   ├── organizaciones.js
│   └── dashboard.js
├── stores/
│   ├── auth.js          # Token, authenticated user, active role
│   └── ui.js            # Language, font size, high contrast
└── style.css            # Global styles (dark theme with CSS custom properties)
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8000/api
```

> If the variable is not defined, the service uses `http://localhost:8000/api` by default.

---

## Installation & Usage

### Requirements

* Node.js >= 18
* GymManager backend running locally (see [gymmanager-backend](https://github.com/unai5665/gymmanager-backend))

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/unai5665/gymmanager-frontend.git
cd gymmanager-frontend

# 2. Install dependencies
npm install

# 3. Configure the environment
cp .env.example .env
# Edit VITE_API_URL if the backend is not running on :8000

# 4. Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Other Commands

```bash
npm run build    # Build for production → dist/
npm run preview  # Preview the production build locally
```

---

## Authentication

Authentication is handled using **Laravel Sanctum** with stateless Bearer tokens.

1. The user logs in → the backend returns an authentication token.
2. The token is persisted in `localStorage` through the Pinia `auth.js` store.
3. All API requests include the `Authorization: Bearer <token>` header.
4. Vue Router uses a **global guard** to redirect unauthenticated users to `/login`.
5. The guard also validates the user's **role** to protect role-specific routes.

### Password Recovery

1. The user requests a recovery link at `/forgot-password`.
2. The backend generates a single-use token valid for 24 hours and sends an email.
3. The user follows the link and sets a new password at `/setup-password`.

---

## Workout Routine System

The `client/Routine.vue` component provides three different routine views:

| View      | Description                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------ |
| **Week**  | Full weekly plan editing. Past days and days with recorded attendance are locked.                |
| **Month** | Monthly calendar with attendance indicators and week type (default / custom / trainer-assigned). |
| **Year**  | Annual heatmap with five visual states (see table below).                                        |

### Annual Heatmap States

| Color         | Status                                        |
| ------------- | --------------------------------------------- |
| 🟢 Green      | Completed training day                        |
| 🔴 Red        | Missed training day (or no attendance record) |
| ⬛ Dark gray   | Rest day                                      |
| ⬜ Transparent | Future day (not reached yet)                  |
| Invisible     | Date before the user was created              |

---

## Internationalization

The application supports **Spanish** and **English**. The active language is persisted in `localStorage` and restored when the page is reloaded.

* Exercise names and muscle groups are translated dynamically.
* The language can be changed from `Settings → Language`.

---

## Backend Integration

```text
Frontend (Vue 3)          REST API (Laravel 12)         MySQL
:5173          ←──────→   :8000/api             ←──→   :3306
```

All API communication goes through `src/services/api.js`, which centrally handles authentication headers and network errors.

---

## Deployment

The application has previously been deployed using **Docker and Nginx** on a VPS. The production environment is currently offline.

The application can be deployed as part of the Docker stack defined in the backend's `docker-compose.yml`.

### Updating Production

```bash
# From the backend directory on the VPS
./deploy.sh

The script performs `git pull` on both repositories and rebuilds only the modified containers.

### Manual Build

```bash
npm run build
```

The contents of `dist/` can be served using any static web server (Nginx, Apache, Vercel, Netlify, etc.).

> Configure the server to redirect all routes to `index.html` (required by Vue Router when using `history` mode).

**Example Nginx configuration:**

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Author

**Unai Perez** — [github.com/unai5665](https://github.com/unai5665)

---

## Project Status

🟡 **Development / Production deployment currently offline**

- [x] Full authentication (login, logout, password recovery)
- [x] Role-based dashboards
- [x] Weekly routine system (week / month / year)
- [x] Daily attendance tracking
- [x] Training streak system with streak protectors
- [x] Personal goals
- [x] Responsive design
- [x] Internationalization (ES / EN)
- [x] Accessibility (font size, high contrast)
- [ ] Unit / E2E tests
- [ ] PWA / push notifications
