const express = require('express');
const { body, validationResult, param } = require('express-validator');
const Farmer = require('../models/Farmer');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * GET /api/farmer/products
 * Get current logged-in farmer's products
 */
router.get('/products', auth, role('Farmer'), async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    const farmer = await Farmer.findOne({ user: req.session.user.id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }
    
    const products = await Product.find({ farmer: farmer._id }).populate('farmer');
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/farmer/products
 * Create a new product (Farmer)
 */
router.post(
  '/products',
  auth,
  role('Farmer'),
  [
    body('name').trim().escape().notEmpty().withMessage('Product name is required'),
    body('category').trim().escape().notEmpty().withMessage('Category is required'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('unit').trim().escape().notEmpty().withMessage('Unit is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('harvestDate').optional().isISO8601().withMessage('Invalid harvest date format'),
    body('description').optional().trim().escape()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, category, quantity, unit, price, harvestDate, description } = req.body;
      
      // Debug logging
      console.log('Received product data:', { name, category, quantity, unit, price, harvestDate, description });
      console.log('Price type:', typeof price, 'Price value:', price);
      console.log('Parsed price:', parseFloat(price));
      
      // Validate price manually
      if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        return res.status(400).json({ 
          message: 'Valid price is required and must be greater than 0' 
        });
      }
      
      // Check if farmer profile exists
      const farmer = await Farmer.findOne({ user: req.session.user.id });
      if (!farmer) {
        return res.status(400).json({ 
          message: 'Farmer profile not found. Please create your farmer profile first.' 
        });
      }

      const Product = require('../models/Product');
      const product = await Product.create({
        product_name: name,
        harvest_date: harvestDate,
        quantity: parseInt(quantity),
        quality: 'Good', // Default quality
        price: parseFloat(price), // Include the price from form
        farmer: farmer._id,
        currentStage: 'harvested', // Explicitly set stage
        isActive: true // Mark as active for supply chain
      });

      console.log('Created product with price:', product.price);
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/farmer/me
 * Get current logged-in farmer's profile
 */
router.get('/me', auth, role('Farmer'), async (req, res, next) => {
  try {
    const farmer = await Farmer.findOne({ user: req.session.user.id });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }
    res.json(farmer);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/farmer/me
 * Update current logged-in farmer's profile
 */
router.put(
  '/me',
  auth,
  role('Farmer'),
  [
    body('name').optional().trim().escape().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('location').optional().trim().escape().isLength({ max: 200 }).withMessage('Location must be less than 200 characters'),
    body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone must be less than 20 characters')
      .matches(/^[\d\-\+\s\(\)]*$/).withMessage('Phone contains invalid characters')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, location, phone } = req.body;
      const updateData = {};
      
      if (name !== undefined) updateData.name = name;
      if (location !== undefined) updateData.location = location;
      if (phone !== undefined) updateData.phone = phone;

      const farmer = await Farmer.findOneAndUpdate(
        { user: req.session.user.id },
        updateData,
        { new: true, runValidators: true }
      );

      if (!farmer) {
        return res.status(404).json({ message: 'Farmer profile not found' });
      }

      res.json(farmer);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/farmer (Admin only - list all farmers)
 */
router.get('/', auth, role('Admin'), async (req, res, next) => {
  try {
    const farmers = await Farmer.find().populate('user', 'name email role createdAt');
    res.json(farmers);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/farmer/:id (Admin only - get specific farmer)
 */
router.get(
  '/:id',
  auth,
  role('Admin'),
  [
    param('id').isMongoId().withMessage('Invalid farmer ID')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const farmer = await Farmer.findById(req.params.id).populate('user', 'name email role createdAt');
      if (!farmer) {
        return res.status(404).json({ message: 'Farmer not found' });
      }
      res.json(farmer);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/farmer/:id (Admin only - delete farmer profile)
 */
router.delete(
  '/:id',
  auth,
  role('Admin'),
  [
    param('id').isMongoId().withMessage('Invalid farmer ID')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const farmer = await Farmer.findByIdAndDelete(req.params.id);
      if (!farmer) {
        return res.status(404).json({ message: 'Farmer not found' });
      }
      res.json({ message: 'Farmer profile deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/farmer/profile
 * Get current logged-in farmer's profile
 */
router.get('/profile', auth, role('Farmer'), async (req, res, next) => {
  try {
    const farmer = await Farmer.findOne({ user: req.session.user.id }).populate('user', 'name email');
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }
    
    res.json({
      _id: farmer._id,
      name: farmer.name,
      location: farmer.location,
      address: farmer.address,
      pincode: farmer.pincode,
      farmSize: farmer.farmSize,
      phone: farmer.phone,
      user: farmer.user
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/farmer/profile
 * Update current logged-in farmer's profile
 */
router.put(
  '/profile',
  auth,
  role('Farmer'),
  [
    body('farmName').optional().trim().escape(),
    body('location').trim().notEmpty().withMessage('Farm location is required'),
    body('address').trim().notEmpty().withMessage('Farm address is required'),
    body('pincode').trim().isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 digits'),
    body('farmSize').optional().trim().escape(),
    body('phone').optional().trim().matches(/^[\+]?[\d\s\-\(\)]+$/).withMessage('Invalid phone number format')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { farmName, location, address, pincode, farmSize, phone } = req.body;
      
      const farmer = await Farmer.findOneAndUpdate(
        { user: req.session.user.id },
        {
          name: farmName,
          location,
          address,
          pincode,
          farmSize,
          phone
        },
        { new: true }
      ).populate('user', 'name email');

      if (!farmer) {
        return res.status(404).json({ message: 'Farmer profile not found' });
      }

      res.json({
        message: 'Farm profile updated successfully',
        farmer: {
          _id: farmer._id,
          name: farmer.name,
          location: farmer.location,
          address: farmer.address,
          pincode: farmer.pincode,
          farmSize: farmer.farmSize,
          phone: farmer.phone,
          user: farmer.user
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;