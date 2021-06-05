const AWS = require("aws-sdk");

const db = new AWS.DynamoDB.DocumentClient();

exports.getTimetable = async (input) => {
  const { username } = input;

  const params = {
    TableName: process.env.UserTableName,
    Key: {
      "username": username,
    },
    ProjectionExpression: "timetable",
  };

  const result = await db.get(params).promise();
  return result.Item.timetable;
};

exports.addTimetable = async (input) => {
  const { username, entries } = input;
  console.log("entries", entries);

  const params = {
    TableName: process.env.UserTableName,
    Key: {
      "username": username,
    },
    UpdateExpression: "set timetable = list_append(if_not_exists(timetable, :empty_list), :entries)",
    ExpressionAttributeValues: {
      ":entries": entries,
      ":empty_list": [],
    },
    ReturnValues: "UPDATED_NEW",
  };

  const result = await db.update(params).promise();
  return result.Attributes.timetable;
};

exports.removeTimetable = async (input) => {
  const { username, indices } = input;

  const UpdateExpression = "remove " + indices.map(i => `timetable[${i}]`).join(', ');

  const params = {
    TableName: process.env.UserTableName,
    Key: {
      "username": username,
    },
    UpdateExpression,
    ReturnValues: "UPDATED_NEW",
  };

  const result = await db.update(params).promise();
  return result.Attributes.timetable;
};
