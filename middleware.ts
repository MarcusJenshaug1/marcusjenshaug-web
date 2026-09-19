import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  NORDIC_COUNTRIES,
  ROUTES,
  isLocale,
  routeKeyFromSegment,
  type Locale,
} from '@/lib/i18n/config'

type CookieToSet = { name: string; value: string; options: CookieOptions }

// Velger språk for en besøkende uten prefiks i URL-en: lagret valg først,
// deretter land (Norge, Sverige og Danmark får norsk), ellers engelsk.
function detectLocale(request: NextRequest): { locale: Locale; fromGeo: boolean } {
  const stored = request.cookies.get(LOCALE_COOKIE)?.value
  if (isLocale(stored)) return { locale: stored, fromGeo: false }

  const country = (request.headers.get('x-vercel-ip-country') ?? '').toUpperCase()
  if ((NORDIC_COUNTRIES as readonly string[]).includes(country)) return { locale: 'nb', fromGeo: true }

  const accept = request.headers.get('accept-language') ?? ''
  if (/^(nb|nn|no|da|sv)\b/i.test(accept)) return { locale: 'nb', fromGeo: true }

  return { locale: DEFAULT_LOCALE, fromGeo: true }
}

// Oversetter de gamle norske stiene (/blogg/slug) til prefikset form (/no/blogg/slug),
// og retter opp om noen kombinerer feil språk og segment (/en/blogg → /en/blog).
function localizePath(pathname: string, locale: Locale): string {
  const [first = '', ...rest] = pathname.split('/').filter(Boolean)
  const key = routeKeyFromSegment(first)
  if (!key) return `/${locale}${pathname === '/' ? '' : pathname}`
  const segment = ROUTES[key][locale]
  return `/${[locale, segment, ...rest].filter(Boolean).join('/')}`
}

function localeResponse(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const [first = '', ...rest] = pathname.split('/').filter(Boolean)

  if (isLocale(first)) {
    const segment = rest[0] ?? ''
    const key = routeKeyFromSegment(segment)
    if (key && ROUTES[key][first] !== segment) {
      const url = request.nextUrl.clone()
      url.pathname = `/${[first, ROUTES[key][first], ...rest.slice(1)].filter(Boolean).join('/')}`
      return NextResponse.redirect(url, 308)
    }
    // Filstrukturen bruker de engelske segmentene (app/[locale]/projects/…).
    // Norske URL-er skrives om internt, uten at adressen i nettleseren endres.
    if (key && ROUTES[key].en !== segment) {
      const url = request.nextUrl.clone()
      url.pathname = `/${[first, ROUTES[key].en, ...rest.slice(1)].filter(Boolean).join('/')}`
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  const { locale, fromGeo } = detectLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = localizePath(pathname, locale)
  url.search = search
  const response = NextResponse.redirect(url, 307)
  if (fromGeo) {
    const country = (request.headers.get('x-vercel-ip-country') ?? '').toUpperCase()
    if (country === 'SE' || country === 'DK') response.cookies.set('mj-locale-hint', 'nordic', { path: '/', maxAge: 60 * 60 })
  }
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) return localeResponse(request)

  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoginPage = pathname === '/admin'
  const adminEmail = process.env.ADMIN_EMAIL
  const isAuthorized = Boolean(user?.email && adminEmail && user.email === adminEmail)

  if (!isAuthorized && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  if (isAuthorized && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/innstillinger'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|auth|_next|_vercel|rss\\.xml|feed\\.json|llms\\.txt|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|icon\\.svg|apple-icon|.*\\.[a-zA-Z0-9]+$).*)',
  ],
}
