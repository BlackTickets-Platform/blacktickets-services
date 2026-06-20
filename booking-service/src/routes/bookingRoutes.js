const express = require("express");
const { create, list, detail } = require("../controllers/bookingController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", requireAuth, create);
router.get("/", requireAuth, list);
router.get("/:id", requireAuth, detail);

module.exports = router;
