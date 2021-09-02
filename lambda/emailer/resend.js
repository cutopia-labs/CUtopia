require('dotenv').config();
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const { connect, getUsers, updateUser } = require('mongodb');

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
  let mail = {
    from: 'CUtopia <cutopia.app@gmail.com>',
    subject: 'CUtopia confirmation email',
  };

  await connect(process.env.ATLAS_URI);
  const users = await getUsers({
    filters: { resendEmail: true },
    fields: ['username', 'SID', 'veriCode'],
  });
  await Promise.all(
    users.map(async ({ username, SID, veriCode }) => {
      await transporter.sendMail({
        ...mail,
        to: `${SID}@link.cuhk.edu.hk`,
        text: `Thanks for using CUtopia! Please click the following link to verify:
https://cutopia.app/account/verify?user=${username}&code=${veriCode}`,
      });
      await updateUser({ username, resendEmail: false });
      console.log('Resent email:', username);
    })
  );
};
