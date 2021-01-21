const AWS = require("aws-sdk");
const SNS = new AWS.SNS({ apiVersion: "2010-03-31" });
const { createUser, verifyUser, updateUser, getUser, getResetPasswordCodeAndEmail, resetPassword, login, LOGIN_CODES, GET_PASSWORD_CODE_CODES } = require("dynamodb");
const { sign } = require("../../jwt");

const sendEmail = async (message) => {
  const params = {
    TopicArn: process.env.UserSNSTopic,
    Message: JSON.stringify(message),
  };
  await SNS.publish(params).promise();
};

exports.Query = {
  user: async (parent, { input }) => {
    return await getUser(input);
  },
};

exports.User = {
  reviewIds: ({ reviewIds }) => { // reviewIds is a set
    return reviewIds.values.filter(reviewId => reviewId); // filter out empty string
  },
};

exports.Mutation = {
  createUser: async (parent, { input }) => {
    const { email } = input;
    try {
      const verificationCode = await createUser(input);
      await sendEmail({
        action: "create",
        email,
        verificationCode,
      });
      return {};
    } catch (e) {
      return {
        error: e,
      };
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
    if (result[0] === LOGIN_CODES.SUCCEEDED) {
      const { username } = input;
      const token = sign({ username });
      return {
        code: result[0],
        token,
        me: result[1],
      };
    }
    return {
      code: result[0],
    };
  },
  sendResetPasswordCode: async (parent, { input }) => {
    try {
      const result = await getResetPasswordCodeAndEmail(input);
      if (result[0] === GET_PASSWORD_CODE_CODES.SUCCEEDED) {
        await sendEmail({
          action: "resetPwd",
          resetPwdCode: result[1],
          email: result[2],
        });
        return {
          code: GET_PASSWORD_CODE_CODES.SUCCEEDED,
        };
      }
      return {
        code: result[0],
      };
    } catch (e) {
      console.trace(e);
      return {
        error: e,
      };
    }
  },
  resetPassword: async (parent, { input }) => {
    const result = await resetPassword(input);
    return {
      code: result,
    };
  },
};
