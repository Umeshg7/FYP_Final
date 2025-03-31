const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const verifyToken = require('../middleware/verifyToken');

router.get('/conversations', verifyToken, messageController.getConversations);
router.get('/:userId', verifyToken, messageController.getMessages);
router.post('/', verifyToken, messageController.sendMessage);

module.exports = router;