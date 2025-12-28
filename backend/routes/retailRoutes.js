

const express = require('express');
const { body, validationResult } = require('express-validator');

const Retail = require('../models/Retail');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const eventBus = require('../events/eventBus');

const router = express.Router();

/**
 * GET /api/retail/assigned-products
 * Get products assigned to current retailer
 */
router.get('/assigned-products', auth, role('Retailer'), async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    const assignedProducts = await Product.find({ 
      assignedRetailer: req.session.user.id,
      currentStage: 'in_retail',
      isActive: true 
    })
    .populate('farmer', 'name location')
    .populate('assignedTransporter', 'name email')
    .populate('assignedWarehouse', 'name email');

    res.json(assignedProducts);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/retail
 * List retail entries (filtered by role)
 */
router.get('/', auth, role('Retailer', 'Admin'), async (req, res, next) => {
  try {
    let query = {};
    
    // Filter by retailer for non-admin users
    if (req.session.user.role === 'Retailer') {
      query.retailer = req.session.user.id;
    }
    
    const entries = await Retail.find(query).populate('product').sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/retail/available-products
 * Get products available for retail sale (stage: in_retail)
 */
router.get('/available-products', auth, role('Retailer', 'Admin'), async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    const availableProducts = await Product.find({ 
      currentStage: 'in_retail', 
      isActive: true 
    }).populate('farmer');
    res.json(availableProducts);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/retail
 * Create a new retail record (Retailer)
 * Expected body:
 *  {
 *    product: "<productId>",
 *    shop_name: "Shop Name",
 *    selling_price: 120,
 *    stock: 50
 *  }
 */
router.post(
  '/',
  auth,
  role('Retailer'),
  [
    body('product').notEmpty().withMessage('product is required'),
    body('shop_name').notEmpty().withMessage('shop_name is required'),
    body('selling_price').isNumeric().withMessage('selling_price must be a number'),
    body('stock').isInt({ min: 0 }).withMessage('stock must be a non-negative integer')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { product, shop_name, selling_price, stock } = req.body;
      
      // Validate product exists and is in correct stage
      const Product = require('../models/Product');
      const existingProduct = await Product.findById(product);
      if (!existingProduct) {
        return res.status(400).json({ message: 'Product not found' });
      }
      
      if (existingProduct.currentStage !== 'in_retail') {
        return res.status(400).json({ 
          message: `Product is in '${existingProduct.currentStage}' stage. Can only sell products in 'in_retail' stage.` 
        });
      }
      
      if (!existingProduct.isActive) {
        return res.status(400).json({ message: 'Product is not active for retail sale' });
      }

      const entry = await Retail.create({
        product,
        retailer: req.session.user.id,
        shop_name,
        selling_price,
        stock
      });

      // Emit internal event (EventEmitter)
      eventBus.emit('status:updated', { productId: product, type: 'retail' });

      // Emit realtime event via Socket.IO
      const io = req.app.get('io');
      if (io) {
        io.emit('retail:updated', entry);
      }

      res.status(201).json(entry);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /api/retail/:id
 * Update a retail record (price / stock)
 */
router.put(
  '/:id',
  auth,
  role('Retailer', 'Admin'),
  [
    body('selling_price').optional().isNumeric().withMessage('selling_price must be a number'),
    body('stock').optional().isInt({ min: 0 }).withMessage('stock must be a non-negative integer')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updated = await Retail.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) {
        return res.status(404).json({ message: 'Retail entry not found' });
      }

      eventBus.emit('status:updated', { productId: updated.product, type: 'retail' });

      const io = req.app.get('io');
      if (io) {
        io.emit('retail:updated', updated);
      }

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /api/retail/:id/sell-out
 * Mark product as sold out (move to sold stage)
 */
router.put('/:id/sell-out', auth, role('Retailer', 'Admin'), async (req, res, next) => {
  try {
    const { customerPhone } = req.body;
    
    const retail = await Retail.findById(req.params.id);
    if (!retail) {
      return res.status(404).json({ message: 'Retail entry not found' });
    }
    
    // Update retail stock to 0, add customer phone
    retail.stock = 0;
    if (customerPhone) {
      retail.customer_phone = customerPhone;
    }
    await retail.save();
    
    // Move product to sold stage and record customer phone
    const Product = require('../models/Product');
    await Product.findByIdAndUpdate(retail.product, { 
      currentStage: 'sold',
      isActive: false, // Mark as inactive when sold
      customerPhone: customerPhone || null
    });

    eventBus.emit('status:updated', { productId: retail.product, type: 'retail' });
    const io = req.app.get('io');
    if (io) io.emit('retail:sold-out', retail);

    res.json({ message: 'Product sold out successfully', retail });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/retail/:id
 * Admin-only: delete retail entry
 */
router.delete('/:id', auth, role('Admin'), async (req, res, next) => {
  try {
    const deleted = await Retail.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Retail entry not found' });
    }
    res.json({ message: 'Retail entry deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
