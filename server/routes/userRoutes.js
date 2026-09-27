const express = require('express');
const router = express.Router();
const {
  updateProfile,
  updateSettings,
  populateDemoData
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.put('/profile', updateProfile);
router.put('/settings', updateSettings);
router.post('/demo-data', populateDemoData);

module.exports = router;
