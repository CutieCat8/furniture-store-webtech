const db = require("../db/sqlite");
const { INSERT_ORDER_SQL } = require("../db/orderSql");

function runQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve(this.changes || 0);
    });
  });
}

function queryOrdersByEmail(email) {
  const sql =
    "SELECT rowid as row_id, order_id, user_id, product_id, quantity, total_price, created_at FROM orders " +
    "WHERE (? IS NULL OR user_id = ?) ORDER BY created_at DESC";
  const params = [email || null, email || null];

  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows || []);
    });
  });
}

function insertOrderItems(orderId, userId, items, createdAt) {
  const inserts = items.map((item) =>
    runQuery(INSERT_ORDER_SQL, [
      orderId,
      userId,
      item.productId,
      item.quantity,
      item.totalPrice,
      createdAt,
    ])
  );

  return Promise.all(inserts);
}

function deleteOrdersByEmail(email) {
  return runQuery("DELETE FROM orders WHERE user_id = ?", [email]);
}

function deleteOrdersByIds(orderIds, email) {
  const legacyRowIds = orderIds
    .filter((id) => typeof id === "string" && id.startsWith("legacy-"))
    .map((id) => Number(id.replace("legacy-", "")))
    .filter((id) => Number.isFinite(id));

  const standardOrderIds = orderIds.filter(
    (id) => typeof id === "string" && !id.startsWith("legacy-")
  );

  const tasks = [];

  if (standardOrderIds.length) {
    const placeholders = standardOrderIds.map(() => "?").join(",");
    const sql = `DELETE FROM orders WHERE order_id IN (${placeholders})${
      email ? " AND user_id = ?" : ""
    }`;
    const params = email ? [...standardOrderIds, email] : standardOrderIds;
    tasks.push(runQuery(sql, params));
  }

  if (legacyRowIds.length) {
    const placeholders = legacyRowIds.map(() => "?").join(",");
    const sql = `DELETE FROM orders WHERE rowid IN (${placeholders})${
      email ? " AND user_id = ?" : ""
    }`;
    const params = email ? [...legacyRowIds, email] : legacyRowIds;
    tasks.push(runQuery(sql, params));
  }

  return Promise.all(tasks).then((changes) =>
    changes.reduce((sum, value) => sum + value, 0)
  );
}

module.exports = {
  queryOrdersByEmail,
  insertOrderItems,
  deleteOrdersByEmail,
  deleteOrdersByIds,
};
