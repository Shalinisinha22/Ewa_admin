const Store = require('../models/Store');

// @desc    Get store settings
// @route   GET /api/settings/store
// @access  Private
const getStoreSettings = async (req, res) => {
  try {
    const store = await Store.findById(req.storeId);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update store settings
// @route   PUT /api/settings/store
// @access  Private
const updateStoreSettings = async (req, res) => {
  try {
    const store = await Store.findById(req.storeId);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Update store fields
    Object.assign(store, req.body);
    const updatedStore = await store.save();

    res.json(updatedStore);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get payment settings
// @route   GET /api/settings/payment
// @access  Private
const getPaymentSettings = async (req, res) => {
  try {
    const store = await Store.findById(req.storeId);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Return payment settings (you might want to store these separately)
    const paymentSettings = {
      razorpay: {
        enabled: false,
        keyId: '',
        keySecret: ''
      },
      stripe: {
        enabled: false,
        publishableKey: '',
        secretKey: ''
      },
      paypal: {
        enabled: false,
        clientId: '',
        clientSecret: ''
      },
      cod: {
        enabled: true,
        charges: 0
      }
    };

    res.json(paymentSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update payment settings
// @route   PUT /api/settings/payment
// @access  Private
const updatePaymentSettings = async (req, res) => {
  try {
    // In a real app, you'd store payment settings securely
    // For now, just return success
    res.json({ message: 'Payment settings updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get shipping settings
// @route   GET /api/settings/shipping
// @access  Private
const getShippingSettings = async (req, res) => {
  try {
    // Return default shipping settings
    const shippingSettings = {
      freeShippingThreshold: 500,
      defaultShippingCost: 50,
      zones: [
        {
          name: 'Local',
          cost: 30,
          estimatedDays: '1-2 days'
        },
        {
          name: 'National',
          cost: 80,
          estimatedDays: '3-5 days'
        }
      ]
    };

    res.json(shippingSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update shipping settings
// @route   PUT /api/settings/shipping
// @access  Private
const updateShippingSettings = async (req, res) => {
  try {
    // In a real app, you'd store shipping settings
    res.json({ message: 'Shipping settings updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get tax settings
// @route   GET /api/settings/tax
// @access  Private
const getTaxSettings = async (req, res) => {
  try {
    // Return default tax settings
    const taxSettings = {
      gst: {
        enabled: true,
        rate: 18
      },
      cgst: {
        enabled: false,
        rate: 9
      },
      sgst: {
        enabled: false,
        rate: 9
      }
    };

    res.json(taxSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update tax settings
// @route   PUT /api/settings/tax
// @access  Private
const updateTaxSettings = async (req, res) => {
  try {
    // In a real app, you'd store tax settings
    res.json({ message: 'Tax settings updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get email settings
// @route   GET /api/settings/email
// @access  Private
const getEmailSettings = async (req, res) => {
  try {
    // Return default email settings
    const emailSettings = {
      smtp: {
        host: '',
        port: 587,
        secure: false,
        username: '',
        password: ''
      },
      templates: {
        orderConfirmation: {
          enabled: true,
          subject: 'Order Confirmation - #{orderNumber}'
        },
        orderShipped: {
          enabled: true,
          subject: 'Your order has been shipped - #{orderNumber}'
        },
        orderDelivered: {
          enabled: true,
          subject: 'Order delivered - #{orderNumber}'
        }
      }
    };

    res.json(emailSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update email settings
// @route   PUT /api/settings/email
// @access  Private
const updateEmailSettings = async (req, res) => {
  try {
    // In a real app, you'd store email settings securely
    res.json({ message: 'Email settings updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get SEO settings
// @route   GET /api/settings/seo
// @access  Private
const getSEOSettings = async (req, res) => {
  try {
    const store = await Store.findById(req.storeId);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store.seo || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update SEO settings
// @route   PUT /api/settings/seo
// @access  Private
const updateSEOSettings = async (req, res) => {
  try {
    const store = await Store.findById(req.storeId);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    store.seo = { ...store.seo, ...req.body };
    const updatedStore = await store.save();

    res.json(updatedStore.seo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getStoreSettings,
  updateStoreSettings,
  getPaymentSettings,
  updatePaymentSettings,
  getShippingSettings,
  updateShippingSettings,
  getTaxSettings,
  updateTaxSettings,
  getEmailSettings,
  updateEmailSettings,
  getSEOSettings,
  updateSEOSettings
};