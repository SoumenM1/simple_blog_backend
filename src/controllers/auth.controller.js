const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const ActivityLog = require("../models/ActivityLog");

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: process.env.COOKIE_SAME_SITE || "lax",
  path: "/",
});

function setCookies(res, tokens) {
    // console.log("tokens in setCookies:", tokens);
  const opts = cookieOptions();
  res.cookie("accessToken", tokens.accessToken, {
    ...opts,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", tokens.refreshToken, {
    ...opts,
    maxAge: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30) * 86400000,
  });
}
function clearCookies(res) {
  const opts = cookieOptions();
  res.clearCookie("accessToken", opts);
  res.clearCookie("refreshToken", opts);
}

const register = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.register(req.body);
  setCookies(res, tokens);
  await ActivityLog.create({
    user: user._id,
    action: "auth.register",
    ip: req.ip,
    userAgent: req.get("user-agent") || "",
  });
  res.status(201).json({ success: true, data: { user } });
});

const login = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.login(req.body);
  setCookies(res, tokens);
  await ActivityLog.create({
    user: user._id,
    action: "auth.login",
    ip: req.ip,
    userAgent: req.get("user-agent") || "",
  });
  res.json({ success: true, data: { user } });
});
const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(
    req.cookies?.refreshToken || req.body.refreshToken,
  );
  setCookies(res, result.tokens);
  res.json({ success: true, data: { user: result.user } });
});
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies?.refreshToken || req.body.refreshToken);
  clearCookies(res);
  if (req.user)
    await ActivityLog.create({
      user: req.user._id,
      action: "auth.logout",
      ip: req.ip,
      userAgent: req.get("user-agent") || "",
    });
  res.json({ success: true, message: "Logged out successfully" });
});
const me = asyncHandler(async (req, res) =>
  res.json({ success: true, data: { user: req.user } }),
);

const oauthSuccess = asyncHandler(async (req, res) => {

  const tokens = await authService.issueTokens(req?.user);

  setCookies(res, tokens);

return  res.redirect(
    process.env.OAUTH_SUCCESS_REDIRECT
  );
});

module.exports = { register, login, refresh, logout, me, oauthSuccess };
