const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Order = require('../models/Order');

// @route   POST /api/orders
// @desc    创建新订单
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: '订单中没有商品' });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// @route   GET /api/orders/myorders
// @desc    获取当前用户的订单列表
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// @route   GET /api/orders/:id
// @desc    获取订单详情
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'username email');

    if (order) {
      // 验证订单所属用户
      if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(401).json({ message: '未授权访问' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: '订单不存在' });
    }
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// @route   PUT /api/orders/:id/pay
// @desc    更新订单为已支付
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        payment_method: req.body.payment_method,
      };
      order.orderStatus = '待发货';

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: '订单不存在' });
    }
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// @route   PUT /api/orders/:id/deliver
// @desc    更新订单为已发货
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.orderStatus = '已发货';
      order.trackingNumber = req.body.trackingNumber;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: '订单不存在' });
    }
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// @route   GET /api/orders/admin/all
// @desc    管理员获取所有订单
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;
    
    const count = await Order.countDocuments({});
    const orders = await Order.find({})
      .populate('user', 'username email')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    取消订单
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // 只有未支付的订单可以取消
      if (order.isPaid) {
        return res.status(400).json({ message: '已支付的订单不能取消' });
      }
      
      order.orderStatus = '已取消';
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: '订单不存在' });
    }
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router; 