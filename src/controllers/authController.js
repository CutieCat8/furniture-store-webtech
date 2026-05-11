const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const authService = require("../services/authService");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL ||
  "http://localhost:3000/mock/user-service/verify";

async function fetchUserByEmail(email) {
  try {
    const response = await fetch(USER_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return payload && payload.data ? payload.data : null;
  } catch (error) {
    return null;
  }
}

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

    // Gatekeeper: reject if the user does not exist in users.json.
    const user = await fetchUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }

    // Compare submitted password after MD5 hashing (assignment requirement).
    const submittedHash = crypto
      .createHash("md5")
      .update(password, "utf8")
      .digest("hex");

    if (submittedHash !== user.password) {
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

async function register(req, res) {
  try {
    // Envelope: read register fields from request body.
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Name, email, and password are required",
      });
    }

    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);

    if (!hasMinLength || !hasUppercase || !hasSpecial) {
      return res.status(400).json({
        status: "fail",
        message:
          "Password must be 8+ chars with 1 uppercase and 1 special (!@#$%^&*)",
      });
    }

    const existingUser = await authService.findAuthUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        status: "fail",
        message: "Email already registered",
      });
    }

    // Package: store hashed password in auth_user.json.
    const passwordHash = await bcrypt.hash(password, 10);
    await authService.addAuthUser({
      name,
      email,
      passwordHash,
    });

    return res.status(201).json({
      status: "success",
      message: "Registration successful",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Registration failed",
    });
  }
}

module.exports = {
  login,
  register,
};
