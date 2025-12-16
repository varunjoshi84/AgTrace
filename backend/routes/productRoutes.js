const express = require('express');
const { body, validationResult, param } = require('express-validator');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const eventBus = require('../events/eventBus');

const router = express.Router();

// GET /api/products (Admin or Customer to list all)
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find().populate('farmer');
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// POST /api/products (Farmer)
router.post(
  '/',
  auth,
  role('Farmer'),
  [ 
    body('product_name').trim().escape().notEmpty().withMessage('Product name is required'),
    body('harvest_date').optional().isISO8601().withMessage('Invalid harvest date format'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('quality').optional().trim().escape().isLength({ max: 50 }).withMessage('Quality must be less than 50 characters')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { product_name, harvest_date, quantity, quality } = req.body;
      
      // Check if farmer profile exists
      const farmer = await Farmer.findOne({ user: req.session.user.id });
      if (!farmer) {
        return res.status(400).json({ 
          message: 'Farmer profile not found. Please create your farmer profile first.' 
        });
      }

      const product = await Product.create({
        product_name,
        harvest_date,
        quantity,
        quality,
        farmer: farmer._id
      });

      // Emit event
      eventBus.emit('product:created', product);

      // Also broadcast via socket.io to dashboards (using app.get('io'))
      const io = req.app.get('io');
      if (io) {
        io.emit('product:created', product);
      }

      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/products/:id
router.put(
  '/:id', 
  auth, 
  role('Farmer','Admin'),
  [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('product_name').optional().trim().escape().notEmpty().withMessage('Product name cannot be empty'),
    body('harvest_date').optional().isISO8601().withMessage('Invalid harvest date format'),
    body('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
    body('quality').optional().trim().escape().isLength({ max: 50 }).withMessage('Quality must be less than 50 characters')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // If farmer role, ensure they own this product
      if (req.session.user.role === 'Farmer') {
        const farmer = await Farmer.findOne({ user: req.session.user.id });
        if (!farmer || !product.farmer.equals(farmer._id)) {
          return res.status(403).json({ message: 'You can only update your own products' });
        }
      }

      const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { 
        new: true, 
        runValidators: true 
      });

      eventBus.emit('status:updated', { productId: updated._id, type: 'product' });
      
      const io = req.app.get('io');
      if (io) {
        io.emit('product:updated', updated);
      }

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/products/:id (Admin)
router.delete(
  '/:id', 
  auth, 
  role('Admin'),
  [
    param('id').isMongoId().withMessage('Invalid product ID')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const deleted = await Product.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
