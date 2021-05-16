const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const localStrategy = require("passport-local").Strategy;
const User = require("../models/user");
passport.serializeUser(function (user, done) {
  //Hàm trả về giá trị lưu trong session
  done(null, user._id);
});

passport.deserializeUser( function (id, done) {
  //Hàm lấy giá trị trong session rồi tìm User tương ứng
  User.findById(id,async function (err, user) {
    await user.populate("manageTopic").execPopulate()
 
    done(err,user);
  });
});
 // Đăng nhập = username password
passport.use(
  new localStrategy(async (username, password, done) => {
    try {
      const iUsername = username.toLowerCase().trim();
      //Kiểm tra xem có tồn tại user chưa
      const user = await User.findOne({ username: iUsername });

      if (!user) {
        throw new Error();
      }
      // Nếu tồn tại username thì kiểm tra xem khớp mật khẩu
      const isCorrectPassword = await user.isValidPassword(password);

      if (!isCorrectPassword) {

        throw new Error();
      }
      //Nếu khớp thì tiếp tục
      return done(null, user);
    } catch (error) {
      //Chưa tồn tại username hoặc mật khẩu ko đúng
      return done(null, false, {
        message:
          "Tài khoản hoặc mật khẩu không đúng !!!",
      });
    }
  })
);

//Đang nhập = google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://tdtunetwork.herokuapp.com/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        console.log(profile)
        //check xem đuôi gmail có phải là sinh viên tdtu
        if (profile._json.hd == "student.tdtu.edu.vn") {
          //check xem tồn tại gmail trong database chưa
          let user = await User.findOne({ authGoogleID: profile.id });
        
          if (!user) {
            //Nếu chưa tồn tại thì tạo tài khoản mới 
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
          //Nếu ko phải là gmail sinh viên
          return done(null, false, {
            message: "Vui lòng dùng tài khoản sinh viên TDTU",
          });
        }
      } catch (err) {
        console.log(err)
        return done(err);
      }
    }
  )
);

module.exports = passport;
