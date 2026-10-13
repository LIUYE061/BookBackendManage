/**
 * 图书信息表(book_info)实体类
 * 字段:bookId 主键自增、bookCode 图书编号、bookName 图书名称、
 *      bookType 图书类型(关联 book_type.id)、bookAuthor 作者、
 *      publishPress 出版社、publishDate 出版日期、borrowed 是否借阅(1已借阅 0未借阅)、
 *      createdBy 入库人、creationTime 入库时间、lastUpdatetime 最新更新时间
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'BookInfo',
    {
      bookId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '图书ID',
      },
      bookCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '图书编号',
      },
      bookName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '图书名称',
      },
      bookType: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '图书类型(关联 book_type.id)',
      },
      bookAuthor: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '图书作者',
      },
      publishPress: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '出版社',
      },
      publishDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '出版日期',
      },
      borrowed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '是否借阅(1已借阅 0未借阅)',
      },
      createdBy: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '创建人(入库人)',
      },
      creationTime: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '创建时间(入库时间)',
      },
      lastUpdatetime: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '最新更新时间',
      },
    },
    { tableName: 'book_info', timestamps: false }
  );
