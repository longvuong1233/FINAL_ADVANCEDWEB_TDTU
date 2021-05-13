const express = require('express');
const router = express.Router();
const passport = require("../middleware/passport-config")



module.exports = (app) => {
  app.use('/google', router);
};

router.route("/").get(
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );
  router.route("/callback").get(
    passport.authenticate("google", {
      failureRedirect: "/login",
  
      successRedirect: "/",
      failureFlash: true,
    })
  );
