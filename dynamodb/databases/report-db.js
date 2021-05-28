const AWS = require("aws-sdk");
const { nanoid } = require("nanoid");

const db = new AWS.DynamoDB.DocumentClient();

exports.report = async (input) => {
  const { type, description, username } = input;
  const reportId = nanoid(5);

  const params = {
    TableName: process.env.ReportTableName,
    Item: {
      "id": reportId,
      "type": type,
      "username": username,
      "description": description,
    },
  };

  await db.put(params).promise();
  return reportId;
};
