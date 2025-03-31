const Message = require('../models/Message');
const User = require('../models/User');

// Get all conversations for current user
const getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user._id },
            { receiverId: req.user._id }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", req.user._id] },
              "$receiverId",
              "$senderId"
            ]
          },
          lastMessage: { $last: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$receiverId", req.user._id] },
                  { $eq: ["$read", false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      { $sort: { "lastMessage.createdAt": -1 } }
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get messages between current user and another user
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user._id }
      ]
    }).sort('createdAt');

    // Mark messages as read
    await Message.updateMany(
      { 
        senderId: req.params.userId, 
        receiverId: req.user._id,
        read: false 
      },
      { $set: { read: true } }
    );

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    const message = new Message({
      senderId: req.user._id,
      receiverId,
      content
    });

    await message.save();

    // Emit real-time event if using Socket.io
    // io.to(receiverId).emit('newMessage', message);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage
};