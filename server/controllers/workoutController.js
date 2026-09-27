const Workout = require('../models/Workout');

// @desc    Get all workouts for authenticated user (with search, filter, sort)
// @route   GET /api/workouts
// @access  Private
const getWorkouts = async (req, res, next) => {
  try {
    const { search, type, difficulty, sortBy = 'date', order = 'desc' } = req.query;

    const query = { userId: req.user._id };

    // Search by name or notes
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { notes: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Filter by type
    if (type && type !== 'All') {
      query.type = type;
    }

    // Filter by difficulty
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    // Sort order
    const sortField = ['date', 'duration', 'caloriesBurned', 'name'].includes(sortBy)
      ? sortBy
      : 'date';
    const sortOrder = order === 'asc' ? 1 : -1;

    const workouts = await Workout.find(query).sort({ [sortField]: sortOrder });

    res.status(200).json({
      success: true,
      count: workouts.length,
      data: workouts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workout by ID
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res, next) => {
  try {
    const { name, type, date, duration, caloriesBurned, difficulty, notes } = req.body;

    if (!name || !type || duration === undefined || caloriesBurned === undefined || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, type, duration, caloriesBurned, difficulty)'
      });
    }

    const workout = await Workout.create({
      userId: req.user._id,
      name,
      type,
      date: date ? new Date(date) : new Date(),
      duration: Number(duration),
      caloriesBurned: Number(caloriesBurned),
      difficulty,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      data: workout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res, next) => {
  try {
    let workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found or unauthorized'
      });
    }

    const { name, type, date, duration, caloriesBurned, difficulty, notes } = req.body;

    if (name !== undefined) workout.name = name;
    if (type !== undefined) workout.type = type;
    if (date !== undefined) workout.date = new Date(date);
    if (duration !== undefined) workout.duration = Number(duration);
    if (caloriesBurned !== undefined) workout.caloriesBurned = Number(caloriesBurned);
    if (difficulty !== undefined) workout.difficulty = difficulty;
    if (notes !== undefined) workout.notes = notes;

    const updatedWorkout = await workout.save();

    res.status(200).json({
      success: true,
      data: updatedWorkout
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Workout deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout
};
