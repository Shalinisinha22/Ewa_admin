const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadImage, uploadMultipleImages, deleteImage } = require('../controllers/uploadController');
const { protect, storeAccess } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Protected routes
router.use(protect);
router.use(storeAccess);

// Upload routes
router.post('/image', upload.single('image'), uploadImage);
router.post('/images', upload.array('images', 10), uploadMultipleImages);
router.delete('/image', deleteImage);

module.exports = router;