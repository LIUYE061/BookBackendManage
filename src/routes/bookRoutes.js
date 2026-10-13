/**
 * 图书管理路由
 */
const express = require('express');
const bookController = require('../controllers/bookController');

const router = express.Router();

// 图书列表(查看所有 / 按名称模糊查询 / 分页)
router.get('/', bookController.index);

// 图书编号查重(AJAX,须注册在 /:id 之前)
router.get('/check-code', bookController.checkCode);

// 新增图书
router.get('/new', bookController.newForm);
router.post('/', bookController.create);

// 查看图书详细信息
router.get('/:id', bookController.detail);

// 修改图书
router.get('/:id/edit', bookController.editForm);
router.post('/:id/update', bookController.update);

// 删除图书
router.post('/:id/delete', bookController.remove);

module.exports = router;
