require('dotenv').config({ path: '.emailer.env' });
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

exports.setupEmailer = () => {
  const setup = id => {
    const OAuth2Client = new google.auth.OAuth2(
      process.env[`GMAIL_CLIENT_ID_${id}`],
      process.env[`GMAIL_CLIENT_SECRET_${id}`],
      'https://developers.google.com/oauthplayground'
    );
    OAuth2Client.setCredentials({
      refresh_token: process.env[`GMAIL_REFRESH_TOKEN_${id}`],
    });
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env[`GMAIL_ADDRESS_${id}`],
        clientId: process.env[`GMAIL_CLIENT_ID_${id}`],
        clientSecret: process.env[`GMAIL_CLIENT_SECRET_${id}`],
        refreshToken: process.env[`GMAIL_REFRESH_TOKEN_${id}`],
        accessToken: process.env[`GMAIL_ACCESS_TOKEN_${id}`],
      },
    });
    transporter.set('oauth2_provision_cb', (user, renew, callback) => {
      if (renew) {
        const accessToken = OAuth2Client.getAccessToken();
        return callback(null, accessToken);
      }
      return callback(null, process.env[`GMAIL_ACCESS_TOKEN_${id}`]);
    });
    return transporter;
  };
  // temporary workaround to resend emails when failed
  // only 3 gmails are set up to send emails
  return Array.from({ length: 3 }, (_, i) => i).map(setup);
};
