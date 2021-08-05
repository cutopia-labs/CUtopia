const AWS = require('aws-sdk');
const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });
const {
  createUser,
  verifyUser,
  updateUser,
  getUser,
  getResetPasswordCodeAndEmail,
  resetPassword,
  login
} = require('dynamodb');
const { sign } = require('../../jwt');

const sendEmail = async (message) => {
  const params = {
    TopicArn: process.env.UserSNSTopic,
    Message: JSON.stringify(message)
  };
  await SNS.publish(params).promise();
};

exports.Query = {
  me: async (parent, args, { user }) => {
    return await getUser({ username: user.username });
  }
};

exports.User = {
  reviewIds: ({ reviewIds }) => {
    // reviewIds is a set
    return reviewIds.values.filter((reviewId) => reviewId); // filter out empty string
  },
  exp: ({ exp }) => {
    return exp === undefined ? 0 : exp;
  },
  level: ({ exp }) => {
    return exp === undefined ? 0 : Math.floor(exp / 5);
  },
  fullAccess: ({ fullAccess }) => {
    return fullAccess === undefined ? false : fullAccess;
  }
};

exports.Mutation = {
  createUser: async (parent, { input }) => {
    const { email } = input;
    const verificationCode = await createUser(input);
    await sendEmail({
      action: 'create',
      email,
      verificationCode
    });
  },
  verifyUser: async (parent, { input }) => {
    await verifyUser(input);
  },
  updateUser: async (parent, { input }) => {
    await updateUser(input);
  },
  login: async (parent, { input }) => {
    const { data } = await login(input);
    const { username } = input;
    const token = sign({ username });
    return {
      token,
      me: data
    };
  },
  sendResetPasswordCode: async (parent, { input }) => {
    const { code, email } = await getResetPasswordCodeAndEmail(input);
    await sendEmail({
      action: 'resetPwd',
      resetPwdCode: code,
      email
    });
  },
  resetPassword: async (parent, { input }) => {
    await resetPassword(input);
  }
};
