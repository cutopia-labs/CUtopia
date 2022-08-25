import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { ErrorCode } from 'cutopia-types/lib/codes';

import User from '../models/user.model';
import { SALT_ROUNDS, VERIFY_EXPIRATION_TIME } from '../constants/config';

const isVerfiCodeExpired = createdAt =>
  createdAt + VERIFY_EXPIRATION_TIME - Date.now() < 0;

const parseUserIdField = userId =>
  /^11[0-9]{8}$/.test(userId) ? 'SID' : 'username';

const replaceUnverifiedUser = async (filter, newUser, err) => {
  const user = await User.findOne(filter, 'verified createdAt').exec();
  if (user.verified || !isVerfiCodeExpired(user.createdAt)) {
    throw Error(err);
  }
  await User.replaceOne(filter, newUser).exec();
};

export const createUser = async input => {
  const { username, SID, password } = input;
  if (parseUserIdField(username) === 'SID') {
    throw Error(ErrorCode.CREATE_USER_INVALID_USERNAME.toString());
  }

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

export const getUser = async (userId, projection?) => {
  const userIdField = parseUserIdField(userId);
  return await User.findOne({ [userIdField]: userId }, projection);
};

export const updateUser = async input => {
  const { username, ...update } = input;
  const user = await User.findOneAndUpdate({ username }, update, {
    new: true,
  }).exec();
  return user;
};

export const verifyUser = async input => {
  const { username, code } = input;
  const user = await getUser(username, 'verified veriCode createdAt');

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
  await user.save();
};

export const login = async input => {
  const { userId, password } = input;
  const user = await getUser(userId);

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
  const { userId } = input;
  const user = await getUser(userId, 'verified SID');

  if (!user) {
    throw Error(ErrorCode.GET_PASSWORD_USER_DNE.toString());
  }

  if (!user.verified) {
    throw Error(ErrorCode.GET_PASSWORD_NOT_VERIFIED.toString());
  }

  user.resetPwdCode = nanoid(5);
  await user.save();
  return {
    SID: user.SID,
    resetPwdCode: user.resetPwdCode,
  };
};

export const resetPassword = async input => {
  const { userId, newPassword, resetCode } = input;
  const user = await getUser(userId, 'verified resetPwdCode');

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
  await user.save();
};

export const incrementVotesCount = async input => {
  const { username, isUpvote } = input;
  const voteCountField = isUpvote ? 'upvotes' : 'downvotes';

  await User.updateOne(
    { username },
    {
      $inc: {
        [voteCountField]: 1,
        exp: isUpvote ? 3 : 0,
      },
    }
  ).exec();
};

export const updateTimetableId = async input => {
  const { username, _id, switchTo, operation } = input;
  const [op, timetableId] =
    operation === 'add' ? ['$addToSet', _id] : ['$pull', switchTo];

  await User.updateOne(
    { username },
    {
      [op]: {
        timetables: _id,
      },
      ...(timetableId !== undefined && { timetableId }),
    }
  ).exec();
};

export const getTimetablesOverview = async input => {
  const { username } = input;
  const user = await User.findOne({ username }, 'timetables')
    .populate('timetables', 'tableName createdAt expireAt expire')
    .exec();
  return user.timetables;
};
