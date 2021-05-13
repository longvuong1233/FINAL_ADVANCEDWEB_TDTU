const express = require("express");
const router = express.Router();
const middle = require("../middleware/authentication")

const TypeInform = require("../models/typeInform");

module.exports = (app) => {
  app.use("/typeInform", router);
};

router.post("/", middle.checkLogged,middle.checkAdmin,async (req, res) => {
  console.log(req.body);
  const { nameType } = req.body;

  const typeInform = new TypeInform({
    name: nameType,
  });

  await typeInform.save();
  res.redirect("back");
});
