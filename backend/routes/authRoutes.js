const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const logToFile = require('../utils/logToFile');

const router = express.Router();

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().escape().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['Farmer','Transporter','Warehouse','Retailer','Customer','Admin'])
      .withMessage('Invalid role')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { name, email, password, role } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists with this email' });
      }
      
      const user = await User.create({ name, email, password, role });
      
      // Auto-create farmer profile if role is Farmer
      if (role === 'Farmer') {
        await Farmer.create({
          user: user._id,
          name: name,
          location: '',
          phone: ''
        });
      }
      
      logToFile(`User registered: ${email} with role ${role}`);
      res.status(201).json({ 
        message: 'User registered successfully', 
        user: { id: user._id, role: user.role } 
      });
    } catch (err) {
      logToFile(`Registration error for ${req.body.email}: ${err.message}`);
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ email });
      if (!user) {
        logToFile(`Failed login attempt for non-existent user: ${email}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        logToFile(`Failed login attempt for user: ${email} - invalid password`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      req.session.user = { id: user._id, role: user.role, name: user.name };
      logToFile(`User logged in: ${email}`);
      res.status(200).json({ 
        message: 'Logged in successfully', 
        user: req.session.user 
      });
    } catch (err) {
      logToFile(`Login error for ${req.body.email}: ${err.message}`);
      next(err);
    }
  }
);

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const userEmail = req.session.user?.name || 'unknown';
  req.session.destroy((err) => {
    if (err) {
      logToFile(`Logout error for ${userEmail}: ${err.message}`);
      return res.status(500).json({ message: 'Could not log out' });
    }
    logToFile(`User logged out: ${userEmail}`);
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
