const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

// Admin-only routes
router.get('/', verifyToken, verifyAdmin, userController.getAllUsers);
router.delete('/:id', verifyToken, verifyAdmin, userController.deleteUser);
router.patch('/admin/:id', verifyToken, verifyAdmin, userController.makeAdmin);

// General user routes
router.post('/', userController.createUser); // Now accepts `age` in the request body
router.get('/admin/:email', verifyToken, userController.getAdmin);

module.exports = router;