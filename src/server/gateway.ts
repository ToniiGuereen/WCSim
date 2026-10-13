import { NextResponse } from 'next/server';
import { CONFIG } from './config';
import { fail, ok } from './http';

/**
 * Gateway: intenta primero el BFF NestJS (si está configurado y vivo) y, si no
 * está disponible, resuelve con el motor local. Diferencias con el proxy anterior:
 *  - Los errores 4xx del BFF se reenvían tal cual (antes se enmascaraban con datos mock).
 *  - Un "circuit breaker" evita pagar el timeout en cada request cuando el BFF está caído.
 *  - Los 404/405/501 del BFF (endpoint inexistente) caen al motor local.
 */
const g = globalThis as unknown as { __wcBreaker?: { openUntil: number } };
const breaker = (g.__wcBreaker ??= { openUntil: 0 });

export interface GatewayOptions<T> {
  path: string;
  method?: 'GET' | 'POST';
  body?: unknown;
  /** Operaciones pesadas (simulación) toleran más tiempo antes de caer al motor local. */
  heavy?: boolean;
  local: () => T | Promise<T>;
}

/** Arma un query string omitiendo los valores vacíos. */
export function qs(params: Record<string, string | null | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

const MISSING_ENDPOINT = new Set([404, 405, 501]);

async function tryUpstream<T>(opts: GatewayOptions<T>): Promise<NextResponse | null> {
  if (!CONFIG.upstreamEnabled || Date.now() < breaker.openUntil) return null;

  const method = opts.method ?? 'GET';
  try {
    const res = await fetch(`${CONFIG.upstreamUrl}${opts.path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: method === 'POST' && opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      cache: 'no-store',
      signal: AbortSignal.timeout(opts.heavy ? CONFIG.upstreamHeavyTimeoutMs : CONFIG.upstreamTimeoutMs),
    });

    if (res.status >= 500 || MISSING_ENDPOINT.has(res.status)) {
      if (res.status >= 500) breaker.openUntil = Date.now() + CONFIG.breakerCooldownMs;
      return null;
    }

    const payload = await res.json().catch(() => undefined);
    if (payload === undefined) return null;

    return NextResponse.json(payload, { status: res.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    breaker.openUntil = Date.now() + CONFIG.breakerCooldownMs;
    return null;
  }
}

export async function gateway<T>(opts: GatewayOptions<T>): Promise<NextResponse> {
  const upstream = await tryUpstream(opts);
  if (upstream) return upstream;

  try {
    return ok(await opts.local());
  } catch (error) {
    return fail(error);
  }
}
