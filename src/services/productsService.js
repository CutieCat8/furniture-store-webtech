const productsRepository = require("../repositories/productsRepository");

async function getAllProducts() {
  return productsRepository.getAllProducts();
}

async function getProductsByCategory(category) {
  // Filter products by a simple category check in the title.
  const products = await productsRepository.getAllProducts();
  const normalizedCategory = category.toLowerCase();

  return products.filter((product) => {
    if (!product || typeof product.title !== "string") {
      return false;
    }

    return product.title.toLowerCase().includes(normalizedCategory);
  });
}

module.exports = {
  getAllProducts,
  getProductsByCategory,
};
