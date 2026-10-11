import { NextResponse } from 'next/server';

const CORE_BASE_URL = process.env.NEXT_PUBLIC_CORE_URL || 'http://localhost:4101/worldCupCore';

export async function proxyOrFallback<T>(
  backendPath: string,
  method = 'GET',
  body?: unknown,
  fallbackData?: T
) {
  try {
    const url = `${CORE_BASE_URL}${backendPath}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      // Timeout after 2.5 seconds to quickly fallback if NestJS isn't up
      signal: AbortSignal.timeout(2500),
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline or timeout -> use mock fallback
  }

  if (fallbackData !== undefined) {
    return NextResponse.json({
      success: true,
      data: fallbackData,
    });
  }

  return NextResponse.json(
    { success: false, message: 'Servicio no disponible y sin fallback' },
    { status: 503 }
  );
}
