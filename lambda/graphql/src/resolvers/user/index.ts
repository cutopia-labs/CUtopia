import AWS from 'aws-sdk';
const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });
import {
  createUser,
  verifyUser,
  updateUser,
  getUser,
  getTimetables,
  getResetPasswordCodeAndEmail,
  resetPassword,
  login,
} from 'mongodb';
import { sign } from '../../jwt';

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
      return await getUser({ username: user.username });
    },
  },
  User: {
    reviewIds: ({ reviewIds }) => {
      // reviewIds is a set
      return reviewIds.values.filter(reviewId => reviewId); // filter out empty string
    },
    exp: ({ exp }) => {
      return exp === undefined ? 0 : exp;
    },
    level: ({ exp }) => {
      return exp === undefined ? 0 : Math.floor(exp / 5);
    },
    fullAccess: ({ fullAccess }) => {
      return fullAccess === undefined ? false : fullAccess;
    },
    timetables: async (parent, args, { user }) => {
      const { username } = user;
      return await getTimetables({
        username,
        shared: false,
      });
    },
    sharedTimetables: async (parent, args, { user }) => {
      const { username } = user;
      return await getTimetables({
        username,
        shared: true,
      });
    },
  },
  Mutation: {
    createUser: async (parent, { input }) => {
      const { email } = input;
      const verificationCode = await createUser(input);
      await sendEmail({
        action: 'create',
        email,
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
