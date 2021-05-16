

const express = require('express');
const config = require('./config/config');
const glob = require('glob');
const mongoose = require('mongoose');
const http = require("http");

const mySocket = require("./app/config-socket");

require('dotenv').config()

mongoose.connect(config.db,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
  useFindAndModify: false,
  useCreateIndex: true,
}).then(() => {
  console.log("✅ Database was connected");
})
.catch((error) => {
  console.error(`❌ Failed with ${error}`);
});;
const db = mongoose.connection;
db.on('error', () => {
  throw new Error('unable to connect to database at ' + config.db);
});

const models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
  require(model);
});
const app = express();


const server = http.createServer(app);



module.exports = require('./config/express')(app, config);

mySocket.inializeIO(server).on("connection", (socket) => {
  socket.on("disconnect", (socket) => {});
});

server.listen(config.port, () => {
  console.log('Express server listening on port ' + config.port);
});

