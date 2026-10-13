/**
 * 数据库连接配置(Sequelize)
 *
 * 数据库连接信息一律从环境变量读取(本地开发放在 .env 文件,已 gitignore;
 * CI 由工作流注入),避免凭据入库:
 *   DB_DIALECT / DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASS
 *
 * 本地默认 SQL Server(见 .env.example),GitHub Actions 回归测试
 * 通过环境变量切换到 MySQL 服务容器。
 */
require('dotenv').config();

const { Sequelize } = require('sequelize');

const dialect = process.env.DB_DIALECT || 'mssql';

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || (dialect === 'mssql' ? 1433 : 3306),
  logging: false,
};

if (dialect === 'mssql') {
  config.dialectOptions = { encrypt: false, trustServerCertificate: true };
}

if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASS) {
  throw new Error(
    '缺少数据库配置:请在项目根目录创建 .env 文件(参考 .env.example),或设置 DB_NAME / DB_USER / DB_PASS 环境变量'
  );
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  { ...config, dialect }
);

module.exports = sequelize;
