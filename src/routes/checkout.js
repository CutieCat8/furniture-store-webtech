const express = require("express");
const checkoutController = require("../controllers/checkoutController");
const authMiddleware = require("../middleware/authMiddleware");
const { createRateLimiter } = require("../middleware/rateLimit");

const router = express.Router();

const checkoutRateLimit = createRateLimiter({ windowMs: 60000, max: 20 });

router.post(
	"/checkout",
	checkoutRateLimit,
	authMiddleware,
	checkoutController.checkout
);

module.exports = router;
