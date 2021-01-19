const AWS = require("aws-sdk");
const SNS = new AWS.SNS({ apiVersion: "2010-03-31" });
const { createUser, verifyUser, updateUser, login, LOGIN_CODES } = require("dynamodb");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { join } = require("path");
const privateKey = fs.readFileSync(join(__dirname, "./jwtRS256.key"));

exports.Mutation = {
  createUser: async (parent, { input }) => {
    const { email } = input;
    try {
      const verificationCode = await createUser(input);
      const params = {
        TopicArn: process.env.UserSNSTopic,
        Message: JSON.stringify({
          email,
          verificationCode,
        }),
      };
      await SNS.publish(params).promise();
      return {};
    } catch (e) {
      return {
        error: e,
      }
    }
  },
  verifyUser: async (parent, { input }) => {
    const result = await verifyUser(input);
    return {
      code: result,
    };
  },
  updateUser: async (parent, { input }) => {
    const result = await updateUser(input);
    return result;
  },
  login: async (parent, { input }) => {
    const result = await login(input);
    if (result === LOGIN_CODES.SUCCEEDED) {
      const { email } = input;
      const token = jwt.sign({ email }, privateKey, { algorithm: "RS256" });
      return {
        code: result,
        token,
      };
    }
    return {
      code: result,
    };
  },
};
