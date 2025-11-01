"use client"

import { useEffect, useMemo } from "react"
import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ""

const crossDomainHosts = (process.env.NEXT_PUBLIC_GA_CROSS_DOMAIN ?? "")
  .split(",")
  .map((domain) => domain.trim())
  .filter((domain) => domain.length > 0)

const internalTrafficCookie = process.env.NEXT_PUBLIC_GA_INTERNAL_TRAFFIC_COOKIE?.trim() ?? ""

const configObjectBody = [
  "send_page_view: false",
  crossDomainHosts.length > 0 ? `linker: { domains: ${JSON.stringify(crossDomainHosts)} }` : "",
]
  .filter((value) => value.length > 0)
  .join(",\n    ")

const internalTrafficSnippet = internalTrafficCookie
  ? `if (document.cookie.split(';').some((item) => item.trim().startsWith('${internalTrafficCookie}='))) {
    gtag('set', 'user_properties', { traffic_type: 'internal' });
  }`
  : ""

const initScript = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${MEASUREMENT_ID}', {
    ${configObjectBody}
  });
  ${internalTrafficSnippet}
`

const pageView = (url: string) => {
  if (typeof window === "undefined" || !window.gtag) {
    return
  }

  window.gtag("event", "page_view", {
    page_path: url,
    page_location: window.location.href,
  })
}

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const searchParamsString = useMemo(() => {
    if (!searchParams) {
      return ""
    }
    const value = searchParams.toString()
    return value.length > 0 ? `?${value}` : ""
  }, [searchParams])

  useEffect(() => {
    if (!MEASUREMENT_ID) {
      return
    }
    const url = `${pathname ?? ""}${searchParamsString}`
    pageView(url)
  }, [pathname, searchParamsString])

  if (!MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {initScript}
      </Script>
    </>
  )
}
