const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const HttpError = require("../utils/httpError");
const {
  signAccess,
  signRefresh,
  hashToken,
  refreshExpiry,
  jwt,
} = require("../utils/token");

async function issueTokens(user) {
  const accessToken = signAccess(user);
  const refreshToken = signRefresh(user);
  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: refreshExpiry(),
  });
  return { accessToken, refreshToken };
}

async function register(data) {
  if (await User.exists({ email: data.email.toLowerCase() }))
    throw new HttpError(409, "Email is already registered");
  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    password: data.password,
  });

  return { user, tokens: await issueTokens(user) };
}

async function login(data) {
  const user = await User.findOne({
    email: data.email.toLowerCase(),
    isDeleted: false,
  }).select("+password");
  if (!user || !(await user.comparePassword(data.password)))
    throw new HttpError(401, "Invalid email or password");
  return { user, tokens: await issueTokens(user) };
}

async function refresh(token) {
  if (!token) throw new HttpError(401, "Refresh token required");
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new HttpError(401, "Invalid or expired refresh token");
  }
  if (payload.typ !== "refresh")
    throw new HttpError(401, "Invalid refresh token");
  const record = await RefreshToken.findOne({
    tokenHash: hashToken(token),
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!record)
    throw new HttpError(401, "Refresh token has been revoked or reused");
  record.revokedAt = new Date();
  await record.save();
  const user = await User.findOne({ _id: payload.sub, isDeleted: false });
  if (!user) throw new HttpError(401, "Account not found");
  return { user, tokens: await issueTokens(user) };
}
async function logout(token) {
  if (token)
    await RefreshToken.updateOne(
      { tokenHash: hashToken(token), revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
}
module.exports = { register, login, refresh, logout, issueTokens };
