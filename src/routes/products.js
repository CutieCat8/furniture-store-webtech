const express = require("express");
const productsController = require("../controllers/productsController");

const router = express.Router();

// Request envelope: /api/products?category=hat
router.get("/products", productsController.getProducts);

module.exports = router;
