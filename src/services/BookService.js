/**
 * 图书业务层(Service)
 * 实现相应业务逻辑,通过声明式事务(Sequelize 事务)保证数据一致性;
 * 数据库操作过程中统一进行异常处理。
 */
const { sequelize } = require('../models');
const bookInfoDao = require('../dao/BookInfoDao');
const bookTypeDao = require('../dao/BookTypeDao');

/** 当前登录用户(本次不实现登录功能,固定为 admin 系统管理员) */
const CURRENT_USER = 'admin';

/** 每页显示条数(试卷要求每页 5 条) */
const PAGE_SIZE = 5;

/** 今天的日期字符串 YYYY-MM-DD */
function today() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** 必填项服务端校验:图书编号、名称、类型、作者、出版社、出版日期 */
function validate(data) {
  const required = ['bookCode', 'bookName', 'bookType', 'bookAuthor', 'publishPress', 'publishDate'];
  for (const field of required) {
    const value = data[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      const err = new Error(`必填项缺失: ${field}`);
      err.name = 'ValidationError';
      throw err;
    }
  }
  // 是否借阅必须为 0 或 1
  if (!['0', '1', 0, 1].includes(data.borrowed)) {
    const err = new Error('是否借阅取值非法');
    err.name = 'ValidationError';
    throw err;
  }
  // 出版日期不能晚于今天
  const publishDate = new Date(`${String(data.publishDate).trim()}T00:00:00`);
  if (Number.isNaN(publishDate.getTime())) {
    const err = new Error('出版日期格式非法');
    err.name = 'ValidationError';
    err.code = 'FUTURE_DATE';
    throw err;
  }
  if (publishDate > new Date()) {
    const err = new Error('出版日期不能晚于今天');
    err.name = 'ValidationError';
    err.code = 'FUTURE_DATE';
    throw err;
  }
}

/** 图书编号查重,重复时抛出带 code 的校验错误 */
async function assertCodeAvailable(bookCode, excludeBookId) {
  const exists = await bookInfoDao.countByCode(bookCode.trim(), excludeBookId);
  if (exists > 0) {
    const err = new Error('图书编号已存在');
    err.name = 'ValidationError';
    err.code = 'DUPLICATE_CODE';
    throw err;
  }
}

class BookService {
  /** 分页查询图书列表(按入库时间降序,支持书名模糊查询) */
  async listBooks({ bookName, page }) {
    const pageNum = Math.max(1, Number(page) || 1);
    const { rows, count } = await bookInfoDao.findByCondition({
      bookName: (bookName || '').trim(),
      page: pageNum,
      pageSize: PAGE_SIZE,
    });
    return {
      rows,
      count,
      page: pageNum,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(count / PAGE_SIZE)),
    };
  }

  /** 查看图书详细信息 */
  async getBookDetail(bookId) {
    const book = await bookInfoDao.findById(Number(bookId));
    if (!book) {
      const err = new Error('图书不存在');
      err.status = 404;
      throw err;
    }
    return book;
  }

  /** 查询全部图书类型(数据来源于 book_type 表) */
  async getBookTypes() {
    return bookTypeDao.findAll();
  }

  /**
   * 图书编号是否可用(供前端 jQuery 失焦 AJAX 查重)
   * @param {string} bookCode 图书编号
   * @param {number} [excludeBookId] 修改时排除自身
   */
  async isBookCodeAvailable(bookCode, excludeBookId) {
    const code = (bookCode || '').trim();
    if (!code) return true;
    const count = await bookInfoDao.countByCode(code, excludeBookId);
    return count === 0;
  }

  /** 新增图书:入库人默认为当前登录用户,入库时间默认为当前时间,是否借阅默认未借阅 */
  async addBook(data) {
    validate(data);
    // 图书编号唯一性校验
    await assertCodeAvailable(data.bookCode);
    const transaction = await sequelize.transaction();
    try {
      await bookInfoDao.create(
        {
          bookCode: data.bookCode,
          bookName: data.bookName,
          bookType: Number(data.bookType),
          bookAuthor: data.bookAuthor,
          publishPress: data.publishPress,
          publishDate: data.publishDate,
          borrowed: data.borrowed === undefined ? 0 : Number(data.borrowed),
          createdBy: CURRENT_USER,
          creationTime: today(),
          lastUpdatetime: today(),
        },
        transaction
      );
      await transaction.commit();
      return true;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  /**
   * 修改图书:入库人与入库时间为只读状态不可修改,
   * 更新时刷新最新更新时间。
   */
  async updateBook(bookId, data) {
    validate(data);
    // 图书编号唯一性校验(排除自身)
    await assertCodeAvailable(data.bookCode, Number(bookId));
    const transaction = await sequelize.transaction();
    try {
      const affected = await bookInfoDao.update(
        Number(bookId),
        {
          bookCode: data.bookCode,
          bookName: data.bookName,
          bookType: Number(data.bookType),
          bookAuthor: data.bookAuthor,
          publishPress: data.publishPress,
          publishDate: data.publishDate,
          borrowed: Number(data.borrowed),
          lastUpdatetime: today(),
        },
        transaction
      );
      await transaction.commit();
      return affected > 0;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  /** 删除指定图书 */
  async deleteBook(bookId) {
    const transaction = await sequelize.transaction();
    try {
      const affected = await bookInfoDao.remove(Number(bookId), transaction);
      await transaction.commit();
      return affected > 0;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }
}

module.exports = new BookService();
