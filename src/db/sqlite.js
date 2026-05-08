const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "..", "..", "store.db");

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error("Failed to connect to store.db", error);
  }
});

db.serialize(() => {
  // Create orders table for checkout history if it does not exist.
  db.run(
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      total_price REAL NOT NULL,
      created_at TEXT NOT NULL
    )`
  );

  // Add order_id column if an existing table is missing it.
  db.all("PRAGMA table_info(orders)", (error, columns) => {
    if (error || !Array.isArray(columns)) {
      return;
    }

    const hasOrderId = columns.some((column) => column.name === "order_id");
    if (!hasOrderId) {
      db.run("ALTER TABLE orders ADD COLUMN order_id TEXT");
    }
  });
});

module.exports = db;
