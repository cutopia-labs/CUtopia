require('dotenv').config();
const { connect, disconnect, addToResendList } = require('mongodb');

const { setupEmailer } = require('./setup');
const { getTemplateByAction } = require('./template');

const transporters = setupEmailer();

exports.handler = async event => {
  const message = JSON.parse(event.Records[0].Sns.Message);
  const mail = getTemplateByAction(message);

  for (const transporter of transporters) {
    // temporary workaround to resend emails when failed
    try {
      await transporter.sendMail(mail);
      console.log('sent!', message.action);
      return;
    } catch {
      console.log('failed:', message.action);
      continue;
    }
  }
  // still failed, then add that message to database for resending later
  console.log('still failed :(', message.action);
  await connect(process.env.ATLAS_URI);
  try {
    await addToResendList(message);
  } finally {
    await disconnect();
  }
};
