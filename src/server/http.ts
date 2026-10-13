import { NextRequest, NextResponse } from 'next/server';
import { ApiError, badRequest } from './errors';

const NO_STORE = { 'Cache-Control': 'no-store' };

/** Envelope de éxito. El cliente (services/api.ts) desempaqueta `data`. */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status, headers: NO_STORE });
}

export function fail(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, message: error.message, code: error.code },
      { status: error.status, headers: NO_STORE }
    );
  }
  console.error('[api] error no controlado:', error);
  return NextResponse.json(
    { success: false, message: 'Error interno del servidor', code: 'INTERNAL' },
    { status: 500, headers: NO_STORE }
  );
}

/** Lee el body como objeto JSON. Body vacío => {}. JSON inválido => 400. */
export async function readJson(req: NextRequest): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (!text.trim()) return {};
  try {
    const value = JSON.parse(text);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  } catch {
    /* cae al error de abajo */
  }
  throw badRequest('El cuerpo de la solicitud debe ser un objeto JSON válido.');
}

/** Envuelve un handler: cualquier excepción (validación incluida) termina en una respuesta JSON consistente. */
export function handle(fn: (req: NextRequest) => Promise<NextResponse> | NextResponse) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await fn(req);
    } catch (error) {
      return fail(error);
    }
  };
}
