const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const OAuth2 = google.auth.OAuth2;
const OAuth2Client = new OAuth2(
  process.env.GamilClientID,
  process.env.GmailClientSecret,
  'https://developers.google.com/oauthplayground'
);
OAuth2Client.setCredentials({
  refresh_token: process.env.GmailRefreshToken
});
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GmailAddress,
    clientId: process.env.GamilClientID,
    clientSecret: process.env.GmailClientSecret,
    refreshToken: process.env.GmailRefreshToken,
    accessToken: OAuth2Client.getAccessToken()
  }
});
transporter.set('oauth2_provision_cb', (user, renew, callback) => {
  const accessToken = OAuth2Client.getAccessToken();
  return callback(null, accessToken);
});

exports.handler = (event) => {
  const message = event.Records[0].Sns.Message;
  const { action, email, verificationCode, resetPwdCode } = JSON.parse(message);

  let mail = {
    from: 'CUtopia Team <cutopia.team@gmail.com>',
    to: email
  };
  if (action === 'create') {
    mail = {
      ...mail,
      subject: 'CUtopia confirmation email',
      text: `Thanks for using CUtopia! Your verification code for registration is: ${verificationCode}`
    };
  } else if (action === 'resetPwd') {
    mail = {
      ...mail,
      subject: 'CUtopia reset password',
      text: `Your verification code for resetting password is: ${resetPwdCode}`
    };
  }

  transporter.sendMail(mail, (err, info) => {
    if (err) {
      console.warn(err);
    }
  });
};
