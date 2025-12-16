const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true, index: true },
  harvest_date: Date,
  quantity: Number,
  quality: String,
  price: { type: Number, default: 0 }, // Add price field for farmer's selling price
  productCode: { type: String, unique: true, index: true }, // Add productCode for easier tracking
  currentStage: { 
    type: String, 
    enum: ['harvested', 'in_transport', 'in_warehouse', 'in_retail', 'sold'],
    default: 'harvested'
  },
  isActive: { type: Boolean, default: true } // For tracking active products
}, { timestamps: true });

// Auto-generate productCode and ensure currentStage before saving
productSchema.pre('save', function(next) {
  if (!this.productCode) {
    this.productCode = 'PC' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  
  // Ensure currentStage is set for new products
  if (this.isNew && !this.currentStage) {
    this.currentStage = 'harvested';
  }
  
  next();
});

module.exports = mongoose.model('Product', productSchema);
