# WCSim — Plan para publicarlo y que otros lo prueben

## Estado actual
- Funciona en local. El backend vive en `src/server` (motor propio, sin base de datos).
- **Bloqueante:** el estado del torneo está en memoria y es **global al servidor**. Con 2 personas a la vez, una pisa el torneo de la otra.
- No se puede usar Vercel/Netlify (serverless): cada request puede caer en otra instancia y la memoria no se comparte. Hace falta un **proceso Node persistente**.

## Fase 1 — Estado por visitante ✅ HECHA
- `src/middleware.ts` asigna la cookie `wc_sid` (HttpOnly, SameSite=Lax, Secure bajo HTTPS, 30 días) y la pasa al backend como `x-wc-sid`. Un `x-wc-sid` mandado por el cliente se ignora.
- `engine/state.ts` guarda un `Store` por sesión. Vencen a los 120 min de inactividad (`WC_SESSION_TTL_MIN`) y hay un tope de 500 (`WC_MAX_SESSIONS`, se descarta la menos usada).
- `/api/health` informa la cantidad de sesiones vivas.
- `scripts/e2e.mjs` usa cookie jar y prueba aislamiento entre visitantes, header forjado y cookie inválida.
- Limitación: las sesiones viven en memoria; un reinicio o el sueño del plan gratis las borra (el frontend se resincroniza solo al recargar).

## Fase 2 — Endurecer (~1 h)
- Rate limit por IP en el middleware (p. ej. 120 req/min, 429 si se pasa).
- `WC_UPSTREAM=off` en producción (el BFF NestJS del TP no se despliega).
- Ya incluido: `GET /api/health` y `npm run start:prod` (escucha en `0.0.0.0` y respeta `PORT`).

## Fase 3 — Hosting (elegir uno)
| Opción | Cuándo | Nota |
|---|---|---|
| **Render** Web Service | Probar gratis | El plan gratis se duerme tras ~15 min sin tráfico (primer request tarda ~1 min) y **al dormirse se pierden las sesiones**. |
| **Railway** / **Fly.io** | Siempre activo, bajo costo | Pago por uso, sin dormirse. |
| VPS (Hetzner, DigitalOcean) + PM2 + Caddy | Control total | Más trabajo de administración. |
Verificar precios y límites vigentes antes de elegir.
Siempre **1 sola instancia** (no escalar horizontalmente mientras el estado esté en memoria).

### Pasos en Render (recomendado para arrancar)
1. Subir el proyecto a GitHub (`git add . && git commit && git push`).
2. render.com → New → Web Service → conectar el repo.
3. Build command: `npm ci && npm run build` · Start command: `npm run start:prod`.
4. Environment: `WC_UPSTREAM=off`, `NODE_ENV=production`, `NODE_VERSION=20`.
5. Health check path: `/api/health`.
6. Cada `git push` a `main` redeploya solo.

## Fase 4 — Verificación antes de compartir
1. `node scripts/e2e.mjs https://TU-APP.onrender.com` .
2. Probar a mano desde celular y PC: elegir selección, simular, jugar la Final, ver que "Jugar la Final" solo aparece si tu selección llegó.
3. Abrir dos navegadores a la vez (Fase 1 funcionando).
4. Monitor gratuito (UptimeRobot) pegándole a `/api/health` cada 5 min: avisa si cae (y mantiene despierto el plan gratis).

## Fase 5 — Lanzamiento
- Dominio propio opcional (Render/Railway dan HTTPS automático).
- README con link, capturas y cómo reportar errores (Issues de GitHub).
- Fuente de banderas: Twemoji (CC-BY 4.0), incluir atribución en el README.
- Siguiente nivel (solo si crece): guardar sesiones en Redis/Upstash para sobrevivir reinicios y poder escalar.
