const { jwt } = require("../utils/token");
const User = require("../models/User");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");
const getAccessToken = (req) => {
  const h = req.headers.authorization;
  if (h?.startsWith("Bearer ")) return h.slice(7);
  return req.cookies?.accessToken;
};
const protect = asyncHandler(async (req, _res, next) => {
  const token = getAccessToken(req);
  if (!token) throw new HttpError(401, "Authentication required");
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    throw new HttpError(401, "Invalid or expired access token");
  }
  if (payload.typ !== "access")
    throw new HttpError(401, "Invalid access token");
  const user = await User.findOne({ _id: payload.sub, isDeleted: false });
  if (!user) throw new HttpError(401, "Account not found");
  req.user = user;
  next();
});
const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return next(
        new HttpError(403, "You do not have permission to perform this action"),
      );
    next();
  };
module.exports = { protect, requireRole };
