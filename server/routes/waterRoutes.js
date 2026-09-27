const express = require('express');
const router = express.Router();
const {
  getWaterEntries,
  addWaterEntry,
  deleteWaterEntry
} = require('../controllers/waterController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getWaterEntries)
  .post(addWaterEntry);

router.route('/:id')
  .delete(deleteWaterEntry);

module.exports = router;
