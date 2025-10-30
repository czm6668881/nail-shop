const DEFAULT_SITE_URL = "https://gelmanicure-nail.com"

const normalizeUrl = (rawUrl: string | undefined): string | null => {
  if (!rawUrl) {
    return null
  }

  try {
    const url = new URL(rawUrl)
    return url.origin
  } catch {
    return null
  }
}

const resolvedSiteUrl = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? DEFAULT_SITE_URL

export const siteConfig = {
  name: "gelmanicure",
  url: resolvedSiteUrl,
  defaultOgImagePath: "/luxury-press-on-nails-hero-image-elegant-hands.jpg",
  defaultLogoPath: "/logo-gelmanicure-nail.svg",
}

export const getSiteUrl = () => siteConfig.url

export const toAbsoluteUrl = (path: string): string => {
  if (!path) {
    return siteConfig.url
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const cleanedPath = path.startsWith("/") ? path : `/${path}`
  return `${siteConfig.url}${cleanedPath}`
}
