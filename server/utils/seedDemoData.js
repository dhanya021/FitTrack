const Workout = require('../models/Workout');
const Activity = require('../models/Activity');
const Water = require('../models/Water');
const Sleep = require('../models/Sleep');
const Goal = require('../models/Goal');

/**
 * Seeds realistic demonstration data for a given user.
 * Covers 14 to 21 days of history up to today.
 * 
 * @param {string|ObjectId} userId
 */
const seedDemoData = async (userId) => {
  // Clear any existing fitness records for this user
  await Promise.all([
    Workout.deleteMany({ userId }),
    Activity.deleteMany({ userId }),
    Water.deleteMany({ userId }),
    Sleep.deleteMany({ userId }),
    Goal.deleteMany({ userId })
  ]);

  const now = new Date();
  const workouts = [];
  const activities = [];
  const waterEntries = [];
  const sleepEntries = [];

  const workoutTemplates = [
    { name: 'Morning Upper Body Pump', type: 'Strength', duration: 50, caloriesBurned: 380, difficulty: 'Moderate', notes: 'Bench press, dumbbell rows, overhead press' },
    { name: 'Sunset Neighborhood Run', type: 'Running', duration: 35, caloriesBurned: 350, difficulty: 'Moderate', notes: 'Steady 5k pace around the park' },
    { name: 'High-Intensity Core Burn', type: 'HIIT', duration: 30, caloriesBurned: 320, difficulty: 'Hard', notes: 'Tabata intervals: burpees, mountain climbers' },
    { name: 'Power Leg Day', type: 'Strength', duration: 55, caloriesBurned: 420, difficulty: 'Hard', notes: 'Squats, Romanian deadlifts, lunges' },
    { name: 'Scenic Road Cycling', type: 'Cycling', duration: 60, caloriesBurned: 500, difficulty: 'Moderate', notes: 'Coastal bike path cadence ride' },
    { name: 'Mindful Vinyasa Flow', type: 'Yoga', duration: 45, caloriesBurned: 190, difficulty: 'Easy', notes: 'Hip openers and hamstring flexibility' },
    { name: 'Brisk Evening Walk', type: 'Walking', duration: 40, caloriesBurned: 180, difficulty: 'Easy', notes: 'Recovery walk listening to podcast' },
    { name: 'Cardio Kickboxing', type: 'Cardio', duration: 45, caloriesBurned: 410, difficulty: 'Hard', notes: 'Heavy bag rounds and footwork drills' }
  ];

  // Generate records for the past 14 days, including today (ensuring an active streak)
  for (let i = 13; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - i);
    targetDate.setHours(9, 30, 0, 0);

    // Workout on almost every day (except maybe day 4 and 10 for rest days, keeping last 4 consecutive for active streak)
    if (i !== 4 && i !== 10) {
      const template = workoutTemplates[(13 - i) % workoutTemplates.length];
      workouts.push({
        userId,
        name: template.name,
        type: template.type,
        date: targetDate,
        duration: template.duration + Math.floor(Math.random() * 10 - 5),
        caloriesBurned: template.caloriesBurned + Math.floor(Math.random() * 40 - 20),
        difficulty: template.difficulty,
        notes: template.notes
      });
    }

    // Daily Activity
    const steps = 7500 + Math.floor(Math.random() * 5000);
    const distance = parseFloat((steps * 0.00078).toFixed(2)); // ~0.78m per step in km
    const activeMins = 35 + Math.floor(Math.random() * 45);
    const calBurned = 350 + Math.floor(Math.random() * 350);

    activities.push({
      userId,
      date: targetDate,
      steps,
      distance,
      activeMinutes: activeMins,
      caloriesBurned: calBurned
    });

    // Sleep entry (for the night before targetDate)
    const bedtime = new Date(targetDate);
    bedtime.setHours(22 + (Math.random() > 0.5 ? 0 : 1), Math.floor(Math.random() * 45), 0, 0);
    bedtime.setDate(bedtime.getDate() - 1);

    const wakeTime = new Date(targetDate);
    wakeTime.setHours(6 + (Math.random() > 0.5 ? 1 : 0), Math.floor(Math.random() * 45), 0, 0);

    const sleepDurationHours = parseFloat(
      ((wakeTime - bedtime) / (1000 * 60 * 60)).toFixed(1)
    );

    const qualities = ['Good', 'Excellent', 'Fair', 'Good'];
    const quality = qualities[i % qualities.length];

    sleepEntries.push({
      userId,
      date: targetDate,
      bedtime,
      wakeTime,
      duration: sleepDurationHours,
      quality,
      notes: i % 3 === 0 ? 'Felt refreshed and recovered well' : 'Consistent uninterrupted sleep'
    });

    // Water entries (multiple glasses per day)
    const glasses = [250, 500, 500, 250, 500, 250];
    glasses.forEach((amt, glassIdx) => {
      const waterTime = new Date(targetDate);
      waterTime.setHours(8 + glassIdx * 2, 15, 0, 0);
      waterEntries.push({
        userId,
        date: targetDate,
        amount: amt,
        timestamp: waterTime
      });
    });
  }

  // Pre-configured fitness goals
  const goals = [
    {
      userId,
      title: 'Daily Step Milestone',
      category: 'Steps',
      target: 10000,
      current: 8850,
      unit: 'steps',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'In Progress'
    },
    {
      userId,
      title: 'Consistent Weekly Workouts',
      category: 'Workouts',
      target: 5,
      current: 4,
      unit: 'workouts',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'In Progress'
    },
    {
      userId,
      title: 'Optimal Daily Hydration',
      category: 'Water',
      target: 2500,
      current: 2250,
      unit: 'ml',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'In Progress'
    },
    {
      userId,
      title: 'Sleep Recovery Target',
      category: 'Sleep',
      target: 8,
      current: 7.6,
      unit: 'hrs',
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'In Progress'
    },
    {
      userId,
      title: 'Monthly Distance Challenge',
      category: 'Distance',
      target: 100,
      current: 100,
      unit: 'km',
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'Completed'
    }
  ];

  await Promise.all([
    Workout.insertMany(workouts),
    Activity.insertMany(activities),
    Water.insertMany(waterEntries),
    Sleep.insertMany(sleepEntries),
    Goal.insertMany(goals)
  ]);

  return {
    workoutsCount: workouts.length,
    activitiesCount: activities.length,
    waterEntriesCount: waterEntries.length,
    sleepEntriesCount: sleepEntries.length,
    goalsCount: goals.length
  };
};

module.exports = { seedDemoData };
