import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/notes/welcome');
  await expect(page.getByRole('heading', { name: '把知识连接起来', level: 1 })).toBeVisible();
});

test('共用布局不刷新，反链、前进后退与刷新直达', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.evaluate(() => { Object.assign(window, { testMarker: 42, testHeader: document.querySelector('header') }); });
  await page.getByRole('complementary', { name: '反链面板' }).getByRole('link', { name: /原子笔记的方法/ }).click();
  await expect(page.getByRole('heading', { name: '原子笔记的方法', level: 1 })).toBeVisible();
  expect(await page.evaluate(() => { const marked = window as Window & { testMarker?: number; testHeader?: Element }; return marked.testMarker === 42 && marked.testHeader === document.querySelector('header'); })).toBe(true);
  await page.goBack(); await expect(page.getByRole('heading', { name: '把知识连接起来', level: 1 })).toBeVisible();
  await page.goForward(); await page.reload();
  await expect(page.getByRole('heading', { name: '原子笔记的方法', level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});

test('递归文件夹折叠、高亮与左右面板空间释放', async ({ page }) => {
  const tree = page.getByRole('navigation', { name: '笔记本与文档' });
  await tree.getByRole('button', { name: '开始于此' }).click();
  await expect(tree.getByRole('link', { name: '原子笔记的方法', exact: true })).toBeHidden();
  await tree.getByRole('button', { name: '开始于此' }).click();
  await tree.getByRole('link', { name: '原子笔记的方法', exact: true }).click();
  await expect(tree.getByRole('link', { name: '原子笔记的方法', exact: true })).toHaveAttribute('aria-current', 'page');
  const before = await page.locator('main').evaluate(element => element.clientWidth);
  await page.getByRole('button', { name: '隐藏文件树' }).click();
  await page.getByRole('button', { name: '隐藏反链面板' }).click();
  expect(await page.locator('main').evaluate(element => element.clientWidth)).toBeGreaterThan(before + 400);
  await page.getByRole('button', { name: '显示文件树' }).click();
  await page.getByRole('button', { name: '显示反链面板' }).click();
  await expect(tree).toBeVisible();
});

test('草稿跨文档保留，显式 mock 保存，刷新恢复，HTML 按文本显示', async ({ page }) => {
  await page.getByRole('button', { name: '编辑', exact: true }).click();
  await page.getByRole('textbox', { name: '笔记标题' }).fill('测试保存标题');
  await page.getByRole('textbox', { name: '笔记正文' }).fill('## 新的想法\n\n<script>alert("unsafe")</script>\n\n一条测试草稿。');
  const tree = page.getByRole('navigation', { name: '笔记本与文档' });
  await tree.getByRole('link', { name: '本周学习回顾', exact: true }).click();
  await expect(page.getByRole('heading', { name: '本周学习回顾', level: 1 })).toBeVisible();
  await tree.getByRole('link', { name: '把知识连接起来', exact: true }).click();
  await expect(page.getByRole('heading', { name: '测试保存标题', level: 1 })).toBeVisible();
  await expect(page.getByText('<script>alert("unsafe")</script>', { exact: true })).toBeVisible();
  expect(await page.locator('article script').count()).toBe(0);
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByText('已模拟保存 · 刷新后恢复示例数据')).toBeVisible();
  await expect(tree.getByRole('link', { name: '测试保存标题', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: '把知识连接起来', level: 1 })).toBeVisible();
});

test('搜索、空结果、标签筛选与文档跳转', async ({ page }) => {
  await page.getByRole('navigation', { name: '功能模块' }).getByRole('link', { name: '搜索', exact: true }).click();
  await page.getByRole('textbox', { name: '搜索笔记' }).fill('Python');
  await expect(page.getByRole('link', { name: /Python 学习笔记/ }).first()).toBeVisible();
  await page.getByRole('textbox', { name: '搜索笔记' }).fill('不存在的关键词zzzz');
  await expect(page.getByText('没有匹配的笔记，换一个关键词试试。')).toBeVisible();
  await page.getByRole('navigation', { name: '功能模块' }).getByRole('link', { name: '标签', exact: true }).click();
  await page.getByRole('button', { name: /Python/ }).click();
  await expect(page.getByText('1 篇相关笔记')).toBeVisible();
  await page.getByRole('link', { name: /Python 学习笔记/ }).last().click();
  await expect(page.getByRole('heading', { name: 'Python 学习笔记', level: 1 })).toBeVisible();
});

test('新建笔记、设置生效和模拟同步提示', async ({ page }) => {
  await page.getByRole('button', { name: '新建笔记' }).click();
  await expect(page.getByRole('heading', { name: '未命名笔记', level: 1 })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '笔记本与文档' }).getByRole('link', { name: '未命名笔记' })).toBeVisible();
  await page.getByRole('button', { name: '打开设置' }).click();
  await page.getByRole('combobox', { name: '正文字号' }).selectOption('20');
  await expect(page.getByText('偏好已应用 · 仅当前会话')).toBeVisible();
  await page.getByRole('checkbox', { name: '源码编辑时显示行号' }).check();
  await expect(page.getByRole('checkbox')).toBeEnabled();
  await page.getByRole('navigation', { name: '功能模块' }).getByRole('link', { name: '文档', exact: true }).click();
  await expect(page.locator('article')).toHaveCSS('font-size', '20px');
  await page.getByRole('button', { name: '编辑', exact: true }).click();
  await expect(page.locator('article pre')).toBeVisible();
  await page.getByRole('button', { name: '模拟同步' }).click();
  await expect(page.getByText('模拟同步完成 · 尚未连接云端')).toBeVisible();
});

test('关系图键盘导航、未知文档和未知路由', async ({ page }) => {
  const node = page.getByRole('button', { name: '打开原子笔记的方法', exact: true });
  await node.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: '原子笔记的方法', level: 1 })).toBeVisible();
  await page.goto('/notes/missing'); await expect(page.getByRole('heading', { name: '无法打开笔记' })).toBeVisible();
  await page.goto('/unknown-page'); await expect(page.getByRole('heading', { name: '没有找到这个页面' })).toBeVisible();
});

test('窄屏侧栏浮层与无横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByRole('heading', { name: '把知识连接起来', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: '显示文件树' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: '显示文件树' }).click();
  await expect(page.getByRole('navigation', { name: '笔记本与文档' })).toBeVisible();
  await page.getByRole('button', { name: '隐藏文件树' }).click();
  await page.getByRole('button', { name: '显示反链面板' }).click();
  await expect(page.getByRole('complementary', { name: '反链面板' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
