const User = require("../models/User");

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-__v -createdAt -updatedAt -password');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @desc    Create new user (with Firebase UID)
 * @route   POST /api/users
 * @access  Public
 */
const createUser = async (req, res) => {
  try {
    const { _id, email } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ 
      $or: [{ _id }, { email }] 
    });

    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: "User already exists",
        data: existingUser
      });
    }

    // Create new user
    const newUser = await User.create({
      _id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "User creation failed",
      error: error.message
    });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-__v -createdAt -updatedAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Authorization check
    if (req.user._id !== user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this profile"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PATCH /api/users/:id
 * @access  Private
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Authorization check
    if (req.user._id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this profile"
      });
    }

    // Field validation
    const allowedUpdates = ['name', 'photoURL', 'phone', 'address', 'age'];
    const invalidUpdates = Object.keys(updates).filter(
      update => !allowedUpdates.includes(update)
    );

    if (invalidUpdates.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid updates attempted",
        invalidFields: invalidUpdates,
        allowedFields: allowedUpdates
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-__v -createdAt');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: error.message
    });
  }
};

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "User deletion failed",
      error: error.message
    });
  }
};

/**
 * @desc    Check admin status by user ID
 * @route   GET /api/users/:id/admin
 * @access  Private
 */
// In your userControllers.js
const getAdminStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      isAdmin: user.role === 'admin'
    });
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @desc    Make user admin (Admin only)
 * @route   PATCH /api/users/:id/admin
 * @access  Private/Admin
 */
// userControllers.js
const makeAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update role to admin
    user.role = 'admin';
    await user.save();

    res.status(200).json({
      success: true,
      message: `${user.name} is now an admin`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserProfile,
  updateUser,
  deleteUser,
  getAdminStatus,
  makeAdmin
};