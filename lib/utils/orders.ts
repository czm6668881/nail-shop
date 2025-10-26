export const generateOrderNumber = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const unique = String(now.getTime()).slice(-6)
  return `ORD-${year}-${unique}`
}
