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

const resolveAssetPath = (value: string | undefined, fallback: string) => {
  if (value && value.trim().length > 0) {
    return value.trim()
  }
  return fallback
}

export const siteConfig = {
  name: "gelmanicure",
  url: resolvedSiteUrl,
  defaultOgImagePath: "/luxury-press-on-nails-hero-image-elegant-hands.jpg",
  defaultLogoPath: "/logo-gelmanicure-nail.svg",
  howItWorksWearImagePath: resolveAssetPath(process.env.NEXT_PUBLIC_HOW_IT_WORKS_WEAR_IMAGE, "/how-it-works-wear.svg"),
  howItWorksRemovalImagePath: resolveAssetPath(process.env.NEXT_PUBLIC_HOW_IT_WORKS_REMOVAL_IMAGE, "/how-it-works-removal.svg"),
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
