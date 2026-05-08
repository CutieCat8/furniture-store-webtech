const ordersService = require("../services/ordersService");

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

async function listOrders(req, res) {
  try {
    const email = String(req.query.email || "").trim() || null;
    const rows = await ordersService.queryOrdersByEmail(email);
    const orders = groupOrders(rows);

    return res.status(200).json({
      status: "success",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Failed to load orders",
    });
  }
}

async function deleteOrdersForEmail(req, res) {
  const email = String(req.query.email || "").trim();
  if (!email) {
    return res.status(400).json({
      status: "fail",
      message: "Email is required",
    });
  }

  try {
    const deleted = await ordersService.deleteOrdersByEmail(email);
    return res.status(200).json({
      status: "success",
      deleted,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Failed to delete orders",
    });
  }
}

async function deleteSelectedOrders(req, res) {
  const orderIds = Array.isArray(req.body.orderIds) ? req.body.orderIds : [];
  const email = String(req.body.email || "").trim() || null;

  if (!orderIds.length) {
    return res.status(400).json({
      status: "fail",
      message: "orderIds are required",
    });
  }

  try {
    const deleted = await ordersService.deleteOrdersByIds(orderIds, email);
    return res.status(200).json({
      status: "success",
      deleted,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Failed to delete orders",
    });
  }
}

module.exports = {
  listOrders,
  deleteOrdersForEmail,
  deleteSelectedOrders,
};
