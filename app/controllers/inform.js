const express = require("express");
const router = express.Router();

const Inform = require("../models/inform");
const TypeInform = require("../models/typeInform");

const middle = require("../middleware/authentication");
const mySocket = require("../config-socket")

module.exports = (app) => {
  app.use("/inform", router);
};


//Trả về tất cả các thông báo
router.get("/", middle.checkLogged, async (req, res) => {
  try {
    const { id } = req.query;
    if (id && id != "") {
      const inform = await Inform.findById(id)
        .populate("idType")
        .populate("idOwner");

      res.render("informInfor", {
        title: req.user.name,
        user: req.user,
        inform,
      });
    } else {
      let { type, page } = req.query;

      if (typeof type == "undefined") {
        type = "all";
      }
      if (typeof page == "undefined") {
        page = 1;
      }

      page = Number(page);

      const per = 5;

      let listInform = [];
      let totalInform = 0;
      if (type == "all") {
        listInform = await Inform.find()
          .populate("idType")
          .limit(per)
          .skip((page - 1) * per)
          .sort({ createdAt: -1 });
        totalInform = await Inform.count();
      } else {
        totalInform = await Inform.find({
          idType: type,
        }).count();
        listInform = await Inform.find({
          idType: type,
        })
          .populate("idType")
          .limit(per)
          .skip((page - 1) * per)
          .sort({ createdAt: -1 });
      }

      const totalPage = Math.ceil(totalInform / per);

      const listTypeInform = await TypeInform.find();
      res.render("listInformTDTU", {
        title: "Generator-Express MVC",
        user: req.user,
        listInform,
        listTypeInform,
        type,
        back: page > 1 ? true : false,
        next: page < totalPage ? true : false,
        currentPage: page,

        idType: type,
      });
    }
  } catch (err) {
    console.log(err);
    res.redirect("back");
  }
});


// Tạo thông báo mới
router.post("/", middle.checkLogged, middle.checkFaculty, async (req, res) => {
  try {
    const { title, content } = req.body;
    const type = req.user.manageTopic;

    const inform = new Inform({
      idOwner: req.user._id,
      title,
      content,
      createdAt: new Date(),
      idType: type._id,
    });

    await inform.save();
    //Realtime thông báo
    //Dùng Socket để gửi tới client
    mySocket.getIO().local.emit("haveNewInform", "ok");
    res.redirect("back");
  } catch (err) {
    console.log(err);
    res.redirect("back");
  }
});

// API trả về 5 thông báo mới nhất

router.get("/api",async (req, res) => {
  try {
    const listInform = await Inform.find()
      .populate("idType")
      .limit(5)
      .sort({ createdAt: -1 });

    res.json(listInform);
  } catch (err) {
    console.log(err);
    res.status(401);
  }
});


//Xóa thông báo
router.get("/delete/:id",middle.checkLogged,middle.checkFaculty ,async (req, res) => {
  try {
 
    const { id } = req.params;
    await Inform.findByIdAndRemove(id).exec();
    res.redirect("/inform");
  } catch (err) {
    res.redirect("back");
  }
});

//Chỉnh sủa thông báo
router.post("/edit" ,middle.checkLogged,middle.checkFaculty,async(req,res)=>{
 try{
  
  const {idInform,title,content} = req.body
  const userID = req.user._id
  Inform.findById(idInform,async (err,doc)=>{
    if(err){
      throw new Error()
    }
    if(String(doc.idOwner)==userID){
      doc.title=title
      doc.content=content
      await doc.save()
      res.redirect("back")
    }
  })
 }catch(err){
   console.log(err)
   res.redirect("/")
 }
})
