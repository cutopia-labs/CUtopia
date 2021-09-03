require('dotenv').config();
const { connect, disconnect, addToResendList } = require('mongodb');
const { setupEmailer } = require('./setup');
const { getTemplateByAction } = require('./template');

const transporter = setupEmailer();

exports.handler = async event => {
  const message = JSON.parse(event.Records[0].Sns.Message);
  const mail = getTemplateByAction(message);

  try {
    await transporter.sendMail(mail);
  } catch (e) {
    console.error(e);
    await connect(process.env.ATLAS_URI);
    await addToResendList(message);
  } finally {
    await disconnect();
  }
};
