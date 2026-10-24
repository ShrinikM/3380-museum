const crypto = require("crypto");

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  return salt + ":" + hash;
}

function checkPassword(password, saved) {
  const [salt, hash] = saved.split(":");

  if (!salt || !hash) {
    return false;
  }

  const attempt = crypto.scryptSync(password, salt, 64);
  const real = Buffer.from(hash, "hex");

  return attempt.length === real.length && crypto.timingSafeEqual(attempt, real);
}

module.exports = { hashPassword, checkPassword };
