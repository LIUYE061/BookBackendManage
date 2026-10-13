/**
 * 应用启动入口
 */
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`图书借阅系统后台管理已启动: http://localhost:${PORT}/books`);
});
