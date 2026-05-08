const express = require("express");
const ordersController = require("../controllers/ordersController");

const router = express.Router();

router.get("/orders", ordersController.listOrders);
router.delete("/orders", ordersController.deleteOrdersForEmail);
router.delete("/orders/selected", ordersController.deleteSelectedOrders);

module.exports = router;
