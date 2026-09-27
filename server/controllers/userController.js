const User = require('../models/User');
const { seedDemoData } = require('../utils/seedDemoData');

// @desc    Update user profile (name, email, password)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, email, currentPassword, newPassword } = req.body;

    if (name) user.name = name;
    if (email) {
      const emailLower = email.toLowerCase();
      if (emailLower !== user.email) {
        const emailExists = await User.findOne({ email: emailLower });
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Email is already in use by another account'
          });
        }
        user.email = emailLower;
      }
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password'
        });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match'
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }
      user.password = newPassword;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        preferences: updatedUser.preferences,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user settings / preferences
// @route   PUT /api/users/settings
// @access  Private
const updateSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const {
      dailyStepGoal,
      waterGoal,
      sleepGoal,
      weeklyWorkoutGoal,
      unitPreference,
      theme
    } = req.body;

    if (dailyStepGoal !== undefined) user.preferences.dailyStepGoal = Number(dailyStepGoal);
    if (waterGoal !== undefined) user.preferences.waterGoal = Number(waterGoal);
    if (sleepGoal !== undefined) user.preferences.sleepGoal = Number(sleepGoal);
    if (weeklyWorkoutGoal !== undefined) user.preferences.weeklyWorkoutGoal = Number(weeklyWorkoutGoal);
    if (unitPreference !== undefined) user.preferences.unitPreference = unitPreference;
    if (theme !== undefined) user.preferences.theme = theme;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings saved successfully',
      data: updatedUser.preferences
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed realistic demonstration data for current user
// @route   POST /api/users/demo-data
// @access  Private
const populateDemoData = async (req, res, next) => {
  try {
    const result = await seedDemoData(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Realistic demo fitness records generated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  updateSettings,
  populateDemoData
};
