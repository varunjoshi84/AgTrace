const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  transporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  from_location: String,
  to_location: String,
  status: String,
  date: Date
}, { timestamps: true });

module.exports = mongoose.model('Transport', transportSchema);
