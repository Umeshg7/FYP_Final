const Message = require('../models/BotMessage');

// Create a new message
exports.createMessage = async (req, res) => {
  try {
    const { key, value } = req.body;
    
    const newMessage = new Message({
      key,
      value
    });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'This key already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Get all messages
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single message by key
exports.getMessageByKey = async (req, res) => {
  try {
    const message = await Message.findOne({ key: req.params.key });
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a message
exports.updateMessage = async (req, res) => {
  try {
    const { value } = req.body;
    const updatedMessage = await Message.findOneAndUpdate(
      { key: req.params.key },
      { value },
      { new: true }
    );
    
    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const deletedMessage = await Message.findOneAndDelete({ key: req.params.key });
    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};