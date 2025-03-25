const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) throw new Error();
    
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Please authenticate' });
  }
};

// Authorization middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }
    next();
  };
};