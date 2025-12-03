const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    batchId: { type: String, required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pickupLocation: { type: String, required: true },
    dropLocation: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'In Transit', 'Delivered'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);
