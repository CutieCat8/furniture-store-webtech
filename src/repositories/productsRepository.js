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
  const fileContents = await fs.readFile(PRODUCTS_PATH, "utf-8");
  const products = JSON.parse(fileContents);

  if (!Array.isArray(products)) {
    throw new Error("Products data is not an array");
  }

  return products;
}

module.exports = {
  getAllProducts,
};
