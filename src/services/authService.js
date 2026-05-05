const fs = require("fs/promises");
const path = require("path");

const USERS_PATH = path.join(
  __dirname,
  "..",
  "..",
  "data",
  "json",
  "users.json"
);

async function getUsers() {
  // Load users from local JSON "database".
  const fileContents = await fs.readFile(USERS_PATH, "utf-8");
  const users = JSON.parse(fileContents);

  if (!Array.isArray(users)) {
    throw new Error("Users data is not an array");
  }

  return users;
}

async function findUserByEmail(email) {
  const users = await getUsers();
  return users.find((user) => user.username === email) || null;
}

module.exports = {
  findUserByEmail,
};
