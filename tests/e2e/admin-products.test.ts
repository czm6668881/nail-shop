import { test, expect } from "@playwright/test"

const BASE_URL = "http://localhost:3000"
const ADMIN_EMAIL = "admin@luxenails.com"
const ADMIN_PASSWORD = "Admin123!"

test.describe("Admin Products Management", () => {
  test.beforeEach(async ({ page }) => {
    // Sign in with the admin account
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    
    // Wait for sign-in to complete
    await page.waitForURL(`${BASE_URL}/`)
    
    // Navigate to the admin products page
    await page.goto(`${BASE_URL}/admin/products`)
    await page.waitForLoadState("networkidle")
  })

  test("should display products list", async ({ page }) => {
    // Verify the page heading
    await expect(page.locator("h1")).toContainText("Products")
    
    // Ensure the products table is visible
    await expect(page.locator("table")).toBeVisible()
    
    // Ensure at least one product exists
    const rows = page.locator("tbody tr")
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
  })

  test("should navigate to add product page", async ({ page }) => {
    // Click the add product button
    await page.click('button:has-text("Add Product")')
    
    // Confirm navigation to the create product page
    await expect(page).toHaveURL(`${BASE_URL}/admin/products/new`)
    await expect(page.locator("h1")).toContainText("Create Product")
  })

  test("should be able to edit a product", async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector("tbody tr")
    
    // Click the first product's edit button
    const editButton = page.locator("tbody tr").first().locator('button[title="Edit product"]')
    await editButton.click()
    
    // Confirm navigation to the edit page
    await page.waitForURL(/\/admin\/products\/.+/)
    await expect(page.locator("h1")).toContainText("Edit Product")
    
    // Verify the form is pre-filled
    const nameInput = page.locator('input[id="name"]')
    await expect(nameInput).not.toHaveValue("")
  })

  test("should be able to delete a product", async ({ page }) => {
    // Wait for the product list to load
    await page.waitForSelector("tbody tr")
    
    // Click the last product's delete button
    const deleteButton = page.locator("tbody tr").last().locator('button[title="Delete product"]')
    await deleteButton.click()
    
    // Verify the delete confirmation dialog appears
    await expect(page.locator('[role="alertdialog"]')).toBeVisible()
    await expect(page.locator('[role="alertdialog"]')).toContainText("Delete Product")
    
    // Confirm deletion
    await page.click('button:has-text("Delete")')
    
    // Wait for deletion to finish
    await page.waitForTimeout(1000)
    
    // Verify the product count decreases (refresh may be required)
    // Verify the success toast appears
    await expect(page.locator("text=Product deleted successfully")).toBeVisible()
  })

  test("should be able to search products", async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector("tbody tr")
    
    // Capture the first product name
    const firstProductName = await page.locator("tbody tr").first().locator("td").nth(0).locator("p").first().textContent()
    
    if (firstProductName) {
      // Search for the first product
      await page.fill('input[placeholder="Search products..."]', firstProductName.substring(0, 5))
      
      // Wait for search results to update
      await page.waitForTimeout(500)
      
      // Validate the search results
      const rows = page.locator("tbody tr")
      const count = await rows.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test("should create a new product", async ({ page }) => {
    // Click the add product button
    await page.click('button:has-text("Add Product")')
    await page.waitForURL(`${BASE_URL}/admin/products/new`)
    
    // Fill in the product form
    const timestamp = Date.now()
    await page.fill('input[id="name"]', `Test Product ${timestamp}`)
    await page.fill('input[id="slug"]', `test-product-${timestamp}`)
    await page.fill('textarea[id="description"]', "This is a test product description")
    await page.fill('input[id="price"]', "29.99")
    await page.fill('input[id="stockQuantity"]', "100")
    
    // Select a category
    await page.click('button[role="combobox"]')
    await page.click('div[role="option"]:has-text("Press-On Nails")')
    
    // Select sizes
    await page.click('button:has-text("S")')
    await page.click('button:has-text("M")')
    await page.click('button:has-text("L")')
    
    // Submit the form
    await page.click('button[type="submit"]:has-text("Save Product")')
    
    // Confirm we return to the products list and see the success message
    await page.waitForURL(`${BASE_URL}/admin/products`)
    await expect(page.locator("text=Product created successfully")).toBeVisible()
  })

  test("should edit an existing product", async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector("tbody tr")
    
    // Click the first product's edit button
    const editButton = page.locator("tbody tr").first().locator('button[title="Edit product"]')
    await editButton.click()
    
    // Wait for the edit page to load
    await page.waitForURL(/\/admin\/products\/.+/)
    
    // Update the product name
    const nameInput = page.locator('input[id="name"]')
    const originalName = await nameInput.inputValue()
    await nameInput.fill(`${originalName} (Updated)`)
    
    // Submit the form
    await page.click('button[type="submit"]:has-text("Save Product")')
    
    // Confirm we return to the products list and see the success message
    await page.waitForURL(`${BASE_URL}/admin/products`)
    await expect(page.locator("text=Product updated successfully")).toBeVisible()
  })

  test("should display product images and preview on double click", async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector("tbody tr")
    
    // Click the first product's edit button
    const editButton = page.locator("tbody tr").first().locator('button[title="Edit product"]')
    await editButton.click()
    
    // Wait for the edit page to load
    await page.waitForURL(/\/admin\/products\/.+/)
    
    // Wait for the page to fully load
    await page.waitForLoadState("networkidle")
    
    // Check whether images exist
    const imageContainers = page.locator(".aspect-square.rounded-lg.border-2")
    const imageCount = await imageContainers.count()
    
    if (imageCount > 0) {
      // Ensure the first image is visible
      await expect(imageContainers.first()).toBeVisible()
      
      // Double-click the first image
      await imageContainers.first().dblclick()
      
      // Wait for the dialog to appear
      await page.waitForTimeout(500)
      
      // Verify the preview dialog is visible
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible()
      
      // Verify the dialog title
      await expect(page.locator('text=Image preview')).toBeVisible()
      
      // Verify the large preview renders
      const previewImage = dialog.locator("img")
      await expect(previewImage).toBeVisible()
      
      // Close the dialog
      await page.keyboard.press("Escape")
      
      // Confirm the dialog is dismissed
      await expect(dialog).not.toBeVisible()
    } else {
      console.log("No images found in product, skipping preview test")
    }
  })
})





