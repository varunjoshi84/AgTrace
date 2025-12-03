const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    type: { type: String, enum: ['Customer', 'Farmer', 'Supplier'], required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read', 'responded'], default: 'unread' }
}, { timestamps: true });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
