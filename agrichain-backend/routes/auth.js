const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({ user, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/auth/profile', auth, async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
        res.json({ user: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/auth/logout', auth, (req, res) => {
    res.json({ success: true });
});

module.exports = router;
