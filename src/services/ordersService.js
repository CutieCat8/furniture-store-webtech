const ordersRepository = require("../repositories/ordersRepository");

function groupOrders(rows) {
  const ordersById = new Map();

  rows.forEach((row) => {
    const orderId = row.order_id || `legacy-${row.row_id}`;
    if (!ordersById.has(orderId)) {
      ordersById.set(orderId, {
        orderId,
        email: row.user_id,
        createdAt: row.created_at,
        total: 0,
        items: [],
      });
    }

    const order = ordersById.get(orderId);
    const lineTotal = Number(row.total_price) || 0;
    order.total += lineTotal;
    order.items.push({
      productId: row.product_id,
      quantity: Number(row.quantity) || 0,
      totalPrice: lineTotal,
    });
  });

  return Array.from(ordersById.values()).map((order) => ({
    ...order,
    total: Number(order.total.toFixed(2)),
  }));
}

async function listOrders(email) {
  const rows = await ordersRepository.queryOrdersByEmail(email);
  return groupOrders(rows);
}

async function deleteOrdersForEmail(email) {
  return ordersRepository.deleteOrdersByEmail(email);
}

async function deleteSelectedOrders(orderIds, email) {
  return ordersRepository.deleteOrdersByIds(orderIds, email);
}

module.exports = {
  listOrders,
  deleteOrdersForEmail,
  deleteSelectedOrders,
};
