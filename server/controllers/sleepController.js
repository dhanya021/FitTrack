const Sleep = require('../models/Sleep');
const User = require('../models/User');

// Helper to calculate duration in hours
const calculateDuration = (bedtime, wakeTime) => {
  const bed = new Date(bedtime);
  const wake = new Date(wakeTime);
  let diffMs = wake - bed;
  if (diffMs < 0) {
    // If wake time is earlier clock time than bedtime, assume cross-midnight (e.g. 11pm to 7am)
    diffMs += 24 * 60 * 60 * 1000;
  }
  const hours = diffMs / (1000 * 60 * 60);
  return parseFloat(hours.toFixed(1));
};

// @desc    Get sleep history & statistics
// @route   GET /api/sleep
// @access  Private
const getSleepEntries = async (req, res, next) => {
  try {
    const { days = '7' } = req.query;
    const numDays = parseInt(days, 10) || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (numDays - 1));
    startDate.setHours(0, 0, 0, 0);

    const sleepLogs = await Sleep.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const allUserSleep = await Sleep.find({ userId: req.user._id });
    const totalDuration = allUserSleep.reduce((acc, curr) => acc + curr.duration, 0);
    const averageSleep = allUserSleep.length > 0
      ? parseFloat((totalDuration / allUserSleep.length).toFixed(1))
      : 0;

    const user = await User.findById(req.user._id);
    const sleepGoal = user?.preferences?.sleepGoal || 8;

    res.status(200).json({
      success: true,
      data: {
        sleepLogs,
        averageSleep,
        sleepGoal,
        totalEntries: allUserSleep.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new sleep log
// @route   POST /api/sleep
// @access  Private
const createSleepEntry = async (req, res, next) => {
  try {
    const { date, bedtime, wakeTime, quality, notes } = req.body;

    if (!bedtime || !wakeTime || !quality) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bedtime, wake time, and sleep quality'
      });
    }

    const duration = calculateDuration(bedtime, wakeTime);

    const sleep = await Sleep.create({
      userId: req.user._id,
      date: date ? new Date(date) : new Date(),
      bedtime: new Date(bedtime),
      wakeTime: new Date(wakeTime),
      duration,
      quality,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      data: sleep
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sleep log
// @route   PUT /api/sleep/:id
// @access  Private
const updateSleepEntry = async (req, res, next) => {
  try {
    let sleep = await Sleep.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!sleep) {
      return res.status(404).json({
        success: false,
        message: 'Sleep log not found or unauthorized'
      });
    }

    const { date, bedtime, wakeTime, quality, notes } = req.body;

    if (date !== undefined) sleep.date = new Date(date);
    if (bedtime !== undefined) sleep.bedtime = new Date(bedtime);
    if (wakeTime !== undefined) sleep.wakeTime = new Date(wakeTime);
    if (quality !== undefined) sleep.quality = quality;
    if (notes !== undefined) sleep.notes = notes;

    // Recalculate duration if times changed
    if (bedtime !== undefined || wakeTime !== undefined) {
      sleep.duration = calculateDuration(sleep.bedtime, sleep.wakeTime);
    }

    const updated = await sleep.save();

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sleep log
// @route   DELETE /api/sleep/:id
// @access  Private
const deleteSleepEntry = async (req, res, next) => {
  try {
    const sleep = await Sleep.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!sleep) {
      return res.status(404).json({
        success: false,
        message: 'Sleep log not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sleep log deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSleepEntries,
  createSleepEntry,
  updateSleepEntry,
  deleteSleepEntry
};
