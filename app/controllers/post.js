const express = require("express");
const router = express.Router();
const multer = require("multer");
const Post = require("../models/post");
const User = require("../models/user");

const fs = require("fs-extra");

const middle = require("../middleware/authentication");

var upload = multer({ dest: "uploads/" });

module.exports = (app) => {
  app.use("/post", router);
};

router.post("/",middle.checkLogged, upload.any(), async (req, res) => {
  try {
    const { youtube, content } = req.body;

    let images = [];

    for (let i = 0; i < req.files.length; i++) {
      let { path, originalname } = req.files[i];
      let newPath = `img/${
        req.user._id
      }/${new Date().getTime()}${originalname}`;

      if (fs.existsSync("public/" + newPath)) {
        return res.end(
          JSON.stringify({
            success: false,
            message: "File already existed",
          })
        );
      }
      fs.moveSync(path, "public/" + newPath);
      images.push(newPath);
    }

    const post = new Post({
      idOwner: req.user._id,
      content,
      createdAt: new Date(),
      images,
      video: youtube,
    });
    await post.save();

    User.findById(req.user._id, async (err, doc) => {
      if (err) {
        throw err;
      }

      if (doc != null) {
        doc.post.push(post._id);
        await doc.save();
        
        await post.populate("idOwner")
        .populate({
          path: "listComment",
          model: "Comment",
          populate: {
            path: "idOwner",
            model: "User",
          },
        }).execPopulate()

        res.json(post)
      }
    });

    
  } catch (err) {
    console.log(err);
  }
});

router.get("/",middle.checkLogged, async (req, res) => {
  const {idUser,turn} =req.query
  console.log(turn)

  let listPost=[]
  if(typeof idUser =='undefined'){
    listPost = await Post.find()
    .populate("idOwner")
    .populate({
      path: "listComment",
      model: "Comment",
      populate: {
        path: "idOwner",
        model: "User",
      },
    }).limit(10).skip(10*Number(turn)).sort({ createdAt: -1 })
    .exec();
  }else{
    listPost = await Post.find({idOwner:idUser})
    .populate("idOwner")
    .populate({
      path: "listComment",
      model: "Comment",
      populate: {
        path: "idOwner",
        model: "User",
      },
    }).limit(10).skip(10*Number(turn)).sort({ createdAt: -1 })
    .exec();
  }
 

  res.json(listPost);
});

router.post("/heart",middle.checkLogged, (req, res) => {
  try {
    const { idUser, idPost } = req.body;

    Post.findById(idPost, async function (err, doc) {
      if (err) {
        throw err;
      }

      const index = doc.heart.indexOf(idUser);
      if (index != -1) {
        doc.heart.splice(index, 1);
      } else {
        doc.heart.push(idUser);
      }

      await doc.save();
      res.status(401);
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/", middle.checkLogged,upload.any(), async (req, res) => {
  try {
    const { youtube, content, deleteImages, idPost } = req.body;
   
    const booleanDeleteImages = deleteImages == "true" ? true : false;
    let images = [];

    if (booleanDeleteImages == false) {
      for (let i = 0; i < req.files.length; i++) {
        
        let { path, originalname } = req.files[i];
        let newPath = `img/${
          req.user._id
        }/${new Date().getTime()}${originalname}`;

        if (fs.existsSync("public/" + newPath)) {
          return res.end(
            JSON.stringify({
              success: false,
              message: "File already existed",
            })
          );
        }
        fs.moveSync(path, "public/" + newPath);
        images.push(newPath);
      }
    }

    Post.findById(idPost, async function (err, doc) {
      if (err) {
        throw err;
      }

      doc.content = content;
      doc.updatedAt = new Date();
      doc.images = images;
      if(youtube.trim()!=''){
        doc.video = youtube;
      }
      
      await doc.save();

      console.log(doc, "11");
      await doc
        .populate("idOwner")
        .populate({
          path: "listComment",
          model: "Comment",
          populate: {
            path: "idOwner",
            model: "User",
          },
        })
        .execPopulate();
      console.log(doc);

      res.json(doc);
    });
  } catch (err) {
    console.log(err);
  }
});

router.delete("/", middle.checkLogged,(req, res) => {
  try {

    const { idPost } = req.query;
    Post.findByIdAndRemove(idPost, {
      idOwner: req.user._id,
    }).exec();

    res.status(401);
  } catch (err) {
    console.log(err);
  }
});
