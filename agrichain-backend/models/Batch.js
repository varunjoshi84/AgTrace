const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    crop: { type: String, required: true },
    produce: String,
    farm: String,
    location: String,
    harvestDate: { type: Date, required: true },
    status: { type: String, enum: ['Created', 'Processing', 'In Transit', 'Delivered'], default: 'Created' },
    journey: [{
        stage: String,
        location: String,
        date: Date,
        completed: { type: Boolean, default: false }
    }],
    sortOrder: Number
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
