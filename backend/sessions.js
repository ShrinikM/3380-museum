const crypto = require("crypto");

const sessions = new Map();

function startSession(customerId) {
  const token = crypto.randomBytes(32).toString("hex");

  sessions.set(token, customerId);
  return token;
}

function findSession(token) {
  if (sessions.has(token)) {
    return sessions.get(token);
  }

  return null;
}

function endSessions(customerId) {
  for (const [token, id] of sessions) {
    if (id === customerId) {
      sessions.delete(token);
    }
  }
}

module.exports = { startSession, findSession, endSessions };
