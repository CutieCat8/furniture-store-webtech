const authService = require("../services/authService");

async function verifyUser(req, res) {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({
      status: "fail",
      message: "Email is required",
    });
  }

  try {
    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "User lookup failed",
    });
  }
}

module.exports = {
  verifyUser,
};
