const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header is present
  if (!authHeader) {
    console.error('Unauthorized access: No token provided');
    return res.status(401).json({ message: "Unauthorized access: No token provided" });
  }

  // Extract token from header
  const token = authHeader.split(" ")[1];

  // Check if token is present
  if (!token) {
    console.error('Unauthorized access: Invalid token format');
    return res.status(401).json({ message: "Unauthorized access: Invalid token format" });
  }

  // Verify the token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.error('Forbidden: Invalid token', err);
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }

    // Attach decoded user info to the request object
    req.decoded = decoded;
    console.log('Token verified successfully:', decoded); // Log decoded payload
    next();
  });
};

module.exports = verifyToken;