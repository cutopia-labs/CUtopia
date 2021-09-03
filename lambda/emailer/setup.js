const { google } = require('googleapis');
const nodemailer = require('nodemailer');

exports.setupEmailer = () => {
  const OAuth2Client = new google.auth.OAuth2(
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
      accessToken: process.env.GMAIL_ACCESS_TOKEN,
    },
  });
  transporter.set('oauth2_provision_cb', (user, renew, callback) => {
    if (renew) {
      const accessToken = OAuth2Client.getAccessToken();
      return callback(null, accessToken);
    }
    return callback(null, process.env.GMAIL_ACCESS_TOKEN);
  });
  return transporter;
};
