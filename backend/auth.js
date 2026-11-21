const crypto = require("node:crypto");
const { db } = require("./database");

const COOKIE_NAME = "duraren_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const passwordHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, passwordHash };
}

function verifyPassword(password, salt, expectedHash) {
  const actual = Buffer.from(hashPassword(password, salt).passwordHash, "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function parseCookies(header = "") {
  return Object.fromEntries(header.split(";").map((part) => {
    const separator = part.indexOf("=");
    if (separator < 0) return ["", ""];
    return [part.slice(0, separator).trim(), decodeURIComponent(part.slice(separator + 1).trim())];
  }).filter(([name]) => name));
}

function setSessionCookie(response, token, maxAgeSeconds = Math.floor(SESSION_DURATION_MS / 1000)) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}${secure}`);
}

function createSession(userId, response) {
  const token = crypto.randomBytes(32).toString("base64url");
  db.prepare("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)")
    .run(hashToken(token), userId, Date.now() + SESSION_DURATION_MS);
  setSessionCookie(response, token);
}

function getPublicUser(userId) {
  const user = db.prepare("SELECT id,name,email FROM users WHERE id=?").get(userId);
  if (!user) return null;
  const preferences = db.prepare("SELECT category FROM user_preferences WHERE user_id=? ORDER BY category")
    .all(userId).map((row) => row.category);
  return { ...user, preferences };
}

function optionalAuth(request, _response, next) {
  try {
    const token = parseCookies(request.headers.cookie)[COOKIE_NAME];
    if (!token) return next();
    const session = db.prepare(`SELECT user_id FROM sessions WHERE token_hash=? AND expires_at>?`)
      .get(hashToken(token), Date.now());
    if (session) request.user = getPublicUser(session.user_id);
    next();
  } catch (error) {
    next(error);
  }
}

function requireAuth(request, response, next) {
  if (!request.user) return response.status(401).json({ error: "Entre na sua conta para continuar." });
  next();
}

function createAccount({ name, email, password }) {
  const credentials = hashPassword(password);
  const result = db.prepare(`INSERT INTO users(name,email,password_salt,password_hash)
    VALUES(?,?,?,?)`).run(name, email, credentials.salt, credentials.passwordHash);
  return getPublicUser(Number(result.lastInsertRowid));
}

function authenticate(email, password) {
  const account = db.prepare("SELECT id,name,email,password_salt,password_hash FROM users WHERE email=? COLLATE NOCASE")
    .get(email);
  if (!account || !verifyPassword(password, account.password_salt, account.password_hash)) return null;
  return getPublicUser(account.id);
}

function destroySession(request, response) {
  const token = parseCookies(request.headers.cookie)[COOKIE_NAME];
  if (token) db.prepare("DELETE FROM sessions WHERE token_hash=?").run(hashToken(token));
  setSessionCookie(response, "", 0);
}

db.prepare("DELETE FROM sessions WHERE expires_at<=?").run(Date.now());

module.exports = { authenticate, createAccount, createSession, destroySession, getPublicUser, hashPassword, optionalAuth, requireAuth };
