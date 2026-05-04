const productsService = require("../services/productsService");

async function getProducts(req, res) {
  try {
    // Envelope: read the category sent from the client.
    const category = String(req.query.category || "").toLowerCase();

    // Gatekeeper: only allow the "hat" category for this assignment flow.
    if (category !== "hat") {
      return res.status(400).json({
        status: "fail",
        message: "Gatekeeper rejected request",
      });
    }

    // Package: fetch data and return success status.
    const products = await productsService.getProductsByCategory(category);
    return res.status(200).json({
      status: "success",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Failed to load products",
    });
  }
}

module.exports = {
  getProducts,
};
