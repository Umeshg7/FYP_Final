const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// Get all notifications for user
const getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .populate('relatedBooking')
      .populate('relatedItem');

    res.json({ notifications });
  } catch (error) {
    console.error('Notification fetch error:', {
      error: error.message,
      userId: req.query.userId,
      time: new Date().toISOString()
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { userId, message, link, type, relatedBooking, relatedItem } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const notification = await Notification.create({
      userId,
      message,
      link,
      type,
      relatedBooking,
      relatedItem
    });

    res.status(201).json({ notification });
  } catch (error) {
    console.error('Notification creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ notification });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




const broadcastNotification = async (req, res) => {
    try {
      const { message, link } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }
  
      // Get all user IDs
      const users = await User.find({}, '_id');
      const userIds = users.map(user => user._id);
  
      // Create notifications for all users
      const notifications = userIds.map(userId => ({
        userId,
        message,
        link: link || null,
        type: 'admin_broadcast',
        isRead: false
      }));
  
      await Notification.insertMany(notifications);
  
      res.status(201).json({ 
        success: true, 
        message: `Notification sent to ${userIds.length} users` 
      });
    } catch (error) {
      console.error('Broadcast error:', error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const count = await Notification.countDocuments({
      userId,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};