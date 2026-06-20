const express = require("express");
const { register, login, validate } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/validate", requireAuth, validate);

module.exports = router;
