-- =====================================================================
-- 图书借阅系统后台管理 - 数据库脚本(SQL Server / T-SQL 方言)
-- 内容:建库、建表、主键自增、测试数据
-- 适用:本地开发(SQL Server 2022,数据库 BookBackendManage)
-- =====================================================================

IF DB_ID('BookBackendManage') IS NULL
  CREATE DATABASE BookBackendManage;
GO

USE BookBackendManage;
GO

-- ---------------------------------------------------------------------
-- 图书类型表 book_type
-- ---------------------------------------------------------------------
IF OBJECT_ID('book_info', 'U') IS NOT NULL DROP TABLE book_info;
IF OBJECT_ID('book_type', 'U') IS NOT NULL DROP TABLE book_type;
GO

CREATE TABLE book_type (
  id       INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  typeName NVARCHAR(50) NOT NULL
);
GO

-- ---------------------------------------------------------------------
-- 图书信息表 book_info
-- ---------------------------------------------------------------------
CREATE TABLE book_info (
  bookId         INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  bookCode       NVARCHAR(50)  NOT NULL,
  bookName       NVARCHAR(100) NOT NULL,
  bookType       INT           NOT NULL,
  bookAuthor     NVARCHAR(50)  NOT NULL,
  publishPress   NVARCHAR(100) NOT NULL,
  publishDate    DATE          NOT NULL,
  borrowed       INT           NOT NULL DEFAULT 0,
  createdBy      NVARCHAR(50)  NOT NULL,
  creationTime   DATE          NOT NULL,
  lastUpdatetime DATE          NULL
);
GO

-- ---------------------------------------------------------------------
-- 测试数据:图书类型(8 种)
-- ---------------------------------------------------------------------
SET IDENTITY_INSERT book_type ON;
INSERT INTO book_type (id, typeName) VALUES
  (1, N'小说'), (2, N'文学'), (3, N'传记'), (4, N'艺术'),
  (5, N'少儿'), (6, N'经济'), (7, N'管理'), (8, N'科技');
SET IDENTITY_INSERT book_type OFF;
GO

-- ---------------------------------------------------------------------
-- 测试数据:图书信息(8 条,入库时间倒序)
-- ---------------------------------------------------------------------
INSERT INTO book_info
  (bookCode, bookName, bookType, bookAuthor, publishPress, publishDate,
   borrowed, createdBy, creationTime, lastUpdatetime)
VALUES
  (N'B-0001', N'三体',               1, N'刘慈欣',           N'重庆出版社',         '2008-01-01', 1, N'admin', '2026-09-12', '2026-09-12'),
  (N'B-0002', N'活着',               1, N'余华',             N'作家出版社',         '2012-08-01', 0, N'admin', '2026-09-15', '2026-09-15'),
  (N'B-0003', N'百年孤独',           2, N'加西亚·马尔克斯',  N'南海出版公司',       '2011-06-01', 0, N'admin', '2026-09-20', '2026-09-20'),
  (N'B-0004', N'人类群星闪耀时',     3, N'斯蒂芬·茨威格',    N'三联书店',           '2019-01-01', 1, N'admin', '2026-09-25', '2026-09-25'),
  (N'B-0005', N'小王子',             5, N'圣埃克苏佩里',     N'人民文学出版社',     '2003-08-01', 0, N'admin', '2026-10-01', '2026-10-01'),
  (N'B-0006', N'经济学原理',         6, N'曼昆',             N'北京大学出版社',     '2015-05-01', 0, N'admin', '2026-10-05', '2026-10-05'),
  (N'B-0007', N'高效能人士的七个习惯',7, N'史蒂芬·柯维',     N'中国青年出版社',     '2010-10-01', 1, N'admin', '2026-10-08', '2026-10-08'),
  (N'B-0008', N'时间简史',           8, N'史蒂芬·霍金',      N'湖南科学技术出版社', '2010-04-01', 0, N'admin', '2026-10-10', '2026-10-10');
GO
