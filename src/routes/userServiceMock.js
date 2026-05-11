const express = require("express");
const userServiceMockController = require("../controllers/userServiceMockController");

const router = express.Router();

router.post("/mock/user-service/verify", userServiceMockController.verifyUser);

module.exports = router;
