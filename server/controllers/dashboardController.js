const Workout = require('../models/Workout');
const Activity = require('../models/Activity');
const Water = require('../models/Water');
const Sleep = require('../models/Sleep');
const Goal = require('../models/Goal');
const User = require('../models/User');
const { calculateStreaks } = require('../utils/streakCalculator');

// @desc    Get aggregated dashboard summary statistics
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Today's date range (midnight to 23:59:59.999)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 7 days ago range
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Run parallel queries across MongoDB collections
    const [
      user,
      todayActivity,
      todayWorkouts,
      todayWaterEntries,
      todaySleep,
      weeklyWorkouts,
      weeklyActivities,
      allWorkouts,
      recentWorkouts,
      activeGoals
    ] = await Promise.all([
      User.findById(userId),
      Activity.findOne({ userId, date: { $gte: todayStart, $lte: todayEnd } }),
      Workout.find({ userId, date: { $gte: todayStart, $lte: todayEnd } }),
      Water.find({ userId, date: { $gte: todayStart, $lte: todayEnd } }),
      Sleep.findOne({ userId, date: { $gte: todayStart, $lte: todayEnd } }).sort({ date: -1 }),
      Workout.find({ userId, date: { $gte: sevenDaysAgo, $lte: todayEnd } }),
      Activity.find({ userId, date: { $gte: sevenDaysAgo, $lte: todayEnd } }).sort({ date: 1 }),
      Workout.find({ userId }).select('date'),
      Workout.find({ userId }).sort({ date: -1 }).limit(5),
      Goal.find({ userId, status: 'In Progress' }).limit(4)
    ]);

    // Calculate Today's Stats
    const todaySteps = todayActivity?.steps || 0;
    const todayWorkoutCalories = todayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const todayActivityCalories = todayActivity?.caloriesBurned || 0;
    const todayCaloriesBurned = todayWorkoutCalories + todayActivityCalories;

    const todayWaterIntake = todayWaterEntries.reduce((sum, w) => sum + (w.amount || 0), 0);
    const todaySleepDuration = todaySleep?.duration || 0;
    const todayWorkoutCount = todayWorkouts.length;
    const todayWorkoutMinutes = todayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const todayActiveMinutes = (todayActivity?.activeMinutes || 0) + todayWorkoutMinutes;

    // Calculate Streaks
    const workoutDates = allWorkouts.map((w) => w.date);
    const { currentStreak, longestStreak } = calculateStreaks(workoutDates);

    // Calculate Weekly summaries (past 7 days)
    const weeklyWorkoutCount = weeklyWorkouts.length;
    const weeklyWorkoutCalories = weeklyWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const weeklyActivityCalories = weeklyActivities.reduce((sum, a) => sum + (a.caloriesBurned || 0), 0);
    const weeklyTotalCalories = weeklyWorkoutCalories + weeklyActivityCalories;

    // Build 7-day trend chart data
    const chartMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      chartMap[dateKey] = {
        date: dateKey,
        day: dayName,
        steps: 0,
        calories: 0,
        activeMinutes: 0,
        workouts: 0
      };
    }

    weeklyActivities.forEach((act) => {
      const key = new Date(act.date).toISOString().split('T')[0];
      if (chartMap[key]) {
        chartMap[key].steps += act.steps || 0;
        chartMap[key].calories += act.caloriesBurned || 0;
        chartMap[key].activeMinutes += act.activeMinutes || 0;
      }
    });

    weeklyWorkouts.forEach((w) => {
      const key = new Date(w.date).toISOString().split('T')[0];
      if (chartMap[key]) {
        chartMap[key].calories += w.caloriesBurned || 0;
        chartMap[key].activeMinutes += w.duration || 0;
        chartMap[key].workouts += 1;
      }
    });

    const weeklyChartData = Object.values(chartMap);

    // Goal Progress with percentage
    const goalProgress = activeGoals.map((g) => {
      const goalObj = g.toObject();
      goalObj.percentage = goalObj.target > 0
        ? Math.min(100, Math.round((goalObj.current / goalObj.target) * 100))
        : 0;
      return goalObj;
    });

    res.status(200).json({
      success: true,
      data: {
        today: {
          steps: todaySteps,
          caloriesBurned: todayCaloriesBurned,
          waterIntake: todayWaterIntake,
          sleepDuration: todaySleepDuration,
          workoutCount: todayWorkoutCount,
          activeMinutes: todayActiveMinutes
        },
        streaks: {
          currentStreak,
          longestStreak
        },
        weekly: {
          workoutCount: weeklyWorkoutCount,
          caloriesBurned: weeklyTotalCalories
        },
        weeklyChartData,
        recentWorkouts,
        goalProgress,
        preferences: user?.preferences || {}
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardData };
