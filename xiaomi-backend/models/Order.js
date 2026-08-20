const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  orderItems: [{
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    specs: { type: Map, of: String },  // 存储选择的规格，如 {color: "黑色", storage: "128GB"}
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    address: { type: String, required: true },
    postalCode: { type: String }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['支付宝', '微信支付', '银联']
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    payment_method: { type: String }
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['待付款', '待发货', '已发货', '已完成', '已取消'],
    default: '待付款'
  },
  trackingNumber: {
    type: String
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true
});

// 添加索引以优化查询性能
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ isPaid: 1 });
orderSchema.index({ isDelivered: 1 });

module.exports = mongoose.model('Order', orderSchema); 