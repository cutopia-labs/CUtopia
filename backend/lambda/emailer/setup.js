require('dotenv').config({ path: '.emailer.env' });
const nodemailer = require('nodemailer');

exports.setupEmailer = () => {
  const setup = id => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        type: 'OAuth2',
        user: process.env[`GMAIL_ADDRESS_${id}`],
        clientId: process.env[`GMAIL_CLIENT_ID_${id}`],
        clientSecret: process.env[`GMAIL_CLIENT_SECRET_${id}`],
        refreshToken: process.env[`GMAIL_REFRESH_TOKEN_${id}`],
      },
    });
    // Nodemailer refreshes and caches OAuth tokens using the refresh token.
    return transporter;
  };
  // temporary workaround to resend emails when failed
  // only 3 gmails are set up to send emails
  return Array.from({ length: 3 }, (_, i) => i).map(setup);
};
