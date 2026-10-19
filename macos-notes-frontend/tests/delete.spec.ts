import { test, expect } from './fixtures';

test('取消删除不发请求；确认后204、清理文件树并持久化，等待时禁止重复操作', async ({ page, request, backend }) => {
  const keep = await (await request.post('/api/notes', { data: { title: '保留笔记' } })).json();
  const target = await (await request.post('/api/notes', { data: { title: '删除目标' } })).json();
  await page.goto('/notes/' + target.id);
  await page.getByRole('button', { name: '编辑', exact: true }).click();
  await page.getByRole('textbox', { name: '笔记正文' }).fill('未保存的输入');
  let deletions = 0;
  page.on('request', r => { if (r.method() === 'DELETE') deletions++; });
  page.once('dialog', async dialog => {
    expect(dialog.message()).toContain('无法撤销');
    expect(dialog.message()).toContain('未保存的草稿');
    await dialog.dismiss();
  });
  await page.getByRole('button', { name: '删除笔记', exact: true }).click();
  expect(deletions).toBe(0);
  await expect(page.getByRole('textbox', { name: '笔记正文' })).toHaveValue('未保存的输入');
  expect((await request.get('/api/notes/' + target.id)).status()).toBe(200);
  let release!: () => void;
  let entered!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const waiting = new Promise<void>(resolve => { entered = resolve; });
  await page.route('**/api/notes/' + target.id, async route => {
    if (route.request().method() === 'DELETE') { entered(); await gate; }
    await route.continue();
  });
  const response = page.waitForResponse(r => r.request().method() === 'DELETE');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '删除笔记', exact: true }).click();
  await waiting;
  await expect(page.getByRole('button', { name: '删除中', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '保存', exact: true })).toBeDisabled();
  await expect(page.getByRole('textbox', { name: '笔记正文' })).toBeDisabled();
  release();
  const deleted = await response;
  expect(deleted.status()).toBe(204);
  // Chrome不保证为204提供可读取的body；空响应已由独立真实HTTP检查验证。
  expect(deletions).toBe(1);
  await expect(page).toHaveURL(new RegExp('/notes/' + keep.id + '$'));
  await expect(page.getByRole('navigation', { name: '笔记本与文档' }).getByRole('link', { name: '删除目标', exact: true })).toHaveCount(0);
  await expect(page.getByText('1 篇笔记', { exact: true })).toBeVisible();
  await backend.restart(); await page.reload();
  await expect(page.getByRole('heading', { name: '保留笔记', exact: true })).toBeVisible();
  expect((await request.get('/api/notes/' + target.id)).status()).toBe(404);
  await page.goto('/search?q=删除目标');
  await expect(page.getByText('找到 0 篇笔记', { exact: true })).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: /删除目标/ })).toHaveCount(0);
});

test('删除最后一篇回到空入口，文档导航不会再打开已删除编号', async ({ page, request }) => {
  const note = await (await request.post('/api/notes', { data: { title: '最后一篇' } })).json();
  await page.goto('/notes/' + note.id);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '删除笔记', exact: true }).click();
  await expect(page.getByRole('heading', { name: '从第一篇笔记开始' })).toBeVisible();
  await expect(page.getByText('0 篇笔记', { exact: true })).toBeVisible();
  await page.getByRole('navigation', { name: '功能模块' }).getByRole('link', { name: '搜索', exact: true }).click();
  await page.getByRole('navigation', { name: '功能模块' }).getByRole('link', { name: '文档', exact: true }).click();
  await expect(page.getByRole('heading', { name: '从第一篇笔记开始' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: '从第一篇笔记开始' })).toBeVisible();
});

test('删除时服务中断保留笔记和草稿，恢复后可重试', async ({ page, request, backend }) => {
  const note = await (await request.post('/api/notes', { data: { title: '断线笔记' } })).json();
  await page.goto('/notes/' + note.id);
  await page.getByRole('button', { name: '编辑', exact: true }).click();
  await page.getByRole('textbox', { name: '笔记正文' }).fill('删除失败也要留住');
  await backend.stop();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '删除笔记', exact: true }).click();
  await expect(page.getByText(/笔记服务.*响应|无法连接笔记服务/).first()).toBeVisible();
  await expect(page.getByRole('textbox', { name: '笔记正文' })).toHaveValue('删除失败也要留住');
  await expect(page.getByRole('navigation', { name: '笔记本与文档' }).getByRole('link', { name: '断线笔记', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '删除笔记', exact: true })).toBeEnabled();
  await backend.restart();
  expect((await request.get('/api/notes/' + note.id)).status()).toBe(200);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '删除笔记', exact: true }).click();
  await expect(page.getByRole('heading', { name: '从第一篇笔记开始' })).toBeVisible();
});

test('笔记已在其他页面删除时显示404，当前草稿保留', async ({ page, request }) => {
  const note = await (await request.post('/api/notes', { data: { title: '已删除笔记' } })).json();
  await page.goto('/notes/' + note.id);
  await page.getByRole('button', { name: '编辑', exact: true }).click();
  await page.getByRole('textbox', { name: '笔记正文' }).fill('仍可复制的草稿');
  expect((await request.delete('/api/notes/' + note.id)).status()).toBe(204);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '删除笔记', exact: true }).click();
  await expect(page.getByText('笔记不存在', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: '笔记正文' })).toHaveValue('仍可复制的草稿');
  await expect(page.getByRole('button', { name: '删除笔记', exact: true })).toBeEnabled();
});
