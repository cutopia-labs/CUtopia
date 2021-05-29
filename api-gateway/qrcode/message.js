const AWS = require('aws-sdk');

const apigwManagementApi = new AWS.ApiGatewayManagementApi({
  apiVersion: '2018-11-29',
  endpoint: process.env.WSArn,
});

exports.handler = async event => {
  const postData = JSON.parse(event.body);
  if (postData.type === 'getSelfId') {
    await apigwManagementApi.postToConnection({
      ConnectionId: event.requestContext.connectionId,
      Data: JSON.stringify({
        "connectionId": event.requestContext.connectionId,
      }),
    }).promise();
    return { statusCode: 200, body: 'Data sent.' };
  }

  await apigwManagementApi.postToConnection({
    ConnectionId: postData.connectionId,
    Data: JSON.stringify(postData.data),
  }).promise();
  return { statusCode: 200, body: 'Data sent.' };
};
