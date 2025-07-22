const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { storeId: req.storeId };

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Payment status filter
    if (req.query.paymentStatus) {
      query['payment.status'] = req.query.paymentStatus;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    // Search by order number or customer
    if (req.query.search) {
      const customers = await Customer.find({
        storeId: req.storeId,
        $or: [
          { firstName: { $regex: req.query.search, $options: 'i' } },
          { lastName: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } }
        ]
      }).select('_id');

      query.$or = [
        { orderNumber: { $regex: req.query.search, $options: 'i' } },
        { customer: { $in: customers.map(c => c._id) } }
      ];
    }

    const orders = await Order.find(query)
      .populate('customer', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      storeId: req.storeId
    })
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      storeId: req.storeId
    };

    // Validate customer exists
    const customer = await Customer.findOne({
      _id: orderData.customer,
      storeId: req.storeId
    });
    if (!customer) {
      return res.status(400).json({ message: 'Customer not found' });
    }

    // Validate products and update stock
    for (let item of orderData.items) {
      const product = await Product.findOne({
        _id: item.product,
        storeId: req.storeId
      });
      
      if (!product) {
        return res.status(400).json({ message: `Product ${item.name} not found` });
      }

      if (product.stock.trackQuantity && product.stock.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock.quantity}` 
        });
      }

      // Update stock
      if (product.stock.trackQuantity) {
        product.stock.quantity -= item.quantity;
        await product.save();
      }
    }

    const order = await Order.create(orderData);
    
    // Calculate totals
    order.calculateTotals();
    await order.save();

    // Populate before sending response
    await order.populate('customer', 'firstName lastName email');

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      storeId: req.storeId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    Object.assign(order, req.body);
    
    // Recalculate totals if items changed
    if (req.body.items) {
      order.calculateTotals();
    }

    const updatedOrder = await order.save();
    
    // Populate before sending response
    await updatedOrder.populate('customer', 'firstName lastName email');

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      storeId: req.storeId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Restore stock for cancelled orders
    if (order.status !== 'cancelled') {
      for (let item of order.items) {
        const product = await Product.findById(item.product);
        if (product && product.stock.trackQuantity) {
          product.stock.quantity += item.quantity;
          await product.save();
        }
      }
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      storeId: req.storeId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.status;
    order.status = status;

    // Update fulfillment status based on order status
    switch (status) {
      case 'shipped':
        order.fulfillment.status = 'fulfilled';
        order.fulfillment.shippedAt = new Date();
        break;
      case 'delivered':
        order.fulfillment.status = 'fulfilled';
        order.fulfillment.deliveredAt = new Date();
        break;
      case 'cancelled':
        // Restore stock if order was not previously cancelled
        if (oldStatus !== 'cancelled') {
          for (let item of order.items) {
            const product = await Product.findById(item.product);
            if (product && product.stock.trackQuantity) {
              product.stock.quantity += item.quantity;
              await product.save();
            }
          }
        }
        break;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private
const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $match: { storeId: req.storeId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' },
          averageOrderValue: { $avg: '$pricing.total' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get monthly revenue trend
    const monthlyStats = await Order.aggregate([
      { $match: { storeId: req.storeId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      overview: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
      },
      monthlyTrend: monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export orders
// @route   GET /api/orders/export
// @access  Private
const exportOrders = async (req, res) => {
  try {
    let query = { storeId: req.storeId };

    // Apply filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.startDate) query.createdAt = { $gte: new Date(req.query.startDate) };
    if (req.query.endDate) {
      query.createdAt = { ...query.createdAt, $lte: new Date(req.query.endDate) };
    }

    const orders = await Order.find(query)
      .populate('customer', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Convert to CSV format
    const csvData = orders.map(order => ({
      orderNumber: order.orderNumber,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      customerEmail: order.customer.email,
      status: order.status,
      paymentStatus: order.payment.status,
      total: order.pricing.total,
      createdAt: order.createdAt.toISOString().split('T')[0]
    }));

    res.json(csvData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refund order
// @route   POST /api/orders/:id/refund
// @access  Private
const refundOrder = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      storeId: req.storeId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.payment.status !== 'completed') {
      return res.status(400).json({ message: 'Order payment is not completed' });
    }

    // Update order with refund information
    order.refund = {
      amount: amount || order.pricing.total,
      reason,
      refundedAt: new Date(),
      transactionId: `REF-${Date.now()}`
    };

    order.status = 'refunded';
    order.payment.status = 'refunded';

    // Restore stock
    for (let item of order.items) {
      const product = await Product.findById(item.product);
      if (product && product.stock.trackQuantity) {
        product.stock.quantity += item.quantity;
        await product.save();
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      storeId: req.storeId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel shipped or delivered orders' });
    }

    order.status = 'cancelled';

    // Restore stock
    for (let item of order.items) {
      const product = await Product.findById(item.product);
      if (product && product.stock.trackQuantity) {
        product.stock.quantity += item.quantity;
        await product.save();
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getOrderStats,
  exportOrders,
  refundOrder,
  cancelOrder
};