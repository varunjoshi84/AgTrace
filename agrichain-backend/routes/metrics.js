const router = require('express').Router();
const Batch = require('../models/Batch');
const User = require('../models/User');

router.get('/metrics/summary', async (req, res) => {
    const batchCount = await Batch.countDocuments();
    const farmers = await User.countDocuments({ role: 'Farmer' });

    res.json({
        totalVerifiedBatches: batchCount,
        activeFarms: farmers,
        carbonOffset: "12.5 tons"
    });
});

module.exports = router;
