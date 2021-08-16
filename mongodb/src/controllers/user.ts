import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { ErrorCode } from 'cutopia-types/lib/codes';
import User from '../models/user.model';

const saltRounds = 10;
const VERIFY_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

export const createUser = async input => {
  const { username, SID, password } = input;
  const now = new Date().getTime();

  const hash = await bcrypt.hash(password, saltRounds);
  const veriCode = nanoid(5);

  const user = new User({
    username,
    SID,
    password: hash,
    createdAt: now,
    verified: false,
    veriCode,
    reviewIds: [],
    upvotesCount: 0,
    fullAccess: false,
    exp: 0,
    viewsCount: 10,
  });

  try {
    await user.save();
  } catch (e) {
    if (e.code === 11000) {
      switch (Object.keys(e.keyValue)[0]) {
        case 'username':
          throw Error(ErrorCode.CREATE_USER_USERNAME_EXISTS.toString());
        case 'SID':
          throw Error(ErrorCode.CREATE_USER_EMAIL_EXISTS.toString());
      }
    }
  }
  return veriCode;
};

export const verifyUser = async input => {
  const { username, code } = input;
  const user = await User.findOne(
    { username },
    'createdAt veriCode verified'
  ).exec();

  if (!user) {
    throw Error(ErrorCode.VERIFICATION_USER_DNE.toString());
  }
  if (user.verified) {
    throw Error(ErrorCode.VERIFICATION_ALREADY_VERIFIED.toString());
  }
  if (user.createdAt + VERIFY_EXPIRATION_TIME - new Date().getTime() < 0) {
    await user.remove();
    throw Error(ErrorCode.VERIFICATION_EXPIRED.toString());
  }
  if (user.veriCode !== code) {
    throw Error(ErrorCode.VERIFICATION_FAILED.toString());
  }

  user.veriCode = null;
  user.verified = true;
  await user.save();
  return true;
};

export const login = async input => {
  const { username, password } = input;
  const user = await User.findOne({ username }, 'verified password').exec();

  if (!user) {
    throw Error(ErrorCode.LOGIN_USER_DNE.toString());
  }

  if (!user.verified) {
    // throw Error(ErrorCode.LOGIN_NOT_VERIFIED.toString()); #TODO
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw Error(ErrorCode.LOGIN_FAILED.toString());
  }
};

export const getResetPasswordCodeAndEmail = async input => {
  const { username } = input;
  const user = await User.findOne({ username }, 'SID verified').exec();

  if (!user) {
    throw Error(ErrorCode.GET_PASSWORD_USER_DNE.toString());
  }
  if (!user.verified) {
    throw Error(ErrorCode.GET_PASSWORD_NOT_VERIFIED.toString());
  }

  const resetPwdCode = nanoid(5);
  user.resetPwdCode = resetPwdCode;
  await user.save();

  return {
    code: resetPwdCode,
    email: user.email,
  };
};

export const resetPassword = async input => {
  const { username, newPassword, resetCode } = input;
  const user = await User.findOne({ username }, 'verified resetPwdCode').exec();

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

  user.password = await bcrypt.hash(newPassword, saltRounds);
  user.resetPwdCode = null;
  await user.save();
  return true;
};

export const incrementUpvotesCount = async input => {
  const { username } = input;
  await User.findOneAndUpdate(
    { username },
    {
      $inc: {
        upvotesCount: 1,
        exp: 3,
      },
    }
  ).exec();
};

export const updateSharedTimetableId = async input => {
  const { username, id, operation } = input;
  const op = operation === 'add' ? '$addToSet' : '$pull';
  await User.findOneAndUpdate(
    { username },
    {
      [op]: {
        sharedTimetables: id,
      },
    }
  ).exec();
};

export const getSharedTimetables = async input => {
  const { username } = input;
  const user = await User.findOne({ username }, 'sharedTimetables')
    .lean()
    .populate('sharedTimetables', 'tableName createdAt expireAt')
    .exec();
  return user.sharedTimetables;
};
