const express = require("express");
const authController = require("../controllers/authController");
const { createRateLimiter } = require("../middleware/rateLimit");

const router = express.Router();

const loginRateLimit = createRateLimiter({ windowMs: 60000, max: 10 });

router.post("/login", loginRateLimit, authController.login);
router.post("/register", authController.register);

module.exports = router;
