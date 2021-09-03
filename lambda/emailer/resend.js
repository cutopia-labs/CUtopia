require('dotenv').config();
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const {
  connect,
  disconnect,
  getResendList,
  removeFromResendList,
} = require('mongodb');
const { getTemplateByAction } = require('./template');

const OAuth2 = google.auth.OAuth2;
const OAuth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);
OAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_ADDRESS,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    accessToken: OAuth2Client.getAccessToken(),
  },
});
transporter.set('oauth2_provision_cb', (user, renew, callback) => {
  const accessToken = OAuth2Client.getAccessToken();
  return callback(null, accessToken);
});

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
