const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  deleteUser,
  makeAdmin,
  getAdminStatus,
  updateUser,
  getUserProfile
} = require('../controllers/userControllers');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const User = require('../models/User'); // Add this import

// Admin-only routes
router.get('/', verifyToken, verifyAdmin, getAllUsers);
router.delete('/:id', verifyToken, verifyAdmin, deleteUser);
router.patch('/:id/admin', verifyToken, verifyAdmin, makeAdmin);

// General user routes
router.post('/', createUser);
router.get('/:id/admin', verifyToken, getAdminStatus);

// User profile routes
router.get('/:id', getUserProfile);
router.patch('/:id', verifyToken, updateUser);



module.exports = router;