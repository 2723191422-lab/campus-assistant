import { test, expect } from './fixtures';

test('空数据库显示入口，新建返回201完整笔记并进入真实文件树', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '从第一篇笔记开始' })).toBeVisible();
  const response = page.waitForResponse(r => r.url().endsWith('/api/notes') && r.request().method() === 'POST');
  await page.getByRole('button', { name: '创建第一篇笔记' }).click();
  const created = await response;
  expect(created.status()).toBe(201);
  const note = await created.json();
  expect(Object.keys(note).sort()).toEqual(['id', 'title', 'content', 'tags', 'notebook', 'updatedAt'].sort());
  await expect(page).toHaveURL(new RegExp('/notes/' + note.id + '$'));
  await expect(page.getByRole('heading', { name: '未命名笔记', exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '笔记本与文档' }).getByRole('link', { name: '未命名笔记' })).toBeVisible();
  expect((await (await page.request.get('/api/notes')).json()).length).toBe(1);
});

test('真实笔记切换保留布局、草稿及历史导航，文件夹可折叠', async ({ page, request }) => {
  const a = await (await request.post('/api/notes', { data: { title: '第一篇' } })).json();
  const b = await (await request.post('/api/notes', { data: { title: '第二篇' } })).json();
  await page.goto('/notes/' + a.id);
  await expect(page.getByRole('heading', { name: '第一篇', exact: true })).toBeVisible();
  await page.evaluate(() => { Object.assign(window, { testHeader: document.querySelector('header') }); });
  await page.getByRole('button', { name: '编辑', exact: true }).click();
  await page.getByRole('textbox', { name: '笔记标题' }).fill('未保存草稿');
  const tree = page.getByRole('navigation', { name: '笔记本与文档' });
  await tree.getByRole('link', { name: '第二篇', exact: true }).click();
  await expect(page.getByRole('heading', { name: '第二篇', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: '未保存草稿', exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { testHeader?: Element }).testHeader === document.querySelector('header'))).toBe(true);
  await page.goForward(); await expect(page).toHaveURL(new RegExp(b.id + '$'));
  await tree.getByRole('button', { name: '收件箱', exact: true }).click();
  await expect(tree.getByRole('link', { name: '第一篇', exact: true })).toBeHidden();
  await tree.getByRole('button', { name: '收件箱', exact: true }).click();
  await expect(tree.getByRole('link', { name: '第二篇', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('真实保存后刷新和后端进程重启仍保留，HTML安全显示', async ({ page, backend }) => {
  await page.goto('/'); await page.getByRole('button', { name: '创建第一篇笔记' }).click();
  await page.getByRole('button', { name: '编辑', exact: true }).click();
  await page.getByRole('textbox', { name: '笔记标题' }).fill('  持久化验收  ');
  await page.getByRole('textbox', { name: '笔记正文' }).fill('## 我的正文\n\n<script>alert("unsafe")</script>');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByText('已保存到本机数据库', { exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '笔记本与文档' }).getByRole('link', { name: '持久化验收', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: '持久化验收', exact: true })).toBeVisible();
  await expect(page.getByText('<script>alert("unsafe")</script>', { exact: true })).toBeVisible();
  expect(await page.locator('article script').count()).toBe(0);
  await backend.restart(); await page.reload();
  await expect(page.getByRole('heading', { name: '持久化验收', exact: true })).toBeVisible();
  await expect(page.getByText('<script>alert("unsafe")</script>', { exact: true })).toBeVisible();
});

test('422与服务中断保留草稿，重新连接后可保存', async ({ page, backend }) => {
  await page.goto('/'); await page.getByRole('button', { name: '创建第一篇笔记' }).click();
  await page.getByRole('button', { name: '编辑', exact: true }).click();
  await page.getByRole('textbox', { name: '笔记标题' }).fill('   ');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByText('标题不能为空', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: '笔记标题' })).toHaveValue('   ');
  await page.getByRole('textbox', { name: '笔记标题' }).fill('恢复后的草稿');
  await page.getByRole('textbox', { name: '笔记正文' }).fill('服务中断也要保留');
  await backend.stop();
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByText(/笔记服务.*响应|无法连接笔记服务/).first()).toBeVisible();
  await expect(page.getByRole('textbox', { name: '笔记正文' })).toHaveValue('服务中断也要保留');
  await backend.restart();
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByText('已保存到本机数据库', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: '恢复后的草稿', exact: true })).toBeVisible();
});

test('搜索与标签视图使用真实笔记，设置和模拟同步范围明确', async ({ page, request }) => {
  const note = await (await request.post('/api/notes', { data: { title: 'Python实践' } })).json();
  await request.patch('/api/notes/' + note.id, { data: { title: 'Python实践', content: 'sqlite持久化' } });
  await page.goto('/search');
  await page.getByRole('textbox', { name: '搜索笔记' }).fill('sqlite');
  await expect(page.getByRole('main').getByRole('link', { name: /Python实践/ })).toBeVisible();
  await page.getByRole('textbox', { name: '搜索笔记' }).fill('没有的内容zzzz');
  await expect(page.getByText('没有匹配的笔记，换一个关键词试试。')).toBeVisible();
  await page.getByRole('navigation', { name: '功能模块' }).getByRole('link', { name: '标签', exact: true }).click();
  await expect(page.getByText('1 篇相关笔记', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '打开设置' }).click();
  await page.getByRole('combobox', { name: '正文字号' }).selectOption('20');
  await expect(page.getByText('偏好已应用 · 仅当前会话')).toBeVisible();
  await page.getByRole('checkbox', { name: '源码编辑时显示行号' }).check();
  await page.getByRole('navigation', { name: '功能模块' }).getByRole('link', { name: '文档', exact: true }).click();
  await expect(page.locator('article')).toHaveCSS('font-size', '20px');
  await page.getByRole('button', { name: '模拟同步' }).click();
  await expect(page.getByText('模拟同步完成 · 尚未连接云端')).toBeVisible();
  await expect(page.getByText('反链分析尚未接入，当前仅显示笔记本身。')).toBeVisible();
});

test('未知笔记404、未知页面和服务不可用均有恢复入口', async ({ page, backend }) => {
  await page.goto('/notes/missing'); await expect(page.getByRole('heading', { name: '无法打开笔记' })).toBeVisible();
  await page.getByRole('link', { name: '返回开始页' }).click();
  await expect(page.getByRole('heading', { name: '从第一篇笔记开始' })).toBeVisible();
  await page.goto('/unknown'); await expect(page.getByRole('heading', { name: '没有找到这个页面' })).toBeVisible();
  await backend.stop(); await page.goto('/');
  await expect(page.getByRole('heading', { name: '无法读取笔记' })).toBeVisible();
  await backend.restart();
  await page.getByRole('main').getByRole('button', { name: '重新连接' }).click();
  await expect(page.getByRole('heading', { name: '从第一篇笔记开始' })).toBeVisible();
});

test('390px窄屏无横向溢出，侧栏可打开，正文可编辑', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/'); await page.getByRole('button', { name: '创建第一篇笔记' }).click();
  await expect(page.getByRole('heading', { name: '未命名笔记', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: '显示文件树' }).click();
  await expect(page.getByRole('navigation', { name: '笔记本与文档' })).toBeVisible();
  await page.getByRole('button', { name: '隐藏文件树' }).click();
  await page.getByRole('button', { name: '显示反链面板' }).click();
  await expect(page.getByRole('complementary', { name: '反链面板' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
