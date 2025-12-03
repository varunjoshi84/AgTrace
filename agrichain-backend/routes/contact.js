const router = require('express').Router();
const ContactMessage = require('../models/ContactMessage');

router.post('/contact', async (req, res) => {
    await ContactMessage.create(req.body);
    res.json({ success: true });
});

module.exports = router;
