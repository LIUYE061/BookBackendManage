/**
 * 实体类装配与关联关系
 * BookInfo.bookType(整数)逻辑上关联 BookType.id
 */
const sequelize = require('../config/db');

const BookType = require('./BookType')(sequelize);
const BookInfo = require('./BookInfo')(sequelize);

BookInfo.belongsTo(BookType, { foreignKey: 'bookType', targetKey: 'id', as: 'type' });

module.exports = { sequelize, BookInfo, BookType };
