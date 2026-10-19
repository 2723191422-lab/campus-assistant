import { test, expect } from './fixtures';

test('按输入顺序匹配：忽略查询空白、允许隔字，不能倒序或只命中部分字符', async ({ page, request }) => {
  for (const note of [
    { title: '笔记甲', content: '今天好开心 aaa' },
    { title: '笔记乙', content: 'aaa，今天好开心' },
    { title: '笔记丙', content: '今天好开心' },
  ]) {
    const created = await request.post('/api/notes', { data: { title: note.title } });
    expect(created.status()).toBe(201);
    const { id } = await created.json();
    expect((await request.patch('/api/notes/' + id, { data: note })).status()).toBe(200);
  }
  await page.goto('/search');
  const search = page.getByRole('textbox', { name: '搜索笔记' });
  const results = page.getByRole('main');
  await search.fill('今天 a');
  await expect(page.getByText('找到 1 篇笔记', { exact: true })).toBeVisible();
  await expect(results.getByRole('heading', { name: '笔记甲', exact: true })).toBeVisible();
  await expect(results.getByRole('heading', { name: '笔记乙', exact: true })).toHaveCount(0);
  await search.fill('a 今天');
  await expect(page.getByText('找到 1 篇笔记', { exact: true })).toBeVisible();
  await expect(results.getByRole('heading', { name: '笔记乙', exact: true })).toBeVisible();
  await search.fill(' 　今   开 A  ');
  await expect(page.getByText('找到 1 篇笔记', { exact: true })).toBeVisible();
  await expect(results.getByRole('heading', { name: '笔记甲', exact: true })).toBeVisible();
  for (const query of ['天今 a', '今天 z', '今天 aaaa']) {
    await search.fill(query);
    await expect(page.getByText('没有匹配的笔记，换一个关键词试试。')).toBeVisible();
  }
  await search.fill(' 　');
  await expect(page.getByText('找到 3 篇笔记', { exact: true })).toBeVisible();
});
