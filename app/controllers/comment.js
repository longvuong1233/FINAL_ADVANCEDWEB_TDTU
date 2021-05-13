const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");
const Post = require("../models/post");
const middle = require("../middleware/authentication");

module.exports = (app) => {
  app.use("/comment", router);
};

router.post("/", middle.checkLogged,async (req, res) => {
  try {
    const { message, idOwner, idPost } = req.body;

    const comment = new Comment({
      message,
      idOwner,
      createdAt: new Date(),
    });
    await comment.save();

    Post.findById(idPost, async function (err, doc) {
      if (err) {
        throw err;
      }

      if (doc != null) {
        doc.listComment.push(comment._id);
        await doc.save();
        await comment.populate("idOwner").execPopulate();
        res.json(comment);
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.delete("/", middle.checkLogged,(req, res) => {
  try {
    const { idComment, idUser } = req.query;
    Comment.findByIdAndRemove(idComment, {
      idOwner: idUser,
    }).exec();
    res.status(401);
  } catch (err) {
    console.log(err);
  }
});
