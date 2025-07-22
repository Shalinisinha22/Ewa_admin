const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/productController');
const { protect, storeAccess, checkPermission } = require('../middleware/auth');

// Protected routes
router.use(protect);
router.use(storeAccess);
router.use(checkPermission('products'));

// Product routes
router.route('/')
  .get(getProducts)
  .post(createProduct);

router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/stats', getProductStats);
router.get('/category/:categoryId', getProductsByCategory);

router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

router.put('/:id/stock', updateProductStock);
router.put('/bulk/update', bulkUpdateProducts);

module.exports = router;