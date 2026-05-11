const checkoutService = require("../services/checkoutService");
const productsService = require("../services/productsService");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCartItems(items, productsById) {
  if (!Array.isArray(items) || items.length === 0) {
    return "Cart is empty";
  }

  if (items.length > 50) {
    return "Cart has too many items";
  }

  for (const item of items) {
    const product = productsById[item.id];
    const quantity = Number(item.quantity);

    if (!product) {
      return "Cart item product is invalid";
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return "Cart item quantity is invalid";
    }
  }

  return null;
}

function calculateTotal(items, productsById) {
  return items.reduce((sum, item) => {
    const product = productsById[item.id];
    const price = Number(product.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + price * quantity;
  }, 0);
}

function buildServerCartItems(items, productsById) {
  return items.map((item) => {
    const product = productsById[item.id];
    return {
      id: item.id,
      title: product.title || "Product",
      price: product.price,
      quantity: Number(item.quantity) || 0,
    };
  });
}

async function checkout(req, res) {
  const { cartItems, email, cardNumber } = req.body || {};
  const errors = {};
  const authEmail = req.user && req.user.email ? String(req.user.email) : null;
  const resolvedEmail = authEmail || email;
  const products = await productsService.getAllProducts();
  const productsById = products.reduce((acc, product) => {
    acc[product.id] = product;
    return acc;
  }, {});

  // Gatekeeper 1: cart must contain items.
  const cartError = validateCartItems(cartItems, productsById);
  if (cartError) {
    errors.cartItems = cartError;
  }

  // Gatekeeper 2: email must be valid.
  if (!resolvedEmail || !EMAIL_REGEX.test(String(resolvedEmail))) {
    errors.email = "Email is invalid";
  }

  if (authEmail && email && authEmail !== String(email)) {
    errors.email = "Email does not match authenticated user";
  }

  // Gatekeeper 3: credit card must be 16 digits.
  const cardDigits = String(cardNumber || "").replace(/\D/g, "");
  if (cardDigits.length !== 16) {
    errors.cardNumber = "Card number must be 16 digits";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      status: "fail",
      message: "Checkout validation failed",
      errors,
    });
  }

  const total = calculateTotal(cartItems, productsById);
  const serverItems = buildServerCartItems(cartItems, productsById);
  const order = {
    orderId: `ord-${Date.now()}`,
    userId: resolvedEmail,
    total: Number(total.toFixed(2)),
    items: serverItems,
    createdAt: new Date().toISOString(),
  };

  try {
    // Save Order: if this fails, return a field-specific error.
    await checkoutService.saveOrder(order);
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: "Checkout save failed",
      errors: {
        order: "Save order failed",
      },
    });
  }

  return res.status(201).json({
    status: "success",
    orderId: order.orderId,
    total: order.total,
  });
}

module.exports = {
  checkout,
};
