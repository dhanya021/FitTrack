const express = require('express');
const router = express.Router();
const {
  getActivities,
  logActivity,
  updateActivity,
  deleteActivity
} = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getActivities)
  .post(logActivity);

router.route('/:id')
  .put(updateActivity)
  .delete(deleteActivity);

module.exports = router;
