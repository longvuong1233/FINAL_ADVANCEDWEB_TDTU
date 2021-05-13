const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const informSchema = new Schema({
  idOwner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: {
    type: String,
    required: true,
  },
  idType: { type: Schema.Types.ObjectId, ref: "TypeInform", required: true },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
  },
});

const Inform = mongoose.model("Inform", informSchema);

module.exports = Inform;
