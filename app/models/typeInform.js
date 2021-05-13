const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const typeSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
      },

});

const TypeInform = mongoose.model("TypeInform", typeSchema);

module.exports = TypeInform;
