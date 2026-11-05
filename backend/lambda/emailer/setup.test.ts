jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('nodemailer', () => ({ createTransport: jest.fn(() => ({})) }), {
  virtual: true,
});

const nodemailer = require('nodemailer');

const { setupEmailer } = require('./setup');

it('lets Nodemailer renew OAuth tokens instead of passing a Promise as a token', () => {
  process.env.GMAIL_REFRESH_TOKEN_0 = 'test-refresh-token';
  process.env.GMAIL_ACCESS_TOKEN_0 = 'expired-cached-token';

  expect(setupEmailer()).toHaveLength(3);
  expect(nodemailer.createTransport.mock.calls[0][0].auth).toMatchObject({
    type: 'OAuth2',
    refreshToken: 'test-refresh-token',
  });
  expect(nodemailer.createTransport.mock.calls[0][0].auth).not.toHaveProperty(
    'accessToken'
  );
  delete process.env.GMAIL_REFRESH_TOKEN_0;
  delete process.env.GMAIL_ACCESS_TOKEN_0;
});
