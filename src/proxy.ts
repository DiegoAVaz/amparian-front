import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/home"];
const GUEST_ONLY_PATHS = ["/login", "/criar-conta", "/esqueci-minha-senha"];

export function proxy(request: NextRequest) {
  const auth = request.cookies.get("amparian_auth")?.value;
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(auth);

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isGuestOnly = GUEST_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("reason", "session-required");
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestOnly && hasSession) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/login", "/criar-conta", "/esqueci-minha-senha/:path*"],
};
