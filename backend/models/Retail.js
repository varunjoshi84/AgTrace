const mongoose = require('mongoose');

const retailSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  shop_name: String,
  selling_price: Number,
  stock: Number,
  customer_phone: { type: String, index: true } // Add customer phone for purchase tracking
}, { timestamps: true });

module.exports = mongoose.model('Retail', retailSchema);
