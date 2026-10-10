const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const accessTtl = process.env.ACCESS_TOKEN_TTL || "15m";
const refreshDays = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30);
function signAccess(user) {
   
  return jwt.sign(
    { sub: user?._id.toString(), role: user?.role, typ: "access" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: accessTtl },
  );
}

function signRefresh(user) {
  return jwt.sign(
    { sub: user._id.toString(), typ: "refresh", jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: `${refreshDays}d` },
  );
}
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
function refreshExpiry() {
  return new Date(Date.now() + refreshDays * 86400000);
}
module.exports = { jwt, signAccess, signRefresh, hashToken, refreshExpiry };
