const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const { nanoid } = require("nanoid");

const db = new AWS.DynamoDB.DocumentClient();

exports.createUser = async (input) => {
  // TODO: check if user exists
  const { name, email, password } = input;
  const hash = await bcrypt.hash(password, saltRounds);
  const verificationCode = nanoid(5);

  const params = {
    TableName: process.env.UserTableName,
    Item: {
      "email": email,
      "password": hash,
      "name": name,
      "verified": false,
      "verificationCode": verificationCode,
    },
  };

  await db.put(params).promise();
  return verificationCode;
};

const VERIFICATION_CODES = Object.freeze({
  SUCCESS: 0,
  FAILED: 1,
  ALREADY_VERIFIED: 2,
  USER_DNE: 3,
});
exports.verifyUser = async (input) => {
  const { email, code } = input;
  const params = {
    TableName: process.env.UserTableName,
    Key: {
      "email": email,
    },
    ProjectionExpression: "verified, verificationCode",
  };

  const result = (await db.get(params).promise()).Item;
  if (result) {
    if (result.verified) {
      return VERIFICATION_CODES.ALREADY_VERIFIED;
    }
    return result.verificationCode === code ? VERIFICATION_CODES.SUCCESS : VERIFICATION_CODES.FAILED;
  }
  return VERIFICATION_CODES.USER_DNE;
};
