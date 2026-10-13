/**
 * 图书类型表(book_type)实体类
 * 字段:id 主键自增、typeName 类型名称(非空)
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'BookType',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '类型ID',
      },
      typeName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '图书类型名称',
      },
    },
    { tableName: 'book_type', timestamps: false }
  );
