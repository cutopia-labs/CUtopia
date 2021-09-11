import AWS from 'aws-sdk';
import {
  createUser,
  verifyUser,
  updateUser,
  getUser,
  getResetPasswordCodeAndEmail,
  resetPassword,
  login,
} from 'mongodb';
import { sign } from '../jwt';
import {
  MutationResolvers,
  QueryResolvers,
  UserResolvers,
} from '../schemas/types';

const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });

const sendEmail = async message => {
  const params = {
    TopicArn: process.env.UserSNSTopic,
    Message: JSON.stringify(message),
  };
  await SNS.publish(params).promise();
};

type UserResolver = {
  Query: QueryResolvers;
  Mutation: MutationResolvers;
  User: UserResolvers;
};

const userResolver: UserResolver = {
  Query: {
    me: async (parent, args, { user }) => {
      const { username } = user;
      return await getUser({ username });
    },
  },
  User: {
    level: ({ exp }) => {
      return Math.floor(exp / 5);
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
    verifyUser: async (parent, { input }) => {
      await verifyUser(input);
    },
    /*
    updateUser: async (parent, { input }, { user }) => {
      const { username } = user;
      await updateUser({
        ...input,
        username,
      });
    },
    */
    login: async (parent, { input }) => {
      const user = await login(input);
      const token = sign({ username: input.username, password: user.password });
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
        username: input.username,
        SID,
      });
    },
    resetPassword: async (parent, { input }) => {
      await resetPassword(input);
    },
  },
};

export default userResolver;
