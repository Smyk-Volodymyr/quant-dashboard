import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth/session";

// Маршрути, які не потребують авторизації
const publicRoutes = ["/login"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = req.cookies.get("admin_session")?.value;
  const session = await decrypt(cookie);

  // Якщо користувач не авторизований і намагається зайти на закриту сторінку
  if (!isPublicRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Якщо авторизований користувач намагається зайти на сторінку логіну
  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

// Захищаємо всі маршрути, окрім статики та API
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};