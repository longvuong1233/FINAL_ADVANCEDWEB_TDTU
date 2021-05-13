const express = require("express");
const router = express.Router();
const middle = require("../middleware/authentication");

const User = require("../models/user");
const TypeInform = require("../models/typeInform");


module.exports = (app) => {
  app.use("/", router);
};

router.get("/", middle.checkLogged,async (req, res, next) => {
  const  listTypeInform = await TypeInform.find()
  res.render("index", {
    title: "Generator-Express MVC",
    user: req.user,
    target:'home',
    listTypeInform
  });
});

router.get("/login", (req, res) => {
  if (!req.user) {
    res.render("login", {
      title: "Generator-Express MVC",
    });
  } else {
    res.redirect("/");
  }
});



router.get("/admin",middle.checkAdmin ,async (req, res) => {
  const listType = await TypeInform.find();
  const listUser = await User.find({
    role: "faculty",
  })
    .populate("manageTopic")
    .exec();

  res.render("adminPage", {
    title: "Generator-Express MVC",
    user: req.user,
    listType,
    listUser,
    target:'admin'
  });
});
