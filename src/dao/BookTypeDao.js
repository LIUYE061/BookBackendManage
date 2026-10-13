/**
 * 图书类型表数据访问层(DAO)
 */
const { BookType } = require('../models');

class BookTypeDao {
  /** 查询全部图书类型 */
  async findAll() {
    return BookType.findAll({ order: [['id', 'ASC']] });
  }
}

module.exports = new BookTypeDao();
