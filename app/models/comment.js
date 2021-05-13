const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  idOwner: { type: Schema.Types.ObjectId, ref: "User", required: true },

  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
  },

});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
