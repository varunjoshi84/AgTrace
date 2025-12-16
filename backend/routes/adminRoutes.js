const express = require('express');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { generateReportStream } = require('../utils/reportStream');
const User = require('../models/User');

const router = express.Router();

/**
 * GET /api/admin/users
 * List all users (Admin only)
 */
router.get('/users', auth, role('Admin'), async (req, res, next) => {
  try {
    const users = await User.find({}, { password: 0 }).lean(); // Exclude passwords
    res.json(users);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user (Admin only)
 */
router.delete('/users/:id', auth, role('Admin'), async (req, res, next) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/report
router.get('/report', auth, role('Admin'), async (req, res, next) => {
  try {
    const gzStream = await generateReportStream();
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', 'attachment; filename="report.csv.gz"');
    gzStream.pipe(res);      // streaming response
  } catch (err) {
    next(err);
  }
});

module.exports = router;
