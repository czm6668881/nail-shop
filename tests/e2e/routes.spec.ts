import { test, expect } from "@playwright/test"

test.describe("Public routes", () => {
  test("home page renders without 404", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { name: "gelmanicure", level: 1 })).toBeVisible()
  })

  const routes: Array<{ path: string; heading: string }> = [
    { path: "/contact", heading: "We Are Here To Help" },
    { path: "/returns", heading: "We Want You To Love Your Manicure" },
    { path: "/privacy", heading: "Your Data. Your Confidence." },
    { path: "/terms", heading: "Guidelines For Shopping With gelmanicure" },
    { path: "/about", heading: "Elevated Press-On Nails, Crafted With Intention" },
    { path: "/sustainability", heading: "Beauty With A Lighter Footprint" },
    { path: "/forgot-password", heading: "Forgot password?" },
  ]

  for (const route of routes) {
    test(`renders ${route.path}`, async ({ page }) => {
      await page.goto(route.path)
      await expect(page.getByRole("heading", { name: route.heading, exact: false })).toBeVisible()
      await expect(page.getByText("404", { exact: false })).not.toBeVisible()
    })
  }
})
