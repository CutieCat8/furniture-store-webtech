const express = require("express");
const productsRouter = require("./routes/products");

const app = express();

app.use(express.json());
app.use("/api", productsRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

module.exports = app;
