const Activity = require('../models/Activity');

// @desc    Get user activity logs (filter by days: 7, 30, 90 or date)
// @route   GET /api/activity
// @access  Private
const getActivities = async (req, res, next) => {
  try {
    const { days = '7', date } = req.query;

    const query = { userId: req.user._id };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else {
      const numDays = parseInt(days, 10) || 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (numDays - 1));
      startDate.setHours(0, 0, 0, 0);
      query.date = { $gte: startDate };
    }

    const activities = await Activity.find(query).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log or update daily activity (upsert for same day)
// @route   POST /api/activity
// @access  Private
const logActivity = async (req, res, next) => {
  try {
    const { date, steps, distance, activeMinutes, caloriesBurned } = req.body;

    const activityDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(activityDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(activityDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if an activity document exists for this day
    let activity = await Activity.findOne({
      userId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (activity) {
      if (steps !== undefined) activity.steps = Number(steps);
      if (distance !== undefined) activity.distance = Number(distance);
      if (activeMinutes !== undefined) activity.activeMinutes = Number(activeMinutes);
      if (caloriesBurned !== undefined) activity.caloriesBurned = Number(caloriesBurned);
      activity = await activity.save();
    } else {
      activity = await Activity.create({
        userId: req.user._id,
        date: activityDate,
        steps: steps ? Number(steps) : 0,
        distance: distance ? Number(distance) : 0,
        activeMinutes: activeMinutes ? Number(activeMinutes) : 0,
        caloriesBurned: caloriesBurned ? Number(caloriesBurned) : 0
      });
    }

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update single activity log by ID
// @route   PUT /api/activity/:id
// @access  Private
const updateActivity = async (req, res, next) => {
  try {
    let activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found or unauthorized'
      });
    }

    const { date, steps, distance, activeMinutes, caloriesBurned } = req.body;

    if (date !== undefined) activity.date = new Date(date);
    if (steps !== undefined) activity.steps = Number(steps);
    if (distance !== undefined) activity.distance = Number(distance);
    if (activeMinutes !== undefined) activity.activeMinutes = Number(activeMinutes);
    if (caloriesBurned !== undefined) activity.caloriesBurned = Number(caloriesBurned);

    const updated = await activity.save();

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete activity log by ID
// @route   DELETE /api/activity/:id
// @access  Private
const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activity log deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
  logActivity,
  updateActivity,
  deleteActivity
};
