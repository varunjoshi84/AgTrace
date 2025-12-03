const router = require('express').Router();
const Shipment = require('../models/Shipment');
const auth = require('../middleware/auth');

router.get('/dashboard/supplier/shipments', auth, async (req, res) => {
    const shipments = await Shipment.find({ supplierId: req.user.id });
    res.json(shipments);
});

router.put('/dashboard/supplier/shipments/:id/status', auth, async (req, res) => {
    const shipment = await Shipment.findOneAndUpdate({ id: req.params.id }, { status: req.body.status }, { new: true });
    res.json(shipment);
});

module.exports = router;
