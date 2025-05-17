const express = require('express');
const router = express.Router();
const messageController = require('../controllers/BotMessageController');

router.post('/', messageController.createMessage);
router.get('/', messageController.getAllMessages);
router.get('/:key', messageController.getMessageByKey);
router.put('/:key', messageController.updateMessage);
router.delete('/:key', messageController.deleteMessage);

module.exports = router;