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
const AUTH_USERS_PATH = path.join(
  __dirname,
  "..",
  "..",
  "data",
  "json",
  "auth_user.json"
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

async function getAuthUsers() {
  try {
    const fileContents = await fs.readFile(AUTH_USERS_PATH, "utf-8");
    const users = JSON.parse(fileContents);

    if (!Array.isArray(users)) {
      throw new Error("Auth users data is not an array");
    }

    return users;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function saveAuthUsers(users) {
  await fs.writeFile(AUTH_USERS_PATH, JSON.stringify(users, null, 2));
}

async function findAuthUserByEmail(email) {
  const users = await getAuthUsers();
  return users.find((user) => user.username === email) || null;
}

async function addAuthUser({ name, email, passwordHash }) {
  const users = await getAuthUsers();
  const newUser = {
    id: `au-${Date.now()}`,
    name,
    username: email,
    password: passwordHash,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  users.push(newUser);
  await saveAuthUsers(users);
  return newUser;
}

module.exports = {
  findUserByEmail,
  findAuthUserByEmail,
  addAuthUser,
};
