const express = require("express");
const router = express.Router();

const passport = require("../middleware/passport-config");
const TypeInform = require("../models/typeInform");

const User = require("../models/user");
const multer = require("multer");
const middle = require("../middleware/authentication")
const upload = multer({ dest: "uploads/" });
const fs = require("fs-extra");
module.exports = (app) => {
  app.use("/user", router);
};
// Tạo tài khoản cho khoa hay phòng ban
router.post("/",middle.checkLogged,middle.checkAdmin ,async (req, res) => {
  try {
    const { username, name } = req.body;
    

    //tạo user mới
    const user = new User({
      username: username.trim(),
      name,
      role: "faculty",
      hookEnabled: true,
      avatar: "img/test.png",
      faculty: name,
    });

    await user.save();

    res.redirect("back");
  } catch (err) {
    console.log(err);
  }
});


//Admin phân loại chủ đề post bài cho phong ban
router.post("/edit",middle.checkLogged,middle.checkAdmin , (req, res) => {
  try {
    const { idType, idUser } = req.body;

    User.findById(idUser, async (err, doc) => {
      if (err) {
        throw err;
      }
      if (doc != null) {
        const type = await TypeInform.findById(idType);
        doc.manageTopic = type.id;
        doc.save();
      }
      res.redirect("back");
    });
  } catch (err) {
    console.log(err);
  }
});

// thay đổi thông tin user: ten lơp khoa
router.post("/editinfor", middle.checkLogged,async (req, res) => {
  try {
    const { name, faculty } = req.body;
    const classNumber = req.body.class;
    await User.findById(req.user._id, async (err, doc) => {
      if (err) {
        throw err;
      }
      doc.name = name;
      doc.class = classNumber;
      doc.faculty = faculty;

      await doc.save();
      res.redirect("back");
    });
  } catch (err) {
    console.log(err);
    res.redirect("back");
  }
});

router.post(
  "/signin",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/",
    failureFlash: true,
  })
);

router.get("/", middle.checkLogged,async (req, res) => {
  try {
    const { id } = req.query;

    const user = await User.findById(id);
    if (!user) {
      throw new Error();
    }

    res.render("user", {
      title: req.user.name,
      user: req.user,
      target:'user',
      targetedUser: user,
    });
  } catch (err) {
    res.redirect("back");
  }
});

//Thay đổi avatar
router.post("/editavatar",middle.checkLogged ,upload.single("avatar"), async (req, res) => {
  try {
    let { path, originalname } = req.file;
    let newPath = `img/${req.user._id}/${new Date().getTime()}${originalname}`;

    if (fs.existsSync("public/" + newPath)) {
      return res.end(
        JSON.stringify({
          success: false,
          message: "File already existed",
        })
      );
    }
    fs.moveSync(path, "public/" + newPath);

    await User.findById(req.user._id, async (err, doc) => {
      if (err) {
        throw err;
      }
      doc.avatar = newPath;
      await doc.save();
      res.redirect("back");
    });
  } catch (err) {
    console.log(err);
    res.redirect("back");
  }
});

router.get("/logout", (req, res) => {
  req.logout();

  res.redirect("/login");
});

//Đôi mật khẩu 
router.post("/changepassword",middle.checkLogged,(req,res)=>{
  
  try{
    User.findById(req.user._id,async(err,doc)=>{
      if(err){
        throw err
      }
      doc.password=req.body.newPassword
      doc.hookEnabled=true
      await doc.save()
      res.redirect("back")
    })


  }catch(er){
    console.log(er)
    res.redirect("back")
  }
})