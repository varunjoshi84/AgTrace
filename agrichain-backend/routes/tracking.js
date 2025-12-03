const router = require('express').Router();
const Batch = require('../models/Batch');

router.get('/tracking/:batchId', async (req, res) => {
    const batch = await Batch.findOne({ id: req.params.batchId });
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json(batch);
});

module.exports = router;
