// =====================================================
// UPDATED adminUploadsRoutes.js
// Clean + Optimized for STEM image upload only
// =====================================================

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const auth = require("../middleware/authMiddleware");

// -----------------------------------------------------
// Ensure uploads folder exists
// -----------------------------------------------------
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// -----------------------------------------------------
// Multer storage (disk-based)
// -----------------------------------------------------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),

  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9-_]/gi, "_");

    const final = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}_${base}${ext}`;

    cb(null, final);
  },
});

// -----------------------------------------------------
// Only allow real image types
// -----------------------------------------------------
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];
    cb(allowed.includes(file.mimetype) ? null : new Error("Invalid image type"));
  },
});

// -----------------------------------------------------
// POST /admin/uploads/image
// Upload STEM image for question
// -----------------------------------------------------
router.post("/image", auth, upload.single("file"), (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    return res.json({ url });
  } catch (err) {
    console.error("Image upload error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
