const productsService = require("../services/productsService");

async function getProducts(req, res) {
  try {
    const products = await productsService.getAllProducts();
    res.status(200).json({
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load products",
    });
  }
}

module.exports = {
  getProducts,
};
