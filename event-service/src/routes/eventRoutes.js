const express = require("express");
const multer = require("multer");
const { create, list, detail, reserve } = require("../controllers/eventController");
const { requireAuth, requireAdmin, requireServiceToken } = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    return cb(null, true);
  }
});

router.get("/", list);
router.get("/:id", detail);
router.post("/", requireAuth, requireAdmin, upload.single("poster"), create);

// Internal endpoint used by booking-service to reserve seats.
router.post("/:id/reserve", requireServiceToken, reserve);

module.exports = router;
