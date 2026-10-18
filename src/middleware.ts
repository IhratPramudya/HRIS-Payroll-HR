export { default } from "next-auth/middleware";

export const config = {
  // Lindungi semua route kecuali: login, api/auth, file statis
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
