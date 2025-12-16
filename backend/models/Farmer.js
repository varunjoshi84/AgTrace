const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  location: String,
  address: String,
  pincode: String,
  farmSize: String,
  phone: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Farmer', farmerSchema);
