const Admin = require('../models/Admin');
const Store = require('../models/Store');
const { generateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// @desc    Create new admin
// @route   POST /api/admin
// @access  Private (Super Admin, Store Admin)
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, status, storeName, role, permissions } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    // Create or find store
    let store;
    if (req.admin.role === 'super_admin') {
      // Super admin can create stores
      store = await Store.findOne({ name: storeName });
      if (!store) {
        store = await Store.create({
          name: storeName,
          slug: storeName.toLowerCase().replace(/\s+/g, '-'),
          status: 'active'
        });
      }
    } else {
      // Store admin can only create admins for their store
      store = await Store.findById(req.storeId);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
      status: status || 'active',
      storeName: store.name,
      storeId: store._id,
      role: role || 'manager',
      permissions: permissions || ['products', 'categories', 'orders']
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      status: admin.status,
      storeName: admin.storeName,
      storeId: admin.storeId,
      role: admin.role,
      permissions: admin.permissions,
      token: generateToken(admin._id)
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all admins
// @route   GET /api/admin
// @access  Private (Super Admin, Store Admin)
const getAdmins = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Store isolation
    if (req.admin.role !== 'super_admin') {
      query.storeId = req.storeId;
    } else if (req.query.storeId) {
      query.storeId = req.query.storeId;
    }

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { storeName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Role filter
    if (req.query.role) {
      query.role = req.query.role;
    }

    const admins = await Admin.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Admin.countDocuments(query);

    res.json({
      admins,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin by ID
// @route   GET /api/admin/:id
// @access  Private (Super Admin, Store Admin)
const getAdminById = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // Store isolation
    if (req.admin.role !== 'super_admin') {
      query.storeId = req.storeId;
    }

    const admin = await Admin.findOne(query).select('-password');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update admin
// @route   PUT /api/admin/:id
// @access  Private (Super Admin, Store Admin)
const updateAdmin = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // Store isolation
    if (req.admin.role !== 'super_admin') {
      query.storeId = req.storeId;
    }

    const admin = await Admin.findOne(query);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Update fields
    const { name, email, status, role, permissions } = req.body;
    
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (status) admin.status = status;
    if (role && req.admin.role === 'super_admin') admin.role = role;
    if (permissions) admin.permissions = permissions;

    const updatedAdmin = await admin.save();

    res.json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      status: updatedAdmin.status,
      storeName: updatedAdmin.storeName,
      storeId: updatedAdmin.storeId,
      role: updatedAdmin.role,
      permissions: updatedAdmin.permissions
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete admin
// @route   DELETE /api/admin/:id
// @access  Private (Super Admin only)
const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent deleting self
    if (admin._id.toString() === req.admin._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if admin is active
    if (admin.status !== 'active') {
      return res.status(401).json({ message: 'Account is not active' });
    }

    // Update last login
    await admin.updateLastLogin();

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      status: admin.status,
      storeName: admin.storeName,
      storeId: admin.storeId,
      role: admin.role,
      permissions: admin.permissions,
      token: generateToken(admin._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const { name, email, avatar } = req.body;
    
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (avatar) admin.avatar = avatar;

    const updatedAdmin = await admin.save();

    res.json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      status: updatedAdmin.status,
      storeName: updatedAdmin.storeName,
      storeId: updatedAdmin.storeId,
      role: updatedAdmin.role,
      permissions: updatedAdmin.permissions,
      avatar: updatedAdmin.avatar
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/profile/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin._id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
  getProfile,
  updateProfile,
  changePassword
};