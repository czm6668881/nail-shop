const LENGTH_TOKEN_REGEX = /[0-9]+(?:[.,][0-9]+)?/g
const LENGTH_SUFFIX_REGEX = /(cm|厘米)$/i

const sanitizeToken = (token: string): string => {
  const trimmed = token.trim()
  if (!trimmed) return ""
  const withoutSuffix = trimmed.replace(LENGTH_SUFFIX_REGEX, "").trim()
  return withoutSuffix.replace(",", ".")
}

const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null
  }

  if (typeof value === "string") {
    const sanitized = sanitizeToken(value)
    if (!sanitized) {
      return null
    }

    const numeric = Number(sanitized)
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null
  }

  return null
}

const extractFromString = (value: string): number[] => {
  const matches = value.match(LENGTH_TOKEN_REGEX)
  if (!matches) {
    const parsed = parseNumber(value)
    return parsed ? [parsed] : []
  }

  return matches
    .map((match) => parseNumber(match))
    .filter((entry): entry is number => entry !== null)
}

export const normalizeLengthValues = (input: unknown): number[] => {
  const rawTokens = Array.isArray(input) ? input : [input]

  const values = rawTokens
    .flatMap((entry) => {
      if (typeof entry === "string") {
        return extractFromString(entry)
      }
      const parsed = parseNumber(entry)
      return parsed ? [parsed] : []
    })

  if (values.length === 0) {
    return []
  }

  const unique = Array.from(new Set(values.map((value) => Number(value.toFixed(4)))))
  return unique.sort((a, b) => a - b)
}

