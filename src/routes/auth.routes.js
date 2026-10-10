const router = require("express").Router();
const passport = require("passport");
const c = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const schemas = require("../validators/schemas");
router.post("/register", validate(schemas.register), c.register);
router.post("/login", validate(schemas.login), c.login);
router.post("/refresh", c.refresh);
router.post("/logout", c.logout);
router.get("/me", protect, c.me);
if (process.env.GOOGLE_CLIENT_ID) {
  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    }),
  );
  router.get(
    "/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: process.env.OAUTH_FAILURE_REDIRECT,
    }),
    c.oauthSuccess,
  );
}

if (process.env.FACEBOOK_APP_ID) {
  router.get(
    "/facebook",
    passport.authenticate("facebook", { scope: ["email"], session: false }),
  );
  router.get(
    "/facebook/callback",
    passport.authenticate("facebook", {
      session: false,
      failureRedirect: process.env.OAUTH_FAILURE_REDIRECT,
    }),
    c.oauthSuccess,
  );
}
module.exports = router;
