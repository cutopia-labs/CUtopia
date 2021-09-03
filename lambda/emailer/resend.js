require('dotenv').config();
const {
  connect,
  disconnect,
  getResendList,
  removeFromResendList,
} = require('mongodb');
const { setupEmailer } = require('./setup');
const { getTemplateByAction } = require('./template');

const transporter = setupEmailer();

exports.handler = async event => {
  await connect(process.env.ATLAS_URI);
  const resendList = await getResendList();

  try {
    await Promise.all(
      resendList.map(async message => {
        await transporter.sendMail(getTemplateByAction(message));
        await removeFromResendList(message);
        console.log('Resent email:', message);
      })
    );
  } finally {
    await disconnect();
  }
};
