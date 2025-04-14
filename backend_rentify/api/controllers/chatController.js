const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

// Create or get conversation
const getOrCreateConversation = async (req, res) => {
  try {
    const { participant1, participant2 } = req.body;
    
    // Check if participants are the same
    if (participant1 === participant2) {
      return res.status(400).json({ message: "Cannot create conversation with yourself" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [participant1, participant2] }
    });

    // If not, create a new one
    if (!conversation) {
      conversation = new Conversation({
        participants: [participant1, participant2],
        lastMessage: null,
        updatedAt: new Date()
      });
      await conversation.save();
    }

    // Get participant details
    const participants = await User.find({
      email: { $in: [participant1, participant2] }
    }, 'name email photoURL');

    const participant1Info = participants.find(p => p.email === participant1);
    const participant2Info = participants.find(p => p.email === participant2);

    res.status(200).json({
      conversationId: conversation._id,
      participants: {
        [participant1]: participant1Info,
        [participant2]: participant2Info
      }
    });
  } catch (error) {
    console.error("Error in getOrCreateConversation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { conversationId, sender, text } = req.body;

    // Create new message
    const message = new Message({
      conversationId,
      sender,
      text,
      createdAt: new Date()
    });

    await message.save();

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date()
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all conversations for a user
const getUserConversations = async (req, res) => {
  try {
    const userEmail = req.params.email;
    
    const conversations = await Conversation.find({
      participants: userEmail
    })
    .sort({ updatedAt: -1 })
    .populate('lastMessage');

    // Get participant details for each conversation
    const populatedConversations = await Promise.all(
      conversations.map(async conv => {
        const otherParticipant = conv.participants.find(p => p !== userEmail);
        const user = await User.findOne({ email: otherParticipant }, 'name email photoURL');
        
        return {
          _id: conv._id,
          lastMessage: conv.lastMessage,
          updatedAt: conv.updatedAt,
          participant: user
        };
      })
    );

    res.status(200).json(populatedConversations);
  } catch (error) {
    console.error("Error in getUserConversations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get messages for a conversation
const getMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getOrCreateConversation,
  sendMessage,
  getUserConversations,
  getMessages
};