const fs = require("fs/promises");
const path = require("path");

const PRODUCTS_PATH = path.join(
  __dirname,
  "..",
  "..",
  "data",
  "json",
  "products.json"
);

async function getAllProducts() {
  // Read local JSON file that stores product data.
  const fileContents = await fs.readFile(PRODUCTS_PATH, "utf-8");
  const products = JSON.parse(fileContents);

  if (!Array.isArray(products)) {
    throw new Error("Products data is not an array");
  }

  return products;
}

async function getProductsByCategory(category) {
  // Filter products by a simple category check in the title.
  const products = await getAllProducts();
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
