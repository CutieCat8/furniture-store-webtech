const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authService = require("../services/authService");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

async function login(req, res) {
  try {
    // Envelope: read email and password from the request body.
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email and password are required",
      });
    }

    // Gatekeeper: reject if the user does not exist.
    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }

    // Compare submitted password with stored bcrypt hash.
    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }

    // Package: sign a token that contains the user id.
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Login failed",
    });
  }
}

module.exports = {
  login,
};
