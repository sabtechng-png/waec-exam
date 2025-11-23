const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Keep both id and userId for compatibility
    const userId = decoded.userId || decoded.id;

    req.user = {
      id: userId,          // new standard field
      userId: userId,      // legacy support for /auth/me
      role: decoded.role,
      email: decoded.email || null
    };

    if (!req.user.id) {
      return res.status(401).json({ message: "Invalid token (no user id)" });
    }

    next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
