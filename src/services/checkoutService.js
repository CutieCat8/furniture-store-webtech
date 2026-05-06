const fs = require("fs/promises");
const path = require("path");

const ORDERS_PATH = path.join(
  __dirname,
  "..",
  "..",
  "data",
  "json",
  "orders.json"
);

async function getOrders() {
  try {
    const fileContents = await fs.readFile(ORDERS_PATH, "utf-8");
    const orders = JSON.parse(fileContents);

    if (!Array.isArray(orders)) {
      throw new Error("Orders data is not an array");
    }

    return orders;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function saveOrder(order) {
  const orders = await getOrders();
  orders.push(order);
  await fs.writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2));
}

module.exports = {
  saveOrder,
};
