const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
  idOwner:{ type: Schema.Types.ObjectId, ref: 'User' ,required:true},
  content: {
    type: String,
  },
  heart: {
    type: Array,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
  images: {
    type: Array,
  },
  video: {
    type: String,
  },
  listComment: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
},{
  usePushEach: true
});

const Post = mongoose.model("Post", postSchema);

module.exports =Post
