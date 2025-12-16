const express = require('express');
const { body, validationResult } = require('express-validator');
const Transport = require('../models/Transport');
const Product = require('../models/Product');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const eventBus = require('../events/eventBus');

const router = express.Router();

/**
 * GET /api/transport
 * List transport entries (filtered by role)
 */
router.get('/', auth, role('Transporter', 'Admin'), async (req, res, next) => {
  try {
    let query = {};
    
    // Filter by transporter for non-admin users
    if (req.session.user.role === 'Transporter') {
      query.transporter = req.session.user.id;
    }
    
    const entries = await Transport.find(query).populate('product').sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/transport/available-products
 * Get products available for pickup (stage: harvested and isActive: true)
 * Includes detailed farm location information for pickup coordination
 */
router.get('/available-products', auth, role('Transporter', 'Admin'), async (req, res, next) => {
  try {
    const availableProducts = await Product.find({ 
      currentStage: 'harvested', 
      isActive: true 
    }).populate('farmer');

    // Enhance the products with detailed farm location information
    const productsWithFarmLocation = availableProducts.map(product => {
      const farmer = product.farmer || {};
      
      return {
        _id: product._id,
        product_name: product.product_name,
        productCode: product.productCode,
        quantity: product.quantity,
        price: product.price,
        harvest_date: product.harvest_date,
        farmer: {
          _id: farmer._id,
          name: farmer.name || 'Unknown Farmer',
          location: farmer.location || 'Location not specified',
          address: farmer.address || 'Address not specified',
          pincode: farmer.pincode || 'Pincode not specified',
          farmSize: farmer.farmSize || 'Size not specified',
          phone: farmer.phone || 'Phone not specified'
        },
        // Pre-populate pickup location from farm profile
        pickup_location: {
          farm_name: farmer.name || 'Unknown Farm',
          location: farmer.location || 'Location not specified',
          full_address: farmer.address || (farmer.location ? `${farmer.location}${farmer.pincode ? ', ' + farmer.pincode : ''}` : 'Address not specified'),
          pincode: farmer.pincode || 'Pincode not specified',
          contact_phone: farmer.phone || 'Phone not specified'
        },
        createdAt: product.createdAt,
        currentStage: product.currentStage,
        isActive: product.isActive
      };
    });

    res.json(productsWithFarmLocation);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  auth,
  role('Transporter'),
  [
    body('product').isMongoId().withMessage('Valid product ID required'),
    body('from_location').trim().escape().notEmpty().withMessage('from_location required'),
    body('to_location').trim().escape().notEmpty().withMessage('to_location required'),
    body('status').trim().escape().notEmpty().withMessage('status required')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { product, from_location, to_location, status, date } = req.body;
      
      // Validate product exists and is in correct stage
      const existingProduct = await Product.findById(product);
      if (!existingProduct) {
        return res.status(400).json({ message: 'Product not found' });
      }
      
      if (existingProduct.currentStage !== 'harvested') {
        return res.status(400).json({ 
          message: `Product is in '${existingProduct.currentStage}' stage. Can only transport products in 'harvested' stage.` 
        });
      }
      
      if (!existingProduct.isActive) {
        return res.status(400).json({ message: 'Product is not active for transport' });
      }

      // Create transport entry
      const entry = await Transport.create({
        product, 
        transporter: req.session.user.id,
        from_location, 
        to_location, 
        status, 
        date: date || new Date()
      });
      
      // Update product stage to in_transport
      await Product.findByIdAndUpdate(product, { 
        currentStage: 'in_transport' 
      });

      eventBus.emit('status:updated', { productId: product, type: 'transport' });
      const io = req.app.get('io');
      if (io) io.emit('transport:updated', entry);

      res.status(201).json(entry);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/:id', auth, role('Transporter', 'Admin'), async (req, res, next) => {
  try {
    let query = { _id: req.params.id };
    
    // Filter by transporter for non-admin users
    if (req.session.user.role === 'Transporter') {
      query.transporter = req.session.user.id;
    }
    
    const updated = await Transport.findOneAndUpdate(query, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Transport entry not found or access denied' });
    }

    eventBus.emit('status:updated', { productId: updated.product, type: 'transport' });
    const io = req.app.get('io');
    if (io) io.emit('transport:updated', updated);

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/transport/:id/complete
 * Mark transport as complete and move product to in_warehouse stage
 */
router.put('/:id/complete', auth, role('Transporter', 'Admin'), async (req, res, next) => {
  try {
    let query = { _id: req.params.id };
    
    // Filter by transporter for non-admin users
    if (req.session.user.role === 'Transporter') {
      query.transporter = req.session.user.id;
    }
    
    const transport = await Transport.findOne(query);
    if (!transport) {
      return res.status(404).json({ message: 'Transport entry not found or access denied' });
    }
    
    // Update transport status
    transport.status = 'Delivered';
    await transport.save();
    
    // Move product to in_warehouse stage
    await Product.findByIdAndUpdate(transport.product, { 
      currentStage: 'in_warehouse' 
    });

    eventBus.emit('status:updated', { productId: transport.product, type: 'transport' });
    const io = req.app.get('io');
    if (io) io.emit('transport:completed', transport);

    res.json({ message: 'Transport completed successfully', transport });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', auth, role('Admin'), async (req, res, next) => {
  try {
    const deleted = await Transport.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Transport entry not found' });
    }
    res.json({ message: 'Transport entry deleted' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/transport/shipments
 * Get shipments for current transporter (role-based filtering)
 */
router.get('/shipments', auth, role('Transporter'), async (req, res, next) => {
  try {
    // Filter by current transporter
    const shipments = await Transport.find({ transporter: req.session.user.id })
      .populate('product')
      .sort({ createdAt: -1 });
    res.json({ shipments });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
