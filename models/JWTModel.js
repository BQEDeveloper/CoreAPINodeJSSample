 var JWTHeader = require(__dirname + "/JWTHeader.js");
 var JWTPayload = require(__dirname + "/JWTPayload.js");

class JWTModel {
    constructor() {
        this.header = new JWTHeader();
        this.payload = new JWTPayload();
        this.signature;
    }
  }

  module.exports = JWTModel;