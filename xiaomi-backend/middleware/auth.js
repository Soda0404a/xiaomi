const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = (req, res, next) => {
  let token;

  // 检查请求头中是否包含 Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // 获取 token
    token = req.headers.authorization.split(' ')[1];

    // 验证 token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: '未授权，token 失效' });
      }

      // 获取用户信息（不包含密码）
      User.findById(decoded.id)
        .select('-password')
        .then(user => {
          req.user = user;
          next();
        })
        .catch(error => {
          res.status(401).json({ message: '未授权，token 失效' });
        });
    });
  } else {
    res.status(401).json({ message: '未授权，没有 token' });
  }
};

// 验证管理员权限的中间件
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: '未授权，需要管理员权限' });
  }
};

module.exports = { protect, admin }; 