import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/config/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} Store`,
    short_name: siteConfig.name,
    description: "Shop salon-quality press-on nails, reusable gel tips, and curated nail art collections.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#fce7f3",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}
