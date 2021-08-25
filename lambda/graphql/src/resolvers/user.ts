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

const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });

const sendEmail = async message => {
  const params = {
    TopicArn: process.env.UserSNSTopic,
    Message: JSON.stringify(message),
  };
  await SNS.publish(params).promise();
};

const userResolver = {
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
      const { SID } = input;
      const verificationCode = await createUser(input);
      await sendEmail({
        action: 'create',
        email: `${SID}@link.cuhk.edu.hk`,
        verificationCode,
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
      const { username } = input;
      const token = sign({ username });
      return {
        token,
        me: user,
      };
    },
    sendResetPasswordCode: async (parent, { input }) => {
      const { code, email } = await getResetPasswordCodeAndEmail(input);
      await sendEmail({
        action: 'resetPwd',
        resetPwdCode: code,
        email,
      });
    },
    resetPassword: async (parent, { input }) => {
      await resetPassword(input);
    },
  },
};

export default userResolver;
