const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
// Create or get conversation
router.post("/conversations", chatController.getOrCreateConversation);

// Send message
router.post("/messages", chatController.sendMessage);

// Get user conversations
router.get("/conversations/:email", chatController.getUserConversations);

// Get conversation messages
router.get("/messages/:conversationId", chatController.getMessages);

module.exports = router;