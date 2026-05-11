const ordersRepository = require("../repositories/ordersRepository");

function normalizeNumber(value) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.]/g, "");
    return Number.parseFloat(cleaned) || 0;
  }

  return 0;
}

async function saveOrder(order) {
  const createdAt = new Date().toISOString();
  const items = Array.isArray(order.items) ? order.items : [];
  const orderId = order.orderId || `ord-${Date.now()}`;

  const normalizedItems = items.map((item) => {
    const quantity = Number(item.quantity) || 0;
    const price = normalizeNumber(item.price);
    const totalPrice = price * quantity;

    return {
      productId: item.id,
      quantity,
      totalPrice: Number(totalPrice.toFixed(2)),
    };
  });

  await ordersRepository.insertOrderItems(
    orderId,
    order.userId,
    normalizedItems,
    createdAt
  );
}

module.exports = {
  saveOrder,
};
