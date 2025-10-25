import { describe, expect, it, afterAll, beforeAll } from "vitest"
import {
  listProducts,
  findProductBySlug,
  ensureCart,
  fetchCart,
  upsertCartItem,
  clearCartItems,
  touchCart,
  listOrders,
} from "@/lib/db/queries"
import { authenticateUser } from "@/lib/auth/session"

const createdCartIds: string[] = []
let products: Awaited<ReturnType<typeof listProducts>> = []

beforeAll(async () => {
  products = await listProducts()
})

afterAll(async () => {
  for (const cartId of createdCartIds) {
    await clearCartItems(cartId)
    await touchCart(cartId)
  }
})

describe("data smoke checks", () => {
  it("has seeded products", async () => {
    expect(products.length).toBeGreaterThan(0)
  })

  it("resolves product by slug", async () => {
    const target = products[0]
    const product = await findProductBySlug(target.slug)
    expect(product?.id).toBe(target.id)
  })

  it("creates and updates a cart", async () => {
    const target = products[0]
    const { cart, newlyCreated } = await ensureCart()
    if (newlyCreated) {
      createdCartIds.push(cart.id)
    }
    await upsertCartItem({ cartId: cart.id, productId: target.id, size: target.sizes[0], quantity: 1 })
    await touchCart(cart.id)
    const updated = await fetchCart(cart.id)
    expect(updated?.items.length).toBeGreaterThan(0)
    expect(updated?.total).toBeGreaterThan(0)
  })

  it("lists seeded orders", async () => {
    const orders = await listOrders()
    expect(orders.length).toBeGreaterThan(0)
  })

  it("authenticates seeded admin credentials", async () => {
    const user = await authenticateUser("admin@luxenails.com", "Admin123!")
    expect(user).not.toBeNull()
    expect(user?.role).toBe("admin")
  })
})
