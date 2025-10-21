import "server-only"

import { revalidatePath } from "next/cache"

const revalidateMany = (...paths: Array<string | null | undefined>) => {
  const unique = new Set(
    paths
      .filter((path): path is string => typeof path === "string" && path.length > 0)
      .map((path) => path.trim())
      .filter((path) => path.startsWith("/")),
  )

  for (const path of unique) {
    revalidatePath(path)
  }
}

export const revalidateProductCache = (options: { slug?: string | null; collectionSlug?: string | null } = {}) => {
  revalidateMany("/", "/products", "/collections")

  if (options.slug) {
    revalidateMany(`/products/${options.slug}`)
  }

  if (options.collectionSlug) {
    revalidateMany(`/collections/${options.collectionSlug}`)
  }
}

export const revalidateCollectionCache = (slug?: string | null) => {
  revalidateMany("/", "/collections")

  if (slug) {
    revalidateMany(`/collections/${slug}`)
  }
}

export const revalidateBlogCache = (slug?: string | null) => {
  revalidateMany("/", "/blog")

  if (slug) {
    revalidateMany(`/blog/${slug}`)
  }
}
