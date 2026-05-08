const db = require("../db/sqlite");
const { INSERT_ORDER_SQL } = require("../db/orderSql");

function runQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve(this);
    });
  });
}

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

  const inserts = items.map((item) => {
    const quantity = Number(item.quantity) || 0;
    const price = normalizeNumber(item.price);
    const totalPrice = price * quantity;

    return runQuery(INSERT_ORDER_SQL, [
      orderId,
      order.userId,
      item.id,
      quantity,
      Number(totalPrice.toFixed(2)),
      createdAt,
    ]);
  });

  await Promise.all(inserts);
}

module.exports = {
  saveOrder,
};
