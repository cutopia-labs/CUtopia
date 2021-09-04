require('dotenv').config();
const {
  connect,
  disconnect,
  getResendList,
  removeFromResendList,
} = require('mongodb');
const { setupEmailer } = require('./setup');
const { getTemplateByAction } = require('./template');

const transporters = setupEmailer();

exports.handler = async event => {
  await connect(process.env.ATLAS_URI);
  const resendList = await getResendList();

  try {
    await Promise.all(
      resendList.map(async message => {
        for (const transporter of transporters) {
          // temporary workaround to resend emails when failed
          try {
            await transporter.sendMail(getTemplateByAction(message));
            await removeFromResendList(message);
            console.log('resent!', message);
            break;
          } catch (e) {
            console.log('resend failed', message);
            continue;
          }
        }
      })
    );
  } finally {
    await disconnect();
  }
};
