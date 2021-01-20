const AWS = require("aws-sdk");
const SNS = new AWS.SNS({ apiVersion: "2010-03-31" });
const { createUser, verifyUser, updateUser, getUser, getResetPasswordCode, resetPassword, login, LOGIN_CODES, GET_PASSWORD_CODE_CODES } = require("dynamodb");
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

exports.User = {};

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
    if (result === LOGIN_CODES.SUCCEEDED) {
      const { email } = input;
      const token = sign({ email });
      return {
        code: result,
        token,
      };
    }
    return {
      code: result,
    };
  },
  sendResetPasswordCode: async (parent, { input }) => {
    try {
      const result = await getResetPasswordCode(input);
      if (result[0] === GET_PASSWORD_CODE_CODES.SUCCEEDED) {
        const { email } = input;
        await sendEmail({
          action: "resetPwd",
          email,
          resetPwdCode: result[1],
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
