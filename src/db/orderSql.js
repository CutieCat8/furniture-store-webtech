const INSERT_ORDER_SQL = `
  INSERT INTO orders (order_id, user_id, product_id, quantity, total_price, created_at)
  VALUES (?, ?, ?, ?, ?, ?);
`;

module.exports = {
  INSERT_ORDER_SQL,
};
