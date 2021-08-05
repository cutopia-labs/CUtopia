const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
// const NodeCache = require('node-cache');
const saltRounds = 10;
const { nanoid } = require('nanoid');
const { ERROR_CODES } = require('codes');

const db = new AWS.DynamoDB.DocumentClient();
/*
const uesrCache = new NodeCache({
  stdTTL: 3600,
});
const uncacheableUserFields = ["reviewIds", "resetPwdCode"];
*/

const VERIFY_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

exports.createUser = async (input) => {
  const { username, email, password } = input;
  const now = new Date().getTime();

  // Ensure username and email do not exist
  const usernameResult = await this.getUser({
    username,
    requiredFields: ['email']
  });
  if (usernameResult) {
    throw Error(ERROR_CODES.CHECK_USER_USERNAME_EXISTS);
  }
  const emailResult = await this.getUsernameByEmail({ email });
  if (emailResult.length !== 0) {
    throw Error(ERROR_CODES.CHECK_USER_EMAIL_EXISTS);
  }

  const hash = await bcrypt.hash(password, saltRounds);
  const verificationCode = nanoid(5);

  const user = {
    username: username,
    password: hash,
    email: email,
    createdDate: now,
    verified: false,
    verificationCode: verificationCode,
    reviewIds: db.createSet(['']),
    upvotesCount: 0,
    fullAccess: false,
    exp: 0,
    viewsCount: 10
  };

  const params = {
    TableName: process.env.UserTableName,
    Item: user
  };

  await db.put(params).promise();
  // uesrCache.set(username, user);
  return verificationCode;
};

/*
const generateProjectionExpression = (fieldNames) => {
  return fieldNames.join(', ');
};
*/
exports.getUser = async (input) => {
  const { username /* , requiredFields */ } = input;
  const user = undefined; // uesrCache.get(username);

  if (user === undefined /* || (requiredFields && uncacheableUserFields.some(f => requiredFields.includes(f))) */) {
    const params = {
      TableName: process.env.UserTableName,
      Key: {
        username
      }
      // ...(requiredFields && { ProjectionExpression: generateProjectionExpression(requiredFields) }),
    };
    const result = (await db.get(params).promise()).Item;
    // if (result) {
    //  uesrCache.set(username, result);
    // }
    return result;
  }
  return user;
};

exports.getUsernameByEmail = async (input) => {
  const { email } = input;
  // GetItem does not support GSI / LSI
  const params = {
    TableName: process.env.UserTableName,
    IndexName: process.env.UserEmailMappingIndexName,
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  };

  const result = (await db.query(params).promise()).Items;
  return result;
};

const generateUpdateParams = (fields) => {
  let expression = 'set ';
  const values = {};

  let i = 0;
  const length = Object.keys(fields).length;
  for (const [key, value] of Object.entries(fields)) {
    i += 1;
    expression += `${key} = :${key}` + (i !== length ? ', ' : '');
    values[`:${key}`] = value;
  }
  return [expression, values];
};
exports.updateUser = async (input) => {
  const { username, ...updatedFields } = input; // Disallow updating username
  if ('password' in updatedFields) {
    updatedFields.password = await bcrypt.hash(updatedFields.password, saltRounds);
  }
  const [updateExpression, expressionValues] = generateUpdateParams(updatedFields);
  const params = {
    TableName: process.env.UserTableName,
    Key: {
      username
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionValues,
    ReturnValues: 'ALL_NEW'
  };
  await db.update(params).promise();
  // const result = await db.update(params).promise();
  // uesrCache.set(username, result.Attributes);
};

exports.deleteUser = async (input) => {
  const { username } = input;
  // uesrCache.del(username);
  const params = {
    TableName: process.env.UserTableName,
    Key: {
      username
    }
  };
  await db.delete(params).promise();
};

exports.verifyUser = async (input) => {
  const { username, code } = input;
  const result = await this.getUser({
    username,
    requiredFields: ['createdDate', 'verified', 'verificationCode']
  });

  if (result) {
    if (result.verified) {
      throw Error(ERROR_CODES.VERIFICATION_ALREADY_VERIFIED);
    }
    if (result.createdDate + VERIFY_EXPIRATION_TIME - new Date().getTime() < 0) {
      await this.deleteUser({ username });
      throw Error(ERROR_CODES.VERIFICATION_EXPIRED);
    }
    if (result.verificationCode === code) {
      await this.updateUser({
        username,
        verified: true
      });
      // successfully verified
      return true;
    }
    throw Error(ERROR_CODES.VERIFICATION_FAILED);
  }
  throw Error(ERROR_CODES.VERIFICATION_USER_DNE);
};

exports.login = async (input) => {
  const { username, password } = input;
  const result = await this.getUser({
    username,
    requiredFields: ['username', 'password', 'email', 'verified', 'reviewIds']
  });
  if (!result) {
    throw Error(ERROR_CODES.LOGIN_USER_DNE);
  }
  if (!await bcrypt.compare(password, result.password)) {
    throw Error(ERROR_CODES.LOGIN_FAILED);
  }

  const { password: pwd, ...remainedFields } = result;
  return {
    data: remainedFields
  };
};

exports.getResetPasswordCodeAndEmail = async (input) => {
  const { username } = input;
  const data = await this.getUser({
    username,
    requiredFields: ['email', 'verified']
  });

  if (!data) {
    throw Error(ERROR_CODES.GET_PASSWORD_USER_DNE);
  }
  if (!data.verified) {
    throw Error(ERROR_CODES.GET_PASSWORD_NOT_VERIFIED);
  }
  const resetPwdCode = nanoid(5);
  await this.updateUser({
    username,
    resetPwdCode
  });
  return {
    code: resetPwdCode,
    email: data.email
  };
};

exports.resetPassword = async (input) => {
  const { username, newPassword, resetCode } = input;
  const data = await this.getUser({
    username,
    requiredFields: ['verified', 'resetPwdCode']
  });

  if (!data) {
    throw Error(ERROR_CODES.RESET_PASSWORD_USER_DNE);
  }
  if (!data.verified) {
    throw Error(ERROR_CODES.RESET_PASSWORD_NOT_VERIFIED);
  }

  const correct = resetCode !== '' && data.resetPwdCode === resetCode;
  if (correct) {
    await this.updateUser({
      username,
      password: newPassword,
      resetPwdCode: ''
    });
    // successfully reset password
    return true;
  }
  throw Error(ERROR_CODES.RESET_PASSWORD_FAILED);
};

exports.incrementUpvotesCount = async (input) => {
  const { username } = input;
  const params = {
    TableName: process.env.UserTableName,
    Key: {
      username: username
    },
    UpdateExpression: 'set upvotesCount = upvotesCount + :value, exp = if_not_exists(exp, :defaultExp) + :delta',
    ExpressionAttributeValues: {
      ':value': 1,
      ':defaultExp': 0,
      ':delta': 1
    },
    ReturnValues: 'ALL_NEW'
  };
  await db.update(params).promise();
  // const result = await db.update(params).promise();
  // uesrCache.set(username, result.Attributes);
};

exports.adjustExp = async (input) => {
  const { username, delta } = input;
  const params = {
    TableName: process.env.UserTableName,
    Key: {
      username
    },
    UpdateExpression: 'set exp = if_not_exists(exp, :defaultExp) + :delta',
    ExpressionAttributeValues: {
      ':defaultExp': 0,
      ':delta': delta
    },
    ReturnValues: 'ALL_NEW'
  };
  const result = await db.update(params).promise();
  // uesrCache.set(username, result.Attributes);
  return result.Attributes.exp;
};
