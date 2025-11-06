import { test, expect } from '@playwright/test'

test.describe('用户认证', () => {
  test('应该能够访问登录页面', async ({ page }) => {
    await page.goto('/admin/login')

    // 检查页面标题
    await expect(page).toHaveTitle(/登录 - ChinaJoin CMS/)

    // 检查页面元素
    await expect(page.locator('h1')).toContainText('ChinaJoin CMS')
    await expect(page.locator('input[name="username"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('应该能够使用默认账户登录', async ({ page }) => {
    await page.goto('/admin/login')

    // 填写登录表单
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'admin123')

    // 提交表单
    await page.click('button[type="submit"]')

    // 等待页面跳转
    await page.waitForURL('/admin')

    // 检查是否登录成功
    await expect(page).toHaveURL('/admin')
    await expect(page.locator('h1')).toContainText('仪表盘')
    await expect(page.locator('text=欢迎回来，admin')).toBeVisible()
  })

  test('登录失败应该显示错误信息', async ({ page }) => {
    await page.goto('/admin/login')

    // 使用错误的密码
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'wrongpassword')

    // 提交表单
    await page.click('button[type="submit"]')

    // 检查错误信息
    await expect(page.locator('.bg-red-50')).toContainText('用户名或密码错误')
  })

  test('未登录访问管理页面应该重定向到登录页', async ({ page }) => {
    // 直接访问管理页面
    await page.goto('/admin')

    // 应该重定向到登录页
    await page.waitForURL('/admin/login')
    await expect(page).toHaveURL('/admin/login')
  })
})