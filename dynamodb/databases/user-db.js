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

const generateUpdateParams = (fields) => {
  let expression = "set ";
  const values = {};

  let i = 0;
  const length = Object.keys(fields).length;
  for (const [key, value] of Object.entries(fields)) {
    i += 1;
    expression += `${key} = :${key}` + (i !== length ? ", " : "");
    values[`:${key}`] = value;
  }
  return [expression, values];
};

exports.updateUser = async (input) => {
  const { email, ...updatedFields } = input; // Disallow updating email
  if ("password" in updatedFields) {
    updatedFields["password"] = await bcrypt.hash(updatedFields["password"], saltRounds);
  }
  const [updateExpression, expressionValues] = generateUpdateParams(updatedFields);
  const params = {
    TableName: process.env.UserTableName,
    Key: {
      "email": email,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionValues,
  };
  try {
    await db.update(params).promise();
    return {};
  } catch(e) {
    return {
      error: e,
    };
  }
};

exports.VERIFICATION_CODES = Object.freeze({
  SUCCEEDED: 0,
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
      return this.VERIFICATION_CODES.ALREADY_VERIFIED;
    }
    if (result.verificationCode === code) {
      await this.updateUser({
        email,
        verified: true,
      });
      return this.VERIFICATION_CODES.SUCCEEDED;
    }
    return this.VERIFICATION_CODES.FAILED;
  }
  return this.VERIFICATION_CODES.USER_DNE;
};

exports.LOGIN_CODES = Object.freeze({
  SUCCEEDED: 0,
  FAILED: 1,
  USER_DNE: 2,
});
exports.login = async (input) => {
  const { email, password } = input;
  const params = {
    TableName: process.env.UserTableName,
    Key: {
      "email": email,
    },
    ProjectionExpression: "password",
  };
  const result = (await db.get(params).promise()).Item;
  if (!result) {
    return this.LOGIN_CODES.USER_DNE;
  }
  const correct = await bcrypt.compare(password, result.password);
  return correct ? this.LOGIN_CODES.SUCCEEDED : this.LOGIN_CODES.FAILED;
};
