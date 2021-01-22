const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const { nanoid } = require("nanoid");

const db = new AWS.DynamoDB.DocumentClient();

exports.createUser = async (input) => {
  const { username, email, password } = input;
  const userExistsCode = await this.checkUserExist({
    username,
    email,
  });

  if (userExistsCode !== CHECK_USER_EXIST_CODES.USERNAME_EMAIL_AVAILABLE) {
    throw Error(userExistsCode);
  }

  const hash = await bcrypt.hash(password, saltRounds);
  const verificationCode = nanoid(5);

  const params = {
    TableName: process.env.UserTableName,
    Item: {
      "username": username,
      "password": hash,
      "email": email,
      "verified": false,
      "verificationCode": verificationCode,
      "reviewIds": db.createSet([""]),
    },
  };

  await db.put(params).promise();
  return verificationCode;
};

const generateProjectionExpression = (fieldNames) => {
  return fieldNames.join(", ");
};
exports.getUser = async (input) => {
  const { username, requiredFields } = input;
  const params = {
    TableName: process.env.UserTableName,
    Key: {
      "username": username,
    },
    ...(requiredFields && { ProjectionExpression: generateProjectionExpression(requiredFields) }),
  };

  const result = (await db.get(params).promise()).Item;
  return result;
};

exports.getUsernameByEmail = async (input) => {
  const { email } = input;
  // GetItem does not support GSI / LSI
  const params = {
    TableName: process.env.UserTableName,
    IndexName: process.env.UserEmailMappingIndexName,
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };

  const result = (await db.query(params).promise()).Items;
  return result;
}

const CHECK_USER_EXIST_CODES = Object.freeze({
  USERNAME_EMAIL_AVAILABLE: 0,
  USERNAME_EXISTS: 1,
  EMAIL_EXISTS: 2,
});
exports.checkUserExist = async (input) => {
  const { username, email } = input;

  const usernameResult = await this.getUser({
    username,
    requiredFields: ["email"],
  });
  if (usernameResult) {
    return CHECK_USER_EXIST_CODES.USERNAME_EXISTS;
  }
  
  const emailResult = await this.getUsernameByEmail({ email });
  if (emailResult.length !== 0) {
    return CHECK_USER_EXIST_CODES.EMAIL_EXISTS;
  }

  return CHECK_USER_EXIST_CODES.USERNAME_EMAIL_AVAILABLE;
};

const generateUpdateParams = (fields) => {
  let expression = "set ";
  const values = {};

  let i = 0;
  const length = Object.keys(fields).length;
  for (const [key, value] of Object.entries(fields)) {
    i += 1;
    expression += `${key} = :${key}` + (i !== length ? ", " : "");
    values[`:${key}`] = value;
  }
  return [expression, values];
};

exports.updateUser = async (input) => {
  const { username, ...updatedFields } = input; // Disallow updating username
  if ("password" in updatedFields) {
    updatedFields["password"] = await bcrypt.hash(updatedFields["password"], saltRounds);
  }
  const [updateExpression, expressionValues] = generateUpdateParams(updatedFields);
  const params = {
    TableName: process.env.UserTableName,
    Key: {
      "username": username,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionValues,
  };
  try {
    await db.update(params).promise();
    return {};
  } catch (e) {
    return {
      error: e,
    };
  }
};

exports.VERIFICATION_CODES = Object.freeze({
  SUCCEEDED: 0,
  FAILED: 1,
  ALREADY_VERIFIED: 2,
  USER_DNE: 3,
});
exports.verifyUser = async (input) => {
  const { username, code } = input;
  const result = await this.getUser({
    username,
    requiredFields: ["verified", "verificationCode"],
  });

  if (result) {
    if (result.verified) {
      return this.VERIFICATION_CODES.ALREADY_VERIFIED;
    }
    if (result.verificationCode === code) {
      await this.updateUser({
        username,
        verified: true,
      });
      return this.VERIFICATION_CODES.SUCCEEDED;
    }
    return this.VERIFICATION_CODES.FAILED;
  }
  return this.VERIFICATION_CODES.USER_DNE;
};

exports.LOGIN_CODES = Object.freeze({
  SUCCEEDED: 0,
  FAILED: 1,
  USER_DNE: 2,
});
exports.login = async (input) => {
  const { username, password } = input;
  const result = await this.getUser({
    username,
    requiredFields: ["username", "password", "email", "verified", "reviewIds"],
  });
  if (!result) {
    return [this.LOGIN_CODES.USER_DNE];
  }
  const correct = await bcrypt.compare(password, result.password);
  const { password: pwd, ...remainedFields } = result
  return correct ? [this.LOGIN_CODES.SUCCEEDED, remainedFields] : [this.LOGIN_CODES.FAILED];
};

exports.GET_PASSWORD_CODE_CODES = Object.freeze({
  SUCCEEDED: 0,
  USER_DNE: 1,
  NOT_VERIFIED: 2,
});
exports.getResetPasswordCodeAndEmail = async (input) => {
  const { username } = input;
  const data = await this.getUser({
    username,
    requiredFields: ["email", "verified"],
  });

  if (!data) {
    return [this.GET_PASSWORD_CODE_CODES.USER_DNE];
  }
  if (!data.verified) {
    return [this.GET_PASSWORD_CODE_CODES.NOT_VERIFIED];
  }
  const resetPwdCode = nanoid(5);
  await this.updateUser({
    username,
    resetPwdCode,
  });
  return [this.GET_PASSWORD_CODE_CODES.SUCCEEDED, resetPwdCode, data.email];
};

exports.RESET_PASSWORD_CODES = Object.freeze({
  SUCCEEDED: 0,
  FAILED: 1,
  USER_DNE: 2,
  NOT_VERIFIED: 3,
});
exports.resetPassword = async (input) => {
  const { username, newPassword, resetCode } = input;
  const data = await this.getUser({
    username,
    requiredFields: ["verified", "resetPwdCode"],
  });

  if (!data) {
    return this.RESET_PASSWORD_CODES.USER_DNE;
  }
  if (!data.verified) {
    return this.RESET_PASSWORD_CODES.NOT_VERIFIED;
  }

  const correct = resetCode !== "" && data.resetPwdCode === resetCode;
  if (correct) {
    await this.updateUser({
      username,
      password: newPassword,
      resetPwdCode: "",
    });
    return this.RESET_PASSWORD_CODES.SUCCEEDED;
  }
  return this.RESET_PASSWORD_CODES.FAILED;
};
