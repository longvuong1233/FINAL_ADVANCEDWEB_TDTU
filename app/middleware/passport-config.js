const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const localStrategy = require("passport-local").Strategy;
const User = require("../models/user");
passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser( function (id, done) {
  User.findById(id,async function (err, user) {
    await user.populate("manageTopic").execPopulate()
 
    done(err,user);
  });
});

passport.use(
  new localStrategy(async (username, password, done) => {
    try {
      const iUsername = username.toLowerCase().trim();

      const user = await User.findOne({ username: iUsername });
      console.log(username)
      if (!user) {
        throw new Error();
      }
      const isCorrectPassword = await user.isValidPassword(password);

      if (!isCorrectPassword) {
        throw new Error();
      }

      return done(null, user);
    } catch (error) {
      return done(null, false, {
        message:
          "Tài khoản hoặc mật khẩu không đúng !!!",
      });
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://tdtunetwork.herokuapp.com/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        if (profile._json.hd == "student.tdtu.edu.vn") {
          let user = await User.findOne({ authGoogleID: profile.id });
        
          if (!user) {
            user = new User({
              email: profile.emails[0].value,
              name: profile.displayName,
              authType: "google",
              authGoogleID: profile.id,
              avatar: profile.photos[0].value,
              createdAt: new Date(),
            });
            await user.save();
          }
          return done(null, user);
        } else {
          return done(null, false, {
            message: "Vui lòng dùng tài khoản sinh viên TDTU",
          });
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;
