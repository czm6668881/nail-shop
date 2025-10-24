export const slugify = (input: string): string => {
  const normalized = input.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()

  const unicodeSlug = normalized
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")

  if (unicodeSlug.length > 0) {
    return unicodeSlug
  }

  const asciiSlug = normalized
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")

  if (asciiSlug.length > 0) {
    return asciiSlug
  }

  const randomSuffix = Math.random().toString(36).slice(2, 8)
  return `item-${randomSuffix}`
}
