const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  deleteUser,
  makeAdmin,
  getAdminStatus,  // Changed from getAdmin
  updateUser,
  getUserProfile
} = require('../controllers/userControllers');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

// Admin-only routes
router.get('/', verifyToken, verifyAdmin, getAllUsers);
router.delete('/:id', verifyToken, verifyAdmin, deleteUser);
router.patch('/:id/admin', verifyToken, verifyAdmin, makeAdmin);  // Updated route pattern

// General user routes
router.post('/', createUser);
router.get('/:id/admin', verifyToken, getAdminStatus);  // Changed from /admin/:email

// User profile routes
router.get('/:id', verifyToken, getUserProfile);  // Changed from :uid to :id
router.patch('/:id', verifyToken, updateUser);    // Changed from :uid to :id

module.exports = router;