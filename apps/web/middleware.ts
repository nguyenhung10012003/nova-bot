import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const user = JSON.parse(req.cookies.get('user')?.value || 'null');
  const { pathname } = req.nextUrl;

  // Nếu request là đến /logout, xóa cookie và chuyển hướng đến /login
  if (pathname === '/logout') {
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.set('user', '', { expires: new Date(0) }); // Xóa cookie
    return response;
  }

  // // Nếu không có token và không phải request đến /login, chuyển hướng đến /login
  // if (!user && pathname !== '/login') {
  //   return NextResponse.redirect(new URL('/login', req.url));
  // }

  return NextResponse.next();
}

// Áp dụng middleware cho tất cả các route ngoại trừ API
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
