const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from Authorization header (Bearer <token>)
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check if Authorization header exists and starts with 'Bearer'
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Handle missing token case
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // 3. Verify JWT token using secret key
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach decoded token payload (userId, email, role) to req.user
      req.user = decoded;

      return next();
    } catch (err) {
      // Handle specific JWT error cases
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please log in again.',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid token authentication failed.',
      });
    }
  } catch (error) {
    next(error);
  }
};
