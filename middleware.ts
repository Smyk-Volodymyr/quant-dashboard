import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // ТУТ ВСТАНОВИ СВІЙ ЛОГІН І ПАРОЛЬ
    if (user === 'quant' && pwd === 'admin123') {
      return NextResponse.next();
    }
  }

  // Якщо пароль неправильний або його немає - не пускаємо і показуємо вікно
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Quant Terminal"',
    },
  });
}

// Вказуємо, які сторінки захищати (у нашому випадку - всі)
export const config = {
  matcher: '/:path*',
};