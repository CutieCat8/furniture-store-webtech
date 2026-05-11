const ordersService = require("../services/ordersService");

async function listOrders(req, res) {
  try {
    const email = String(req.query.email || "").trim() || null;
    const orders = await ordersService.listOrders(email);

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
    const deleted = await ordersService.deleteOrdersForEmail(email);
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
    const deleted = await ordersService.deleteSelectedOrders(orderIds, email);
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
