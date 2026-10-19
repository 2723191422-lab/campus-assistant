import { test, expect } from './fixtures';
import type { Page, Locator } from '@playwright/test';

// 使用浏览器原生组合输入协议；不是 fill 或直接粘贴中文。
async function compose(page: Page, input: Locator, text: string, duringComposition?: () => Promise<void>) {
  await input.focus();
  const client = await page.context().newCDPSession(page);
  await input.evaluate(element => {
    const events: string[] = [];
    Object.assign(element, { imeEvents: events });
    for (const type of ['compositionstart', 'compositionupdate', 'compositionend']) {
      element.addEventListener(type, () => events.push(type));
    }
  });
  for (const part of ['n', 'ni', 'nihao']) {
    await client.send('Input.imeSetComposition', { text: part, selectionStart: part.length, selectionEnd: part.length });
    await expect(input).toHaveValue(part);
    if (duringComposition) await duringComposition();
  }
  await client.send('Input.insertText', { text });
  await expect(input).toHaveValue(text);
  const events = await input.evaluate(element => (element as HTMLElement & { imeEvents: string[] }).imeEvents);
  expect(events).toContain('compositionstart');
  expect(events).toContain('compositionend');
  await client.detach();
}

test('中文组合输入：标题与正文完成选词后可保存并刷新', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '创建第一篇笔记' }).click();
  await page.getByRole('button', { name: '编辑', exact: true }).click();
  const title = page.getByRole('textbox', { name: '笔记标题' });
  await title.fill('');
  await compose(page, title, '你好');
  await compose(page, page.getByRole('textbox', { name: '笔记正文' }), '你好');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByText('已保存到本机数据库', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: '你好', exact: true })).toBeVisible();
  await expect(page.locator('article p').filter({ hasText: /^你好$/ })).toBeVisible();
});

test('中文组合输入：搜索选词后正确显示中文查询', async ({ page, request }) => {
  await request.post('/api/notes', { data: { title: '你好' } });
  await page.goto('/search');
  await compose(page, page.getByRole('textbox', { name: '搜索笔记' }), '你好', async () => {
    await expect(page).toHaveURL(/\/search$/);
  });
  await expect(page).toHaveURL(/q=%E4%BD%A0%E5%A5%BD/);
  await expect(page.getByRole('main').getByRole('link', { name: /你好/ })).toBeVisible();
});
