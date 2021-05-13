const socket = require("socket.io");

class mySocket {
  static myIO = null;
  static inializeIO(server) {
    this.IO = socket(server);
    return this.IO;
  }
  static getIO() {
    return this.IO;
  }
}

module.exports = mySocket;
