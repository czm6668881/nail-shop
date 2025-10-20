export type InventoryErrorCode = "INSUFFICIENT_STOCK" | "PRODUCT_NOT_FOUND"

export class InventoryError extends Error {
  code: InventoryErrorCode
  meta?: Record<string, unknown>

  constructor(code: InventoryErrorCode, message: string, meta?: Record<string, unknown>) {
    super(message)
    this.name = "InventoryError"
    this.code = code
    this.meta = meta
  }
}
