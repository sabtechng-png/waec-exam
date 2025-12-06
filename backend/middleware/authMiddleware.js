// =======================================
// OPTIMIZED AUTH MIDDLEWARE (FINAL VERSION)
// =======================================

const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // ------------------------------
    // 1. Check for missing token
    // ------------------------------
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // ------------------------------
    // 2. Verify token once (fast)
    // ------------------------------
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Maintain backward compatibility:
    // Some older tokens use decoded.id, new ones use decoded.userId
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token (no user id)" });
    }

    // ------------------------------
    // 3. Attach decoded user to req
    // ------------------------------
    req.user = {
      id: userId,              // main field used by ALL new routes
      userId: userId,          // legacy field used by older routes
      role: decoded.role || "student",
      email: decoded.email || null,
    };

    return next();

  } catch (err) {
    console.error("authMiddleware error:", err.message || err);

    // Expired / invalid token
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

module.exports = authMiddleware;
