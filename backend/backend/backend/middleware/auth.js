const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateCustomer(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Authentication is not configured"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.customer = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token"
    });
  }
}

module.exports = authenticateCustomer;
