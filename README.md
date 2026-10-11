# ⚽ Mundial 2026 — Simulador Interactivo

**Aplicación web Full Stack** para seguimiento, simulación y análisis del Mundial de Fútbol 2026. Construida con **Next.js 14 App Router**, TypeScript y un sistema de diseño premium con glassmorphism y paletas de color dinámicas por selección.

---

## ¿Qué es este proyecto?

Un simulador web completo del Mundial FIFA 2026 que permite:

- **Gestionar una selección** — plantel, cuerpo técnico, formación táctica, historial y rivales.
- **Simular el torneo** — motor de simulación que procesa grupos y fases eliminatorias hasta definir a los finalistas.
- **Jugar la Gran Final** — simulador interactivo por turnos donde el usuario elige jugadas tácticas en tiempo real.
- **Consultar estadísticas** — goleadores, asistencias, premios individuales, camino del equipo partido a partido.
- **Historial de Mundiales** — archivo de ediciones anteriores de la Copa del Mundo FIFA.
- **Eventos en vivo y estado del equipo** durante la Final.

---

## Arquitectura

El proyecto sigue una arquitectura **monorepo Next.js** donde el frontend y la capa de API proxy conviven en la misma aplicación:

```
┌─────────────────────────────────────┐
│       Browser (Next.js Client)      │
│  React Components + AppContext      │
└──────────────┬──────────────────────┘
               │ fetch /api/...
┌──────────────▼──────────────────────┐
│     Next.js Route Handlers          │
│  app/api/** (proxy + fallback)      │
└──────────────┬──────────────────────┘
               │ HTTP proxy
┌──────────────▼──────────────────────┐
│   Backend BFF — NestJS (port 4101)  │
│   /worldCupCore/**                  │
└──────────────┬──────────────────────┘
               │ HTTP
┌──────────────▼──────────────────────┐
│   WorldCupAPI (port 5101, solo      │
│   lectura, datos del torneo)        │
└─────────────────────────────────────┘
```

### Flujo de datos

1. Los **componentes React** llaman a `src/services/api.ts` — cliente HTTP centralizado que apunta a `/api/*`.
2. Los **Route Handlers** en `src/app/api/**` proxean cada pedido al **BFF NestJS** con un timeout de 2.5 s.
3. Si el BFF no responde, los Route Handlers retornan **datos mock** locales (fallback) para que el frontend funcione sin backend.
4. El **BFF NestJS** es el único que habla con la **WorldCupAPI** — el frontend nunca la contacta directamente.

---

## Stack técnico

| Capa | Tecnología | Puerto |
|------|-----------|--------|
| Frontend + API Proxy | Next.js 14 (App Router) | `:3101` |
| BFF Backend | NestJS | `:4101` |
| API de datos | WorldCupAPI (solo lectura) | `:5101` |

**Dependencias del frontend:**

| Paquete | Uso |
|---------|-----|
| `next` 14 | Framework React con App Router |
| `react` / `react-dom` 18 | Renderizado UI |
| `lucide-react` | Iconografía SVG |
| `typescript` 5 | Tipado estático |

---

## Estructura de carpetas

```
src/
├── app/
│   ├── layout.tsx              # Layout raíz: Sidebar, Topbar, Header, AdminModal
│   ├── page.tsx                # Redirige a /my-team/squad
│   ├── api/                    # Route Handlers (proxy hacia NestJS + fallback mock)
│   │   ├── admin/config/
│   │   ├── my-team/{players,coaching,coaching/strategy,coaching/formation,history,rivals}/
│   │   ├── world-cup/{groups,journey,simulate,current,matches,stats-awards,history}/
│   │   └── final-match/{start,play,strategy,formation,team-state,eventos-geniales-api}/
│   ├── my-team/
│   │   ├── squad/page.tsx      # Plantel de jugadores
│   │   ├── coaching/page.tsx   # Cuerpo técnico y estrategia
│   │   ├── history/page.tsx    # Historia y palmarés del equipo
│   │   └── rivals/page.tsx     # Rivales históricos
│   ├── world-cup/
│   │   ├── groups/page.tsx     # Fase de grupos
│   │   ├── journey/page.tsx    # Camino del equipo en el torneo
│   │   ├── simulate/page.tsx   # Motor de simulación del torneo
│   │   ├── matches/page.tsx    # Detalle de partidos por fase
│   │   ├── stats/page.tsx      # Estadísticas y premios individuales
│   │   └── history/page.tsx    # Historial de Copas del Mundo
│   └── play-final/
│       ├── chat/page.tsx       # Simulador interactivo de la Gran Final
│       ├── live/page.tsx       # Eventos en vivo (línea de tiempo)
│       └── team-state/page.tsx # Estado del equipo en la Final
├── components/
│   ├── AppHeader.tsx           # Encabezado global con logo, equipo y controles
│   ├── Sidebar.tsx             # Navegación lateral con secciones y links activos
│   ├── Topbar.tsx              # Barra de contexto por ruta
│   └── AdminModal.tsx          # Modal de configuración de equipo e idioma
├── context/
│   └── AppContext.tsx          # Estado global: teamId, lang, paleta CSS dinámica
├── services/
│   ├── api.ts                  # Cliente HTTP centralizado (apunta a /api/*)
│   └── mockData.ts             # Datos de fallback para modo offline
├── styles/
│   └── globals.css             # Sistema de diseño: tokens CSS, glassmorphism, layout
└── types/
    └── index.ts                # Interfaces y tipos TypeScript del dominio
```

---

## Funcionalidades

### 🏟️ Mi Equipo
- **Plantel** — nómina de jugadores con posición, dorsal, edad, habilidad, energía y si está en cancha.
- **Cuerpo Técnico** — perfil del DT, estrategia actual (`EQUILIBRADO`, `OFENSIVO`, `DEFENSIVO`, `CONTRAATAQUE`) y formación (`4-3-3`, `4-4-2`, etc.). Permite cambiarlos en tiempo real.
- **Historial del Equipo** — títulos, copas del mundo ganadas, participaciones y estadísticas históricas.
- **Rivales Históricos** — balance de enfrentamientos contra rivales clásicos con rating de rivalidad.

### 🌍 El Mundial
- **Fase de Grupos** — tablas de posiciones de los 16 grupos del Mundial 2026 con puntos, goles y diferencia.
- **Camino del Equipo** — cada partido de la selección desde grupos hasta la final, con resultado y rival.
- **Simular Final** — ejecuta el motor de simulación completo y muestra qué dos equipos llegan a la Final con sus datos tácticos.
- **Partidos** — resultados detallados por fase: goleadores, tarjetas, figura del partido.
- **Estadísticas y Premios** — podio, goleadores, asistentes, mejor portero, mejor jugador joven.
- **Historial de Mundiales** — archivo de todas las ediciones pasadas de la Copa del Mundo.

### ⚡ La Final
- **Jugar la Final** — simulador interactivo por turnos. El usuario elige entre 4 opciones tácticas (atacar, remate al arco, centro, aguantar) o ingresa texto libre que se mapea a una acción. El partido avanza minuto a minuto con un marcador en vivo, zona del balón y posesión.
- **Eventos en Vivo** — línea de tiempo con los eventos más relevantes del partido (goles, tarjetas, cambios).
- **Estado del Equipo** — alineación en cancha con nivel de energía por jugador, cambios disponibles.

---

## Sistema de diseño

La aplicación usa **CSS custom properties** para una paleta dinámica por selección:

- **Modo oscuro** por defecto con fondo `#060c18` y gradientes radiales.
- **Glassmorphism** en sidebar, header, tarjetas y modales (`backdrop-filter: blur`).
- **Tipografía**: `Outfit` (headings, números) + `Plus Jakarta Sans` (body text).
- **Paleta dinámica**: al cambiar de equipo, las variables `--team-primary`, `--team-accent`, etc. se aplican en `document.documentElement` actualizando toda la UI al instante.

---

## Variables de entorno

Crear un archivo `.env.local` en la raíz con:

```env
# URL base del BFF NestJS (Backend For Frontend)
NEXT_PUBLIC_CORE_URL=http://localhost:4101/worldCupCore

# Equipo por defecto (código ISO de 3 letras, ej: arg, bra, esp)
NEXT_PUBLIC_TEAM_ID=arg

# Idioma por defecto para las respuestas de la API
NEXT_PUBLIC_APP_LANG=es

# Puerto del servidor Next.js
PORT=3101
```

---

## Cómo levantar el proyecto

### Modo solo frontend (con datos mock)

```bash
npm install
npm run dev
```

La aplicación corre en `http://localhost:3101` usando datos mock locales como fallback cuando el backend no está disponible.

### Modo completo (con backend y API de datos)

**1. WorldCupAPI** (datos del torneo, puerto 5101)
```bash
cd world-cup-api
npm install
npm start
```

**2. BFF NestJS** (Backend For Frontend, puerto 4101)
```bash
cd backend/world-cup-core
cp .env.example .env
npm install
npm run start:dev
```

**3. Frontend Next.js** (puerto 3101)
```bash
npm install
npm run dev
```

Acceder en: `http://localhost:3101`

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en puerto 3101 |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Análisis estático con ESLint |

---

## Licencia

MIT License © 2026 **Antonio Ignacio Guerendiain**

Ver archivo [LICENSE](./LICENSE) para más detalles.
