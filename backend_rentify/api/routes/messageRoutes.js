const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const verifyToken = require("../middleware/verifyToken");

// Create or get conversation
router.post("/conversations", verifyToken, chatController.getOrCreateConversation);

// Send message
router.post("/messages", verifyToken, chatController.sendMessage);

// Get user conversations
router.get("/conversations/:email", verifyToken, chatController.getUserConversations);

// Get conversation messages
router.get("/messages/:conversationId", verifyToken, chatController.getMessages);

module.exports = router;