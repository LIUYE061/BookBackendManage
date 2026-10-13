# 图书借阅系统后台管理(BookBackendManage)

基于试卷《2016年10月学士后Java毕业考试机试试卷-2》功能要求,使用 **Express + Sequelize + EJS** 实现的后台管理系统,支持本地 **SQL Server** 与 CI **MySQL** 双数据库。

## 功能清单(对照试卷)

| # | 功能 | 说明 |
|---|------|------|
| 1 | 查看所有图书 | 默认按入库时间(`creationTime`)降序,日期显示"年-月-日",隔行变色,每页 5 条分页 |
| 2 | 查询图书 | 按图书名称模糊查询,输入框记忆查询条件 |
| 3 | 查看详情 | 全部字段只读;返回时保留查询条件与页码 |
| 4 | 新增图书 | 类型下拉来源于 `book_type` 表;入库时间默认当前时间、入库人默认 admin、是否借阅默认未借阅;jQuery 必填验证;成功/失败均提示并跳回列表 |
| 5 | 修改图书 | 入库人/入库时间只读;必填验证;成功/失败均提示并跳回列表 |
| 6 | 删除图书 | 删除前确认弹窗"确定删除该图书信息?";删除后回列表显示成功/失败提示 |

## 技术栈

- **前后端**:Express 4 + EJS 模板 + jQuery
- **数据访问**:Sequelize 6(本地 SQL Server 2022 / CI MySQL 8 双方言)
- **测试**:node:test + supertest(17 个回归用例)
- **CI**:GitHub Actions(MySQL 服务容器加载 SQL 脚本后运行回归测试)
- **设计**:页面设计稿使用 Pixso 绘制(列表/查看/新增/修改四页)

## 项目结构(分层架构)

```
├── sql/                         # 数据库脚本(建库建表 + 测试数据)
│   ├── book_backend_manage.sql      # MySQL 方言(CI 使用)
│   └── book_backend_manage_mssql.sql # SQL Server 方言(本地开发)
├── src/
│   ├── config/db.js             # Sequelize 连接配置(env 切换方言)
│   ├── models/                  # 实体类:BookInfo、BookType
│   ├── dao/                     # 数据访问层:BookInfoDao、BookTypeDao
│   ├── services/                # 业务层:BookService(声明式事务)
│   ├── controllers/             # 控制器层:bookController
│   ├── routes/                  # 路由:bookRoutes
│   ├── views/                   # EJS 视图:列表/查看/新增/修改/错误页
│   ├── app.js                   # Express 装配
│   └── server.js                # 启动入口
├── public/                      # 静态资源:style.css、jquery、main.js
├── test/regression.test.js      # 回归测试
└── .github/workflows/ci.yml     # CI:MySQL 容器 + 回归测试
```

## 数据库

- `book_type`:图书类型表(id 主键自增、typeName),含小说/文学/传记/艺术/少儿/经济/管理/科技 8 条数据
- `book_info`:图书信息表(bookId 主键自增;bookCode、bookName、bookType、bookAuthor、publishPress、publishDate、borrowed(1已借阅/0未借阅)、createdBy、creationTime、lastUpdatetime)

## 本地运行

### 方式一:SQL Server(默认,本机)

```bash
# 1. 初始化数据库(需本地 SQL Server,使用 Windows 身份或已有账号执行)
sqlcmd -f 65001 -S localhost -E -C -i sql/book_backend_manage_mssql.sql

# 2. 安装依赖并启动
npm install
npm start          # http://localhost:3000/books
```

默认连接 `localhost:1433` 的 `BookBackendManage` 库(用户 `bookuser`),可用环境变量覆盖:
`DB_DIALECT / DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASS`。

### 方式二:MySQL

```bash
mysql -uroot -p < sql/book_backend_manage.sql
DB_DIALECT=mysql DB_HOST=localhost DB_PORT=3306 DB_NAME=book_backend_manage DB_USER=root DB_PASS=root npm start
```

## 回归测试

```bash
npm test
```

覆盖:列表降序/分页/隔行变色、模糊查询与条件记忆、查看只读与返回保留状态、新增默认值与成功失败提示、修改只读字段与提示、删除确认与提示、404 异常路径,共 17 个用例。

GitHub Actions 在每次 push/pull_request 时,使用 MySQL 8 服务容器加载 `sql/book_backend_manage.sql` 后运行同一套回归测试(见 `.github/workflows/ci.yml`)。
