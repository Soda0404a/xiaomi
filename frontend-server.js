const express = require('express');
const path = require('path');
const app = express();

// 提供静态文件服务
app.use(express.static(path.join(__dirname)));

// 所有路由都返回 index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`前端服务器运行在端口 ${PORT}`);
}); 