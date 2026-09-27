const Water = require('../models/Water');
const User = require('../models/User');

// @desc    Get water logs (by date or date range)
// @route   GET /api/water
// @access  Private
const getWaterEntries = async (req, res, next) => {
  try {
    const { date, days = '7' } = req.query;

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

    const entries = await Water.find(query).sort({ timestamp: -1 });

    // Calculate today's total
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayEntries = await Water.find({
      userId: req.user._id,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    const todayTotal = todayEntries.reduce((acc, curr) => acc + curr.amount, 0);
    const user = await User.findById(req.user._id);
    const waterGoal = user?.preferences?.waterGoal || 2500;
    const progressPercentage = Math.min(
      100,
      Math.round((todayTotal / waterGoal) * 100)
    );

    res.status(200).json({
      success: true,
      data: {
        entries,
        todayTotal,
        waterGoal,
        progressPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log a water entry
// @route   POST /api/water
// @access  Private
const addWaterEntry = async (req, res, next) => {
  try {
    const { amount, date } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid water amount in ml'
      });
    }

    const entryDate = date ? new Date(date) : new Date();

    const water = await Water.create({
      userId: req.user._id,
      date: entryDate,
      amount: Number(amount),
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: water
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a water entry
// @route   DELETE /api/water/:id
// @access  Private
const deleteWaterEntry = async (req, res, next) => {
  try {
    const water = await Water.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!water) {
      return res.status(404).json({
        success: false,
        message: 'Water entry not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Water entry deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWaterEntries,
  addWaterEntry,
  deleteWaterEntry
};
