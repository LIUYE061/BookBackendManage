/**
 * 图书信息表数据访问层(DAO)
 * 完成图书信息的增删改查与分页、模糊查询数据库操作
 */
const { Op } = require('sequelize');
const { BookInfo, BookType } = require('../models');

class BookInfoDao {
  /**
   * 分页查询图书列表
   * @param {Object} condition { bookName 模糊查询关键字, page 页码, pageSize 每页条数 }
   * @returns {Promise<{rows: BookInfo[], count: number}>}
   */
  async findByCondition({ bookName, page, pageSize }) {
    const where = {};
    if (bookName) {
      // 根据图书名称模糊查询
      where.bookName = { [Op.like]: `%${bookName}%` };
    }
    return BookInfo.findAndCountAll({
      where,
      // 默认按照入库时间降序排列
      order: [
        ['creationTime', 'DESC'],
        ['bookId', 'DESC'],
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [{ model: BookType, as: 'type', attributes: ['typeName'] }],
    });
  }

  /** 按主键查询图书(含类型名称) */
  async findById(bookId) {
    return BookInfo.findByPk(bookId, {
      include: [{ model: BookType, as: 'type', attributes: ['typeName'] }],
    });
  }

  /** 新增图书(事务由 Service 控制) */
  async create(data, transaction) {
    return BookInfo.create(data, { transaction });
  }

  /** 修改图书(事务由 Service 控制) */
  async update(bookId, data, transaction) {
    const [affected] = await BookInfo.update(data, {
      where: { bookId },
      transaction,
    });
    return affected;
  }

  /** 删除图书(事务由 Service 控制) */
  async remove(bookId, transaction) {
    return BookInfo.destroy({ where: { bookId }, transaction });
  }
}

module.exports = new BookInfoDao();
