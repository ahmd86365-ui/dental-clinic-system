import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { locales, defaultLocale, isLocale } from "@/lib/i18n/config";

const LOCALE_COOKIE = "NEXT_LOCALE";
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname === "/login") {
    return await updateSession(request);
  }

  return handlePublicLocale(request);
}

/**
 * Arabic is the default, unprefixed locale (existing URLs like `/` and
 * `/appointment` keep working exactly as before — zero regression). English
 * lives under a `/en` prefix. Unprefixed requests are internally rewritten to
 * `/ar/...` (invisible to the browser) unless the visitor's remembered
 * preference is English, in which case they're redirected to the `/en`
 * equivalent so the visible URL matches their choice.
 */
function handlePublicLocale(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) {
    const response = NextResponse.next();
    const activeLocale = pathname.split("/")[1];
    if (activeLocale !== defaultLocale) {
      response.cookies.set(LOCALE_COOKIE, activeLocale, {
        path: "/",
        maxAge: LOCALE_COOKIE_MAX_AGE,
      });
    }
    return response;
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value ?? "";
  const preferredLocale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  if (preferredLocale !== defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|favicon\\.ico|.*\\..*).*)"],
};
