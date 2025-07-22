const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { storeId: req.storeId };

    // Search functionality
    if (req.query.keyword) {
      query.$text = { $search: req.query.keyword };
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Featured filter
    if (req.query.featured) {
      query.featured = req.query.featured === 'true';
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Stock filter
    if (req.query.inStock) {
      query['stock.quantity'] = { $gt: 0 };
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      storeId: req.storeId
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      storeId: req.storeId
    };

    // Validate category exists
    if (productData.category) {
      const category = await Category.findOne({
        _id: productData.category,
        storeId: req.storeId
      });
      if (!category) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

    const product = await Product.create(productData);
    
    // Populate category before sending response
    await product.populate('category', 'name slug');

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      storeId: req.storeId
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate category if being updated
    if (req.body.category) {
      const category = await Category.findOne({
        _id: req.body.category,
        storeId: req.storeId
      });
      if (!category) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

    Object.assign(product, req.body);
    const updatedProduct = await product.save();
    
    // Populate category before sending response
    await updatedProduct.populate('category', 'name slug');

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      storeId: req.storeId
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Private
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const products = await Product.find({
      storeId: req.storeId,
      featured: true,
      status: 'active'
    })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Private
const getProductsByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({
      storeId: req.storeId,
      category: req.params.categoryId,
      status: 'active'
    })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({
      storeId: req.storeId,
      category: req.params.categoryId,
      status: 'active'
    });

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Private
const searchProducts = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, inStock } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { storeId: req.storeId, status: 'active' };

    if (q) {
      query.$text = { $search: q };
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      query['stock.quantity'] = { $gt: 0 };
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private
const updateProductStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'set', 'add', 'subtract'

    const product = await Product.findOne({
      _id: req.params.id,
      storeId: req.storeId
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    switch (operation) {
      case 'set':
        product.stock.quantity = quantity;
        break;
      case 'add':
        product.stock.quantity += quantity;
        break;
      case 'subtract':
        product.stock.quantity = Math.max(0, product.stock.quantity - quantity);
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    // Update status based on stock
    if (product.stock.quantity <= 0) {
      product.status = 'out_of_stock';
    } else if (product.status === 'out_of_stock') {
      product.status = 'active';
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Bulk update products
// @route   PUT /api/products/bulk/update
// @access  Private
const bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updates } = req.body;

    const result = await Product.updateMany(
      {
        _id: { $in: productIds },
        storeId: req.storeId
      },
      updates
    );

    res.json({
      message: `${result.modifiedCount} products updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Private
const getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      { $match: { storeId: req.storeId } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          draftProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'out_of_stock'] }, 1, 0] }
          },
          featuredProducts: {
            $sum: { $cond: ['$featured', 1, 0] }
          },
          totalValue: { $sum: { $multiply: ['$price', '$stock.quantity'] } },
          averagePrice: { $avg: '$price' },
          lowStockProducts: {
            $sum: {
              $cond: [
                { $lte: ['$stock.quantity', '$stock.lowStockThreshold'] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const categoryStats = await Product.aggregate([
      { $match: { storeId: req.storeId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          name: '$category.name',
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: stats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        draftProducts: 0,
        outOfStockProducts: 0,
        featuredProducts: 0,
        totalValue: 0,
        averagePrice: 0,
        lowStockProducts: 0
      },
      categoryBreakdown: categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  updateProductStock,
  bulkUpdateProducts,
  getProductStats
};