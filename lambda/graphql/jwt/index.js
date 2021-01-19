const jwt = require("jsonwebtoken");
const fs = require("fs");
const { join } = require("path");
const privateKey = fs.readFileSync(join(__dirname, "./jwtRS256.key"));
const publicKey = fs.readFileSync(join(__dirname, "./jwtRS256.key.pub"));

exports.sign = (payload) => {
  const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
  return token;
};

exports.verify = (token) => {
  try {
    const decoded = jwt.verify(token, publicKey, { algorithm: "RS256" });
    return decoded;
  } catch(e) {
    return null;
  }
};
