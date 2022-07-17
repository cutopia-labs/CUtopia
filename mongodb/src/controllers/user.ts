import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import NodeCache from 'node-cache';
import { ErrorCode } from 'cutopia-types/lib/codes';

import User from '../models/user.model';
import { SALT_ROUNDS, VERIFY_EXPIRATION_TIME } from '../constant/configs';
import withCache from '../utils/withCache';

const userCache = new NodeCache({
  stdTTL: 1800,
});

const isVerfiCodeExpired = createdAt =>
  createdAt + VERIFY_EXPIRATION_TIME - Date.now() < 0;

const replaceUnverifiedUser = async (filter, newUser, err) => {
  const user = await User.findOne(filter, 'verified createdAt').exec();
  if (user.verified || !isVerfiCodeExpired(user.createdAt)) {
    throw Error(err);
  }
  await User.replaceOne(filter, newUser).exec();
  userCache.set(newUser.username, JSON.stringify(user));
};

export const createUser = async input => {
  const { username, SID, password } = input;
  const now = +new Date();

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const veriCode = nanoid(5);

  const userData = {
    username,
    SID,
    password: hash,
    createdAt: now,
    veriCode,
  };
  const user = new User(userData);

  try {
    await user.save();
    userCache.set(username, JSON.stringify(user));
  } catch (e) {
    if (e.code === 11000) {
      switch (Object.keys(e.keyValue)[0]) {
        case 'username':
          await replaceUnverifiedUser(
            { username },
            userData,
            ErrorCode.CREATE_USER_USERNAME_EXISTS.toString()
          );
          break;
        case 'SID':
          await replaceUnverifiedUser(
            { SID },
            userData,
            ErrorCode.CREATE_USER_EMAIL_EXISTS.toString()
          );
          break;
      }
    }
  }
  return veriCode;
};

export const deleteUser = async input => {
  const { username } = input;
  await User.deleteOne({ username }).exec();
};

export const getUser = async (filter, fetchIf?) =>
  withCache(
    userCache,
    filter.username,
    async () => User.findOne(filter).exec(),
    // fetchIf here is to deal with data synchronization accross lambda instances
    // e.g. suppose lambda A and B have cache of unverified user U, U verified its account in A
    // and reset password in B, but U is unverified in B's cache, resulting in error
    // database access is reduced if U's requests are handled by A
    fetchIf
  );

export const updateUser = async input => {
  const { username, ...update } = input;
  return await User.updateOne({ username }, update).exec();
};

export const verifyUser = async input => {
  const { username, code } = input;
  const user = await getUser({ username }, cachedUser => !cachedUser.verified);

  if (!user) {
    throw Error(ErrorCode.VERIFICATION_USER_DNE.toString());
  }
  if (user.verified) {
    throw Error(ErrorCode.VERIFICATION_ALREADY_VERIFIED.toString());
  }
  if (isVerfiCodeExpired(user.createdAt)) {
    await user.remove();
    throw Error(ErrorCode.VERIFICATION_EXPIRED.toString());
  }
  if (user.veriCode !== code) {
    throw Error(ErrorCode.VERIFICATION_FAILED.toString());
  }

  user.veriCode = null;
  user.verified = true;
  await User.updateOne({ username }, user).exec();
  userCache.set(username, JSON.stringify(user));
  return true;
};

export const login = async input => {
  const { username, password } = input;
  const user = await getUser(
    { username },
    async cachedUser =>
      !cachedUser.verified ||
      !(await bcrypt.compare(password, cachedUser.password))
  );

  if (!user) {
    throw Error(ErrorCode.LOGIN_USER_DNE.toString());
  }

  if (!user.verified) {
    throw Error(ErrorCode.LOGIN_NOT_VERIFIED.toString());
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw Error(ErrorCode.LOGIN_FAILED.toString());
  }
  return user;
};

export const getResetPasswordCodeAndEmail = async input => {
  const { username } = input;
  const user = await getUser({ username }, cachedUser => !cachedUser.verified);

  if (!user) {
    throw Error(ErrorCode.GET_PASSWORD_USER_DNE.toString());
  }
  if (!user.verified) {
    throw Error(ErrorCode.GET_PASSWORD_NOT_VERIFIED.toString());
  }

  const resetPwdCode = nanoid(5);
  user.resetPwdCode = resetPwdCode;
  await User.updateOne({ username }, user).exec();
  userCache.set(username, JSON.stringify(user));
  return {
    SID: user.SID,
    resetPwdCode,
  };
};

export const resetPassword = async input => {
  const { username, newPassword, resetCode } = input;

  const user = await getUser({ username }, cachedUser => !cachedUser.verified);

  if (!user) {
    throw Error(ErrorCode.RESET_PASSWORD_USER_DNE.toString());
  }
  if (!user.verified) {
    throw Error(ErrorCode.RESET_PASSWORD_NOT_VERIFIED.toString());
  }

  const correct = resetCode !== '' && user.resetPwdCode === resetCode;
  if (!correct) {
    throw Error(ErrorCode.RESET_PASSWORD_FAILED.toString());
  }

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.resetPwdCode = null;
  await User.updateOne({ username }, user).exec();
  userCache.set(username, JSON.stringify(user));
  return true;
};

export const incrementUpvotesCount = async input => {
  const { username } = input;
  const user = await User.findOneAndUpdate(
    { username },
    {
      $inc: {
        upvotes: 1,
        exp: 3,
      },
    },
    { new: true }
  ).exec();
  userCache.set(username, JSON.stringify(user));
};

export const updateTimetableId = async input => {
  const { username, _id, operation, expire } = input;
  const op = operation === 'add' ? '$addToSet' : '$pull';
  const timetableField = expire >= 0 ? 'sharedTimetables' : 'timetables';

  const user = await User.findOneAndUpdate(
    { username },
    {
      [op]: {
        [timetableField]: _id,
      },
    },
    { new: true }
  ).exec();
  userCache.set(username, JSON.stringify(user));
};

export const getTimetablesOverview = async input => {
  const { username } = input;
  const user = await User.findOne({ username }, 'timetables sharedTimetables')
    .populate('timetables', 'tableName createdAt expireAt expire')
    .populate('sharedTimetables', 'tableName createdAt expireAt expire')
    .exec();
  return [user.timetables, user.sharedTimetables];
};
