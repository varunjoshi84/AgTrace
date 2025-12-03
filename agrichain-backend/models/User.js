const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    role: { type: String, enum: ['Farmer', 'Customer', 'Supplier'], required: true },
    phone: String,
    location: String,
    bio: String,
    avatar: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
