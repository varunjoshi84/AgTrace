const router = require('express').Router();
const Batch = require('../models/Batch');
const auth = require('../middleware/auth');

router.get('/dashboard/farmer/batches', auth, async (req, res) => {
    const batches = await Batch.find({ farmerId: req.user.id });
    res.json(batches);
});

router.post('/dashboard/farmer/batches', auth, async (req, res) => {
    const id = 'B-' + Math.floor(1000 + Math.random() * 9000);
    const batch = await Batch.create({ ...req.body, id, farmerId: req.user.id });
    res.json(batch);
});

module.exports = router;
