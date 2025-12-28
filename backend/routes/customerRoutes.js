const express = require('express');
const Product = require('../models/Product');
const Transport = require('../models/Transport');
const Warehouse = require('../models/Warehouse');
const Retail = require('../models/Retail');

const router = express.Router();

// GET /api/customer/track/:productId
router.get('/track/:productId', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate('farmer', 'name location')
      .populate('assignedTransporter', 'name email')
      .populate('assignedWarehouse', 'name email')
      .populate('assignedRetailer', 'name email');
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
      notes: `Product harvested by ${product.farmer?.name || 'farmer'}`
    });

    // Add transport stage if assigned
    if (product.assignedTransporter) {
      journey.push({
        stage: 'In Transport',
        status: product.currentStage === 'in_transport' ? 'In Transit' : 'Delivered',
        location: `En route to ${product.assignedWarehouse?.name || 'warehouse'}`,
        handler: product.assignedTransporter?.name || 'Transporter',
        timestamp: product.updatedAt,
        notes: `Transported by ${product.assignedTransporter?.name || 'transporter'}`
      });
    }

    // Add warehouse stage if assigned and delivered
    if (product.assignedWarehouse && ['in_warehouse', 'in_retail', 'sold'].includes(product.currentStage)) {
      // Get warehouse storage details
      const warehouseDetails = warehouse.length > 0 ? warehouse[0] : null;
      let warehouseNotes = `Stored at ${product.assignedWarehouse?.name || 'warehouse'}`;
      
      if (warehouseDetails) {
        const storageInfo = [];
        if (warehouseDetails.storage_location) storageInfo.push(`Shelf: ${warehouseDetails.storage_location}`);
        if (warehouseDetails.temperature) storageInfo.push(`Storage Type: ${warehouseDetails.temperature}`);
        if (storageInfo.length > 0) {
          warehouseNotes += ` (${storageInfo.join(', ')})`;
        }
      }
      
      journey.push({
        stage: 'In Warehouse',
        status: product.currentStage === 'in_warehouse' ? 'In Storage' : 'Dispatched',
        location: product.assignedWarehouse?.name || 'Warehouse',
        handler: 'Warehouse Staff',
        timestamp: warehouseDetails?.stored_date || product.updatedAt,
        order: orderIndex++,
        notes: warehouseNotes,
        storageLocation: warehouseDetails?.storage_location,
        storageType: warehouseDetails?.temperature
      });
    }

    // Add retail stage if assigned and dispatched
    if (product.assignedRetailer && ['in_retail', 'sold'].includes(product.currentStage)) {
      journey.push({
        stage: 'In Retail',
        status: product.currentStage === 'sold' ? 'Sold' : 'Available for Sale',
        location: product.assignedRetailer?.name || 'Retail Store',
        handler: product.assignedRetailer?.name || 'Retailer',
        timestamp: product.updatedAt,
        order: orderIndex++,
        notes: `Available at ${product.assignedRetailer?.name || 'retail store'}`
      });
    }

    // Add sold stage if product is sold
    if (product.currentStage === 'sold' && product.customerPhone) {
      journey.push({
        stage: 'Sold',
        status: 'Sold to Customer',
        location: 'Customer',
        handler: 'Customer',
        timestamp: product.updatedAt,
        order: orderIndex++,
        notes: `Sold to customer (${product.customerPhone})`
      });
    }

    // Sort journey by order to maintain correct sequence
    journey.sort((a, b) => a.order - b.order);

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
        transporter: product.assignedTransporter,
        warehouse: product.assignedWarehouse,
        retailer: product.assignedRetailer,
        customerPhone: product.customerPhone,
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
    const product = await Product.findOne({ productCode: req.params.productCode })
      .populate('farmer', 'name location')
      .populate('assignedTransporter', 'name email')
      .populate('assignedWarehouse', 'name email')
      .populate('assignedRetailer', 'name email');
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
    let orderIndex = 1;
    
    // Always start with harvest/creation
    journey.push({
      stage: 'Harvested',
      status: 'Harvested',
      location: product.farmer?.location || 'Farm',
      handler: product.farmer?.name || 'Farmer',
      timestamp: product.createdAt,
      order: orderIndex++,
      notes: `Product harvested by ${product.farmer?.name || 'farmer'}`
    });

    // Add transport stage if assigned
    if (product.assignedTransporter) {
      journey.push({
        stage: 'In Transport',
        status: product.currentStage === 'in_transport' ? 'In Transit' : 'Delivered',
        location: `En route to ${product.assignedWarehouse?.name || 'warehouse'}`,
        handler: product.assignedTransporter?.name || 'Transporter',
        timestamp: product.updatedAt,
        order: orderIndex++,
        notes: `Transported by ${product.assignedTransporter?.name || 'transporter'}`
      });
    }

    // Add warehouse stage if assigned and delivered
    if (product.assignedWarehouse && ['in_warehouse', 'in_retail', 'sold'].includes(product.currentStage)) {
      // Get warehouse storage details
      const warehouseDetails = warehouse.length > 0 ? warehouse[0] : null;
      let warehouseNotes = `Stored at ${product.assignedWarehouse?.name || 'warehouse'}`;
      
      if (warehouseDetails) {
        const storageInfo = [];
        if (warehouseDetails.storage_location) storageInfo.push(`Shelf: ${warehouseDetails.storage_location}`);
        if (warehouseDetails.temperature) storageInfo.push(`Storage Type: ${warehouseDetails.temperature}`);
        if (storageInfo.length > 0) {
          warehouseNotes += ` (${storageInfo.join(', ')})`;
        }
      }
      
      journey.push({
        stage: 'In Warehouse',
        status: product.currentStage === 'in_warehouse' ? 'In Storage' : 'Dispatched',
        location: product.assignedWarehouse?.name || 'Warehouse',
        handler: 'Warehouse Staff',
        timestamp: warehouseDetails?.stored_date || product.updatedAt,
        order: orderIndex++,
        notes: warehouseNotes,
        storageLocation: warehouseDetails?.storage_location,
        storageType: warehouseDetails?.temperature
      });
    }

    // Add retail stage if assigned and dispatched
    if (product.assignedRetailer && ['in_retail', 'sold'].includes(product.currentStage)) {
      journey.push({
        stage: 'In Retail',
        status: product.currentStage === 'sold' ? 'Sold' : 'Available for Sale',
        location: product.assignedRetailer?.name || 'Retail Store',
        handler: product.assignedRetailer?.name || 'Retailer',
        timestamp: product.updatedAt,
        order: orderIndex++,
        notes: `Available at ${product.assignedRetailer?.name || 'retail store'}`
      });
    }

    // Add sold stage if product is sold
    if (product.currentStage === 'sold' && product.customerPhone) {
      journey.push({
        stage: 'Sold',
        status: 'Sold to Customer',
        location: 'Customer',
        handler: 'Customer',
        timestamp: product.updatedAt,
        order: orderIndex++,
        notes: `Sold to customer (${product.customerPhone})`
      });
    }

    // Sort journey by order to maintain correct sequence
    journey.sort((a, b) => a.order - b.order);

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
        transporter: product.assignedTransporter,
        warehouse: product.assignedWarehouse,
        retailer: product.assignedRetailer,
        customerPhone: product.customerPhone,
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
    
    // Find all products sold to this customer by phone number
    const purchases = await Product.find({ 
      customerPhone: phone,
      currentStage: 'sold'
    })
      .populate('farmer', 'name location')
      .populate('assignedTransporter', 'name')
      .populate('assignedWarehouse', 'name')
      .populate('assignedRetailer', 'name')
      .sort({ updatedAt: -1 });

    // Map the purchases to include product information and supply chain journey
    const customerPurchases = purchases.map(product => ({
      _id: product._id,
      product_name: product.product_name,
      productCode: product.productCode,
      currentStage: product.currentStage,
      quantity: product.quantity,
      unit: product.unit,
      harvest_date: product.harvest_date,
      purchase_date: product.updatedAt,
      
      // Supply chain journey
      farmer: {
        name: product.farmer?.name || 'Unknown',
        location: product.farmer?.location || 'Unknown'
      },
      transporter: product.assignedTransporter?.name || 'Not assigned',
      warehouse: product.assignedWarehouse?.name || 'Not assigned',
      retailer: product.assignedRetailer?.name || 'Unknown'
    }));

    res.json({ purchases: customerPurchases });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
