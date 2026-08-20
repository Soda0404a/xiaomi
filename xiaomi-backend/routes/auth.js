const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    注册新用户
// @access  Public
router.post('/register', function(req, res) {
  const { username, email, password } = req.body;

  User.findOne({ $or: [{ email }, { username }] })
    .then(userExists => {
      if (userExists) {
        return res.status(400).json({ message: '用户名或邮箱已被注册' });
      }
      
      return User.create({
        username,
        email,
        password
      });
    })
    .then(user => {
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        token
      });
    })
    .catch(error => {
      res.status(500).json({ message: '服务器错误' });
    });
});

// @route   POST /api/auth/login
// @desc    用户登录
// @access  Public
router.post('/login', function(req, res) {
  const { email, password } = req.body;

  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: '邮箱或密码错误' });
      }

      return bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (!isMatch) {
            return res.status(401).json({ message: '邮箱或密码错误' });
          }

          const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
          );

          res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            token
          });
        });
    })
    .catch(error => {
      res.status(500).json({ message: '服务器错误' });
    });
});

// @route   GET /api/auth/profile
// @desc    获取用户信息
// @access  Private
router.get('/profile', protect, function(req, res) {
  User.findById(req.user._id)
    .select('-password')
    .then(user => {
      res.json(user);
    })
    .catch(error => {
      res.status(500).json({ message: '服务器错误' });
    });
});

// @route   PUT /api/auth/profile
// @desc    更新用户信息
// @access  Private
router.put('/profile', protect, function(req, res) {
  User.findById(req.user._id)
    .then(user => {
      if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        
        if (req.body.password) {
          user.password = req.body.password;
        }

        return user.save();
      } else {
        res.status(404).json({ message: '用户不存在' });
      }
    })
    .then(updatedUser => {
      if (updatedUser) {
        res.json({
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          isAdmin: updatedUser.isAdmin,
          token: jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
          }),
        });
      }
    })
    .catch(error => {
      res.status(500).json({ message: '服务器错误' });
    });
});

module.exports = router; 