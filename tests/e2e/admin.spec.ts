import { test, expect, type Page } from "@playwright/test"
import type { Collection, Order } from "@/types"

const adminCredentials = {
  email: "admin@luxenails.com",
  password: "Admin123!",
}

const establishAdminSession = async (page: Page) => {
  const response = await page.request.post("/api/auth/login", {
    data: {
      email: adminCredentials.email,
      password: adminCredentials.password,
    },
  })

  expect(response.ok()).toBeTruthy()
}

test.describe.configure({ mode: "serial" })

test.describe("Admin backend integration", () => {
  test("admin data endpoints respond with content", async ({ page }) => {
    await establishAdminSession(page)
    await page.goto("/admin")
    await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible()

    const adminEndpoints = [
      { path: "/api/admin/products", key: "products" },
      { path: "/api/admin/orders", key: "orders" },
      { path: "/api/admin/customers", key: "users" },
      { path: "/api/admin/blog", key: "posts" },
      { path: "/api/admin/collections", key: "collections" },
    ] as const

    for (const endpoint of adminEndpoints) {
      const response = await page.request.get(endpoint.path)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      const value = data[endpoint.key]
      expect(Array.isArray(value)).toBeTruthy()
      expect(value.length).toBeGreaterThan(0)
    }
  })

  test("toggling a collection propagates to the storefront", async ({ page }) => {
    await establishAdminSession(page)
    await page.goto("/admin/collections")
    await expect(page.getByRole("heading", { name: "Collections" })).toBeVisible()

    const collectionsResponse = await page.request.get("/api/admin/collections")
    expect(collectionsResponse.ok()).toBeTruthy()

    const { collections } = (await collectionsResponse.json()) as { collections: Collection[] }
    const target = collections.find((item) => item.name === "Essentials")
    expect(target, "Expected to find Essentials collection in seed data").toBeDefined()

    if (!target) {
      return
    }

    const originalFeatured = target.featured
    const toggledValue = !originalFeatured

    const assertStorefrontState = async (featured: boolean) => {
      await page.goto("/")
      await page.waitForLoadState("networkidle")
      const heading = page.getByRole("heading", { name: "Essentials" })
      if (featured) {
        await expect(heading).toBeVisible()
      } else {
        await expect(heading).toHaveCount(0)
      }
    }

    await assertStorefrontState(originalFeatured)

    const updateResponse = await page.request.patch(`/api/admin/collections/${target.id}/feature`, {
      data: { featured: toggledValue },
    })
    expect(updateResponse.ok()).toBeTruthy()

    await assertStorefrontState(toggledValue)

    const revertResponse = await page.request.patch(`/api/admin/collections/${target.id}/feature`, {
      data: { featured: originalFeatured },
    })
    expect(revertResponse.ok()).toBeTruthy()

    await assertStorefrontState(originalFeatured)
  })

  test("orders view reflects backend data for monitoring", async ({ page }) => {
    await establishAdminSession(page)
    await page.goto("/admin/orders")
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible()

    const ordersResponse = await page.request.get("/api/admin/orders")
    expect(ordersResponse.ok()).toBeTruthy()

    const { orders } = (await ordersResponse.json()) as { orders: Order[] }
    expect(orders.length).toBeGreaterThan(0)

    const [firstOrder] = orders
    const orderRow = page.locator("tbody tr").filter({ hasText: firstOrder.orderNumber }).first()

    await expect(orderRow).toBeVisible()
    await expect(orderRow.getByText(`${firstOrder.shippingAddress.firstName} ${firstOrder.shippingAddress.lastName}`)).toBeVisible()
    await expect(orderRow.getByText(`$${firstOrder.total.toFixed(2)}`)).toBeVisible()
    await expect(orderRow.getByText(firstOrder.status.toUpperCase())).toBeVisible()
  })
})
