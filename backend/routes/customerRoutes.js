const express = require('express');
const Product = require('../models/Product');
const Transport = require('../models/Transport');
const Warehouse = require('../models/Warehouse');
const Retail = require('../models/Retail');

const router = express.Router();

// GET /api/customer/track/:productId
router.get('/track/:productId', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId).populate('farmer');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const [transport, warehouse, retail] = await Promise.all([
      Transport.find({ product: product._id }).sort({ createdAt: 1 }),
      Warehouse.find({ product: product._id }).sort({ createdAt: 1 }),
      Retail.find({ product: product._id }).sort({ createdAt: 1 })
    ]);

    // Build journey timeline with proper stage names
    const journey = [];
    
    // Always start with harvest/creation
    journey.push({
      stage: 'Harvested',
      status: 'Harvested',
      location: product.farmer?.location || 'Farm',
      handler: product.farmer?.name || 'Farmer',
      timestamp: product.createdAt,
      notes: `Product harvested by farmer`
    });

    // Add transport stages
    transport.forEach(t => {
      journey.push({
        stage: 'In Transport',
        status: t.status || 'In Transport',
        location: `${t.from_location} → ${t.to_location}`,
        handler: 'Transporter',
        timestamp: t.date || t.createdAt,
        notes: `Moving from ${t.from_location} to ${t.to_location}`
      });
    });

    // Add warehouse stages
    warehouse.forEach(w => {
      journey.push({
        stage: 'In Warehouse',
        status: 'In Warehouse',
        location: w.storage_location || 'Warehouse',
        handler: 'Warehouse Staff',
        timestamp: w.stored_date || w.createdAt,
        notes: `Stored at ${w.temperature || 'normal'} temperature`
      });
    });

    // Add retail stages
    retail.forEach(r => {
      journey.push({
        stage: 'In Retail',
        status: 'In Retail',
        location: r.shop_name || 'Retail Store',
        handler: 'Retailer',
        timestamp: r.createdAt,
        notes: `Available for sale at $${r.selling_price || 'N/A'} per unit`
      });
    });

    // Sort journey by timestamp
    journey.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Determine current status based on product.currentStage
    let currentStatus = 'Harvested';
    switch (product.currentStage) {
      case 'harvested':
        currentStatus = 'Harvested';
        break;
      case 'in_transport':
        currentStatus = 'In Transport';
        break;
      case 'in_warehouse':
        currentStatus = 'In Warehouse';
        break;
      case 'in_retail':
        currentStatus = 'In Retail';
        break;
      case 'sold':
        currentStatus = 'Sold';
        break;
      default:
        currentStatus = 'Unknown Status';
    }

    const response = {
      product: {
        _id: product._id,
        productCode: product.productCode,
        name: product.product_name,
        category: 'Agricultural Product', 
        quantity: product.quantity,
        unit: 'units',
        harvestDate: product.harvest_date,
        farmer: product.farmer,
        currentStage: product.currentStage
      },
      journey,
      currentStatus,
      lastUpdated: journey[journey.length - 1]?.timestamp || product.updatedAt,
      transport,
      warehouse,
      retail
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

// GET /api/customer/track-by-code/:productCode
// Track product by productCode 
router.get('/track-by-code/:productCode', async (req, res, next) => {
  try {
    const product = await Product.findOne({ productCode: req.params.productCode }).populate('farmer');
    if (!product) return res.status(404).json({ message: 'Product not found with this product code' });

    // Reuse the same logic by redirecting to track by ID
    req.params.productId = product._id;
    // Call the track by ID handler
    const [transport, warehouse, retail] = await Promise.all([
      Transport.find({ product: product._id }).sort({ createdAt: 1 }),
      Warehouse.find({ product: product._id }).sort({ createdAt: 1 }),
      Retail.find({ product: product._id }).sort({ createdAt: 1 })
    ]);

    // Build journey timeline with proper stage names
    const journey = [];
    
    journey.push({
      stage: 'Harvested',
      status: 'Harvested',
      location: product.farmer?.location || 'Farm',
      handler: product.farmer?.name || 'Farmer',
      timestamp: product.createdAt,
      notes: `Product harvested by farmer`
    });

    transport.forEach(t => {
      journey.push({
        stage: 'In Transport',
        status: t.status || 'In Transport',
        location: `${t.from_location} → ${t.to_location}`,
        handler: 'Transporter',
        timestamp: t.date || t.createdAt,
        notes: `Moving from ${t.from_location} to ${t.to_location}`
      });
    });

    warehouse.forEach(w => {
      journey.push({
        stage: 'In Warehouse',
        status: 'In Warehouse',
        location: w.storage_location || 'Warehouse',
        handler: 'Warehouse Staff',
        timestamp: w.stored_date || w.createdAt,
        notes: `Stored at ${w.temperature || 'normal'} temperature`
      });
    });

    retail.forEach(r => {
      journey.push({
        stage: 'In Retail',
        status: 'In Retail',
        location: r.shop_name || 'Retail Store',
        handler: 'Retailer',
        timestamp: r.createdAt,
        notes: `Available for sale at $${r.selling_price || 'N/A'} per unit`
      });
    });

    journey.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    let currentStatus = 'Harvested';
    switch (product.currentStage) {
      case 'harvested': currentStatus = 'Harvested'; break;
      case 'in_transport': currentStatus = 'In Transport'; break;
      case 'in_warehouse': currentStatus = 'In Warehouse'; break;
      case 'in_retail': currentStatus = 'In Retail'; break;
      case 'sold': currentStatus = 'Sold'; break;
      default: currentStatus = 'Unknown Status';
    }

    const response = {
      product: {
        _id: product._id,
        productCode: product.productCode,
        name: product.product_name,
        category: 'Agricultural Product',
        quantity: product.quantity,
        unit: 'units',
        harvestDate: product.harvest_date,
        farmer: product.farmer,
        currentStage: product.currentStage
      },
      journey,
      currentStatus,
      lastUpdated: journey[journey.length - 1]?.timestamp || product.updatedAt,
      transport,
      warehouse,
      retail
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

// GET /api/customer/purchases/:phone - Get customer's purchases by phone number
router.get('/purchases/:phone', async (req, res, next) => {
  try {
    const phone = req.params.phone;
    
    // Find all retail sales for this phone number
    const purchases = await Retail.find({ customer_phone: phone })
      .populate('product')
      .sort({ createdAt: -1 });

    // Map the purchases to include product information
    const customerPurchases = purchases.map(purchase => ({
      _id: purchase._id,
      product_name: purchase.product?.product_name || 'Unknown Product',
      productCode: purchase.product?.productCode,
      currentStage: purchase.product?.currentStage || 'sold',
      shop_name: purchase.shop_name,
      selling_price: purchase.selling_price,
      purchase_date: purchase.createdAt,
      createdAt: purchase.createdAt,
      vendor: purchase.shop_name
    }));

    res.json({ purchases: customerPurchases });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
