/**
 * Configuración central del backend (capa servidor de Next.js).
 * Todo se resuelve una sola vez desde variables de entorno.
 */
const positive = (value: string | undefined, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const CONFIG = {
  /** BFF NestJS opcional. Si no responde, el motor local toma el control. */
  upstreamUrl: (process.env.CORE_URL || process.env.NEXT_PUBLIC_CORE_URL || 'http://localhost:4101/worldCupCore').replace(/\/+$/, ''),
  /** WC_UPSTREAM=off fuerza el motor local (útil para tests deterministas). */
  upstreamEnabled: (process.env.WC_UPSTREAM || 'auto').toLowerCase() !== 'off',
  upstreamTimeoutMs: positive(process.env.WC_UPSTREAM_TIMEOUT_MS, 2500),
  upstreamHeavyTimeoutMs: positive(process.env.WC_UPSTREAM_HEAVY_TIMEOUT_MS, 20000),
  /** Tras una falla del BFF no se vuelve a intentar durante este tiempo (evita esperar timeouts en cada request). */
  breakerCooldownMs: positive(process.env.WC_UPSTREAM_COOLDOWN_MS, 10000),
  defaultTeamId: (process.env.NEXT_PUBLIC_TEAM_ID || 'arg').trim().toLowerCase(),
  defaultLang: ((process.env.NEXT_PUBLIC_APP_LANG || 'es').toLowerCase() === 'en' ? 'en' : 'es') as 'es' | 'en',
  /** WC_SEED fija la semilla del torneo para reproducir simulaciones. */
  fixedSeed: process.env.WC_SEED && Number.isFinite(Number(process.env.WC_SEED)) ? Number(process.env.WC_SEED) >>> 0 : undefined,
  /** Una sesión inactiva más de WC_SESSION_TTL_MIN minutos se descarta. */
  sessionTtlMs: positive(process.env.WC_SESSION_TTL_MIN, 120) * 60_000,
  /** Tope de sesiones simultáneas en memoria. */
  maxSessions: Math.floor(positive(process.env.WC_MAX_SESSIONS, 500)),
  edition: 2026,
  stadium: 'MetLife Stadium',
  city: 'New York / New Jersey',
  finalDate: '2026-07-19',
} as const;
