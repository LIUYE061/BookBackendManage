/**
 * 图书控制器层(Controller)
 * 引用 Service 完成业务,保存结果与提示消息并导航到指定页面;
 * 所有操作均进行必要的异常处理。
 */
const bookService = require('../services/BookService');

/** 操作提示消息文案(与列表页 banner 展示对应) */
const MESSAGES = {
  add_success: '添加成功',
  add_fail: '添加失败',
  update_success: '修改成功',
  update_fail: '修改失败',
  del_success: '删除成功',
  del_fail: '删除失败',
};

/**
 * 拼接返回列表页地址:保留查询条件与页码,
 * 并可附带操作提示消息(msg)。
 */
function backUrl(query, msg) {
  const params = new URLSearchParams();
  if (msg) params.set('msg', msg);
  if (query.bookName) params.set('bookName', query.bookName);
  if (query.page && Number(query.page) > 1) params.set('page', query.page);
  const qs = params.toString();
  return qs ? `/books?${qs}` : '/books';
}

/**
 * 从请求中取返回参数:GET 页面从 query 读取;
 * 表单提交从隐藏域 _bookName / _page 读取(保留原查询条件与页码)。
 */
function backParams(req) {
  return {
    bookName: req.query.bookName || req.body._bookName,
    page: req.query.page || req.body._page,
  };
}

/** 今天的日期字符串 YYYY-MM-DD(新增页入库时间默认值) */
function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

const bookController = {
  /** 图书列表页:默认按入库时间降序显示全部图书,支持书名模糊查询与分页 */
  async index(req, res, next) {
    try {
      const { rows, count, page, pageSize, totalPages } = await bookService.listBooks({
        bookName: req.query.bookName,
        page: req.query.page,
      });
      res.render('bookList', {
        title: '图书信息列表',
        books: rows,
        count,
        page,
        pageSize,
        totalPages,
        bookName: (req.query.bookName || '').trim(),
        message: req.query.msg ? MESSAGES[req.query.msg] || null : null,
        messageType: req.query.msg && req.query.msg.endsWith('_fail') ? 'error' : 'success',
      });
    } catch (e) {
      next(e);
    }
  },

  /** 查看图书详细信息页(全部字段只读) */
  async detail(req, res, next) {
    try {
      const book = await bookService.getBookDetail(req.params.id);
      res.render('bookView', {
        title: '图书详细信息',
        book,
        backUrl: backUrl(req.query),
      });
    } catch (e) {
      next(e);
    }
  },

  /** 新增图书表单页 */
  async newForm(req, res, next) {
    try {
      const types = await bookService.getBookTypes();
      res.render('bookAdd', {
        title: '新增图书',
        types,
        backUrl: backUrl(req.query),
        back: { bookName: req.query.bookName || '', page: req.query.page || 1 },
        today: todayStr(),
      });
    } catch (e) {
      next(e);
    }
  },

  /** 新增图书提交:无论成功或失败均提示,并跳转回列表页 */
  async create(req, res, next) {
    try {
      const ok = await bookService.addBook(req.body);
      res.redirect(backUrl(backParams(req), ok ? 'add_success' : 'add_fail'));
    } catch (e) {
      // 校验失败或数据库异常:提示失败信息
      res.redirect(backUrl(backParams(req), 'add_fail'));
    }
  },

  /** 修改图书表单页(入库人、入库时间只读) */
  async editForm(req, res, next) {
    try {
      const [book, types] = await Promise.all([
        bookService.getBookDetail(req.params.id),
        bookService.getBookTypes(),
      ]);
      res.render('bookEdit', {
        title: '修改图书',
        book,
        types,
        backUrl: backUrl(req.query),
        back: { bookName: req.query.bookName || '', page: req.query.page || 1 },
      });
    } catch (e) {
      next(e);
    }
  },

  /** 修改图书提交:无论成功或失败均提示,并跳转回列表页 */
  async update(req, res, next) {
    try {
      const ok = await bookService.updateBook(req.params.id, req.body);
      res.redirect(backUrl(backParams(req), ok ? 'update_success' : 'update_fail'));
    } catch (e) {
      res.redirect(backUrl(backParams(req), 'update_fail'));
    }
  },

  /** 删除图书:删除后跳转回列表页,显示成功或失败提示 */
  async remove(req, res, next) {
    try {
      const ok = await bookService.deleteBook(req.params.id);
      res.redirect(backUrl(backParams(req), ok ? 'del_success' : 'del_fail'));
    } catch (e) {
      res.redirect(backUrl(backParams(req), 'del_fail'));
    }
  },
};

module.exports = bookController;
