const express = require("express");
const cors = require("cors");
const productsRouter = require("./routes/products");
const authRouter = require("./routes/auth");
const checkoutRouter = require("./routes/checkout");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  })
);
app.use("/api", productsRouter);
app.use("/api", authRouter);
app.use("/api", checkoutRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

module.exports = app;
