import AWS from 'aws-sdk';
import {
  createUser,
  verifyUser,
  getUser,
  getResetPasswordCodeAndEmail,
  resetPassword,
  login,
} from 'mongodb';
import { sign } from '../jwt';
import { Resolvers } from '../schemas/types';

const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });

const sendEmail = async message => {
  const params = {
    TopicArn: process.env.UserSNSTopic,
    Message: JSON.stringify(message),
  };
  await SNS.publish(params).promise();
};

const userResolver: Resolvers = {
  Query: {
    me: async (parent, args, { user }) => {
      const { username } = user;
      return await getUser({ username });
    },
  },
  Mutation: {
    createUser: async (parent, { input }) => {
      const { username, SID } = input;
      const veriCode = await createUser(input);
      await sendEmail({
        action: 'create',
        code: veriCode,
        username,
        SID,
      });
    },
    verifyUser: async (parent, { input }) => verifyUser(input),
    login: async (parent, { input }) => {
      const user = await login(input);
      const token = sign({ username: user.username, password: user.password });
      return {
        token,
        me: user,
      };
    },
    sendResetPasswordCode: async (parent, { input }) => {
      const { resetPwdCode, SID } = await getResetPasswordCodeAndEmail(input);
      await sendEmail({
        action: 'resetPwd',
        code: resetPwdCode,
        userId: input.userId,
        SID,
      });
    },
    resetPassword: async (parent, { input }) => resetPassword(input),
  },
};

export default userResolver;
