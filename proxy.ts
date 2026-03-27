import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Додано "default" сюди:
export default function proxy(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    const expectedUser = process.env.BASIC_AUTH_USER;
    const expectedPassword = process.env.BASIC_AUTH_PASSWORD;

    if (user === expectedUser && pwd === expectedPassword) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Quant Terminal"',
    },
  });
}

export const config = {
  matcher: '/:path*',
};