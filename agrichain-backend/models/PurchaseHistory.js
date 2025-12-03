const mongoose = require('mongoose');

const purchaseHistorySchema = new mongoose.Schema({
    id: { type: String, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    batchId: { type: String, required: true },
    product: { type: String, required: true },
    source: { type: String, required: true },
    purchaseDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseHistory', purchaseHistorySchema);
