const router = require('express').Router();
const PurchaseHistory = require('../models/PurchaseHistory');
const auth = require('../middleware/auth');

router.get('/dashboard/customer/history', auth, async (req, res) => {
    const history = await PurchaseHistory.find({ customerId: req.user.id });
    res.json(history);
});

module.exports = router;
