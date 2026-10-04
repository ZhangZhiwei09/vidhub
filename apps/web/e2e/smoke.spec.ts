import { test, expect } from '@playwright/test'

test('home page renders brand', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'VidHub' })).toBeVisible()
  await expect(page.getByRole('navigation').getByRole('link', { name: '热门' })).toBeVisible()
})

test('login page is reachable', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: '登录 VidHub' })).toBeVisible()
  await expect(page.getByRole('button', { name: '登录', exact: true })).toBeVisible()
})

test('popular page is reachable', async ({ page }) => {
  await page.goto('/popular')
  await expect(page.getByRole('heading', { name: '热门视频' })).toBeVisible()
})

test('video detail mounts the player when a featured video exists', async ({ page }) => {
  await page.goto('/')
  const watch = page.getByRole('link', { name: '立即观看' })
  if (!(await watch.count())) {
    test.skip(true, 'no approved videos seeded')
  }
  await watch.click()
  await expect(page.getByTestId('video-player')).toBeVisible()
  await expect(page.locator('#wplayer')).toBeVisible()
})
