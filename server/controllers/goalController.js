const Goal = require('../models/Goal');

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const { category, status } = req.query;
    const query = { userId: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const goals = await Goal.find(query).sort({ createdAt: -1 });

    // Append calculated percentage
    const goalsWithPercentage = goals.map((goal) => {
      const g = goal.toObject();
      const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
      return {
        ...g,
        percentage: pct
      };
    });

    res.status(200).json({
      success: true,
      count: goalsWithPercentage.length,
      data: goalsWithPercentage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const { title, category, target, current = 0, unit, deadline, status = 'In Progress' } = req.body;

    if (!title || !category || target === undefined || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, category, target value, and unit'
      });
    }

    const initialCurrent = Number(current);
    const initialTarget = Number(target);
    const resolvedStatus = initialCurrent >= initialTarget ? 'Completed' : status;

    const goal = await Goal.create({
      userId: req.user._id,
      title,
      category,
      target: initialTarget,
      current: initialCurrent,
      unit,
      deadline: deadline ? new Date(deadline) : null,
      status: resolvedStatus
    });

    const goalObj = goal.toObject();
    goalObj.percentage = Math.min(100, Math.round((goalObj.current / goalObj.target) * 100));

    res.status(201).json({
      success: true,
      data: goalObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal (details or progress)
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or unauthorized'
      });
    }

    const { title, category, target, current, unit, deadline, status } = req.body;

    if (title !== undefined) goal.title = title;
    if (category !== undefined) goal.category = category;
    if (target !== undefined) goal.target = Number(target);
    if (current !== undefined) goal.current = Number(current);
    if (unit !== undefined) goal.unit = unit;
    if (deadline !== undefined) goal.deadline = deadline ? new Date(deadline) : null;
    
    // Auto complete if current reaches or exceeds target, unless manually set
    if (status !== undefined) {
      goal.status = status;
    } else if (goal.current >= goal.target) {
      goal.status = 'Completed';
    }

    const updated = await goal.save();
    const goalObj = updated.toObject();
    goalObj.percentage = Math.min(100, Math.round((goalObj.current / goalObj.target) * 100));

    res.status(200).json({
      success: true,
      data: goalObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
};
