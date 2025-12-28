const express = require('express');
const { body, validationResult } = require('express-validator');
const Warehouse = require('../models/Warehouse');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const eventBus = require('../events/eventBus');

const router = express.Router();

/**
 * GET /api/warehouse/assigned-products
 * Get products assigned and delivered to current warehouse
 */
router.get('/assigned-products', auth, role('Warehouse'), async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    const assignedProducts = await Product.find({ 
      assignedWarehouse: req.session.user.id,
      currentStage: 'in_warehouse',
      isActive: true 
    })
    .populate('farmer', 'name location')
    .populate('assignedTransporter', 'name email')
    .populate('assignedRetailer', 'name email');

    res.json(assignedProducts);
  } catch (err) {
    console.error('Error fetching warehouse assigned products:', err);
    next(err);
  }
});

/**
 * GET /api/warehouse
 * List warehouse entries (filtered by role)
 */
router.get('/', auth, role('Warehouse', 'Admin'), async (req, res, next) => {
  try {
    let query = {};
    
    // Filter by warehouse staff for non-admin users
    if (req.session.user.role === 'Warehouse') {
      query.warehouse_staff = req.session.user.id;
    }
    
    const entries = await Warehouse.find(query).populate('product').sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/warehouse/available-products
 * Get products available at warehouse (stage: in_warehouse)
 */
router.get('/available-products', auth, role('Warehouse', 'Admin'), async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    const availableProducts = await Product.find({ 
      currentStage: 'in_warehouse', 
      isActive: true 
    }).populate('farmer');
    res.json(availableProducts);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/warehouse
 * Create a new warehouse record
 * Expected body:
 *  {
 *    product: "<productId>",
 *    storage_location: "Location Name",
 *    temperature: "Cold/Normal",
 *    stored_date: "2023-12-01T00:00:00.000Z"
 *  }
 */
router.post(
  '/',
  auth,
  role('Warehouse'),
  [
    body('product').notEmpty().withMessage('product is required'),
    body('storage_location').notEmpty().withMessage('storage_location is required'),
    body('temperature').notEmpty().withMessage('temperature is required'),
    body('stored_date').optional().isISO8601().withMessage('stored_date must be a valid date')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { product, storage_location, temperature, stored_date } = req.body;
      
      // Validate product exists and is in correct stage
      const Product = require('../models/Product');
      const existingProduct = await Product.findById(product);
      if (!existingProduct) {
        return res.status(400).json({ message: 'Product not found' });
      }
      
      if (existingProduct.currentStage !== 'in_warehouse') {
        return res.status(400).json({ 
          message: `Product is in '${existingProduct.currentStage}' stage. Can only store products in 'in_warehouse' stage.` 
        });
      }
      
      if (!existingProduct.isActive) {
        return res.status(400).json({ message: 'Product is not active for warehouse storage' });
      }

      const entry = await Warehouse.create({
        product,
        warehouse_staff: req.session.user.id,
        storage_location,
        temperature,
        stored_date: stored_date || new Date()
      });

      // Emit internal event (EventEmitter)
      eventBus.emit('status:updated', { productId: product, type: 'warehouse' });

      // Emit realtime event via Socket.IO
      const io = req.app.get('io');
      if (io) {
        io.emit('warehouse:updated', entry);
      }

      res.status(201).json(entry);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /api/warehouse/:id
 * Update a warehouse record
 */
router.put(
  '/:id',
  auth,
  role('Warehouse', 'Admin'),
  [
    body('temperature').optional().notEmpty().withMessage('temperature cannot be empty'),
    body('stored_date').optional().isISO8601().withMessage('stored_date must be a valid date')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updated = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) {
        return res.status(404).json({ message: 'Warehouse entry not found' });
      }

      eventBus.emit('status:updated', { productId: updated.product, type: 'warehouse' });

      const io = req.app.get('io');
      if (io) {
        io.emit('warehouse:updated', updated);
      }

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /api/warehouse/:id/dispatch
 * Dispatch product from warehouse to retail (move to in_retail stage)
 */
router.put('/:id/dispatch', auth, role('Warehouse', 'Admin'), async (req, res, next) => {
  try {
    const { assignedRetailer } = req.body;
    
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse entry not found' });
    }
    
    // Move product to in_retail stage and assign retailer
    const Product = require('../models/Product');
    await Product.findByIdAndUpdate(warehouse.product, { 
      currentStage: 'in_retail',
      assignedRetailer: assignedRetailer || null
    });

    eventBus.emit('status:updated', { productId: warehouse.product, type: 'warehouse' });
    const io = req.app.get('io');
    if (io) io.emit('warehouse:dispatched', warehouse);

    res.json({ message: 'Product dispatched to retail successfully', warehouse });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/warehouse/product/:productId/dispatch
 * Dispatch product from warehouse to retailer (move to in_retail stage)
 */
router.put('/product/:productId/dispatch', auth, role('Warehouse'), async (req, res, next) => {
  try {
    const { assignedRetailer } = req.body;
    
    if (!assignedRetailer) {
      return res.status(400).json({ message: 'Retailer ID is required' });
    }

    const Product = require('../models/Product');
    const product = await Product.findOne({
      _id: req.params.productId,
      assignedWarehouse: req.session.user.id,
      currentStage: 'in_warehouse'
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or not in your warehouse' });
    }

    // Update product stage and assign retailer
    product.currentStage = 'in_retail';
    product.assignedRetailer = assignedRetailer;
    await product.save();
    
    eventBus.emit('status:updated', { productId: product._id, type: 'warehouse' });
    const io = req.app.get('io');
    if (io) io.emit('warehouse:dispatched', { productId: product._id });

    res.json({ message: 'Product dispatched to retailer successfully', product });
  } catch (err) {
    console.error('Error dispatching product:', err);
    next(err);
  }
});

/**
 * GET /api/warehouse/available-retailers
 * Get list of available retailers for warehouses to choose
 */
router.get('/available-retailers', auth, role('Warehouse', 'Admin'), async (req, res, next) => {
  try {
    const User = require('../models/User');
    const retailers = await User.find({ role: 'Retailer' }, { _id: 1, name: 1, email: 1 });
    res.json(retailers);
  } catch (err) {
    console.error('Error fetching retailers:', err);
    next(err);
  }
});

/**
 * DELETE /api/warehouse/:id
 * Admin-only: delete warehouse entry
 */
router.delete('/:id', auth, role('Admin'), async (req, res, next) => {
  try {
    const deleted = await Warehouse.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Warehouse entry not found' });
    }
    res.json({ message: 'Warehouse entry deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
