import { test, expect, type Page } from "@playwright/test"
import type { Order } from "@/types"

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
