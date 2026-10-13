/**
 * 回归测试(node:test + supertest)
 *
 * 覆盖试卷全部功能点:
 *  1. 列表:默认按入库时间降序、每页 5 条、隔行变色、日期"年-月-日"
 *  2. 按图书名称模糊查询 + 输入框记忆查询条件
 *  3. 查看:全部字段只读,返回保留查询条件与页码
 *  4. 新增:入库人默认 admin、入库时间默认当前时间、是否借阅默认未借阅、
 *     成功/失败提示并跳回列表
 *  5. 修改:入库人/入库时间只读,成功/失败提示并跳回列表
 *  6. 删除:确认后删除,回列表显示成功提示,保留查询条件
 *
 * 测试数据由本文件自行重置(与 SQL 文件中的测试数据一致),
 * 对数据库方言无依赖:本地跑 SQL Server,CI 跑 MySQL。
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../src/app');
const { sequelize, BookInfo, BookType } = require('../src/models');

/** 与 sql/book_backend_manage.sql 一致的测试数据 */
const SAMPLE_TYPES = [
  { id: 1, typeName: '小说' }, { id: 2, typeName: '文学' }, { id: 3, typeName: '传记' },
  { id: 4, typeName: '艺术' }, { id: 5, typeName: '少儿' }, { id: 6, typeName: '经济' },
  { id: 7, typeName: '管理' }, { id: 8, typeName: '科技' },
];

const SAMPLE_BOOKS = [
  ['B-0001', '三体', 1, '刘慈欣', '重庆出版社', '2008-01-01', 1, 'admin', '2026-09-12'],
  ['B-0002', '活着', 1, '余华', '作家出版社', '2012-08-01', 0, 'admin', '2026-09-15'],
  ['B-0003', '百年孤独', 2, '加西亚·马尔克斯', '南海出版公司', '2011-06-01', 0, 'admin', '2026-09-20'],
  ['B-0004', '人类群星闪耀时', 3, '斯蒂芬·茨威格', '三联书店', '2019-01-01', 1, 'admin', '2026-09-25'],
  ['B-0005', '小王子', 5, '圣埃克苏佩里', '人民文学出版社', '2003-08-01', 0, 'admin', '2026-10-01'],
  ['B-0006', '经济学原理', 6, '曼昆', '北京大学出版社', '2015-05-01', 0, 'admin', '2026-10-05'],
  ['B-0007', '高效能人士的七个习惯', 7, '史蒂芬·柯维', '中国青年出版社', '2010-10-01', 1, 'admin', '2026-10-08'],
  ['B-0008', '时间简史', 8, '史蒂芬·霍金', '湖南科学技术出版社', '2010-04-01', 0, 'admin', '2026-10-10'],
].map(([bookCode, bookName, bookType, bookAuthor, publishPress, publishDate, borrowed, createdBy, creationTime]) => ({
  bookCode, bookName, bookType, bookAuthor, publishPress,
  publishDate, borrowed, createdBy, creationTime, lastUpdatetime: creationTime,
}));

/** 重置测试数据 */
async function seed() {
  await BookInfo.destroy({ where: {}, truncate: true });
  await BookType.destroy({ where: {}, truncate: true });
  await BookType.bulkCreate(SAMPLE_TYPES);
  await BookInfo.bulkCreate(SAMPLE_BOOKS);
}

/** 按编号查图书 */
async function findByCode(code) {
  return BookInfo.findOne({ where: { bookCode: code } });
}

before(async () => {
  await seed();
});

after(async () => {
  // 恢复示例数据,保证本地开发库完好
  await seed();
  await sequelize.close();
});

/* ---------- 1. 列表页 ---------- */

test('列表页:默认显示全部图书,按入库时间降序,每页 5 条', async () => {
  const res = await request(app).get('/books');
  assert.equal(res.status, 200);
  assert.match(res.text, /共 8 条记录/);
  assert.match(res.text, /每页 5 条/);
  // 第一页:最新的 5 条(B-0008 最早入库时间 2026-10-10 在最前)
  const first = res.text.indexOf('B-0008');
  const second = res.text.indexOf('B-0007');
  const fourth = res.text.indexOf('B-0005');
  const fifth = res.text.indexOf('B-0004');
  assert.ok(first > -1 && first < second && second < fourth && fourth < fifth);
  // 第 6 条 B-0003 不应出现在第一页
  assert.ok(res.text.indexOf('B-0003') === -1);
});

test('列表页:隔行变色与日期"年-月-日"格式', async () => {
  const res = await request(app).get('/books');
  // 隔行变色样式(在引用的样式表中)
  assert.match(res.text, /\/css\/style\.css/);
  const css = await request(app).get('/css/style.css');
  assert.equal(css.status, 200);
  assert.match(css.text, /nth-child\(even\)/);
  // 入库时间按 年-月-日 显示(首页最新与最旧两条)
  assert.match(res.text, /2026-10-10/);
  assert.match(res.text, /2026-09-25/);
});

test('列表页:提供查看/修改/删除链接与新增按钮', async () => {
  const res = await request(app).get('/books');
  assert.match(res.text, /查看/);
  assert.match(res.text, /修改/);
  assert.match(res.text, /删除/);
  assert.match(res.text, /新增图书/);
  assert.match(res.text, /\/books\/new/);
});

/* ---------- 2. 模糊查询 ---------- */

test('查询:按图书名称模糊查询并记忆查询条件', async () => {
  const res = await request(app).get(`/books?bookName=${encodeURIComponent('三体')}`);
  assert.equal(res.status, 200);
  assert.match(res.text, /三体/);
  assert.match(res.text, /B-0001/);
  assert.doesNotMatch(res.text, /活着/);
  // 输入框记忆查询条件(服务端解码后原样回显)
  assert.match(res.text, /value="三体"/);
  // 查询结果仍按入库时间降序(仅一条)
  assert.match(res.text, /共 1 条记录/);
});

test('查询:无匹配结果时给出空提示', async () => {
  const res = await request(app).get(`/books?bookName=${encodeURIComponent('不存在的书')}`);
  assert.match(res.text, /暂无符合条件的图书信息/);
});

/* ---------- 3. 分页 ---------- */

test('分页:第 2 页显示剩余 3 条', async () => {
  const res = await request(app).get('/books?page=2');
  assert.match(res.text, /B-0003/);
  assert.match(res.text, /B-0002/);
  assert.match(res.text, /B-0001/);
  assert.doesNotMatch(res.text, /B-0004/);
  assert.match(res.text, /共 8 条记录/);
});

/* ---------- 4. 查看 ---------- */

test('查看:详情页字段完整且全部只读', async () => {
  const book = await findByCode('B-0001');
  const res = await request(app).get(`/books/${book.bookId}`);
  assert.equal(res.status, 200);
  assert.match(res.text, /图书详细信息/);
  for (const kw of ['B-0001', '三体', '小说', '刘慈欣', '重庆出版社', '2008-01-01', '已借阅', 'admin', '2026-09-12']) {
    assert.match(res.text, new RegExp(kw), `详情页应包含 ${kw}`);
  }
  // 所有字段只读:页面无输入控件
  assert.doesNotMatch(res.text, /<input/);
});

test('查看:返回按钮保留查询条件与页码', async () => {
  const book = await findByCode('B-0001');
  const res = await request(app).get(`/books/${book.bookId}?bookName=${encodeURIComponent('三体')}&page=2`);
  assert.match(res.text, new RegExp(`href="/books\\?bookName=${encodeURIComponent('三体')}(&amp;|&)page=2"`));
});

/* ---------- 5. 新增 ---------- */

test('新增:表单默认值(类型来源于 book_type、入库人 admin、入库时间当前时间)', async () => {
  const res = await request(app).get('/books/new');
  assert.equal(res.status, 200);
  assert.match(res.text, /新增图书/);
  // 类型下拉数据来源于 book_type 表(8 种)
  for (const t of ['小说', '文学', '传记', '艺术', '少儿', '经济', '管理', '科技']) {
    assert.match(res.text, new RegExp(t));
  }
  // 入库人默认 admin、入库时间默认为当前系统时间
  assert.match(res.text, /value="admin"/);
  const today = new Date();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  assert.match(res.text, new RegExp(`${today.getFullYear()}-${m}-${d}`));
  // 是否借阅默认未借阅
  assert.match(res.text, /value="0" checked/);
  // 必填项使用 jQuery 验证
  assert.match(res.text, /bookForm/);
});

test('新增:保存成功跳回列表并提示添加成功', async () => {
  const res = await request(app).post('/books').type('form').send({
    bookCode: 'B-T01', bookName: '回归测试书', bookType: '1', bookAuthor: '测试作者',
    publishPress: '测试出版社', publishDate: '2021-01-01', borrowed: '0',
  });
  assert.equal(res.status, 302);
  assert.match(res.headers.location, /msg=add_success/);

  const created = await findByCode('B-T01');
  assert.ok(created, '新书应已入库');
  assert.equal(created.createdBy, 'admin', '入库人默认当前登录用户');
  assert.equal(created.borrowed, 0, '是否借阅默认未借阅');
  // 入库时间默认为当前时间(年-月-日)
  const today = new Date();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  assert.equal(created.creationTime, `${today.getFullYear()}-${m}-${d}`);

  // 列表页显示添加成功提示
  const listRes = await request(app).get('/books?msg=add_success');
  assert.match(listRes.text, /添加成功/);
});

test('新增:必填项缺失提示添加失败且不入库', async () => {
  const res = await request(app).post('/books').type('form').send({
    bookCode: '', bookName: '', bookType: '', bookAuthor: '',
    publishPress: '', publishDate: '',
  });
  assert.equal(res.status, 302);
  assert.match(res.headers.location, /msg=add_fail/);
  assert.equal(await BookInfo.count({ where: { bookCode: '' } }), 0, '非法数据不应入库');
  const listRes = await request(app).get('/books?msg=add_fail');
  assert.match(listRes.text, /添加失败/);
});

/* ---------- 6. 修改 ---------- */

test('修改:表单预填,入库人与入库时间只读', async () => {
  const book = await findByCode('B-0002');
  const res = await request(app).get(`/books/${book.bookId}/edit`);
  assert.equal(res.status, 200);
  assert.match(res.text, /修改图书/);
  assert.match(res.text, /B-0002/);
  assert.match(res.text, /活着/);
  // 入库人/入库时间为只读状态
  assert.match(res.text, /name="createdBy" value="admin" readonly/);
  assert.match(res.text, /name="creationTime" value="2026-09-15" readonly/);
});

test('修改:保存成功跳回列表并提示修改成功,入库人/时间不变', async () => {
  const book = await findByCode('B-0002');
  const res = await request(app).post(`/books/${book.bookId}/update`).type('form').send({
    bookCode: 'B-0002', bookName: '活着(修订版)', bookType: '1', bookAuthor: '余华',
    publishPress: '作家出版社', publishDate: '2012-08-01', borrowed: '1',
  });
  assert.equal(res.status, 302);
  assert.match(res.headers.location, /msg=update_success/);

  await book.reload();
  assert.equal(book.bookName, '活着(修订版)');
  assert.equal(book.borrowed, 1);
  assert.equal(book.createdBy, 'admin', '入库人只读不可修改');
  assert.equal(book.creationTime, '2026-09-15', '入库时间只读不可修改');

  const listRes = await request(app).get('/books?msg=update_success');
  assert.match(listRes.text, /修改成功/);
});

test('修改:必填项缺失提示修改失败', async () => {
  const book = await findByCode('B-0003');
  const res = await request(app).post(`/books/${book.bookId}/update`).type('form').send({
    bookCode: '', bookName: '', bookType: '', bookAuthor: '',
    publishPress: '', publishDate: '',
  });
  assert.equal(res.status, 302);
  assert.match(res.headers.location, /msg=update_fail/);
  const listRes = await request(app).get('/books?msg=update_fail');
  assert.match(listRes.text, /修改失败/);
});

/* ---------- 7. 删除 ---------- */

test('删除:删除成功跳回列表并提示,记录不存在', async () => {
  const book = await findByCode('B-0008');
  const res = await request(app).post(`/books/${book.bookId}/delete`).type('form').send({
    _bookName: '时间简史', _page: '2',
  });
  assert.equal(res.status, 302);
  assert.match(res.headers.location, /msg=del_success/);
  // 保留原查询条件与页码
  assert.match(res.headers.location, /bookName=%E6%97%B6%E9%97%B4%E7%AE%80%E5%8F%B2/);
  assert.match(res.headers.location, /page=2/);

  assert.equal(await BookInfo.findByPk(book.bookId), null, '图书记录应已删除');
  // 删除后详情页返回 404 提示
  const detailRes = await request(app).get(`/books/${book.bookId}`);
  assert.equal(detailRes.status, 404);

  const listRes = await request(app).get('/books?msg=del_success');
  assert.match(listRes.text, /删除成功/);
});

test('删除:删除按钮由 jQuery 绑定确认提示', async () => {
  const res = await request(app).get('/books');
  // 列表页加载交互脚本
  assert.match(res.text, /\/js\/main\.js/);
  assert.match(res.text, /js-delete-form/);
  // 交互脚本中包含删除确认提示
  const js = await request(app).get('/js/main.js');
  assert.equal(js.status, 200);
  assert.match(js.text, /确定删除该图书信息/);
});

/* ---------- 8. 异常路径 ---------- */

test('访问不存在的图书返回 404 提示页', async () => {
  const res = await request(app).get('/books/99999');
  assert.equal(res.status, 404);
  assert.match(res.text, /图书不存在/);
});
