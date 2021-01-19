const AWS = require("aws-sdk");
const SNS = new AWS.SNS({apiVersion: "2010-03-31"});
const { createUser, verifyUser } = require("dynamodb");

exports.Mutation = {
  createUser: async (parent, { input }) => {
    const { email } = input;
    try {
      const verificationCode = await createUser(input);
      const params = {
        TopicArn: process.env.UserSNSTopic,
        Message: JSON.stringify({
          email,
          verificationCode,
        }),
      };
      const result = await SNS.publish(params).promise();
      console.log('result', result);
      return {
  
      };
    } catch(e) {
      return {
        errorMessage: e,
      }
    }
  },
  verifyUser: async (parent, { input }) => {
    const result = await verifyUser(input);
    return {
      code: result,
    };
  }
};
