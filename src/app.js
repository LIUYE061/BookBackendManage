/**
 * Express 应用装配(不启动监听,便于回归测试直接引用)
 */
const path = require('path');
const express = require('express');

const app = express();

// 视图引擎:EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 静态资源(CSS / jQuery)
app.use(express.static(path.join(__dirname, '..', 'public')));

// 解析表单提交
app.use(express.urlencoded({ extended: false }));

// 模板辅助:生成保留查询条件的列表页地址(分页/搜索链接用)
app.locals.listUrl = (bookName, page) => {
  const params = new URLSearchParams();
  if (bookName) params.set('bookName', bookName);
  if (page && Number(page) > 1) params.set('page', page);
  const qs = params.toString();
  return qs ? `/books?${qs}` : '/books';
};

// 图书管理路由
app.use('/books', require('./routes/bookRoutes'));

// 根路径跳转到图书列表
app.get('/', (req, res) => res.redirect('/books'));

// 404
app.use((req, res) => {
  res.status(404).render('error', {
    title: '页面不存在',
    message: '您访问的页面不存在',
    backUrl: '/books',
  });
});

// 统一错误处理(含数据库异常)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  res.status(err.status || 500).render('error', {
    title: '系统错误',
    message: err.status === 404 ? '图书不存在或已被删除' : '系统繁忙,请稍后重试',
    backUrl: '/books',
  });
});

module.exports = app;
