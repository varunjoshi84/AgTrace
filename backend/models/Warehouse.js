const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  warehouse_staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  storage_location: String,
  temperature: String,
  stored_date: Date,
  assignedRetailer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Warehouse assigns specific retailer
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', warehouseSchema);
