const express = require('express');
const router = express.Router();
const {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/adminController');
const { protect, storeAccess, authorize } = require('../middleware/auth');

// Public routes
router.post('/login', loginAdmin);

// Protected routes
router.use(protect);
router.use(storeAccess);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/password', changePassword);

// Admin management routes (only for super_admin and store_admin)
router.route('/')
  .get(authorize('super_admin', 'store_admin'), getAdmins)
  .post(authorize('super_admin', 'store_admin'), createAdmin);

router.route('/:id')
  .get(authorize('super_admin', 'store_admin'), getAdminById)
  .put(authorize('super_admin', 'store_admin'), updateAdmin)
  .delete(authorize('super_admin'), deleteAdmin);

module.exports = router;