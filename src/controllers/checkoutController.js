const checkoutService = require("../services/checkoutService");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePrice(value) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  return NaN;
}

function validateCartItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "Cart is empty";
  }

  for (const item of items) {
    const price = normalizePrice(item.price);
    const quantity = Number(item.quantity);

    if (!Number.isFinite(price) || price <= 0) {
      return "Cart item price is invalid";
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return "Cart item quantity is invalid";
    }
  }

  return null;
}

function calculateTotal(items) {
  return items.reduce((sum, item) => {
    const price = normalizePrice(item.price);
    const quantity = Number(item.quantity);
    return sum + price * quantity;
  }, 0);
}

async function checkout(req, res) {
  const { cartItems, email, cardNumber } = req.body || {};
  const errors = {};

  // Gatekeeper 1: cart must contain items.
  const cartError = validateCartItems(cartItems);
  if (cartError) {
    errors.cartItems = cartError;
  }

  // Gatekeeper 2: email must be valid.
  if (!email || !EMAIL_REGEX.test(String(email))) {
    errors.email = "Email is invalid";
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

  const total = calculateTotal(cartItems);
  const order = {
    orderId: `ord-${Date.now()}`,
    email,
    total: Number(total.toFixed(2)),
    items: cartItems,
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
