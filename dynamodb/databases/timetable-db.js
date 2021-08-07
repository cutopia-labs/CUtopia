const AWS = require('aws-sdk');
const { nanoid } = require('nanoid');
const { ErrorCode } = require('cutopia-types/lib/codes');

const db = new AWS.DynamoDB.DocumentClient();

exports.getTimetable = async (input) => {
  const { username } = input;

  const params = {
    TableName: process.env.UserTableName,
    Key: {
      username
    },
    ProjectionExpression: 'timetable'
  };

  const result = await db.get(params).promise();
  return result.Item.timetable;
};

exports.addTimetable = async (input) => {
  const { username, entries } = input;

  const params = {
    TableName: process.env.UserTableName,
    Key: {
      username
    },
    UpdateExpression:
      'set timetable = list_append(if_not_exists(timetable, :empty_list), :entries)',
    ExpressionAttributeValues: {
      ':entries': entries,
      ':empty_list': []
    },
    ReturnValues: 'UPDATED_NEW'
  };

  const result = await db.update(params).promise();
  return result.Attributes.timetable;
};

exports.removeTimetable = async (input) => {
  const { username, indices } = input;

  const UpdateExpression =
    'remove ' + indices.map((i) => `timetable[${i}]`).join(', ');

  const params = {
    TableName: process.env.UserTableName,
    Key: {
      username
    },
    UpdateExpression,
    ReturnValues: 'UPDATED_NEW'
  };

  const result = await db.update(params).promise();
  return result.Attributes.timetable;
};

exports.shareTimetable = async (input) => {
  const { username, entries, tableName, expire } = input;
  const id = nanoid(8);
  const now = new Date().getTime();

  const params = {
    TableName: process.env.TimetableTableName,
    Item: {
      id,
      createdDate: now,
      username,
      tableName,
      entries,
      expire
    }
  };

  await db.put(params).promise();
  return {
    id,
    createdDate: now
  };
};

exports.getSharedTimetable = async (input) => {
  const { id } = input;
  const now = new Date().getTime();

  const params = {
    TableName: process.env.TimetableTableName,
    Key: {
      id
    }
  };

  const result = (await db.get(params).promise()).Item;

  if (result === undefined) {
    throw Error(ErrorCode.GET_TIMETABLE_INVALID_ID);
  }

  const expireDate = result.createdDate + result.expire * 60 * 1000;
  if (expireDate - now < 0) {
    throw Error(ErrorCode.GET_TIMETABLE_EXPIRED);
  }

  return {
    entries: result.entries,
    tableName: result.tableName,
    createdDate: result.createdDate,
    expireDate
  };
};
