const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");

async function findOrCreateOAuthUser({
  provider,
  providerId,
  email,
  name,
  avatar,
}) {
  if (!email) throw new Error(`${provider} did not provide an email address`);
  let user = await User.findOne({
    $or: [
      { email: email.toLowerCase() },
      { [`oauth.${provider}Id`]: providerId },
    ],
  });
  if (user) {
    if (!user.oauth) user.oauth = {};
    user.oauth[`${provider}Id`] = providerId;
    if (!user.avatar && avatar) user.avatar = avatar;
    await user.save();
    return user;
  }
  user = await User.create({
    name: name || email.split("@")[0],
    email: email.toLowerCase(),
    password: undefined,
    avatar,
    oauth: { [`${provider}Id`]: providerId },
    role: "user",
    isEmailVerified: true,
  });
  return user;
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (_a, _r, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          done(
            null,
            await findOrCreateOAuthUser({
              provider: "google",
              providerId: profile.id,
              email,
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value,
            }),
          );
        } catch (e) {
          done(e);
        }
      },
    ),
  );
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ["id", "displayName", "emails", "photos"],
        enableProof: true,
      },
      async (_a, _r, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          done(
            null,
            await findOrCreateOAuthUser({
              provider: "facebook",
              providerId: profile.id,
              email,
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value,
            }),
          );
        } catch (e) {
          done(e);
        }
      },
    ),
  );
}
module.exports = passport;
