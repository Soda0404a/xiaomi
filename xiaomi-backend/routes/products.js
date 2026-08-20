const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Product = require('../models/Product');

// @route   GET /api/products
// @desc    获取所有产品
// @access  Public
router.get('/', function(req, res) {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;
  const category = req.query.category;
  const keyword = req.query.keyword;
  
  let query = {};
  
  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } }
    ];
  }
  
  if (category) {
    query.category = category;
  }

  Product.countDocuments(query)
    .then(count => {
      return Product.find(query)
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 })
        .then(products => {
          res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
          });
        });
    })
    .catch(error => {
      res.status(500).json({ message: '服务器错误' });
    });
});

// @route   GET /api/products/:id
// @desc    获取单个产品详情
// @access  Public
router.get('/:id', function(req, res) {
  Product.findById(req.params.id)
    .then(product => {
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: '产品不存在' });
      }
    })
    .catch(error => {
      res.status(500).json({ message: '服务器错误' });
    });
});

// @route   POST /api/products
// @desc    创建新产品
// @access  Private/Admin
router.post('/', protect, admin, function(req, res) {
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    originalPrice: req.body.originalPrice,
    images: req.body.images,
    category: req.body.category,
    subcategory: req.body.subcategory,
    specs: req.body.specs,
    stock: req.body.stock,
    isNewProduct: req.body.isNewProduct,
    isHot: req.body.isHot
  });

  product.save()
    .then(createdProduct => {
      res.status(201).json(createdProduct);
    })
    .catch(error => {
      res.status(500).json({ message: '服务器错误' });
    });
});

// @route   PUT /api/products/:id
// @desc    更新产品
// @access  Private/Admin
router.put('/:id', protect, admin, function(req, res) {
  Product.findById(req.params.id)
    .then(product => {
      if (product) {
        product.name = req.body.name || product.name;
        product.description = req.body.description || product.description;
        product.price = req.body.price || product.price;
        product.originalPrice = req.body.originalPrice || product.originalPrice;
        product.images = req.body.images || product.images;
        product.category = req.body.category || product.category;
        product.subcategory = req.body.subcategory || product.subcategory;
        product.specs = req.body.specs || product.specs;
        product.stock = req.body.stock || product.stock;
        product.isNewProduct = req.body.isNewProduct !== undefined ? req.body.isNewProduct : product.isNewProduct;
        product.isHot = req.body.isHot !== undefined ? req.body.isHot : product.isHot;

        return product.save();
      } else {
        res.status(404).json({ message: '产品不存在' });
      }
    })
    .then(updatedProduct => {
      if (updatedProduct) {
        res.json(updatedProduct);
      }
    })
    .catch(error => {
      res.status(500).json({ message: '服务器错误' });
    });
});

// @route   DELETE /api/products/:id
// @desc    删除产品
// @access  Private/Admin
router.delete('/:id', protect, admin, function(req, res) {
  Product.findById(req.params.id)
    .then(product => {
      if (product) {
        return product.remove()
          .then(() => {
            res.json({ message: '产品已删除' });
          });
      } else {
        res.status(404).json({ message: '产品不存在' });
      }
    })
    .catch(error => {
      res.status(500).json({ message: '服务器错误' });
    });
});

// @route   POST /api/products/:id/reviews
// @desc    添加产品评价
// @access  Private
router.post('/:id/reviews', protect, function(req, res) {
  const { rating, comment } = req.body;
  
  Product.findById(req.params.id)
    .then(product => {
      if (product) {
        const alreadyReviewed = product.reviews.find(
          function(review) { 
            return review.user.toString() === req.user._id.toString();
          }
        );

        if (alreadyReviewed) {
          return res.status(400).json({ message: '您已经评价过该产品' });
        }

        const review = {
          user: req.user._id,
          name: req.user.username,
          rating: Number(rating),
          comment
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating =
          product.reviews.reduce(function(acc, item) {
            return item.rating + acc;
          }, 0) / product.reviews.length;

        return product.save()
          .then(() => {
            res.status(201).json({ message: '评价已添加' });
          });
      } else {
        res.status(404).json({ message: '产品不存在' });
      }
    })
    .catch(error => {
      res.status(500).json({ message: '服务器错误' });
    });
});

module.exports = router; 