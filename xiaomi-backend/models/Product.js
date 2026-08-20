const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  originalPrice: {  // 原价，用于显示折扣
    type: Number,
    default: 0
  },
  images: [{
    type: String,  // 图片URL数组
    required: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['手机', '电视', '笔记本', '家电', '智能硬件', '配件']
  },
  subcategory: {  // 子分类，比如"手机"下的"小米手机"、"Redmi手机"等
    type: String
  },
  specs: [{  // 产品规格，如内存、颜色等
    name: String,
    options: [String]
  }],
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  isNewProduct: {  // 新品标识
    type: Boolean,
    default: false
  },
  isHot: {  // 热销标识
    type: Boolean,
    default: false
  },
  rating: {  // 产品评分
    type: Number,
    default: 0
  },
  numReviews: {  // 评价数量
    type: Number,
    default: 0
  },
  reviews: [{  // 评价详情
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    name: String,
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// 添加索引以优化查询性能
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ isNewProduct: 1 });
productSchema.index({ isHot: 1 });

module.exports = mongoose.model('Product', productSchema); 