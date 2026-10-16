import { NextRequest, NextResponse } from 'next/server';

/**
 * Identifica a cada visitante con una cookie `wc_sid` y la pasa al backend como `x-wc-sid`.
 * Cualquier `x-wc-sid` que mande el cliente se ignora: solo vale el que genera este middleware.
 */
const COOKIE = 'wc_sid';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_AGE = 60 * 60 * 24 * 30;

export function middleware(req: NextRequest) {
  const existing = req.cookies.get(COOKIE)?.value;
  const sid = existing && UUID.test(existing) ? existing : crypto.randomUUID();

  const headers = new Headers(req.headers);
  headers.set('x-wc-sid', sid);
  const res = NextResponse.next({ request: { headers } });

  if (sid !== existing) {
    const https = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';
    res.cookies.set(COOKIE, sid, { httpOnly: true, sameSite: 'lax', secure: https, path: '/', maxAge: MAX_AGE });
  }
  return res;
}

export const config = { matcher: '/api/:path*' };
