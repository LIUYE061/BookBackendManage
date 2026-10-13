-- =====================================================================
-- 图书借阅系统后台管理 - 数据库脚本(MySQL 方言)
-- 内容:建库、建表、主键自动增长、测试数据
-- 适用:GitHub Actions 回归测试(MySQL 8 服务容器)、评分提交
-- =====================================================================

CREATE DATABASE IF NOT EXISTS book_backend_manage
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE book_backend_manage;

-- ---------------------------------------------------------------------
-- 图书类型表 book_type
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS book_type;
CREATE TABLE book_type (
  id       INT          NOT NULL AUTO_INCREMENT COMMENT '类型ID',
  typeName VARCHAR(50)  NOT NULL                COMMENT '图书类型名称',
  PRIMARY KEY (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '图书类型表';

-- ---------------------------------------------------------------------
-- 图书信息表 book_info
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS book_info;
CREATE TABLE book_info (
  bookId         INT          NOT NULL AUTO_INCREMENT COMMENT '图书ID',
  bookCode       VARCHAR(50)  NOT NULL                COMMENT '图书编号',
  bookName       VARCHAR(100) NOT NULL                COMMENT '图书名称',
  bookType       INT          NOT NULL                COMMENT '图书类型(关联 book_type.id)',
  bookAuthor     VARCHAR(50)  NOT NULL                COMMENT '图书作者',
  publishPress   VARCHAR(100) NOT NULL                COMMENT '出版社',
  publishDate    DATE         NOT NULL                COMMENT '出版日期',
  borrowed       INT          NOT NULL DEFAULT 0      COMMENT '是否借阅(1已借阅 0未借阅)',
  createdBy      VARCHAR(50)  NOT NULL                COMMENT '创建人(入库人)',
  creationTime   DATE         NOT NULL                COMMENT '创建时间(入库时间)',
  lastUpdatetime DATE         NULL                    COMMENT '最新更新时间',
  PRIMARY KEY (bookId)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '图书信息表';

-- ---------------------------------------------------------------------
-- 测试数据:图书类型(试卷要求的 8 种类型,数据来源于 book_type 表)
-- ---------------------------------------------------------------------
INSERT INTO book_type (id, typeName) VALUES
  (1, '小说'),
  (2, '文学'),
  (3, '传记'),
  (4, '艺术'),
  (5, '少儿'),
  (6, '经济'),
  (7, '管理'),
  (8, '科技');

-- ---------------------------------------------------------------------
-- 测试数据:图书信息(8 条,入库时间倒序)
-- ---------------------------------------------------------------------
INSERT INTO book_info
  (bookCode, bookName, bookType, bookAuthor, publishPress, publishDate,
   borrowed, createdBy, creationTime, lastUpdatetime)
VALUES
  ('B-0001', '三体',               1, '刘慈欣',           '重庆出版社',       '2008-01-01', 1, 'admin', '2026-09-12', '2026-09-12'),
  ('B-0002', '活着',               1, '余华',             '作家出版社',       '2012-08-01', 0, 'admin', '2026-09-15', '2026-09-15'),
  ('B-0003', '百年孤独',           2, '加西亚·马尔克斯',  '南海出版公司',     '2011-06-01', 0, 'admin', '2026-09-20', '2026-09-20'),
  ('B-0004', '人类群星闪耀时',     3, '斯蒂芬·茨威格',    '三联书店',         '2019-01-01', 1, 'admin', '2026-09-25', '2026-09-25'),
  ('B-0005', '小王子',             5, '圣埃克苏佩里',     '人民文学出版社',   '2003-08-01', 0, 'admin', '2026-10-01', '2026-10-01'),
  ('B-0006', '经济学原理',         6, '曼昆',             '北京大学出版社',   '2015-05-01', 0, 'admin', '2026-10-05', '2026-10-05'),
  ('B-0007', '高效能人士的七个习惯', 7, '史蒂芬·柯维',     '中国青年出版社',   '2010-10-01', 1, 'admin', '2026-10-08', '2026-10-08'),
  ('B-0008', '时间简史',           8, '史蒂芬·霍金',      '湖南科学技术出版社','2010-04-01', 0, 'admin', '2026-10-10', '2026-10-10');
