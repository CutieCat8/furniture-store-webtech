const authRepository = require("../repositories/authRepository");

async function findUserByEmail(email) {
  return authRepository.findUserByEmail(email);
}

async function findAuthUserByEmail(email) {
  return authRepository.findAuthUserByEmail(email);
}

async function addAuthUser({ name, email, passwordHash }) {
  return authRepository.addAuthUser({ name, email, passwordHash });
}

module.exports = {
  findUserByEmail,
  findAuthUserByEmail,
  addAuthUser,
};
