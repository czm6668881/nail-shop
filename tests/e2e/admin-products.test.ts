import { test, expect } from "@playwright/test"

const BASE_URL = "http://localhost:3000"
const ADMIN_EMAIL = "admin@luxenails.com"
const ADMIN_PASSWORD = "Admin123!"

test.describe("Admin Products Management", () => {
  test.beforeEach(async ({ page }) => {
    // 登录管理员账户
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    
    // 等待登录完成
    await page.waitForURL(`${BASE_URL}/`)
    
    // 导航到产品管理页面
    await page.goto(`${BASE_URL}/admin/products`)
    await page.waitForLoadState("networkidle")
  })

  test("should display products list", async ({ page }) => {
    // 检查页面标题
    await expect(page.locator("h1")).toContainText("Products")
    
    // 检查是否有产品表格
    await expect(page.locator("table")).toBeVisible()
    
    // 检查是否有至少一个产品
    const rows = page.locator("tbody tr")
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
  })

  test("should navigate to add product page", async ({ page }) => {
    // 点击添加产品按钮
    await page.click('button:has-text("Add Product")')
    
    // 验证跳转到新建产品页面
    await expect(page).toHaveURL(`${BASE_URL}/admin/products/new`)
    await expect(page.locator("h1")).toContainText("Create Product")
  })

  test("should be able to edit a product", async ({ page }) => {
    // 等待产品加载
    await page.waitForSelector("tbody tr")
    
    // 点击第一个产品的编辑按钮
    const editButton = page.locator("tbody tr").first().locator('button[title="Edit product"]')
    await editButton.click()
    
    // 验证跳转到编辑页面
    await page.waitForURL(/\/admin\/products\/.+/)
    await expect(page.locator("h1")).toContainText("Edit Product")
    
    // 验证表单已填充
    const nameInput = page.locator('input[id="name"]')
    await expect(nameInput).not.toHaveValue("")
  })

  test("should be able to delete a product", async ({ page }) => {
    // 等待产品列表加载
    await page.waitForSelector("tbody tr")
    
    // 点击最后一个产品的删除按钮
    const deleteButton = page.locator("tbody tr").last().locator('button[title="Delete product"]')
    await deleteButton.click()
    
    // 验证删除确认对话框出现
    await expect(page.locator('[role="alertdialog"]')).toBeVisible()
    await expect(page.locator('[role="alertdialog"]')).toContainText("Delete Product")
    
    // 确认删除
    await page.click('button:has-text("Delete")')
    
    // 等待删除完成
    await page.waitForTimeout(1000)
    
    // 验证产品数量减少（注意：可能需要刷新或等待状态更新）
    // 这里我们验证成功提示出现
    await expect(page.locator("text=Product deleted successfully")).toBeVisible()
  })

  test("should be able to search products", async ({ page }) => {
    // 等待产品加载
    await page.waitForSelector("tbody tr")
    
    // 获取第一个产品的名称
    const firstProductName = await page.locator("tbody tr").first().locator("td").nth(0).locator("p").first().textContent()
    
    if (firstProductName) {
      // 搜索第一个产品
      await page.fill('input[placeholder="Search products..."]', firstProductName.substring(0, 5))
      
      // 等待搜索结果更新
      await page.waitForTimeout(500)
      
      // 验证搜索结果
      const rows = page.locator("tbody tr")
      const count = await rows.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test("should create a new product", async ({ page }) => {
    // 点击添加产品按钮
    await page.click('button:has-text("Add Product")')
    await page.waitForURL(`${BASE_URL}/admin/products/new`)
    
    // 填写产品表单
    const timestamp = Date.now()
    await page.fill('input[id="name"]', `Test Product ${timestamp}`)
    await page.fill('input[id="slug"]', `test-product-${timestamp}`)
    await page.fill('textarea[id="description"]', "This is a test product description")
    await page.fill('input[id="price"]', "29.99")
    await page.fill('input[id="stockQuantity"]', "100")
    
    // 选择分类
    await page.click('button[role="combobox"]')
    await page.click('div[role="option"]:has-text("Press-On Nails")')
    
    // 选择尺寸
    await page.click('button:has-text("S")')
    await page.click('button:has-text("M")')
    await page.click('button:has-text("L")')
    
    // 提交表单
    await page.click('button[type="submit"]:has-text("Save Product")')
    
    // 验证跳转回产品列表并显示成功消息
    await page.waitForURL(`${BASE_URL}/admin/products`)
    await expect(page.locator("text=Product created successfully")).toBeVisible()
  })

  test("should edit an existing product", async ({ page }) => {
    // 等待产品加载
    await page.waitForSelector("tbody tr")
    
    // 点击第一个产品的编辑按钮
    const editButton = page.locator("tbody tr").first().locator('button[title="Edit product"]')
    await editButton.click()
    
    // 等待编辑页面加载
    await page.waitForURL(/\/admin\/products\/.+/)
    
    // 修改产品名称
    const nameInput = page.locator('input[id="name"]')
    const originalName = await nameInput.inputValue()
    await nameInput.fill(`${originalName} (Updated)`)
    
    // 提交表单
    await page.click('button[type="submit"]:has-text("Save Product")')
    
    // 验证跳转回产品列表并显示成功消息
    await page.waitForURL(`${BASE_URL}/admin/products`)
    await expect(page.locator("text=Product updated successfully")).toBeVisible()
  })
})




