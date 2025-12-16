const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const transportRoutes = require('./routes/transportRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const retailRoutes = require('./routes/retailRoutes');
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();

// Middleware
app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    process.env.CORS_ORIGIN
  ].filter(Boolean), // Remove any undefined values
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-for-dev',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}));

app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/transporter', transportRoutes); // Add alias for transporter role
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/retail', retailRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handler middleware (must be last)
app.use(errorHandler);

module.exports = app;
