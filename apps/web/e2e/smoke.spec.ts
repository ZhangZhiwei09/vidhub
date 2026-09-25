import { test, expect } from '@playwright/test'

test('home page renders brand', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'VidHub' })).toBeVisible()
  await expect(page.getByText('发现精彩视频')).toBeVisible()
})

test('login page is reachable', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByText('登录 VidHub')).toBeVisible()
})